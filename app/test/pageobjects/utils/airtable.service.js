/**
 * Airtable Service - Utility for fetching OTP codes from Airtable
 *
 * Usage:
 *   node airtable.service.js
 *
 * Set environment variables:
 *   AIRTABLE_API_TOKEN - Your Airtable Personal Access Token
 *   AIRTABLE_BASE_ID - The Base ID (starts with 'app')
 *   AIRTABLE_TABLE_NAME - The table name (e.g., 'OTP' or 'OTP Records')
 */

const https = require('https');

// Configuration - use getter functions to read env vars lazily (after wdio.conf.js loads .env)
const getAirtableConfig = () => {
    const config = {
        apiToken: process.env.AIRTABLE_API_TOKEN || 'YOUR_TOKEN_HERE',
        baseId: process.env.AIRTABLE_BASE_ID || 'YOUR_BASE_ID_HERE',
        tableName: process.env.AIRTABLE_TABLE_NAME || 'YOUR_TABLE_NAME_HERE',
        fromEmail: process.env.AIRTABLE_FROM_EMAIL || 'AIRTABLE_FROM_EMAIL_HERE'
    };
    // Debug: Check if token is configured (avoid logging sensitive token characters)
    const hasToken = config.apiToken && config.apiToken !== 'YOUR_TOKEN_HERE';
    const tokenStatus = hasToken ? `(set, length: ${config.apiToken.length})` : '(not set)';
    console.log(`  [Airtable Config] Token: ${tokenStatus}, BaseId: ${config.baseId}, Table: ${config.tableName}`);
    return config;
};

/**
 * Makes a GET request to Airtable API
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<object>} - Parsed JSON response
 */
function airtableRequest(endpoint) {
    const config = getAirtableConfig();
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.airtable.com',
            path: endpoint,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json'
            }
        };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Airtable API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Makes a PATCH request to Airtable API to update a record
 * @param {string} recordId - The Airtable record ID
 * @param {object} fields - The fields to update
 * @returns {Promise<object>} - Updated record
 */
function updateRecord(recordId, fields) {
    const config = getAirtableConfig();
    return new Promise((resolve, reject) => {
        const encodedTableName = encodeURIComponent(config.tableName);
        const postData = JSON.stringify({ fields });
        
        const options = {
            hostname: 'api.airtable.com',
            path: `/v0/${config.baseId}/${encodedTableName}/${recordId}`,
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Airtable API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Updates the Status field of a record to "Processed"
 * @param {string} recordId - The Airtable record ID
 * @returns {Promise<object>} - Updated record
 */
async function markAsProcessed(recordId) {
  console.info(`  Marking record ${recordId} as Processed...`);
  try {
    const result = await updateRecord(recordId, { Status: 'Processed' });
    console.info(`  ✓ Record marked as Processed`);
    return result;
  } catch (error) {
    console.error(`  ⚠ Failed to mark as Processed: ${error.message}`);
    throw error;
  }
}

/**
 * Extracts OTP code from email body text
 * @param {string} bodyText - The plain text body of the email
 * @returns {string|null} - The 6-digit OTP code or null if not found
 */
function extractOTPFromBody(bodyText) {
  const match = bodyText.match(/verification code is:\s*(\d{6})/i);
  return match ? match[1] : null;
}

/**
 * Fetches the latest OTP for a given email address
 * @param {string} email - The recipient email address to search for
 * @returns {Promise<{otp: string, record: object}|null>} - OTP and record, or null if not found
 */
async function fetchOTPByEmail(email) {
    const config = getAirtableConfig();
    console.log(`\n=== Fetching OTP for: ${email} ===`);
    console.log(`  From Email filter: ${config.fromEmail}\n`);
    
    try {
        const encodedTableName = encodeURIComponent(config.tableName);
        // Filter by "To Emails", "From Email" fields, exclude Processed, sort by "Created At" descending to get latest
        const filterFormula = encodeURIComponent(
            `AND({To Emails}='${email}', {From Email}='${config.fromEmail}', {Status}!='Processed')`
        );
        const sortField = encodeURIComponent('Created At');
        const endpoint = `/v0/${config.baseId}/${encodedTableName}?filterByFormula=${filterFormula}&sort[0][field]=${sortField}&sort[0][direction]=desc&maxRecords=1`;
        
        const response = await airtableRequest(endpoint);
        
        if (response.records && response.records.length > 0) {
            const record = response.records[0];
            const bodyPlain = record.fields['Body Plain'] || '';
            const otp = extractOTPFromBody(bodyPlain);
            
            if (otp) {
                console.log(`✓ Found OTP: ${otp}`);
                console.log(`  Created At: ${record.fields['Created At']}`);
                console.log(`  Subject: ${record.fields['Subject']}`);
                
                // Mark record as Processed
                await markAsProcessed(record.id);
                
                return { otp, record };
            } else {
                console.log('⚠ Record found but no OTP code in body');
                return null;
            }
        } else {
            console.log(`⚠ No email records found for: ${email}`);
            return null;
        }
    } catch (error) {
        console.error('✗ Error fetching OTP:', error.message);
        throw error;
    }
}

/**
 * Waits for OTP to appear in Airtable for a given email
 * Polls at regular intervals until OTP is found or timeout
 * @param {string} email - The recipient email address to search for
 * @param {number} timeoutMs - Maximum time to wait in milliseconds (default: 60000 = 1 minute)
 * @param {number} pollIntervalMs - Time between polls in milliseconds (default: 5000 = 5 seconds)
 * @param {Date} afterTime - Only consider records created after this time (default: now)
 * @returns {Promise<{otp: string, record: object}>} - OTP and record
 * @throws {Error} - If timeout is reached without finding OTP
 */
async function waitForOTP(email, timeoutMs = 60000, pollIntervalMs = 5000, afterTime = new Date()) {
    const config = getAirtableConfig();
    console.log(`\n=== Waiting for OTP for: ${email} ===`);
    console.log(`  From Email filter: ${config.fromEmail}`);
    console.log(`  Timeout: ${timeoutMs / 1000}s, Poll interval: ${pollIntervalMs / 1000}s`);
    console.log(`  Looking for records after: ${afterTime.toISOString()}\n`);
    
    const startTime = Date.now();
    let attempts = 0;
    
    while (Date.now() - startTime < timeoutMs) {
        attempts++;
        console.log(`  Attempt ${attempts}...`);
        
        try {
            const encodedTableName = encodeURIComponent(config.tableName);
            // Filter by email, from email, exclude Processed, AND created after the specified time
            const filterFormula = encodeURIComponent(
                `AND({To Emails}='${email}', {From Email}='${config.fromEmail}', {Status}!='Processed', IS_AFTER({Created At}, '${afterTime.toISOString()}'))`
            );
            const sortField = encodeURIComponent('Created At');
            const endpoint = `/v0/${config.baseId}/${encodedTableName}?filterByFormula=${filterFormula}&sort[0][field]=${sortField}&sort[0][direction]=desc&maxRecords=1`;
            
            const response = await airtableRequest(endpoint);
            
            if (response.records && response.records.length > 0) {
                const record = response.records[0];
                const bodyPlain = record.fields['Body Plain'] || '';
                const otp = extractOTPFromBody(bodyPlain);
                
                if (otp) {
                    console.log(`\n✓ OTP found after ${attempts} attempt(s): ${otp}`);
                    
                    // Mark record as Processed
                    await markAsProcessed(record.id);
                    
                    return { otp, record };
                }
            }
        } catch (error) {
            console.log(`  Error on attempt ${attempts}: ${error.message}`);
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
    
    throw new Error(`Timeout: No OTP found for ${email} after ${timeoutMs / 1000} seconds`);
}

module.exports = {
  fetchOTPByEmail,
  waitForOTP,
  extractOTPFromBody,
  markAsProcessed,
  updateRecord,
};

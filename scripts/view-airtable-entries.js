#!/usr/bin/env node
/**
 * Airtable Viewer - Display recent Airtable entries in a formatted table
 * 
 * Usage:
 *   ./scripts/view-airtable-entries.js [limit]
 *   node scripts/view-airtable-entries.js [limit]
 * 
 * Arguments:
 *   limit - Number of records to fetch (default: 10)
 * 
 * Loads configuration from app/.env file
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env file from app directory
const envPath = path.join(__dirname, '../app/.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^#][^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
    console.log('✅ Loaded configuration from app/.env\n');
} else {
    console.error('⚠️  .env file not found at:', envPath);
    console.error('Please create app/.env file based on app/.env.example\n');
}

// Configuration
const AIRTABLE_API_TOKEN = process.env.AIRTABLE_API_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
const AIRTABLE_FROM_EMAIL = process.env.AIRTABLE_FROM_EMAIL;

// Get limit from command line argument
const LIMIT = parseInt(process.argv[2]) || 10;

/**
 * Makes a GET request to Airtable API
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<object>} - Parsed JSON response
 */
function airtableRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.airtable.com',
            path: endpoint,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
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
 * Extracts OTP code from email body text
 * @param {string} bodyText - The plain text body of the email
 * @returns {string} - The 6-digit OTP code or 'N/A' if not found
 */
function extractOTP(bodyText) {
    if (!bodyText) return 'N/A';
    const match = bodyText.match(/verification code is:\s*(\d{6})/i);
    return match ? match[1] : 'N/A';
}

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncate(text, maxLength = 30) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}

/**
 * Formats a date string to a readable format
 * @param {string} dateStr - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/**
 * Pads a string to a specified length
 * @param {string} str - String to pad
 * @param {number} length - Target length
 * @returns {string} - Padded string
 */
function pad(str, length) {
    str = String(str || '');
    return str + ' '.repeat(Math.max(0, length - str.length));
}

/**
 * Fetches and displays recent Airtable entries
 */
async function viewEntries() {
    // Validate configuration
    if (!AIRTABLE_API_TOKEN || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
        console.error('❌ Missing required environment variables in app/.env:');
        if (!AIRTABLE_API_TOKEN) console.error('  - AIRTABLE_API_TOKEN');
        if (!AIRTABLE_BASE_ID) console.error('  - AIRTABLE_BASE_ID');
        if (!AIRTABLE_TABLE_NAME) console.error('  - AIRTABLE_TABLE_NAME');
        console.error('\nPlease configure these values in app/.env file\n');
        process.exit(1);
    }

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║           AIRTABLE ENTRIES VIEWER                              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log(`📊 Base: ${AIRTABLE_BASE_ID}`);
    console.log(`📋 Table: ${AIRTABLE_TABLE_NAME}`);
    console.log(`🔍 Limit: ${LIMIT} records`);
    if (AIRTABLE_FROM_EMAIL) {
        console.log(`📧 From Email Filter: ${AIRTABLE_FROM_EMAIL}`);
    }
    console.log();

    try {
        const encodedTableName = encodeURIComponent(AIRTABLE_TABLE_NAME);
        
        // Build filter formula if FROM_EMAIL is specified
        let endpoint = `/v0/${AIRTABLE_BASE_ID}/${encodedTableName}?`;
        if (AIRTABLE_FROM_EMAIL) {
            const filterFormula = encodeURIComponent(`{From Email}='${AIRTABLE_FROM_EMAIL}'`);
            endpoint += `filterByFormula=${filterFormula}&`;
        }
        
        // Sort by Created At descending
        const sortField = encodeURIComponent('Created At');
        endpoint += `sort[0][field]=${sortField}&sort[0][direction]=desc&maxRecords=${LIMIT}`;
        
        console.log('⏳ Fetching records...\n');
        const response = await airtableRequest(endpoint);
        
        if (!response.records || response.records.length === 0) {
            console.log('📭 No records found.\n');
            return;
        }

        console.log(`✅ Found ${response.records.length} record(s)\n`);
        
        // Print table header
        const divider = '─'.repeat(140);
        console.log('┌' + divider + '┐');
        console.log('│ ' + pad('Created At', 18) + ' │ ' + 
                    pad('To Email', 32) + ' │ ' + 
                    pad('Subject', 35) + ' │ ' + 
                    pad('OTP', 8) + ' │ ' + 
                    pad('Status', 12) + ' │');
        console.log('├' + divider + '┤');
        
        // Print each record
        response.records.forEach((record, index) => {
            const fields = record.fields;
            const createdAt = formatDate(fields['Created At']);
            const toEmail = truncate(fields['To Emails'], 32);
            const subject = truncate(fields['Subject'], 35);
            const otp = extractOTP(fields['Body Plain']);
            const status = fields['Status'] || 'New';
            
            console.log('│ ' + pad(createdAt, 18) + ' │ ' + 
                        pad(toEmail, 32) + ' │ ' + 
                        pad(subject, 35) + ' │ ' + 
                        pad(otp, 8) + ' │ ' + 
                        pad(status, 12) + ' │');
            
            if (index < response.records.length - 1) {
                console.log('├' + divider + '┤');
            }
        });
        
        console.log('└' + divider + '┘\n');
        
        // Print summary statistics
        const processed = response.records.filter(r => r.fields['Status'] === 'Processed').length;
        const unprocessed = response.records.length - processed;
        
        console.log('📈 Summary:');
        console.log(`   Total: ${response.records.length} records`);
        console.log(`   Processed: ${processed}`);
        console.log(`   Unprocessed: ${unprocessed}`);
        console.log();
        
    } catch (error) {
        console.error('❌ Error fetching entries:', error.message);
        process.exit(1);
    }
}

// Run the viewer
viewEntries();

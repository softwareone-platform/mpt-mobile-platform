const https = require('https');
const { API_BASE_URL, API_OPS_TOKEN } = require('./env');

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.opsToken = API_OPS_TOKEN;

    if (!this.opsToken) {
      console.warn('⚠️  API_OPS_TOKEN not set in .env - API calls will fail');
    }
  }

  /**
   * Makes an authenticated GET request to the API
   * @param {string} endpoint - API endpoint path (e.g., '/public/v1/accounts/users/USR-0556-8733')
   * @returns {Promise<object>} - Parsed JSON response
   */
  async get(endpoint) {
    return this._request('GET', endpoint);
  }

  /**
   * Makes an authenticated POST request to the API
   * @param {string} endpoint - API endpoint path
   * @param {object} body - Request body
   * @returns {Promise<object>} - Parsed JSON response
   */
  async post(endpoint, body) {
    return this._request('POST', endpoint, body);
  }

  /**
   * Internal method to make HTTP requests
   * @private
   */
  async _request(method, endpoint, body = null) {
    const url = new URL(endpoint, this.baseUrl);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${this.opsToken}`,
        'request-context': 'appId=cid-v1:MobileAutomation',
        'content-type': 'application/json',
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(data);
            }
          } else {
            reject(new Error(`API request failed: ${res.statusCode} ${res.statusMessage}\n${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`API request error: ${error.message}`));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  // ========== User Information Methods ==========

  /**
   * Get user information including associated accounts
   * @param {string} userId - User ID in format USR-XXXX-XXXX (e.g., 'USR-0556-8733')
   *                          This should come from the Profile page's "Your Profile" user entry
   * @returns {Promise<object>} - User information data including accounts
   * @throws {Error} - If userId is invalid format or API call fails
   * 
   * @example
   * // Get user ID from Profile page in test
   * const userId = await profilePage.getCurrentUserId(); // Returns 'USR-5988-7474'
   * const userInfo = await apiClient.getUserInformation(userId);
   */
  async getUserInformation(userId) {
    // Validate userId format
    if (!userId || !/^USR-\d{4}-\d{4}$/.test(userId)) {
      throw new Error(`Invalid userId format: "${userId}". Expected format: USR-XXXX-XXXX`);
    }
    
    return this.get(`/public/v1/accounts/users/${userId}`);
  }

  /**
   * Get accounts list for a user (convenience method)
   * @param {string} userId - User ID in format USR-XXXX-XXXX
   *                          Typically retrieved from profilePage.getCurrentUserId()
   * @returns {Promise<Array>} - Array of account objects
   * 
   * @example
   * // In test file:
   * const userId = await profilePage.getCurrentUserId();
   * const accounts = await apiClient.getAccountsList(userId);
   * console.log(`User has ${accounts.length} accounts`);
   */
  async getAccountsList(userId) {
    const response = await this.getUserInformation(userId);
    // Adjust based on actual API response structure
    return response.data || response.accounts || response;
  }
}

// Export singleton instance
const apiClient = new ApiClient();

module.exports = { ApiClient, apiClient };

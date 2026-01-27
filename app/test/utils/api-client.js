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

  // ========== Orders Methods ==========

  /**
   * Get orders list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of orders to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by order status (Draft, Quoted, Completed, etc.)
   * @returns {Promise<object>} - Orders list response
   * 
   * @example
   * // Get all orders
   * const orders = await apiClient.getOrders();
   * 
   * // Get orders with pagination
   * const orders = await apiClient.getOrders({ limit: 10, offset: 0 });
   * 
   * // Get orders by status
   * const draftOrders = await apiClient.getOrders({ status: 'Draft' });
   */
  async getOrders(options = {}) {
    let endpoint = '/public/v1/commerce/orders';
    
    const queryParams = [];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);
    if (options.status) queryParams.push(`status=${options.status}`);
    
    if (queryParams.length > 0) {
      endpoint += '?' + queryParams.join('&');
    }
    
    return this.get(endpoint);
  }

  /**
   * Get a specific order by ID
   * @param {string} orderId - Order ID in format ORD-XXXX-XXXX-XXXX
   * @returns {Promise<object>} - Order details
   * 
   * @example
   * const order = await apiClient.getOrderById('ORD-3760-9768-9099');
   */
  async getOrderById(orderId) {
    // Validate orderId format
    if (!orderId || !/^ORD-\d{4}-\d{4}-\d{4}$/.test(orderId)) {
      throw new Error(`Invalid orderId format: "${orderId}". Expected format: ORD-XXXX-XXXX-XXXX`);
    }
    
    return this.get(`/public/v1/commerce/orders/${orderId}`);
  }

  /**
   * Get orders count
   * @returns {Promise<number>} - Total number of orders
   */
  async getOrdersCount() {
    const response = await this.getOrders({ limit: 1 });
    return response.pagination?.total || response.data?.length || 0;
  }

  /**
   * Check if user has any orders
   * @returns {Promise<boolean>}
   */
  async hasOrders() {
    const count = await this.getOrdersCount();
    return count > 0;
  }

  /**
   * Get orders by status
   * @param {string} status - Order status (Draft, Quoted, Completed, Deleted, Failed)
   * @returns {Promise<Array>} - Array of orders with the specified status
   */
  async getOrdersByStatus(status) {
    const validStatuses = ['Draft', 'Quoted', 'Completed', 'Deleted', 'Failed'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const response = await this.getOrders({ status });
    return response.data || response;
  }

  // ========== Spotlight Methods ==========

  /**
   * Get spotlight data for the authenticated user
   * @param {number} [limit=100] - Maximum number of items per category to return
   * @returns {Promise<object>} - Spotlight data with categories and counts
   * 
   * @example
   * const spotlight = await apiClient.getSpotlightData();
   * // Returns: { $meta: {...}, data: [{ id: 'orders-long-running', total: 5, top: [...] }, ...] }
   */
  async getSpotlightData(limit = 100) {
    return this.get(`/public/v1/spotlight/objects?select=top&limit=${limit}`);
  }

  /**
   * Get spotlight objects by template name
   * @param {string} templateName - Template name (e.g., 'longRunningOrders', 'expiringSubscriptions')
   * @returns {Promise<object>} - Spotlight data for that template
   */
  async getSpotlightByTemplate(templateName) {
    return this.get(`/public/v1/spotlight/objects?eq(query.template,"${templateName}")&select=top`);
  }

  /**
   * Get spotlight category counts - useful for checking data availability
   * @returns {Promise<object>} - Object with category totals
   * 
   * @example
   * const counts = await apiClient.getSpotlightCounts();
   * // Returns: {
   * //   'longRunningOrders': 5,
   * //   'expiringSubscriptions': 3,
   * //   'pendingInvites': 2,
   * //   ...
   * // }
   */
  async getSpotlightCounts() {
    // Note: limit controls number of categories returned, not items per category
    // Use 100 to ensure we get all spotlight categories
    const response = await this.getSpotlightData(100);
    const counts = {};
    
    if (response.data && Array.isArray(response.data)) {
      for (const item of response.data) {
        // Use query.template as the key (e.g., 'inProgressJournals', 'expiringSubscriptions')
        const templateName = item.query?.template;
        if (templateName) {
          counts[templateName] = item.total || 0;
        }
      }
    }
    
    return counts;
  }

  /**
   * Check spotlight data availability by category type
   * @returns {Promise<object>} - Object with boolean flags for each category
   * 
   * Template names from API (query.template field):
   * - orders: 'longRunningOrders', 'processingOrders', 'queryingOrders', 'savedOrdersClient', 'savedOrdersOperations'
   * - subscriptions: 'expiringSubscriptions', 'renewingSubscriptions', 'expiringSubscriptionsOfMyClients'
   * - users: 'pendingInvites', 'expiredInvites', 'pendingInvitesOfMyClients', 'expiredInvitesOfMyClients'
   * - invoices: 'invoicesPastDue', 'unpaidInvoices', 'invoicesPastDueOfMyClients', 'unpaidInvoicesOfMyClients'
   * - journals: 'inProgressJournals'
   * - enrollments: 'queryingEnrollments', 'processingEnrollments', 'longRunningEnrollmentsOfMyClients'
   * - buyers: 'mismatchingBuyersClient', 'mismatchingBuyersOfMyClients', 'buyersWithBlockedSellerConnectionsOfMyClients'
   */
  async getSpotlightDataAvailability() {
    const counts = await this.getSpotlightCounts();
    
    return {
      hasOrders: (counts['longRunningOrders'] || 0) > 0 ||
                 (counts['processingOrders'] || 0) > 0 ||
                 (counts['queryingOrders'] || 0) > 0 ||
                 (counts['savedOrdersClient'] || 0) > 0 ||
                 (counts['savedOrdersOperations'] || 0) > 0,
      hasSubscriptions: (counts['expiringSubscriptions'] || 0) > 0 ||
                        (counts['renewingSubscriptions'] || 0) > 0 ||
                        (counts['expiringSubscriptionsOfMyClients'] || 0) > 0,
      hasUsers: (counts['pendingInvites'] || 0) > 0 || 
                (counts['expiredInvites'] || 0) > 0 ||
                (counts['pendingInvitesOfMyClients'] || 0) > 0 ||
                (counts['expiredInvitesOfMyClients'] || 0) > 0,
      hasInvoices: (counts['invoicesPastDue'] || 0) > 0 ||
                   (counts['unpaidInvoices'] || 0) > 0 ||
                   (counts['invoicesPastDueOfMyClients'] || 0) > 0 ||
                   (counts['unpaidInvoicesOfMyClients'] || 0) > 0,
      hasJournals: (counts['inProgressJournals'] || 0) > 0,
      hasEnrollments: (counts['queryingEnrollments'] || 0) > 0 ||
                      (counts['processingEnrollments'] || 0) > 0 ||
                      (counts['longRunningEnrollmentsOfMyClients'] || 0) > 0,
      hasBuyers: (counts['mismatchingBuyersClient'] || 0) > 0 || 
                 (counts['mismatchingBuyersOfMyClients'] || 0) > 0 ||
                 (counts['buyersWithBlockedSellerConnectionsOfMyClients'] || 0) > 0,
      // Raw counts for detailed logging
      _counts: counts,
    };
  }

  /**
   * Check if user has any spotlight data
   * @returns {Promise<boolean>}
   */
  async hasSpotlightData() {
    const availability = await this.getSpotlightDataAvailability();
    return availability.hasOrders || availability.hasSubscriptions || 
           availability.hasUsers || availability.hasInvoices || 
           availability.hasJournals || availability.hasEnrollments || 
           availability.hasBuyers;
  }
}

// Export singleton instance
const apiClient = new ApiClient();

module.exports = { ApiClient, apiClient };

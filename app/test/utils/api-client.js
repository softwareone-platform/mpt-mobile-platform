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
   * console.info(`User has ${accounts.length} accounts`);
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

  // ========== Subscriptions Methods ==========

  /**
   * Get subscriptions list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of subscriptions to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by subscription status (Active, Terminated, etc.)
   * @returns {Promise<object>} - Subscriptions list response
   * 
   * @example
   * // Get all subscriptions
   * const subscriptions = await apiClient.getSubscriptions();
   * 
   * // Get subscriptions with pagination
   * const subscriptions = await apiClient.getSubscriptions({ limit: 10, offset: 0 });
   * 
   * // Get subscriptions by status
   * const activeSubscriptions = await apiClient.getSubscriptions({ status: 'Active' });
   */
  async getSubscriptions(options = {}) {
    let endpoint = '/public/v1/commerce/subscriptions';
    
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
   * Get a specific subscription by ID
   * @param {string} subscriptionId - Subscription ID in format SUB-XXXX-XXXX-XXXX
   * @returns {Promise<object>} - Subscription details
   * 
   * @example
   * const subscription = await apiClient.getSubscriptionById('SUB-2539-6731-4903');
   */
  async getSubscriptionById(subscriptionId) {
    // Validate subscriptionId format
    if (!subscriptionId || !/^SUB-\d{4}-\d{4}-\d{4}$/.test(subscriptionId)) {
      throw new Error(`Invalid subscriptionId format: "${subscriptionId}". Expected format: SUB-XXXX-XXXX-XXXX`);
    }
    
    return this.get(`/public/v1/commerce/subscriptions/${subscriptionId}`);
  }

  /**
   * Get subscriptions count
   * @returns {Promise<number>} - Total number of subscriptions
   */
  async getSubscriptionsCount() {
    const response = await this.getSubscriptions({ limit: 1 });
    return response.pagination?.total || response.data?.length || 0;
  }

  /**
   * Check if user has any subscriptions
   * @returns {Promise<boolean>}
   */
  async hasSubscriptions() {
    const count = await this.getSubscriptionsCount();
    return count > 0;
  }

  /**
   * Get subscriptions by status
   * @param {string} status - Subscription status (Active, Terminated, Updating, Terminating)
   * @returns {Promise<Array>} - Array of subscriptions with the specified status
   */
  async getSubscriptionsByStatus(status) {
    const validStatuses = ['Active', 'Terminated', 'Updating', 'Terminating', 'Suspended'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const response = await this.getSubscriptions({ status });
    return response.data || response;
  }

  // ========== Invoices Methods ==========

  /**
   * Get invoices list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of invoices to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by invoice status (Issued, Paid, Cancelled, etc.)
   * @returns {Promise<object>} - Invoices list response
   *
   * @example
   * // Get all invoices
   * const invoices = await apiClient.getInvoices();
   *
   * // Get invoices with pagination
   * const invoices = await apiClient.getInvoices({ limit: 10, offset: 0 });
   *
   * // Get invoices by status
   * const issuedInvoices = await apiClient.getInvoices({ status: 'Issued' });
   */
  async getInvoices(options = {}) {
    let endpoint = '/public/v1/billing/invoices';

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
   * Get a specific invoice by ID
   * @param {string} invoiceId - Invoice ID in format INV-XXXX-XXXX-XXXX-XXXX
   * @returns {Promise<object>} - Invoice details
   *
   * @example
   * const invoice = await apiClient.getInvoiceById('INV-3995-3781-4639-3898');
   */
  async getInvoiceById(invoiceId) {
    // Validate invoiceId format
    if (!invoiceId || !/^INV-\d{4}-\d{4}-\d{4}-\d{4}$/.test(invoiceId)) {
      throw new Error(`Invalid invoiceId format: "${invoiceId}". Expected format: INV-XXXX-XXXX-XXXX-XXXX`);
    }
    return this.get(`/public/v1/billing/invoices/${invoiceId}`);
  }

  // ========== Agreements Methods ==========

  /**
   * Get agreements list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of agreements to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by agreement status (Active, Terminated, etc.)
   * @returns {Promise<object>} - Agreements list response
   * 
   * @example
   * // Get all agreements
   * const agreements = await apiClient.getAgreements();
   * 
   * // Get agreements with pagination
   * const agreements = await apiClient.getAgreements({ limit: 10, offset: 0 });
   * 
   * // Get agreements by status
   * const activeAgreements = await apiClient.getAgreements({ status: 'Active' });
   */
  async getAgreements(options = {}) {
    let endpoint = '/public/v1/commerce/agreements';
    
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
   * Get a specific agreement by ID
   * @param {string} agreementId - Agreement ID in format AGR-XXXX-XXXX-XXXX
   * @returns {Promise<object>} - Agreement details
   * 
   * @example
   * const agreement = await apiClient.getAgreementById('AGR-0000-0039-2883');
   */
  async getAgreementById(agreementId) {
    // Validate agreementId format
    if (!agreementId || !/^AGR-\d{4}-\d{4}-\d{4}$/.test(agreementId)) {
      throw new Error(`Invalid agreementId format: "${agreementId}". Expected format: AGR-XXXX-XXXX-XXXX`);
    }
    
    return this.get(`/public/v1/commerce/agreements/${agreementId}`);
  }

  /**
   * Get agreements count
   * @returns {Promise<number>} - Total number of agreements
   */
  async getAgreementsCount() {
    const response = await this.getAgreements({ limit: 1 });
    return response.pagination?.total || response.data?.length || 0;
  }

  /**
   * Check if user has any agreements
   * @returns {Promise<boolean>}
   */
  async hasAgreements() {
    const count = await this.getAgreementsCount();
    return count > 0;
  }

  /**
   * Get agreements by status
   * @param {string} status - Agreement status (Active, Terminated, Deleted, Provisioning)
   * @returns {Promise<Array>} - Array of agreements with the specified status
   */
  async getAgreementsByStatus(status) {
    const validStatuses = ['Active', 'Terminated', 'Deleted', 'Provisioning', 'Updating'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const response = await this.getAgreements({ status });
    return response.data || response;
  }

  // ========== Programs Methods ==========

  /**
   * Get programs list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of programs to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by program status (Unpublished, Draft, Published)
   * @returns {Promise<object>} - Programs list response
   * 
   * @example
   * // Get all programs
   * const programs = await apiClient.getPrograms();
   * 
   * // Get programs with pagination
   * const programs = await apiClient.getPrograms({ limit: 10, offset: 0 });
   * 
   * // Get programs by status
   * const publishedPrograms = await apiClient.getPrograms({ status: 'Published' });
   */
  async getPrograms(options = {}) {
    let endpoint = '/public/v1/program/programs';
    
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
   * Get a specific program by ID
   * @param {string} programId - Program ID in format PRG-XXXX-XXXX
   * @returns {Promise<object>} - Program details
   * 
   * @example
   * const program = await apiClient.getProgramById('PRG-7725-9433');
   */
  async getProgramById(programId) {
    // Validate programId format (3-group)
    if (!programId || !/^PRG-\d{4}-\d{4}$/.test(programId)) {
      throw new Error(`Invalid programId format: "${programId}". Expected format: PRG-XXXX-XXXX`);
    }
    
    return this.get(`/public/v1/program/programs/${programId}`);
  }

  /**
   * Get programs count
   * @returns {Promise<number>} - Total number of programs
   */
  async getProgramsCount() {
    const response = await this.getPrograms({ limit: 1 });
    return response.pagination?.total || response.data?.length || 0;
  }

  /**
   * Check if user has any programs
   * @returns {Promise<boolean>}
   */
  async hasPrograms() {
    const count = await this.getProgramsCount();
    return count > 0;
  }

  /**
   * Get programs by status
   * @param {string} status - Program status (Unpublished, Draft, Published)
   * @returns {Promise<Array>} - Array of programs with the specified status
   */
  async getProgramsByStatus(status) {
    const validStatuses = ['Unpublished', 'Draft', 'Published'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const response = await this.getPrograms({ status });
    return response.data || response;
  }

  // ========== Enrollments Methods ==========

  /**
   * Get enrollments list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of enrollments to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by enrollment status (Draft, Completed, Processing)
   * @returns {Promise<object>} - Enrollments list response
   * 
   * @example
   * // Get all enrollments
   * const enrollments = await apiClient.getEnrollments();
   * 
   * // Get enrollments with pagination
   * const enrollments = await apiClient.getEnrollments({ limit: 10, offset: 0 });
   * 
   * // Get enrollments by status
   * const completedEnrollments = await apiClient.getEnrollments({ status: 'Completed' });
   */
  async getEnrollments(options = {}) {
    let endpoint = '/public/v1/program/enrollments';
    
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
   * Get a specific enrollment by ID
   * @param {string} enrollmentId - Enrollment ID in format ENR-XXXX-XXXX-XXXX
   * @returns {Promise<object>} - Enrollment details
   * 
   * @example
   * const enrollment = await apiClient.getEnrollmentById('ENR-9994-9916-5145');
   */
  async getEnrollmentById(enrollmentId) {
    // Validate enrollmentId format (4-group)
    if (!enrollmentId || !/^ENR-\d{4}-\d{4}-\d{4}$/.test(enrollmentId)) {
      throw new Error(`Invalid enrollmentId format: "${enrollmentId}". Expected format: ENR-XXXX-XXXX-XXXX`);
    }
    
    return this.get(`/public/v1/program/enrollments/${enrollmentId}`);
  }

  /**
   * Get enrollments count
   * @returns {Promise<number>} - Total number of enrollments
   */
  async getEnrollmentsCount() {
    const response = await this.getEnrollments({ limit: 1 });
    return response.pagination?.total || response.data?.length || 0;
  }

  /**
   * Check if user has any enrollments
   * @returns {Promise<boolean>}
   */
  async hasEnrollments() {
    const count = await this.getEnrollmentsCount();
    return count > 0;
  }

  /**
   * Get enrollments by status
   * @param {string} status - Enrollment status (Draft, Completed, Processing)
   * @returns {Promise<Array>} - Array of enrollments with the specified status
   */
  async getEnrollmentsByStatus(status) {
    const validStatuses = ['Draft', 'Completed', 'Processing'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const response = await this.getEnrollments({ status });
    return response.data || response;
  }

  // ========== Licensees Methods ==========

  /**
   * Get licensees list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of licensees to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by licensee status (Enabled, Disabled)
   * @returns {Promise<object>} - Licensees list response
   * 
   * Note: The Licensees API may require accountId parameter depending on the endpoint
   * 
   * @example
   * // Get all licensees
   * const licensees = await apiClient.getLicensees();
   * 
   * // Get licensees with pagination
   * const licensees = await apiClient.getLicensees({ limit: 10, offset: 0 });
   */
  async getLicensees(options = {}) {
    let endpoint = '/public/v1/accounts/licensees';
    
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
   * Get a specific licensee by ID
   * @param {string} licenseeId - Licensee ID in format LCE-XXXX-XXXX-XXXX
   * @returns {Promise<object>} - Licensee details
   * 
   * @example
   * const licensee = await apiClient.getLicenseeById('LCE-6773-3048-1612');
   */
  async getLicenseeById(licenseeId) {
    // Validate licenseeId format (4-group)
    if (!licenseeId || !/^LCE-\d{4}-\d{4}-\d{4}$/.test(licenseeId)) {
      throw new Error(`Invalid licenseeId format: "${licenseeId}". Expected format: LCE-XXXX-XXXX-XXXX`);
    }
    
    return this.get(`/public/v1/accounts/licensees/${licenseeId}`);
  }

  /**
   * Get licensees count
   * @returns {Promise<number>} - Total number of licensees
   */
  async getLicenseesCount() {
    const response = await this.getLicensees({ limit: 1 });
    return response.pagination?.total || response.data?.length || 0;
  }

  /**
   * Check if user has any licensees
   * @returns {Promise<boolean>}
   */
  async hasLicensees() {
    const count = await this.getLicenseesCount();
    return count > 0;
  }

  /**
   * Get licensees by status
   * @param {string} status - Licensee status (Enabled, Disabled)
   * @returns {Promise<Array>} - Array of licensees with the specified status
   */
  async getLicenseesByStatus(status) {
    const validStatuses = ['Enabled', 'Disabled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const response = await this.getLicensees({ status });
    return response.data || response;
  }

  // ========== Buyers Methods ==========

  /**
   * Get buyers list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of buyers to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by buyer status (Active, Unassigned)
   * @returns {Promise<object>} - Buyers list response
   * 
   * @example
   * // Get all buyers
   * const buyers = await apiClient.getBuyers();
   * 
   * // Get buyers with pagination
   * const buyers = await apiClient.getBuyers({ limit: 10, offset: 0 });
   * 
   * // Get buyers by status
   * const activeBuyers = await apiClient.getBuyers({ status: 'Active' });
   */
  async getBuyers(options = {}) {
    let endpoint = '/public/v1/accounts/buyers';
    
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
   * Get a specific buyer by ID
   * @param {string} buyerId - Buyer ID in format BUY-XXXX-XXXX
   * @returns {Promise<object>} - Buyer details
   * 
   * @example
   * const buyer = await apiClient.getBuyerById('BUY-6619-8697');
   */
  async getBuyerById(buyerId) {
    // Validate buyerId format (3-group)
    if (!buyerId || !/^BUY-\d{4}-\d{4}$/.test(buyerId)) {
      throw new Error(`Invalid buyerId format: "${buyerId}". Expected format: BUY-XXXX-XXXX`);
    }
    
    return this.get(`/public/v1/accounts/buyers/${buyerId}`);
  }

  /**
   * Get buyers count
   * @returns {Promise<number>} - Total number of buyers
   */
  async getBuyersCount() {
    const response = await this.getBuyers({ limit: 1 });
    return response.pagination?.total || response.data?.length || 0;
  }

  /**
   * Check if user has any buyers
   * @returns {Promise<boolean>}
   */
  async hasBuyers() {
    const count = await this.getBuyersCount();
    return count > 0;
  }

  /**
   * Get buyers by status
   * @param {string} status - Buyer status (Active, Unassigned)
   * @returns {Promise<Array>} - Array of buyers with the specified status
   */
  async getBuyersByStatus(status) {
    const validStatuses = ['Active', 'Unassigned'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const response = await this.getBuyers({ status });
    return response.data || response;
  }

  // ========== Spotlight Methods ==========

  /**
   * Get spotlight data for the authenticated user (all categories)
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
   * This is the preferred method for checking specific spotlight categories
   * @param {string} templateName - Template name (e.g., 'longRunningOrders', 'expiringSubscriptions')
   * @returns {Promise<object>} - Spotlight data for that template
   */
  async getSpotlightByTemplate(templateName) {
    return this.get(`/public/v1/spotlight/objects?eq(query.template,"${templateName}")&select=top`);
  }

  // ========== Spotlight Template-Specific Methods ==========
  // Following the pattern from swo-e2e-uitest reference implementation

  // Orders templates
  async getSpotlightLongRunningOrders() {
    return this.getSpotlightByTemplate('longRunningOrders');
  }

  async getSpotlightProcessingOrders() {
    return this.getSpotlightByTemplate('processingOrders');
  }

  async getSpotlightQueryingOrders() {
    return this.getSpotlightByTemplate('queryingOrders');
  }

  async getSpotlightSavedOrdersClient() {
    return this.getSpotlightByTemplate('savedOrdersClient');
  }

  async getSpotlightSavedOrdersOperations() {
    return this.getSpotlightByTemplate('savedOrdersOperations');
  }

  // Subscriptions templates
  async getSpotlightExpiringSubscriptions() {
    return this.getSpotlightByTemplate('expiringSubscriptions');
  }

  async getSpotlightRenewingSubscriptions() {
    return this.getSpotlightByTemplate('renewingSubscriptions');
  }

  async getSpotlightExpiringSubscriptionsOfMyClients() {
    return this.getSpotlightByTemplate('expiringSubscriptionsOfMyClients');
  }

  // Users/Invites templates
  async getSpotlightPendingInvites() {
    return this.getSpotlightByTemplate('pendingInvites');
  }

  async getSpotlightExpiredInvites() {
    return this.getSpotlightByTemplate('expiredInvites');
  }

  async getSpotlightPendingInvitesOfMyClients() {
    return this.getSpotlightByTemplate('pendingInvitesOfMyClients');
  }

  async getSpotlightExpiredInvitesOfMyClients() {
    return this.getSpotlightByTemplate('expiredInvitesOfMyClients');
  }

  // Invoices templates
  async getSpotlightInvoicesPastDue() {
    return this.getSpotlightByTemplate('invoicesPastDue');
  }

  async getSpotlightUnpaidInvoices() {
    return this.getSpotlightByTemplate('unpaidInvoices');
  }

  async getSpotlightInvoicesPastDueOfMyClients() {
    return this.getSpotlightByTemplate('invoicesPastDueOfMyClients');
  }

  async getSpotlightUnpaidInvoicesOfMyClients() {
    return this.getSpotlightByTemplate('unpaidInvoicesOfMyClients');
  }

  // Journals templates
  async getSpotlightInProgressJournals() {
    return this.getSpotlightByTemplate('inProgressJournals');
  }

  // Enrollments templates
  async getSpotlightQueryingEnrollments() {
    return this.getSpotlightByTemplate('queryingEnrollments');
  }

  async getSpotlightProcessingEnrollments() {
    return this.getSpotlightByTemplate('processingEnrollments');
  }

  async getSpotlightLongRunningEnrollmentsOfMyClients() {
    return this.getSpotlightByTemplate('longRunningEnrollmentsOfMyClients');
  }

  // Buyers templates
  async getSpotlightMismatchingBuyersClient() {
    return this.getSpotlightByTemplate('mismatchingBuyersClient');
  }

  async getSpotlightMismatchingBuyersOfMyClients() {
    return this.getSpotlightByTemplate('mismatchingBuyersOfMyClients');
  }

  async getSpotlightBuyersWithBlockedConnections() {
    return this.getSpotlightByTemplate('buyersWithBlockedSellerConnectionsOfMyClients');
  }

  // ========== Spotlight Data Availability Helpers ==========

  /**
   * Helper to check if a spotlight template has data
   * @param {string} templateName - Template name to check
   * @returns {Promise<{hasData: boolean, total: number}>}
   */
  async checkSpotlightTemplateHasData(templateName) {
    try {
      const response = await this.getSpotlightByTemplate(templateName);
      const total = response?.data?.[0]?.total || 0;
      return { hasData: total > 0, total };
    } catch (error) {
      console.warn(`⚠️ Failed to check spotlight template '${templateName}':`, error.message);
      return { hasData: false, total: 0 };
    }
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
    try {
      const response = await this.getSpotlightData(100);
      const counts = {};
      
      if (!response) {
        console.warn('⚠️ getSpotlightCounts: API returned null/undefined response');
        return counts;
      }
      
      if (!response.data) {
        console.warn('⚠️ getSpotlightCounts: API response has no data field. Response keys:', Object.keys(response));
        // Log first 500 chars of response for debugging
        console.warn('⚠️ Response preview:', JSON.stringify(response).substring(0, 500));
        return counts;
      }
      
      if (!Array.isArray(response.data)) {
        console.warn('⚠️ getSpotlightCounts: response.data is not an array. Type:', typeof response.data);
        return counts;
      }
      
      if (response.data.length === 0) {
        console.warn('⚠️ getSpotlightCounts: response.data is empty array');
        return counts;
      }
      
      for (const item of response.data) {
        // Use query.template as the key (e.g., 'inProgressJournals', 'expiringSubscriptions')
        const templateName = item.query?.template;
        if (templateName) {
          counts[templateName] = item.total || 0;
        }
      }
      
      return counts;
    } catch (error) {
      console.error('❌ getSpotlightCounts failed:', error.message);
      return {};
    }
  }

  /**
   * Check spotlight data availability by category type
   * Uses individual template queries for more reliable results
   * @param {boolean} [useIndividualQueries=true] - Use individual template queries (more reliable) or bulk query
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
  async getSpotlightDataAvailability(useIndividualQueries = true) {
    if (useIndividualQueries) {
      return this.getSpotlightDataAvailabilityByTemplate();
    }
    
    // Fallback to bulk query method
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
   * Check spotlight data availability using individual template queries
   * This is more reliable than the bulk query approach
   * @returns {Promise<object>} - Object with boolean flags for each category
   */
  async getSpotlightDataAvailabilityByTemplate() {
    console.info('📊 Checking spotlight data availability using individual template queries...');
    
    // Define templates per category
    const templatesByCategory = {
      orders: ['longRunningOrders', 'processingOrders', 'queryingOrders', 'savedOrdersClient', 'savedOrdersOperations'],
      subscriptions: ['expiringSubscriptions', 'renewingSubscriptions', 'expiringSubscriptionsOfMyClients'],
      users: ['pendingInvites', 'expiredInvites', 'pendingInvitesOfMyClients', 'expiredInvitesOfMyClients'],
      invoices: ['invoicesPastDue', 'unpaidInvoices', 'invoicesPastDueOfMyClients', 'unpaidInvoicesOfMyClients'],
      journals: ['inProgressJournals'],
      enrollments: ['queryingEnrollments', 'processingEnrollments', 'longRunningEnrollmentsOfMyClients'],
      buyers: ['mismatchingBuyersClient', 'mismatchingBuyersOfMyClients', 'buyersWithBlockedSellerConnectionsOfMyClients'],
    };

    const counts = {};
    const results = {
      hasOrders: false,
      hasSubscriptions: false,
      hasUsers: false,
      hasInvoices: false,
      hasJournals: false,
      hasEnrollments: false,
      hasBuyers: false,
      _counts: counts,
    };

    // Query each category in parallel
    const categoryPromises = Object.entries(templatesByCategory).map(async ([category, templates]) => {
      // Query templates in parallel within each category
      const templateResults = await Promise.all(
        templates.map(async (template) => {
          const { hasData, total } = await this.checkSpotlightTemplateHasData(template);
          counts[template] = total;
          return hasData;
        })
      );
      // Category has data if any template has data
      return { category, hasData: templateResults.some(Boolean) };
    });

    const categoryResults = await Promise.all(categoryPromises);
    
    // Map results to flags
    for (const { category, hasData } of categoryResults) {
      switch (category) {
        case 'orders': results.hasOrders = hasData; break;
        case 'subscriptions': results.hasSubscriptions = hasData; break;
        case 'users': results.hasUsers = hasData; break;
        case 'invoices': results.hasInvoices = hasData; break;
        case 'journals': results.hasJournals = hasData; break;
        case 'enrollments': results.hasEnrollments = hasData; break;
        case 'buyers': results.hasBuyers = hasData; break;
      }
    }

    console.info('📊 Spotlight data availability results:', {
      hasOrders: results.hasOrders,
      hasSubscriptions: results.hasSubscriptions,
      hasUsers: results.hasUsers,
      hasInvoices: results.hasInvoices,
      hasJournals: results.hasJournals,
      hasEnrollments: results.hasEnrollments,
      hasBuyers: results.hasBuyers,
    });
    console.info('📊 Individual template counts:', counts);

    return results;
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

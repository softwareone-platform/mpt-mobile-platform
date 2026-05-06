const https = require('https');
const { API_BASE_URL, API_OPS_TOKEN, API_CLIENT_TOKEN, API_VENDOR_TOKEN, CLIENT_ACCOUNT_ID } = require('./env');
const { STATUSES } = require('../pageobjects/utils/constants');

const sharedAgent = new https.Agent({ keepAlive: true, maxSockets: 6 });

/**
 * Token propagation wait time in milliseconds.
 * Newly created API tokens need ~60 seconds to propagate across the platform
 * before they can be used for API calls.
 */
const TOKEN_PROPAGATION_WAIT_MS = 60000;

/**
 * Prefix for auto-created API tokens. Used to search for and reuse existing tokens.
 */
const TOKEN_NAME_PREFIX = 'mobile-e2e-setup';

class ApiClient {
  constructor(token) {
    this.baseUrl = API_BASE_URL;
    this.token = token || API_OPS_TOKEN;

    if (!this.token) {
      console.warn('⚠️  API token not set - API calls will fail');
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
      agent: sharedAgent,
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${this.token}`,
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
   * Get the user ID (USR-XXXX-XXXX) from the token's JWT claims.
   * Decodes the JWT payload without verification to extract the userId claim.
   * @returns {string|null} - User ID or null if not found/invalid
   */
  getTokenUserId() {
    if (!this.token) return null;
    try {
      const parts = this.token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      return payload['https://claims.softwareone.com/userId'] || null;
    } catch {
      return null;
    }
  }

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
    
    // Match app's default query: filter by buyer group and sort by created date descending
    // (mirrors orderService.ts: filter(group.buyers)&order=-audit.created.at)
    const queryParams = ['filter(group.buyers)', 'order=-audit.created.at'];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);
    if (options.status) queryParams.push(`status=${options.status}`);
    
    endpoint += '?' + queryParams.join('&');
    
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
    if (!STATUSES.ORDER.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${STATUSES.ORDER.join(', ')}`);
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
    
    const queryParams = ['filter(group.buyers)'];
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
    if (!STATUSES.SUBSCRIPTION.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${STATUSES.SUBSCRIPTION.join(', ')}`);
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

    // Match app's default query (mirrors billingService.ts: filter(group.buyers)&order=-audit.created.at)
    const queryParams = ['filter(group.buyers)', 'order=-audit.created.at'];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);
    if (options.status) queryParams.push(`status=${options.status}`);

    endpoint += '?' + queryParams.join('&');

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

  // ========== Credit Memos Methods ==========

  /**
   * Get credit memos list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of credit memos to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by credit memo status (Issued)
   * @returns {Promise<object>} - Credit memos list response
   *
   * @example
   * // Get all credit memos
   * const creditMemos = await apiClient.getCreditMemos();
   *
   * // Get credit memos with pagination
   * const creditMemos = await apiClient.getCreditMemos({ limit: 10, offset: 0 });
   */
  async getCreditMemos(options = {}) {
    let endpoint = '/public/v1/billing/credit-memos';

    // Match app's default query (mirrors billingService.ts: filter(group.buyers)&order=-audit.created.at)
    const queryParams = ['filter(group.buyers)', 'order=-audit.created.at'];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);
    if (options.status) queryParams.push(`status=${options.status}`);

    endpoint += '?' + queryParams.join('&');

    return this.get(endpoint);
  }

  /**
   * Get a specific credit memo by ID
   * @param {string} creditMemoId - Credit Memo ID in format CRD-XXXX-XXXX-XXXX-XXXX
   * @returns {Promise<object>} - Credit memo details
   *
   * @example
   * const creditMemo = await apiClient.getCreditMemoById('CRD-9994-9916-5145-1234');
   */
  async getCreditMemoById(creditMemoId) {
    // Validate creditMemoId format (4-group)
    if (!creditMemoId || !/^CRD-\d{4}-\d{4}-\d{4}-\d{4}$/.test(creditMemoId)) {
      throw new Error(`Invalid creditMemoId format: "${creditMemoId}". Expected format: CRD-XXXX-XXXX-XXXX-XXXX`);
    }
    return this.get(`/public/v1/billing/credit-memos/${creditMemoId}`);
  }

  /**
   * Get credit memos count
   * @returns {Promise<number>} - Total number of credit memos
   */
  async getCreditMemosCount() {
    const response = await this.getCreditMemos({ limit: 1 });
    return response.pagination?.total || response.data?.length || 0;
  }

  /**
   * Check if user has any credit memos
   * @returns {Promise<boolean>}
   */
  async hasCreditMemos() {
    const count = await this.getCreditMemosCount();
    return count > 0;
  }

  // ========== Statements Methods ==========

  /**
   * Get statements list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of statements to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by statement status (Generated, Queued, Error, Cancelled, Pending, Issued, Generating)
   * @returns {Promise<object>} - Statements list response
   *
   * @example
   * // Get all statements
   * const statements = await apiClient.getStatements();
   *
   * // Get statements with pagination
   * const statements = await apiClient.getStatements({ limit: 10, offset: 0 });
   */
  async getStatements(options = {}) {
    let endpoint = '/public/v1/billing/statements';

    // Match app's default query (mirrors billingService.ts: filter(group.buyers)&order=-audit.created.at)
    const queryParams = ['filter(group.buyers)', 'order=-audit.created.at'];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);
    if (options.status) queryParams.push(`status=${options.status}`);

    endpoint += '?' + queryParams.join('&');

    return this.get(endpoint);
  }

  /**
   * Get a specific statement by ID
   * @param {string} statementId - Statement ID in format SOM-XXXX-XXXX-XXXX-XXXX
   * @returns {Promise<object>} - Statement details
   *
   * @example
   * const statement = await apiClient.getStatementById('SOM-9994-9916-5145-1234');
   */
  async getStatementById(statementId) {
    // Validate statementId format (4-group)
    if (!statementId || !/^SOM-\d{4}-\d{4}-\d{4}-\d{4}$/.test(statementId)) {
      throw new Error(`Invalid statementId format: "${statementId}". Expected format: SOM-XXXX-XXXX-XXXX-XXXX`);
    }
    return this.get(`/public/v1/billing/statements/${statementId}`);
  }

  /**
   * Get statements count
   * @returns {Promise<number>} - Total number of statements
   */
  async getStatementsCount() {
    const response = await this.getStatements({ limit: 1 });
    return response.pagination?.total || response.data?.length || 0;
  }

  /**
   * Check if user has any statements
   * @returns {Promise<boolean>}
   */
  async hasStatements() {
    const count = await this.getStatementsCount();
    return count > 0;
  }

  // ========== Journals Methods ==========

  /**
   * Get journals list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of journals to return
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Promise<object>} - Journals list response
   */
  async getJournals(options = {}) {
    let endpoint = '/public/v1/billing/journals';

    // Match app's default query (mirrors billingService.ts: ne(status,"Deleted")&order=-audit.created.at)
    const queryParams = ['ne(status,"Deleted")', 'order=-audit.created.at'];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);

    endpoint += '?' + queryParams.join('&');

    return this.get(endpoint);
  }

  /**
   * Get a specific journal by ID
   * @param {string} journalId - Journal ID
   * @returns {Promise<object>} - Journal details
   */
  async getJournalById(journalId) {
    return this.get(`/public/v1/billing/journals/${journalId}`);
  }

  /**
   * Check if user has any journals
   * @returns {Promise<boolean>}
   */
  async hasJournals() {
    try {
      const response = await this.getJournals({ limit: 1 });
      const data = response.data || response;
      return Array.isArray(data) ? data.length > 0 : false;
    } catch {
      return false;
    }
  }

  // ========== Chat Methods ==========

  /**
   * Get chats list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of chats to return
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Promise<object>} - Chats list response
   *
   * @example
   * // Get all chats
   * const chats = await apiClient.getChats();
   *
   * // Get first page of chats
   * const chats = await apiClient.getChats({ limit: 10, offset: 0 });
   */
  async getChats(options = {}) {
    const userId = this.getTokenUserId();
    let endpoint = '/public/v1/helpdesk/chats';

    const queryParams = [
      'select=participants,lastMessage,lastMessage.audit,lastMessage.sender',
      'order=-lastMessage.audit.created.at',
    ];
    if (userId) {
      queryParams.push(
        `and(any(participants,eq(identity.id,"${userId}")),any(participants,ne(status,"Exited")))`,
      );
    }
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);

    endpoint += '?' + queryParams.join('&');

    return this.get(endpoint);
  }

  /**
   * Get a specific chat by ID
   * @param {string} chatId - Chat ID (CHT-XXXX-XXXX-XXXX)
   * @returns {Promise<object>} - Chat details response
   *
   * @example
   * const chat = await apiClient.getChatById('CHT-1234-5678-9012');
   */
  async getChatById(chatId) {
    if (!chatId || !/^CHT-\d{4}-\d{4}-\d{4}$/.test(chatId)) {
      throw new Error(`Invalid chatId format: "${chatId}". Expected format: CHT-XXXX-XXXX-XXXX`);
    }
    return this.get(`/public/v1/helpdesk/chats/${chatId}?select=participants`);
  }

  /**
   * Check if the user has any chats
   * @returns {Promise<boolean>}
   *
   * @example
   * const hasChats = await apiClient.hasChats();
   */
  async hasChats() {
    try {
      const response = await this.getChats({ limit: 1 });
      const data = response.data || response;
      return Array.isArray(data) ? data.length > 0 : false;
    } catch {
      return false;
    }
  }

  /**
   * Get contacts available for adding to a chat (excludes the current user)
   * @param {Object} options - Query parameters
   * @param {number} [options.limit=5] - Maximum number of contacts to return
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Promise<object>} - Contacts list response
   *
   * @example
   * // Get up to 5 contacts
   * const contacts = await apiClient.getContacts();
   *
   * // Get first page with pagination
   * const contacts = await apiClient.getContacts({ limit: 10, offset: 0 });
   */
  async getContacts(options = {}) {
    const userId = this.getTokenUserId();
    const baseFilter = userId
      ? `and(and(and(eq(chat,true),ne(status,"deleted")),ne(identity.id,"${userId}")),any(directories))`
      : `and(and(eq(chat,true),ne(status,"deleted")),any(directories))`;

    const queryParams = [
      'select=identity',
      baseFilter,
      'order=identity.name',
      `limit=${options.limit || 5}`,
    ];
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);

    return this.get(`/public/v1/notifications/contacts?${queryParams.join('&')}`);
  }

  /**
   * Send a message to a chat
   * @param {string} chatId - Chat ID (CHT-XXXX-XXXX-XXXX)
   * @param {string} content - Message text
   * @param {string} [visibility='Public'] - Message visibility ('Public' | 'Private')
   * @returns {Promise<object>} - Created message response
   *
   * @example
   * const message = await apiClient.sendChatMessage('CHT-1234-5678-9012', 'Hello from QA');
   */
  async sendChatMessage(chatId, content, visibility = 'Public') {
    if (!chatId || !/^CHT-\d{4}-\d{4}-\d{4}$/.test(chatId)) {
      throw new Error(`Invalid chatId format: "${chatId}". Expected format: CHT-XXXX-XXXX-XXXX`);
    }
    const payload = { content, visibility, isDeleted: false, links: [] };
    console.info(`📨 [sendChatMessage] POST /public/v1/helpdesk/chats/${chatId}/messages\n${JSON.stringify(payload, null, 2)}`);
    const response = await this.post(`/public/v1/helpdesk/chats/${chatId}/messages`, payload);
    console.info(`📨 [sendChatMessage] Response:\n${JSON.stringify(response, null, 2)}`);
    return response;
  }

  /**
   * Send a message with structured link-preview attachments to a chat.
   * @param {string} chatId - Chat ID (CHT-XXXX-XXXX-XXXX)
   * @param {string} content - Message text
   * @param {Array<{name: string, uri: string, icon?: string}>} links - Link card attachments
   * @returns {Promise<object>} - Created message response
   */
  async sendChatMessageWithLinks(chatId, content, links = []) {
    if (!chatId || !/^CHT-\d{4}-\d{4}-\d{4}$/.test(chatId)) {
      throw new Error(`Invalid chatId format: "${chatId}". Expected format: CHT-XXXX-XXXX-XXXX`);
    }
    const payload = {
      content,
      visibility: 'Public', // always Public — extend if Private messages with links are needed
      isDeleted: false,
      links: links.map((l) => ({ name: l.name, uri: l.uri, icon: l.icon ?? '' })),
    };
    console.info(`📎 [sendChatMessageWithLinks] POST /public/v1/helpdesk/chats/${chatId}/messages\n${JSON.stringify(payload, null, 2)}`);
    const response = await this.post(`/public/v1/helpdesk/chats/${chatId}/messages`, payload);
    console.info(`📎 [sendChatMessageWithLinks] Response:\n${JSON.stringify(response, null, 2)}`);
    return response;
  }

  /**
   * Create a Group chat via the API
   * @param {string} name - Display name for the group chat
   * @param {string[]} participantContactIds - CON- IDs of contacts to add as participants
   * @returns {Promise<object>} - Created chat response (includes id and name)
   *
   * @example
   * const chat = await apiClient.createGroupChat('MPT-QA-test', ['CON-1234-5678']);
   */
  async createGroupChat(name, participantContactIds = []) {
    const payload = {
      type: 'Group',
      name,
      participants: participantContactIds.map((id) => ({ contact: { id } })),
    };
    console.info(`🔧 [createGroupChat] POST /public/v1/helpdesk/chats\n${JSON.stringify(payload, null, 2)}`);
    const response = await this.post('/public/v1/helpdesk/chats', payload);
    console.info(`🔧 [createGroupChat] Response:\n${JSON.stringify(response, null, 2)}`);
    return response;
  }

  /**
   * Find the most recent QA chat whose name starts with the given prefix.
   * Uses an API-side name filter so only matching chats are returned —
   * this avoids pagination issues with chats ordered by lastMessage date.
   * @param {string} namePrefix - Name prefix to search for (e.g. "MPT-QA-portal")
   * @returns {Promise<object|null>} - Matching chat with { id, name }, or null if not found
   *
   * @example
   * const chat = await apiClient.findChatByNamePrefix('MPT-QA-portal');
   * if (chat) console.log(chat.id); // 'CHT-1234-5678-9012'
   */
  async findChatByNamePrefix(namePrefix) {
    const sanitized = namePrefix.replace(/["\\()]/g, '');
    const queryParams = [
      'select=name,id',
      `ilike(name,"${sanitized}*")`,
      'limit=10',
    ];
    const url = `/public/v1/helpdesk/chats?${queryParams.join('&')}`;
    console.info(`🔍 [findChatByNamePrefix] GET ${url}`);

    try {
      const response = await this.get(url);
      console.info(`🔍 [findChatByNamePrefix] Response:\n${JSON.stringify(response, null, 2)}`);
      const data = response.data || response;
      if (!Array.isArray(data)) {
        console.info(`🔍 [findChatByNamePrefix] Unexpected response shape — no array in data`);
        return null;
      }
      console.info(`🔍 [findChatByNamePrefix] Candidates: ${data.length} item(s)`);
      return data.find((chat) => chat.name && chat.name.startsWith(namePrefix)) || null;
    } catch (error) {
      console.warn(`⚠️ [findChatByNamePrefix] Query failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Find an existing QA group chat by name prefix, or create a new one.
   *
   * Chats cannot be deleted via the API, so this reuses existing QA chats to avoid
   * polluting the helpdesk list on repeated runs. A new chat is only created when no
   * chat matching the given prefix exists.
   *
   * @param {string} namePrefix - Prefix used to detect existing QA chats (e.g. "MPT-QA-portal")
   * @param {object} [options={}]
   * @param {number} [options.participantOffset=0] - Index into the contacts list for the participant seed; use different values per QA chat to avoid concurrency collisions
   * @returns {Promise<object|null>} - Chat object with at least { id, name }, or null on failure
   *
   * @example
   * const chat = await apiClient.ensureQaGroupChat('MPT-QA-portal');
   * if (chat) await apiClient.sendChatMessage(chat.id, 'setup message');
   */
  async ensureQaGroupChat(namePrefix, { participantOffset = 0 } = {}) {
    try {
      const contactsResponse = await this.getContacts({ limit: 5 });
      const contacts = contactsResponse.data || contactsResponse;
      const contact = Array.isArray(contacts) && contacts.length > 0
        ? contacts[Math.min(participantOffset, contacts.length - 1)]
        : null;
      const participantContactIds = contact ? [contact.id] : [];

      const existing = await this.findChatByNamePrefix(namePrefix);
      if (existing) {
        // Verify the expected participant is present — a chat created with a different
        // participantOffset will not be visible to the test UI user.
        if (contact) {
          const chatDetails = await this.getChatById(existing.id);
          const participants = chatDetails?.data?.participants ?? chatDetails?.participants ?? [];
          const hasParticipant = participants.some((p) => p?.contact?.id === contact.id);
          if (hasParticipant) {
            console.info(`✅ [ensureQaGroupChat] Reusing existing QA chat: ${existing.name} (${existing.id})`);
            return existing;
          }
          console.warn(`⚠️ [ensureQaGroupChat] Existing chat ${existing.id} missing expected participant ${contact.id}, creating new chat...`);
        } else {
          console.info(`✅ [ensureQaGroupChat] Reusing existing QA chat: ${existing.name} (${existing.id})`);
          return existing;
        }
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T]/g, '')
        .slice(0, 14);
      const chatName = `${namePrefix}-${timestamp}`;

      console.info(`🔧 [ensureQaGroupChat] Creating new QA group chat: "${chatName}"...`);
      const chat = await this.createGroupChat(chatName, participantContactIds);
      const chatWithName = { ...chat, name: chat.name || chatName };
      console.info(`✅ [ensureQaGroupChat] Created QA group chat: ${chatWithName.name} (${chatWithName.id})`);

      console.info(`📨 [ensureQaGroupChat] Sending setup message to bring chat to top of list...`);
      try {
        await this.sendChatMessage(chatWithName.id, 'QA test setup — automated');
        console.info(`✅ [ensureQaGroupChat] Setup message sent`);
      } catch (msgError) {
        console.warn(`⚠️ [ensureQaGroupChat] Setup message failed (chat will sort to bottom): ${msgError.message}`);
      }

      return chatWithName;
    } catch (error) {
      console.warn(`⚠️ [ensureQaGroupChat] Could not ensure QA chat: ${error.message}`);
      return null;
    }
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
    
    // Match app's default query (mirrors agreementService.ts):
    // filter(group.buyers) - scoped to buyer group
    // and(ne(status,"Draft"),ne(status,"Failed")) - exclude Draft and Failed
    // order=name - sorted by name alphabetically
    const queryParams = [
      'filter(group.buyers)',
      'and(ne(status,"Draft"),ne(status,"Failed"))',
      'order=name',
    ];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);
    if (options.status) queryParams.push(`status=${options.status}`);
    
    endpoint += '?' + queryParams.join('&');
    
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
    if (!STATUSES.AGREEMENT.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${STATUSES.AGREEMENT.join(', ')}`);
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

    // Match app's default query (mirrors programService.ts: order=name)
    const queryParams = ['order=name'];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);
    if (options.status) queryParams.push(`status=${options.status}`);

    endpoint += '?' + queryParams.join('&');

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
    if (!STATUSES.PROGRAM.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${STATUSES.PROGRAM.join(', ')}`);
    }
    
    const response = await this.getPrograms({ status });
    return response.data || response;
  }

  // ========== Products Methods ==========

  /**
   * Get products list for the authenticated user.
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of products to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by product status (Published, Unpublished, Pending, Draft)
   * @param {string} [options.select] - Select projection expression (e.g., '-*,id,name,status,icon')
   * @returns {Promise<object>} - Products list response
   */
  async getProducts(options = {}) {
    let endpoint = '/public/v1/catalog/products';

    // Match app's default query (mirrors productService.ts: ne(status,"Draft")&order=name)
    const queryParams = ['ne(status,"Draft")', 'order=name'];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);
    if (options.status) queryParams.push(`status=${options.status}`);
    if (options.select) queryParams.push(`select=${encodeURIComponent(options.select)}`);

    endpoint += '?' + queryParams.join('&');

    return this.get(endpoint);
  }

  /**
   * Get a specific product by ID.
   * @param {string} productId - Product ID in format PRD-XXXX-XXXX
   * @returns {Promise<object>} - Product details
   */
  async getProductById(productId) {
    if (!productId || !/^PRD-\d{4}-\d{4}$/.test(productId)) {
      throw new Error(`Invalid productId format: "${productId}". Expected format: PRD-XXXX-XXXX`);
    }

    return this.get(`/public/v1/catalog/products/${productId}`);
  }

  /**
   * Get products count.
   * @returns {Promise<number>} - Total number of products
   */
  async getProductsCount() {
    const response = await this.getProducts({ limit: 1 });
    return response?.$meta?.pagination?.total || response?.pagination?.total || response?.data?.length || 0;
  }

  /**
   * Check if user has any products.
   * @returns {Promise<boolean>}
   */
  async hasProducts() {
    const count = await this.getProductsCount();
    return count > 0;
  }

  // ========== Enrollments Methods ==========

  /**
   * Get enrollments list for the authenticated user
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of enrollments to return
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.status] - Filter by enrollment status (Draft, Completed, Processing, Deleted)
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

    // Match app's default query (mirrors enrollmentService.ts: order=-id)
    const queryParams = ['order=-id'];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);
    if (options.status) queryParams.push(`status=${options.status}`);

    endpoint += '?' + queryParams.join('&');

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
   * @param {string} status - Enrollment status (Draft, Completed, Processing, Deleted)
   * @returns {Promise<Array>} - Array of enrollments with the specified status
   */
  async getEnrollmentsByStatus(status) {
    if (!STATUSES.ENROLLMENT.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${STATUSES.ENROLLMENT.join(', ')}`);
    }
    
    const response = await this.getEnrollments({ status });
    return response.data || response;
  }

  // ========== Licensees Methods ==========

  /**
   * Get licensees list scoped to a specific account, matching the app's endpoint.
   * @param {string} accountId - Account ID (ACC-XXXX-XXXX) of the client being browsed
   * @param {Object} options - Query parameters
   * @param {number} [options.limit] - Maximum number of licensees to return (default 50)
   * @param {number} [options.offset] - Offset for pagination (default 0)
   * @param {string} [options.status] - Filter by licensee status (Enabled, Disabled)
   * @returns {Promise<object>} - Licensees list response
   * 
   * @example
   * const licensees = await apiClient.getLicensees('ACC-4850-1126', { limit: 10 });
   */
  async getLicensees(accountId, options = {}) {
    if (!accountId) {
      throw new Error('accountId is required for getLicensees (format: ACC-XXXX-XXXX)');
    }
    
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;
    
    let endpoint =
      `/v1/accounts/licensees` +
      `?select=seller,buyer.status` +
      `&eq(account.id,${accountId})&order=name` +
      `&offset=${offset}&limit=${limit}`;
    
    if (options.status) {
      endpoint += `&eq(status,"${options.status}")`;
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
   * Get licensees count for an account
   * @param {string} accountId - Account ID (ACC-XXXX-XXXX)
   * @returns {Promise<number>} - Total number of licensees
   */
  async getLicenseesCount(accountId) {
    const response = await this.getLicensees(accountId, { limit: 1 });
    return response.pagination?.total || response.data?.length || 0;
  }

  /**
   * Check if an account has any licensees
   * @param {string} accountId - Account ID (ACC-XXXX-XXXX)
   * @returns {Promise<boolean>}
   */
  async hasLicensees(accountId) {
    const count = await this.getLicenseesCount(accountId);
    return count > 0;
  }

  /**
   * Get licensees by status for an account
   * @param {string} accountId - Account ID (ACC-XXXX-XXXX)
   * @param {string} status - Licensee status (Enabled, Disabled)
   * @returns {Promise<Array>} - Array of licensees with the specified status
   */
  async getLicenseesByStatus(accountId, status) {
    if (!STATUSES.LICENSEE.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${STATUSES.LICENSEE.join(', ')}`);
    }
    
    const response = await this.getLicensees(accountId, { status });
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

    // Match app's default query (mirrors buyerService.ts: ne(status,"Deleted")&order=name)
    const queryParams = ['ne(status,"Deleted")', 'order=name'];
    if (options.limit) queryParams.push(`limit=${options.limit}`);
    if (options.offset !== undefined) queryParams.push(`offset=${options.offset}`);
    if (options.status) queryParams.push(`status=${options.status}`);

    endpoint += '?' + queryParams.join('&');

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
    if (!STATUSES.BUYER.includes(status)) {
      throw new Error(`Invalid status: "${status}". Must be one of: ${STATUSES.BUYER.join(', ')}`);
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
  async getSpotlightDataAvailability(useIndividualQueries = false) {
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
    const tokenUserId = this.getTokenUserId();
    console.info(`📊 Checking spotlight data availability using individual template queries (user: ${tokenUserId || 'unknown'})...`);
    
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

// Export singleton instances per access level
const apiClient = new ApiClient();
const opsApiClient = apiClient;

// Client/vendor instances — initialized statically from env vars if provided,
// or dynamically via initAccountTokens() at test setup time.
let clientApiClient = API_CLIENT_TOKEN ? new ApiClient(API_CLIENT_TOKEN) : null;
let vendorApiClient = API_VENDOR_TOKEN ? new ApiClient(API_VENDOR_TOKEN) : null;

/**
 * Fetches default (free, non-paid) module IDs for a given account type from the API.
 * These modules are required when creating an account-scoped API token.
 *
 * @param {ApiClient} client - An ApiClient with OPS-level authorization
 * @param {'Client'|'Vendor'} accountType - The account type to fetch modules for
 * @returns {Promise<string[]>} Array of module IDs
 */
async function fetchDefaultModules(client, accountType) {
  const FALLBACK_MODULES = {
    Client: ['MOD-0478', 'MOD-0622', 'MOD-1239', 'MOD-1756', 'MOD-4525', 'MOD-5842', 'MOD-6338', 'MOD-8352', 'MOD-9042'],
    Vendor: ['MOD-0478', 'MOD-1239', 'MOD-1756', 'MOD-4525', 'MOD-5842', 'MOD-8352', 'MOD-8743', 'MOD-9042'],
  };

  try {
    const response = await client.get('/public/v1/accounts/modules?select=accountTypes&limit=100');
    const items = response.data || response;

    if (!Array.isArray(items)) {
      console.warn(`⚠️ [fetchDefaultModules] Unexpected response, using fallback modules`);
      return FALLBACK_MODULES[accountType];
    }

    const moduleIds = items
      .filter(m =>
        m.accountTypes?.includes(accountType) &&
        m.settings?.default === true &&
        m.settings?.paid === false
      )
      .map(m => m.id);

    if (moduleIds.length === 0) {
      console.warn(`⚠️ [fetchDefaultModules] No modules found for ${accountType}, using fallback`);
      return FALLBACK_MODULES[accountType];
    }

    console.info(`✅ [fetchDefaultModules] Found ${moduleIds.length} modules for ${accountType}`);
    return moduleIds;
  } catch (error) {
    console.warn(`⚠️ [fetchDefaultModules] Failed: ${error.message}, using fallback modules`);
    return FALLBACK_MODULES[accountType];
  }
}

/**
 * Gets or creates an account-scoped API token using the OPS token.
 *
 * This function is idempotent:
 * 1. Searches for existing "mobile-e2e-setup-*" tokens for the account
 * 2. If found, reuses the token (no propagation wait needed)
 * 3. Only creates a new token if none exists (requires 60s propagation wait)
 *
 * @param {string} accountId - The ACC- ID to create a token for
 * @param {'Client'|'Vendor'} accountType - Determines which modules the token gets
 * @returns {Promise<{token: string|null, isNew: boolean}>}
 */
async function getOrCreateAccountToken(accountId, accountType) {
  if (!API_OPS_TOKEN) {
    console.warn(`⚠️ [getOrCreateAccountToken] API_OPS_TOKEN not set, cannot create ${accountType} token`);
    return { token: null, isNew: false };
  }

  if (!accountId) {
    console.warn(`⚠️ [getOrCreateAccountToken] No account ID for ${accountType}, skipping token creation`);
    return { token: null, isNew: false };
  }

  const ops = new ApiClient(API_OPS_TOKEN);

  // Step 1: Search for existing tokens
  try {
    const searchEndpoint = `/public/v1/accounts/api-tokens?eq(account.id,"${accountId}")&eq(status,"Active")&like(name,"${TOKEN_NAME_PREFIX}-*")&limit=10`;
    const searchResponse = await ops.get(searchEndpoint);
    const existingTokens = searchResponse.data || [];

    if (existingTokens.length > 0) {
      const tokenId = existingTokens[0].id;
      console.info(`🔄 [getOrCreateAccountToken] Found existing ${accountType} token: ${tokenId}, retrieving value...`);

      try {
        const tokenData = await ops.get(`/public/v1/accounts/api-tokens/${tokenId}`);
        if (tokenData.token) {
          console.info(`✅ [getOrCreateAccountToken] Reusing existing ${accountType} token (no propagation wait)`);
          return { token: tokenData.token, isNew: false };
        }
      } catch (error) {
        console.warn(`⚠️ [getOrCreateAccountToken] Could not retrieve token ${tokenId}: ${error.message}`);
      }
    }
  } catch (error) {
    console.warn(`⚠️ [getOrCreateAccountToken] Token search failed: ${error.message}`);
  }

  // Step 2: Create a new token
  console.info(`🔧 [getOrCreateAccountToken] Creating new ${accountType} API token for ${accountId}...`);

  const modules = await fetchDefaultModules(ops, accountType);
  const timestamp = Date.now();

  try {
    const tokenData = await ops.post('/public/v1/accounts/api-tokens', {
      account: { id: accountId },
      name: `${TOKEN_NAME_PREFIX}-${timestamp}`,
      description: `Auto-created token for mobile E2E test API validation (${accountType})`,
      icon: '',
      extensions: null,
      modules: modules.map(id => ({ id })),
    });

    if (!tokenData.token) {
      console.error(`❌ [getOrCreateAccountToken] Token response missing 'token' field`);
      return { token: null, isNew: false };
    }

    console.info(`✅ [getOrCreateAccountToken] Created new ${accountType} token: ${tokenData.id}`);
    return { token: tokenData.token, isNew: true };
  } catch (error) {
    console.error(`❌ [getOrCreateAccountToken] Failed to create ${accountType} token: ${error.message}`);
    return { token: null, isNew: false };
  }
}

/**
 * Initializes account-scoped API client instances for E2E test API validation.
 *
 * Call this once in a top-level `before()` hook. It will:
 * 1. Check if static tokens are already provided via env vars (skip generation)
 * 2. Otherwise, use the OPS token to create/reuse account-scoped tokens
 * 3. Wait for propagation if new tokens were created (60 seconds)
 * 4. Create ApiClient instances for each account type
 *
 * After calling this, `clientApiClient` will be populated if CLIENT_ACCOUNT_ID is configured.
 * `vendorApiClient` is not populated by this function — it is only available when
 * API_VENDOR_TOKEN is set via environment variable at startup.
 *
 * @returns {Promise<{clientApiClient: ApiClient|null, vendorApiClient: ApiClient|null}>}
 */
async function initAccountTokens() {
  let needsPropagationWait = false;

  // Client token
  if (!clientApiClient && CLIENT_ACCOUNT_ID) {
    const result = await getOrCreateAccountToken(CLIENT_ACCOUNT_ID, 'Client');
    if (result.token) {
      clientApiClient = new ApiClient(result.token);
      if (result.isNew) needsPropagationWait = true;
    }
  }

  // Propagation wait — only if we created new tokens
  if (needsPropagationWait) {
    console.info(`⏳ [initAccountTokens] Waiting ${TOKEN_PROPAGATION_WAIT_MS / 1000}s for new token(s) to propagate...`);
    await new Promise(resolve => setTimeout(resolve, TOKEN_PROPAGATION_WAIT_MS));
    console.info(`✅ [initAccountTokens] Token propagation wait complete`);
  }

  return { clientApiClient, vendorApiClient };
}

module.exports = {
  ApiClient,
  apiClient,
  opsApiClient,
  get clientApiClient() { return clientApiClient; },
  get vendorApiClient() { return vendorApiClient; },
  initAccountTokens,
  /**
   * Returns the best available API client for client-scoped tests.
   * Prefers clientApiClient (client token) when available, falls back to apiClient (ops token).
   * Call this inside before() hooks or test bodies — not at module top level —
   * so that dynamically initialized tokens are picked up.
   * @returns {ApiClient}
   */
  getClientApi() { return clientApiClient || apiClient; },
};

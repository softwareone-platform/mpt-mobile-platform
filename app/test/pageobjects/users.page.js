const { selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Users Page - extends ListPage for common list functionality
 * Provides user-specific methods and backward-compatible aliases
 *
 * Variant: Full (Title + Subtitle ID + Picture)
 * ID Format: USR-XXXX-XXXX (2 groups)
 * Status Values: Active, Blocked, Invitation Expired, ...
 */
class UsersPage extends ListPage {
  // ========== Abstract Property Implementations ========== 

  get itemPrefix() {
    return 'USR-';
  }

  get pageName() {
    return 'Users';
  }

  get loadingIndicatorId() {
    return 'users-loading-indicator';
  }

  get emptyStateId() {
    return 'users-empty-state';
  }

  get errorStateId() {
    return 'users-error-state';
  }

  // ========== Empty State Elements (page-specific) ========== 

  get noUsersTitle() {
    return $(selectors.byText('No users'));
  }

  get noUsersDescription() {
    return $(selectors.byText('No users found.'));
  }

  // ========== ID Pattern Override ==========
  // Users use 2-group IDs: USR-XXXX-XXXX

  /**
   * Get user details from an item's accessibility label
   * Format: "Name, USR-XXXX-XXXX, Status"
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{userId: string, id: string, name: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));
    // USR- uses 2-group format: USR-XXXX-XXXX
    const idMatch = label.match(/(USR-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';
    // Extract name (everything before the ID)
    const nameMatch = label.match(/^(.+?),\s*USR-/);
    const name = nameMatch ? nameMatch[1].trim() : '';
    // Extract status (everything after the last comma)
    const statusMatch = label.match(/,\s*([\w ]+)$/);
    const status = statusMatch ? statusMatch[1] : '';
    return { userId: id, id, name, status, label };
  }

  // ========== Backward-Compatible Aliases ==========

  /** @alias for scrollView */
  get usersScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get userItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstUserItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} userId - User ID (e.g., 'USR-2716-7913')
   */
  getUserById(userId) {
    return this.getItemById(userId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - User status (Active, Blocked, Invitation Expired, ...)
   */
  getUsersByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnUsersPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasUsers() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleUsersCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} userId - User ID to tap
   */
  async tapUser(userId) {
    return this.tapItem(userId);
  }

  /** @alias for tapFirstItem */
  async tapFirstUser() {
    return this.tapFirstItem();
  }

  /**
   * Get user details from a user element
   * @alias for getItemDetails with user-specific naming
   * @param {WebdriverIO.Element} userElement - User list item element
   * @returns {Promise<{userId: string, id: string, name: string, status: string, label: string}>}
   */
  async getUserDetails(userElement) {
    return this.getItemDetails(userElement);
  }

  /**
   * Get all visible user IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleUserIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible users with their statuses
   * @returns {Promise<Array<{userId: string, id: string, name: string, status: string, label: string}>>}
   */
  async getVisibleUsersWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new UsersPage();

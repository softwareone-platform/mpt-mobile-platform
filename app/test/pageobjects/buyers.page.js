const { selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Buyers Page - extends ListPage for common list functionality
 * Provides buyer-specific methods and backward-compatible aliases
 * 
 * Variant: Full (Title + Subtitle ID + Picture)
 * ID Format: BUY-XXXX-XXXX (3 groups)
 * Status Values: Active, Unassigned
 */
class BuyersPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'BUY-';
  }

  get pageName() {
    return 'Buyers';
  }

  get loadingIndicatorId() {
    return 'buyers-loading-indicator';
  }

  get emptyStateId() {
    return 'buyers-empty-state';
  }

  get errorStateId() {
    return 'buyers-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noBuyersTitle() {
    return $(selectors.byText('No buyers'));
  }

  get noBuyersDescription() {
    return $(selectors.byText('No buyers found.'));
  }

  // ========== ID Pattern Override ==========
  // Buyers use 3-group IDs: BUY-XXXX-XXXX (unlike 4-group IDs in other entities)

  /**
   * Get item details from an item's accessibility label
   * Override for BUY- 3-group format: "Name, BUY-XXXX-XXXX, Status"
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{buyerId: string, id: string, name: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));
    
    // BUY- uses 3-group format: BUY-XXXX-XXXX
    const idMatch = label.match(/(BUY-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    // Extract name (everything before the ID)
    const nameMatch = label.match(/^(.+?),\s*BUY-/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    // Extract status (everything after the last comma)
    const statusMatch = label.match(/,\s*(\w+)$/);
    const status = statusMatch ? statusMatch[1] : '';

    return { buyerId: id, id, name, status, label };
  }

  // ========== Backward-Compatible Aliases ==========
  // These maintain compatibility with existing tests

  /** @alias for scrollView */
  get buyersScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get buyerItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstBuyerItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} buyerId - Buyer ID (e.g., 'BUY-6619-8697')
   */
  getBuyerById(buyerId) {
    return this.getItemById(buyerId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Buyer status (Active, Unassigned)
   */
  getBuyersByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnBuyersPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasBuyers() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleBuyersCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} buyerId - Buyer ID to tap
   */
  async tapBuyer(buyerId) {
    return this.tapItem(buyerId);
  }

  /** @alias for tapFirstItem */
  async tapFirstBuyer() {
    return this.tapFirstItem();
  }

  /**
   * Get buyer details from a buyer element
   * @alias for getItemDetails with buyer-specific naming
   * @param {WebdriverIO.Element} buyerElement - Buyer list item element
   * @returns {Promise<{buyerId: string, id: string, name: string, status: string, label: string}>}
   */
  async getBuyerDetails(buyerElement) {
    return this.getItemDetails(buyerElement);
  }

  /**
   * Get all visible buyer IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleBuyerIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible buyers with their statuses
   * @returns {Promise<Array<{buyerId: string, id: string, name: string, status: string, label: string}>>}
   */
  async getVisibleBuyersWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new BuyersPage();

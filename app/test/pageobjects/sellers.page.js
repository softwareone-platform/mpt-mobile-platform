const ListPage = require('./base/list.page');

/**
 * Sellers Page - extends ListPage for common list functionality
 * Provides seller-specific methods and backward-compatible aliases
 *
 * Variant: Standard (Title + ID + Status, no picture for all items)
 * ID Format: SEL-XXXX-XXXX (2 groups)
 * Status Values: Active, Disabled
 *
 * Accessibility label format: "Name, SEL-XXXX-XXXX, Status"
 */
class SellersPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'SEL-';
  }

  get pageName() {
    return 'Sellers';
  }

  get loadingIndicatorId() {
    return 'sellers-loading-indicator';
  }

  get emptyStateId() {
    return 'sellers-empty-state';
  }

  get errorStateId() {
    return 'sellers-error-state';
  }

  // ========== ID Parsing Override ==========
  // Sellers use 2-group IDs: SEL-XXXX-XXXX
  // Label format: "Name, SEL-XXXX-XXXX, Status"

  /**
   * Get item details from an item's accessibility label
   * Override for SEL- 2-group format: "Name, SEL-XXXX-XXXX, Status"
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{sellerId: string, id: string, name: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));

    const idMatch = label.match(/(SEL-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    const nameMatch = label.match(/^(.+?),\s*SEL-/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    const statusMatch = label.match(/,\s*(\w+)$/);
    const status = statusMatch ? statusMatch[1] : '';

    return { sellerId: id, id, name, status, label };
  }

  // ========== Backward-Compatible Aliases ==========

  /** @alias for scrollView */
  get sellersScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get sellerItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstSellerItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} sellerId - Seller ID (e.g., 'SEL-0043-6778')
   */
  getSellerById(sellerId) {
    return this.getItemById(sellerId);
  }

  /** @alias for isOnPage */
  async isOnSellersPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasSellers() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleSellersCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} sellerId - Seller ID to tap
   */
  async tapSeller(sellerId) {
    return this.tapItem(sellerId);
  }

  /** @alias for tapFirstItem */
  async tapFirstSeller() {
    return this.tapFirstItem();
  }

  /**
   * Get seller details from a seller element
   * @alias for getItemDetails with seller-specific naming
   * @param {WebdriverIO.Element} sellerElement - Seller list item element
   * @returns {Promise<{sellerId: string, id: string, name: string, status: string, label: string}>}
   */
  async getSellerDetails(sellerElement) {
    return this.getItemDetails(sellerElement);
  }

  /**
   * Get all visible seller IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleSellerIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible sellers with their statuses
   * @returns {Promise<Array<{sellerId: string, id: string, name: string, status: string, label: string}>>}
   */
  async getVisibleSellersWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new SellersPage();

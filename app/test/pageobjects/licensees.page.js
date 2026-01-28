const { selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Licensees Page - extends ListPage for common list functionality
 * Provides licensee-specific methods and backward-compatible aliases
 * 
 * Variant: Full (Title + Subtitle ID + Picture)
 * ID Format: LCE-XXXX-XXXX-XXXX (4 groups)
 * Status Values: Enabled, ...
 * 
 * Note: Licensees API requires accountId parameter
 */
class LicenseesPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'LCE-';
  }

  get pageName() {
    return 'Licensees';
  }

  get loadingIndicatorId() {
    return 'licensees-loading-indicator';
  }

  get emptyStateId() {
    return 'licensees-empty-state';
  }

  get errorStateId() {
    return 'licensees-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noLicenseesTitle() {
    return $(selectors.byText('No licensees'));
  }

  get noLicenseesDescription() {
    return $(selectors.byText('No licensees found.'));
  }

  // ========== ID Pattern Override ==========
  // Licensees use 4-group IDs: LCE-XXXX-XXXX-XXXX

  /**
   * Get item details from an item's accessibility label
   * Override for LCE- 4-group format: "Name, LCE-XXXX-XXXX-XXXX, Status"
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{licenseeId: string, id: string, name: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));
    
    // LCE- uses 4-group format: LCE-XXXX-XXXX-XXXX
    const idMatch = label.match(/(LCE-\d{4}-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    // Extract name (everything before the ID)
    const nameMatch = label.match(/^(.+?),\s*LCE-/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    // Extract status (everything after the last comma)
    const statusMatch = label.match(/,\s*(\w+)$/);
    const status = statusMatch ? statusMatch[1] : '';

    return { licenseeId: id, id, name, status, label };
  }

  // ========== Backward-Compatible Aliases ==========
  // These maintain compatibility with existing tests

  /** @alias for scrollView */
  get licenseesScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get licenseeItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstLicenseeItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} licenseeId - Licensee ID (e.g., 'LCE-6773-3048-1612')
   */
  getLicenseeById(licenseeId) {
    return this.getItemById(licenseeId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Licensee status (Enabled, ...)
   */
  getLicenseesByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnLicenseesPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasLicensees() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleLicenseesCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} licenseeId - Licensee ID to tap
   */
  async tapLicensee(licenseeId) {
    return this.tapItem(licenseeId);
  }

  /** @alias for tapFirstItem */
  async tapFirstLicensee() {
    return this.tapFirstItem();
  }

  /**
   * Get licensee details from a licensee element
   * @alias for getItemDetails with licensee-specific naming
   * @param {WebdriverIO.Element} licenseeElement - Licensee list item element
   * @returns {Promise<{licenseeId: string, id: string, name: string, status: string, label: string}>}
   */
  async getLicenseeDetails(licenseeElement) {
    return this.getItemDetails(licenseeElement);
  }

  /**
   * Get all visible licensee IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleLicenseeIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible licensees with their statuses
   * @returns {Promise<Array<{licenseeId: string, id: string, name: string, status: string, label: string}>>}
   */
  async getVisibleLicenseesWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new LicenseesPage();

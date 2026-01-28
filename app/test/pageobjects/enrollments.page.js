const { getSelector, selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Enrollments Page - extends ListPage for common list functionality
 * Provides enrollment-specific methods and backward-compatible aliases
 * 
 * Variant: Minimal (Title ID only, no picture, no subtitle)
 * ID Format: ENR-XXXX-XXXX-XXXX (4 groups)
 * Status Values: Draft, Completed, Processing
 * 
 * Note: Enrollments use a different list config (listItemConfigNoImageNoSubtitle)
 * The title IS the ID, so accessibility label format is: "ENR-XXXX-XXXX-XXXX, Status"
 */
class EnrollmentsPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'ENR-';
  }

  get pageName() {
    return 'Enrollments';
  }

  get loadingIndicatorId() {
    return 'enrollments-loading-indicator';
  }

  get emptyStateId() {
    return 'enrollments-empty-state';
  }

  get errorStateId() {
    return 'enrollments-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noEnrollmentsTitle() {
    return $(selectors.byText('No enrollments'));
  }

  get noEnrollmentsDescription() {
    return $(selectors.byText('No enrollments found.'));
  }

  // ========== ID Pattern Override ==========
  // Enrollments use 4-group IDs: ENR-XXXX-XXXX-XXXX
  // The title IS the ID (no separate name field)

  /**
   * Get all visible list items
   * Override for ENR- 4-group format
   * @returns {Promise<ElementArray>} Array of list item elements
   */
  get listItems() {
    return $$(
      getSelector({
        ios: `//XCUIElementTypeOther[contains(@name, "${this.itemPrefix}") and contains(@name, ",")]`,
        android: `//*[contains(@content-desc, "${this.itemPrefix}") and contains(@content-desc, ",")]`,
      }),
    );
  }

  /**
   * Get item details from an item's accessibility label
   * Override for ENR- minimal variant: "ENR-XXXX-XXXX-XXXX, Status" (title IS the ID)
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{enrollmentId: string, id: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));
    
    // ENR- uses 4-group format: ENR-XXXX-XXXX-XXXX
    const idMatch = label.match(/(ENR-\d{4}-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    // Extract status (everything after the last comma)
    const statusMatch = label.match(/,\s*(\w+)$/);
    const status = statusMatch ? statusMatch[1] : '';

    // Note: Enrollments don't have a separate name - the ID IS the title
    return { enrollmentId: id, id, status, label };
  }

  // ========== Backward-Compatible Aliases ==========
  // These maintain compatibility with existing tests

  /** @alias for scrollView */
  get enrollmentsScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get enrollmentItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstEnrollmentItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} enrollmentId - Enrollment ID (e.g., 'ENR-9994-9916-5145')
   */
  getEnrollmentById(enrollmentId) {
    return this.getItemById(enrollmentId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Enrollment status (Draft, Completed, Processing)
   */
  getEnrollmentsByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnEnrollmentsPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasEnrollments() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleEnrollmentsCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} enrollmentId - Enrollment ID to tap
   */
  async tapEnrollment(enrollmentId) {
    return this.tapItem(enrollmentId);
  }

  /** @alias for tapFirstItem */
  async tapFirstEnrollment() {
    return this.tapFirstItem();
  }

  /**
   * Get enrollment details from an enrollment element
   * @alias for getItemDetails with enrollment-specific naming
   * @param {WebdriverIO.Element} enrollmentElement - Enrollment list item element
   * @returns {Promise<{enrollmentId: string, id: string, status: string, label: string}>}
   */
  async getEnrollmentDetails(enrollmentElement) {
    return this.getItemDetails(enrollmentElement);
  }

  /**
   * Get all visible enrollment IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleEnrollmentIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible enrollments with their statuses
   * @returns {Promise<Array<{enrollmentId: string, id: string, status: string, label: string}>>}
   */
  async getVisibleEnrollmentsWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new EnrollmentsPage();

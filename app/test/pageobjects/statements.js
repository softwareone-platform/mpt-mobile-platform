const { getSelector, selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Statements Page - extends ListPage for common list functionality
 * Provides statements-specific methods and backward-compatible aliases
 * 
 * Variant: Minimal (Title ID only, no picture, no subtitle)
 * ID Format: SOM-XXXX-XXXX-XXXX-XXXX (4 groups)
 * Status Values: Generated, Queued, Error, Cancelled, Pending, Issued, Generating
 * 
 * Note: Statements use a different list config (listItemConfigNoImageNoSubtitle)
 * The title IS the ID, so accessibility label format is: "SOM-XXXX-XXXX-XXXX-XXXX, Status"
 */
class StatementsPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'SOM-';
  }

  get pageName() {
    return 'Statements';
  }

  get loadingIndicatorId() {
    return 'statements-loading-indicator';
  }

  get emptyStateId() {
    return 'statements-empty-state';
  }

  get errorStateId() {
    return 'statements-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noStatementsTitle() {
    return $(selectors.byText('No statements'));
  }

  get noStatementsDescription() {
    return $(selectors.byText('No statements found.'));
  }

  // ========== ID Pattern Override ==========
  // Statements use 4-group IDs: SOM-XXXX-XXXX-XXXX-XXXX
  // The title IS the ID (no separate name field)

  /**
   * Get all visible list items
   * Override for SOM- 4-group format
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
   * Override for SOM- minimal variant: "SOM-XXXX-XXXX-XXXX-XXXX, Status" (title IS the ID)
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{statementId: string, id: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));
    
    // SOM- uses 4-group format: SOM-XXXX-XXXX-XXXX-XXXX
    const idMatch = label.match(/(SOM-\d{4}-\d{4}-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    // Extract status (everything after the last comma)
    const statusMatch = label.match(/,\s*(\w+)$/);
    const status = statusMatch ? statusMatch[1] : '';

    // Note: Statements don't have a separate name - the ID IS the title
    return { statementId: id, id, status, label };
  }

  // ========== Backward-Compatible Aliases ==========
  // These maintain compatibility with existing tests

  /** @alias for scrollView */
  get statementsScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get statementItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstStatementItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} statementId - Statement ID (e.g., 'SOM-9994-9916-5145')
   */
  getStatementById(statementId) {
    return this.getItemById(statementId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Statement status (Generated, Queued, Error, Cancelled, Pending, Issued, Generating)
   */
  getStatementsByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnStatementsPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasStatements() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleStatementsCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} statementId - Statement ID to tap
   */
  async tapStatement(statementId) {
    return this.tapItem(statementId);
  }

  /** @alias for tapFirstItem */
  async tapFirstStatement() {
    return this.tapFirstItem();
  }

  /**
   * Get statement details from a statement element
   * @alias for getItemDetails with statement-specific naming
   * @param {WebdriverIO.Element} statementElement - Statement list item element
   * @returns {Promise<{statementId: string, id: string, status: string, label: string}>}
   */
  async getStatementDetails(statementElement) {
    return this.getItemDetails(statementElement);
  }

  /**
   * Get all visible statement IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleStatementIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible statements with their statuses
   * @returns {Promise<Array<{statementId: string, id: string, status: string, label: string}>>}
   */
  async getVisibleStatementsWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new StatementsPage();

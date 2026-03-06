const { getSelector, selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Credit Memos Page - extends ListPage for common list functionality
 * Provides credit memo-specific methods and backward-compatible aliases
 * 
 * Variant: Minimal (Title ID only, no picture, no subtitle)
 * ID Format: CRD-XXXX-XXXX-XXXX (4 groups)
 * Status Values: Draft, Completed, Processing
 * 
 * Note: Credit Memos use a different list config (listItemConfigNoImageNoSubtitle)
 * The title IS the ID, so accessibility label format is: "CRD-XXXX-XXXX-XXXX, Status"
 */
class CreditMemosPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'CRD-';
  }

  get pageName() {
    return 'Credit Memos';
  }

  get loadingIndicatorId() {
    return 'credit-memos-loading-indicator';
  }

  get emptyStateId() {
    return 'credit-memos-empty-state';
  }

  get errorStateId() {
    return 'credit-memos-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noCreditMemosTitle() {
    return $(selectors.byText('No credit memos'));
  }

  get noCreditMemosDescription() {
    return $(selectors.byText('No credit memos found.'));
  }

  // ========== ID Pattern Override ==========
  // Credit Memos use 4-group IDs: CRD-XXXX-XXXX-XXXX
  // The title IS the ID (no separate name field)

  /**
   * Get all visible list items
   * Override for CRD- 4-group format
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
   * Override for CRD- minimal variant: "CRD-XXXX-XXXX-XXXX, Status" (title IS the ID)
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{creditMemoId: string, id: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));
    
    // CRD- uses 4-group format: CRD-XXXX-XXXX-XXXX
    const idMatch = label.match(/(CRD-\d{4}-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    // Extract status (everything after the last comma)
    const statusMatch = label.match(/,\s*(\w+)$/);
    const status = statusMatch ? statusMatch[1] : '';

    // Note: Credit Memos don't have a separate name - the ID IS the title
    return { creditMemoId: id, id, status, label };
  }

  // ========== Backward-Compatible Aliases ==========
  // These maintain compatibility with existing tests

  /** @alias for scrollView */
  get creditMemosScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get creditMemoItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstCreditMemoItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} creditMemoId - Credit Memo ID (e.g., 'CRD-9994-9916-5145')
   */
  getCreditMemoById(creditMemoId) {
    return this.getItemById(creditMemoId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Credit Memo status (Issued, ...)
   */
  getCreditMemosByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnCreditMemosPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasCreditMemos() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleCreditMemosCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} creditMemoId - Credit Memo ID to tap
   */
  async tapCreditMemo(creditMemoId) {
    return this.tapItem(creditMemoId);
  }

  /** @alias for tapFirstItem */
  async tapFirstCreditMemo() {
    return this.tapFirstItem();
  }

  /**
   * Get credit memo details from a credit-memo element
   * @alias for getItemDetails with credit-memo-specific naming
   * @param {WebdriverIO.Element} creditMemoElement - Credit Memo list item element
   * @returns {Promise<{creditMemoId: string, id: string, status: string, label: string}>}
   */
  async getCreditMemoDetails(creditMemoElement) {
    return this.getItemDetails(creditMemoElement);
  }

  /**
   * Get all visible credit-memo IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleCreditMemoIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible credit memos with their statuses
   * @returns {Promise<Array<{creditMemoId: string, id: string, status: string, label: string}>>}
   */
  async getVisibleCreditMemosWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new CreditMemosPage();

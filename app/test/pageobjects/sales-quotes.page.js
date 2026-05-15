const ListPage = require('./base/list.page');

/**
 * Sales Quotes Page - extends ListPage for common list functionality
 *
 * Variant: ID as title + externalIds.operations as subtitle + Status badge (no image, no name)
 * List config: listItemConfigNoImageWithExternalIds
 * ID Format: SQT-XXXX-XXXX-XXXX (3 groups)
 *
 * Accessibility label format: "SQT-XXXX-XXXX-XXXX, EXT-ID, Status"
 * (externalIds.operations may be empty/null, in which case format is "SQT-XXXX-XXXX-XXXX, Status")
 */
class SalesQuotesPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'SQT-';
  }

  get pageName() {
    return 'Sales Quotes';
  }

  get loadingIndicatorId() {
    return 'sales-quotes-loading-indicator';
  }

  get emptyStateId() {
    return 'sales-quotes-empty-state';
  }

  get errorStateId() {
    return 'sales-quotes-error-state';
  }

  // ========== ID Parsing Override ==========
  // Sales Quotes use 3-group IDs: SQT-XXXX-XXXX-XXXX
  // Label format: "SQT-XXXX-XXXX-XXXX[, EXT-ID], Status"

  /**
   * Get item details from a sales quote item's accessibility label
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{salesQuoteId: string, id: string, externalId: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));

    const idMatch = label.match(/(SQT-\d{4}-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    const statusMatch = label.match(/,\s*([^,]+)$/);
    const status = statusMatch ? statusMatch[1].trim() : '';

    const externalIdMatch = label.match(/SQT-\d{4}-\d{4}-\d{4},\s*(.+),\s*[^,]+$/);
    const externalId = externalIdMatch ? externalIdMatch[1].trim() : '';

    return { salesQuoteId: id, id, externalId, status, label };
  }

  // ========== Backward-Compatible Aliases ==========

  /** @alias for scrollView */
  get salesQuotesScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get salesQuoteItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstSalesQuoteItem() {
    return this.firstListItem;
  }

  getSalesQuoteById(salesQuoteId) {
    return this.getItemById(salesQuoteId);
  }

  async isOnSalesQuotesPage() {
    return this.isOnPage();
  }

  async hasSalesQuotes() {
    return this.hasItems();
  }

  async getVisibleSalesQuotesCount() {
    return this.getVisibleItemsCount();
  }

  async tapSalesQuote(salesQuoteId) {
    return this.tapItem(salesQuoteId);
  }

  async tapFirstSalesQuote() {
    return this.tapFirstItem();
  }

  async getSalesQuoteDetails(salesQuoteElement) {
    return this.getItemDetails(salesQuoteElement);
  }

  async getVisibleSalesQuoteIds() {
    return this.getVisibleItemIds();
  }

  async getVisibleSalesQuotesWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new SalesQuotesPage();

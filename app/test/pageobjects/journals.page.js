const { getSelector, selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Journals Page - extends ListPage for common list functionality
 * Provides journal-specific methods and backward-compatible aliases
 *
 * Variant: Minimal (Title ID only, no picture, no subtitle) — uses listItemConfigNoImage
 * ID Format: BJO-XXXX-XXXX (2 groups)
 * Status Values: In Progress, Generated, Error, etc.
 *
 * Note: Journals appear under "billing" section in the More menu.
 * Only visible to Vendor and Operations roles.
 */
class JournalsPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'BJO-';
  }

  get pageName() {
    return 'Journals';
  }

  get loadingIndicatorId() {
    return 'journals-loading-indicator';
  }

  get emptyStateId() {
    return 'journals-empty-state';
  }

  get errorStateId() {
    return 'journals-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noJournalsTitle() {
    return $(selectors.byText('No journals'));
  }

  get noJournalsDescription() {
    return $(selectors.byText('No journals found.'));
  }

  /**
   * Get item details from an item's accessibility label
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{journalId: string, id: string, name: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label =
      (await itemElement.getAttribute('name')) ||
      (await itemElement.getAttribute('content-desc'));

    const idMatch = label.match(/(BJO-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    const nameMatch = label.match(/^(.+?),\s*BJO-/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    const statusMatch = label.match(/,\s*([^,]+)$/);
    const status = statusMatch ? statusMatch[1].trim() : '';

    return { journalId: id, id, name, status, label };
  }

  // ========== Backward-Compatible Aliases ==========

  /** @alias for scrollView */
  get journalsScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get journalItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstJournalItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} journalId - Journal ID
   */
  getJournalById(journalId) {
    return this.getItemById(journalId);
  }

  /** @alias for isOnPage */
  async isOnJournalsPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasJournals() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleJournalsCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} journalId - Journal ID to tap
   */
  async tapJournal(journalId) {
    return this.tapItem(journalId);
  }

  /** @alias for tapFirstItem */
  async tapFirstJournal() {
    return this.tapFirstItem();
  }

  /**
   * Get journal details from a journal element
   * @param {WebdriverIO.Element} journalElement - Journal list item element
   * @returns {Promise<{journalId: string, id: string, name: string, status: string, label: string}>}
   */
  async getJournalDetails(journalElement) {
    return this.getItemDetails(journalElement);
  }

  /**
   * Get all visible journal IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleJournalIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible journals with their statuses
   * @returns {Promise<Array<{journalId: string, id: string, name: string, status: string, label: string}>>}
   */
  async getVisibleJournalsWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new JournalsPage();

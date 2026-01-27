const { selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Agreements Page - extends ListPage for common list functionality
 * Provides agreement-specific methods and backward-compatible aliases
 */
class AgreementsPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'AGR-';
  }

  get pageName() {
    return 'Agreements';
  }

  get loadingIndicatorId() {
    return 'agreements-loading-indicator';
  }

  get emptyStateId() {
    return 'agreements-empty-state';
  }

  get errorStateId() {
    return 'agreements-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noAgreementsTitle() {
    return $(selectors.byText('No agreements'));
  }

  get noAgreementsDescription() {
    return $(selectors.byText('No agreements found.'));
  }

  // ========== Backward-Compatible Aliases ==========
  // These maintain compatibility with existing tests

  /** @alias for scrollView */
  get agreementsScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get agreementItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstAgreementItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} agreementId - Agreement ID (e.g., 'AGR-0000-0039-2883')
   */
  getAgreementById(agreementId) {
    return this.getItemById(agreementId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Agreement status (Active, Terminated, Deleted, Provisioning)
   */
  getAgreementsByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnAgreementsPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasAgreements() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleAgreementsCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} agreementId - Agreement ID to tap
   */
  async tapAgreement(agreementId) {
    return this.tapItem(agreementId);
  }

  /** @alias for tapFirstItem */
  async tapFirstAgreement() {
    return this.tapFirstItem();
  }

  /** @alias for getVisibleItemIds */
  async getVisibleAgreementIds() {
    return this.getVisibleItemIds();
  }

  // ========== Agreement-Specific Methods ==========

  /**
   * Get agreement details from an agreement item's accessibility label
   * Overrides base class for agreement-specific parsing
   * @param {WebdriverIO.Element} agreementElement - Agreement item element
   * @returns {Promise<{name: string, agreementId: string, status: string}>}
   */
  async getAgreementDetails(agreementElement) {
    const label =
      (await agreementElement.getAttribute('name')) || (await agreementElement.getAttribute('content-desc'));
    // Format: "Name, AGR-XXXX-XXXX-XXXX, Status"
    const match = label.match(/^(.+),\s*(AGR-\d{4}-\d{4}-\d{4}),\s*(\w+)$/);
    if (match) {
      return {
        name: match[1].trim(),
        agreementId: match[2],
        status: match[3],
      };
    }
    return { name: label, agreementId: '', status: '' };
  }

  /**
   * Get all visible agreements with their statuses
   * @returns {Promise<Array<{name: string, agreementId: string, status: string}>>}
   */
  async getVisibleAgreementsWithStatus() {
    const agreements = await this.agreementItems;
    const agreementDetails = [];
    for (const agreement of agreements) {
      const details = await this.getAgreementDetails(agreement);
      agreementDetails.push(details);
    }
    return agreementDetails;
  }
}

module.exports = new AgreementsPage();

const { selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Certificates Page - extends ListPage for common list functionality
 * Provides certificate-specific methods and backward-compatible aliases
 *
 * Variant: Standard (Title + ID + Status, no picture)
 * ID Format: CER-XXXX-XXXX-XXXX (4 groups)
 * Status Values: Active, Draft, Terminated
 *
 * Accessibility label format: "Name, CER-XXXX-XXXX-XXXX, Status"
 */
class CertificatesPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'CER-';
  }

  get pageName() {
    return 'Certificates';
  }

  get loadingIndicatorId() {
    return 'certificates-loading-indicator';
  }

  get emptyStateId() {
    return 'certificates-empty-state';
  }

  get errorStateId() {
    return 'certificates-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noCertificatesTitle() {
    return $(selectors.byText('No certificates'));
  }

  get noCertificatesDescription() {
    return $(selectors.byText('No certificates found.'));
  }

  // ========== ID Parsing Override ==========
  // Certificates use 4-group IDs: CER-XXXX-XXXX-XXXX
  // Label format: "Name, CER-XXXX-XXXX-XXXX, Status"

  /**
   * Get item details from an item's accessibility label
   * Override for CER- 4-group format: "Name, CER-XXXX-XXXX-XXXX, Status"
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{certificateId: string, id: string, name: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));

    // CER- uses 4-group format: CER-XXXX-XXXX-XXXX
    const idMatch = label.match(/(CER-\d{4}-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    // Extract name (everything before the CER- ID)
    const nameMatch = label.match(/^(.+?),\s*CER-/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    // Extract status (everything after the last comma)
    const statusMatch = label.match(/,\s*(\w+)$/);
    const status = statusMatch ? statusMatch[1] : '';

    return { certificateId: id, id, name, status, label };
  }

  // ========== Backward-Compatible Aliases ==========

  /** @alias for scrollView */
  get certificatesScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get certificateItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstCertificateItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} certificateId - Certificate ID (e.g., 'CER-3022-2070-2487')
   */
  getCertificateById(certificateId) {
    return this.getItemById(certificateId);
  }

  /** @alias for isOnPage */
  async isOnCertificatesPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasCertificates() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleCertificatesCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} certificateId - Certificate ID to tap
   */
  async tapCertificate(certificateId) {
    return this.tapItem(certificateId);
  }

  /** @alias for tapFirstItem */
  async tapFirstCertificate() {
    return this.tapFirstItem();
  }

  /**
   * Get certificate details from a certificate element
   * @alias for getItemDetails with certificate-specific naming
   * @param {WebdriverIO.Element} certificateElement - Certificate list item element
   * @returns {Promise<{certificateId: string, id: string, name: string, status: string, label: string}>}
   */
  async getCertificateDetails(certificateElement) {
    return this.getItemDetails(certificateElement);
  }

  /**
   * Get all visible certificate IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleCertificateIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible certificates with their statuses
   * @returns {Promise<Array<{certificateId: string, id: string, name: string, status: string, label: string}>>}
   */
  async getVisibleCertificatesWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new CertificatesPage();

const { $ } = require('@wdio/globals');

const { selectors } = require('./utils/selectors');
const ListPage = require('./base/list.page');

/**
 * Vendors Page - extends ListPage for common list functionality
 * Provides vendor-specific methods for the Operations-role Vendors list screen.
 *
 * Accessible from: More menu → Vendors (Operations role only)
 * Navigation: nav-menu-vendors
 *
 * Items are accounts with type "Vendor" (ACC-XXXX-XXXX format).
 * Tapping an item navigates to Account Details (type: 'vendor').
 *
 * Variant: Full (Title + Subtitle ID + Picture)
 * ID Format: ACC-XXXX-XXXX (3 groups)
 */
class VendorsPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'ACC-';
  }

  get pageName() {
    return 'Vendors';
  }

  get loadingIndicatorId() {
    return 'vendors-loading-indicator';
  }

  get emptyStateId() {
    return 'vendors-empty-state';
  }

  get errorStateId() {
    return 'vendors-error-state';
  }

  // ========== Empty State Elements ==========

  get noVendorsTitle() {
    return $(selectors.byText('No vendors'));
  }

  get noVendorsDescription() {
    return $(selectors.byText('No vendors found.'));
  }

  // ========== Helper Methods ==========

  /**
   * Check if there are any vendors in the list
   * @returns {Promise<boolean>}
   */
  async hasVendors() {
    return this.hasItems();
  }

  /**
   * Check if currently on the Vendors page
   * @returns {Promise<boolean>}
   */
  async isOnVendorsPage() {
    return this.isOnPage();
  }
}

module.exports = new VendorsPage();

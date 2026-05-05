const { $ } = require('@wdio/globals');

const { selectors } = require('./utils/selectors');
const ListPage = require('./base/list.page');

/**
 * Clients Page - extends ListPage for common list functionality
 * Provides client-specific methods for the Operations-role Clients list screen.
 *
 * Accessible from: More menu → Clients (Operations role only)
 * Navigation: nav-menu-clients
 *
 * Items are accounts with type "Client" (ACC-XXXX-XXXX format).
 * Tapping an item navigates to Account Details (type: 'client').
 *
 * Variant: Full (Title + Subtitle ID + Picture)
 * ID Format: ACC-XXXX-XXXX (3 groups)
 */
class ClientsPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'ACC-';
  }

  get pageName() {
    return 'Clients';
  }

  get loadingIndicatorId() {
    return 'clients-loading-indicator';
  }

  get emptyStateId() {
    return 'clients-empty-state';
  }

  get errorStateId() {
    return 'clients-error-state';
  }

  // ========== Empty State Elements ==========

  get noClientsTitle() {
    return $(selectors.byText('No clients'));
  }

  get noClientsDescription() {
    return $(selectors.byText('No clients found.'));
  }

  // ========== Helper Methods ==========

  /**
   * Check if there are any clients in the list
   * @returns {Promise<boolean>}
   */
  async hasClients() {
    return this.hasItems();
  }

  /**
   * Check if currently on the Clients page
   * @returns {Promise<boolean>}
   */
  async isOnClientsPage() {
    return this.isOnPage();
  }
}

module.exports = new ClientsPage();

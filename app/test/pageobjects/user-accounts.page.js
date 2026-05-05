const { $ } = require('@wdio/globals');

const { selectors } = require('./utils/selectors');
const ListPage = require('./base/list.page');

/**
 * User Accounts Page - extends ListPage for the UserAccountsScreen
 * Displays the list of accounts associated with a specific user.
 *
 * Accessible from: More → All Users → [user] → User Details → "Accounts" sub-list navigation item
 * This route is only available from Operations context when showAccounts=true is passed to UserDetailsScreen.
 *
 * Items are accounts (ACC-XXXX-XXXX format) - both Clients and Vendors.
 * Tapping an item navigates to Account Details.
 *
 * Navigation route name: 'accounts' (requires userId route param)
 *
 * Variant: Full (Title + Subtitle ID + Picture)
 * ID Format: ACC-XXXX-XXXX (3 groups)
 */
class UserAccountsPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'ACC-';
  }

  get pageName() {
    return 'Accounts';
  }

  get loadingIndicatorId() {
    return 'user-accounts-loading-indicator';
  }

  get emptyStateId() {
    return 'user-accounts-empty-state';
  }

  get errorStateId() {
    return 'user-accounts-error-state';
  }

  // ========== Empty State Elements ==========

  get noAccountsTitle() {
    return $(selectors.byText('No accounts'));
  }

  // ========== Helper Methods ==========

  /**
   * Check if there are any accounts in the list
   * @returns {Promise<boolean>}
   */
  async hasAccounts() {
    return this.hasItems();
  }

  /**
   * Check if currently on the User Accounts page
   * @returns {Promise<boolean>}
   */
  async isOnUserAccountsPage() {
    return this.isOnPage();
  }
}

module.exports = new UserAccountsPage();

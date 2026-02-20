const { $ } = require('@wdio/globals');
const DetailsPage = require('./base/details.page');

/**
 * User Details Page - displays detailed information for a single user
 * Accessed by tapping a user item from the Users list page
 * Extends DetailsPage for common detail page functionality
 */
class UserDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'USR-';
  }

  get pageName() {
    return 'User';
  }

  /**
   * @alias for itemIdText
   */
  get userIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible user details as an object (uses base helpers)
   * @returns {Promise<Object>} User details object
   */
  async getAllUserDetails() {
    await this.scrollToTop();
    return {
      userName: await this.getSimpleFieldValue('Adam Ruszczak', true), // User name label
      userId: await this.getItemId(),
      status: await this.getStatus(),
      email: await this.getSimpleFieldValue('Email', true),
      singleSignOn: await this.getSimpleFieldValue('Single sign on', true),
      firstName: await this.getSimpleFieldValue('First name', true),
      lastName: await this.getSimpleFieldValue('Last name', true),
      phoneNumber: await this.getSimpleFieldValue('Phone number', true),
    };
  }
}

module.exports = new UserDetailsPage();

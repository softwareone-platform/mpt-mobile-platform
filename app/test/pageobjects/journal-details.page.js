const { $ } = require('@wdio/globals');
const DetailsPage = require('./base/details.page');

/**
 * Journal Details Page - displays detailed information for a single journal
 * Accessed by tapping a journal item from the Journals list page
 * Extends DetailsPage for common detail page functionality
 */
class JournalDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'BJO-';
  }

  get pageName() {
    return 'Journal';
  }

  /**
   * @alias for itemIdText
   */
  get journalIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible journal details as an object (uses base helpers)
   * @returns {Promise<Object>} Journal details object
   */
  async getAllJournalDetails() {
    await this.scrollToTop();
    return {
      journalId: await this.getItemId(),
      status: await this.getStatus(),
      authorization: await this.getSimpleFieldValue('Authorization', true).catch(() => ''),
      product: await this.getCompositeFieldValueByLabel('Product', true).catch(() => ''),
      owner: await this.getCompositeFieldValueByLabel('Owner', true).catch(() => ''),
      vendor: await this.getCompositeFieldValueByLabel('Vendor', true).catch(() => ''),
      dueDate: await this.getSimpleFieldValue('Due date', true).catch(() => ''),
      baseCurrency: await this.getSimpleFieldValue('Base currency', true).catch(() => ''),
      allCharges: await this.getSimpleFieldValue('All charges', true).catch(() => ''),
      readyCharges: await this.getSimpleFieldValue('Ready charges', true).catch(() => ''),
      splitCharges: await this.getSimpleFieldValue('Split charges', true).catch(() => ''),
      errorCharges: await this.getSimpleFieldValue('Error charges', true).catch(() => ''),
      pp: await this.getSimpleFieldValue('∑ PP', true).catch(() => ''),
      assignee: await this.getCompositeFieldValueByLabel('Assignee', true).catch(() => ''),
    };
  }
}

module.exports = new JournalDetailsPage();

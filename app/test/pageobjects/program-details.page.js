const DetailsPage = require('./base/details.page');

/**
 * Program Details Page - displays detailed information for a single program.
 * Accessed by tapping a program item from the Programs list page.
 * Extends DetailsPage for common detail page functionality.
 */
class ProgramDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'PRG-';
  }

  get pageName() {
    return 'Program';
  }

  /** @alias for itemIdText */
  get programIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible program details as an object (uses base helpers).
   * @returns {Promise<Object>} Program details object
   */
  async getAllProgramDetails() {
    await this.scrollToTop();
    return {
      programId: await this.getItemId(),
      status: await this.getStatus(),
      vendor: await this.getCompositeFieldValueByLabel('Vendor', true).catch(() => ''),
      name: await this.getSimpleFieldValue('Name', true),
      website: await this.getSimpleFieldValue('Website', true),
      eligibility: await this.getSimpleFieldValue('Eligibility', true),
      applicableTo: await this.getSimpleFieldValue('Applicable To', true),
    };
  }
}

module.exports = new ProgramDetailsPage();

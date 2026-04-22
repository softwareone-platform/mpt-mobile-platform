const DetailsPage = require('./base/details.page');

/**
 * Enrollment Details Page - displays detailed information for a single enrollment
 * Accessed by tapping an enrollment item from the Enrollments list page
 * Extends DetailsPage for common detail page functionality
 */
class EnrollmentDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'ENR-';
  }

  get pageName() {
    return 'Enrollment';
  }

  /**
   * @alias for itemIdText
   */
  get enrollmentIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible enrollment details as an object (uses base helpers)
   * @returns {Promise<Object>} Enrollment details object
   */
  async getAllEnrollmentDetails() {
    await this.scrollToTop();
    return {
      enrollmentId: await this.getItemId(),
      status: await this.getStatus(),
      program: await this.getCompositeFieldValueByLabel('Program', true).catch(() => ''),
      certificate: await this.getCompositeFieldValueByLabel('Certificate', true).catch(() => ''),
      certificant: await this.getCompositeFieldValueByLabel('Certificant', true).catch(() => ''),
      eligibility: await this.getSimpleFieldValue('Eligibility', true),
      applicableTo: await this.getSimpleFieldValue('Applicable To', true),
      assignee: await this.getCompositeFieldValueByLabel('Assignee', true).catch(() => ''),
    };
  }
}

module.exports = new EnrollmentDetailsPage();

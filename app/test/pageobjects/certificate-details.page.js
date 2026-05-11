const DetailsPage = require('./base/details.page');

/**
 * Certificate Details Page - displays detailed information for a single certificate
 * Accessed by tapping a certificate item from the Certificates list page
 * Extends DetailsPage for common detail page functionality
 *
 * Fields shown (from CertificateDetailsContent.tsx):
 *   - Program (composite field)
 *   - Vendor (composite field, hidden for vendor accounts)
 *   - Certificant (composite field, buyer or licensee depending on applicableTo)
 *   - Eligibility (simple field: Partner or Client)
 *   - Applicable To (simple field: Buyer or Licensee)
 *   - Expiration (simple field: formatted date)
 */
class CertificateDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'CER-';
  }

  get pageName() {
    return 'Certificate';
  }

  /**
   * @alias for itemIdText
   */
  get certificateIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible certificate details as an object (uses base helpers)
   * @returns {Promise<Object>} Certificate details object
   */
  async getAllCertificateDetails() {
    await this.scrollToTop();
    return {
      certificateId: await this.getItemId(),
      status: await this.getStatus(),
      program: await this.getCompositeFieldValueByLabel('Program', true).catch(() => ''),
      vendor: await this.getCompositeFieldValueByLabel('Vendor', true).catch(() => ''),
      certificant: await this.getCompositeFieldValueByLabel('Certificant', true).catch(() => ''),
      eligibility: await this.getSimpleFieldValue('Eligibility', true),
      applicableTo: await this.getSimpleFieldValue('Applicable To', true),
      expiration: await this.getSimpleFieldValue('Expiration', true),
    };
  }
}

module.exports = new CertificateDetailsPage();

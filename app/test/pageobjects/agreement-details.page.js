const { $ } = require('@wdio/globals');
const DetailsPage = require('./base/details.page');
const { getSelector, selectors } = require('./utils/selectors');
const { TIMEOUT } = require('./utils/constants');

/**
 * Agreement Details Page - displays detailed information for a single agreement
 * Accessed by tapping an agreement item from the Agreements list page
 * Extends DetailsPage for common detail page functionality
 */

class AgreementDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'AGR-';
  }

  get pageName() {
    return 'Agreement';
  }

  /**
   * @alias for itemIdText
   */
  get agreementIdText() {
    return this.itemIdText;
  }

  /**
   * Get all visible agreement details as an object (uses base helpers)
   * @returns {Promise<Object>} Agreement details object
   */
  async getAllAgreementDetails() {
    await this.scrollToTop();
    return {
      agreementId: await this.getItemId(),
      status: await this.getStatus(),
      // Core fields — scroll to find if not immediately visible
      vendor: await this.getCompositeFieldValueByLabel('Vendor', true),
      product: await this.getCompositeFieldValueByLabel('Product', true),
      resaleLicensee: await this.getSimpleFieldValue('Resale licensee', false),
      client: await this.getCompositeFieldValueByLabel('Client', false),
      // Pricing/yield fields — check existence only (no scrolling); these are role-gated
      // and will not be present for Client accounts, so scrollIfNeeded=false avoids
      // burning 4 scroll attempts per missing field.
      ppx: await this.getSimpleFieldValue('PPx', false),
      ppxPrice: await this.getSimpleFieldValue('- USD/month    - USD/year', false),
      averageYield: await this.getSimpleFieldValue('Average yield', false),
      averageYieldValue: await this.getSimpleFieldValue('- M↑    - M↓', false),
      defaultYield: await this.getSimpleFieldValue('Default yield', false),
      defaultYieldValue: await this.getSimpleFieldValue('42.00% M↑    29.58% M↓', false),
      spx: await this.getSimpleFieldValue('SPx', false),
      spxPrice: await this.getSimpleFieldValue('- USD/month    - USD/year', false),
      baseCurrency: await this.getSimpleFieldValue('Base currency', true),
      baseCurrencyValue: await this.getSimpleFieldValue('USD', false),
      billingCurrency: await this.getSimpleFieldValue('Billing currency', true),
      billingCurrencyValue: await this.getSimpleFieldValue('USD', false),
    };
  }
}

module.exports = new AgreementDetailsPage();

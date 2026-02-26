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
      vendor: await this.getCompositeFieldValueByLabel('Vendor', true),
      product: await this.getCompositeFieldValueByLabel('Product', true),
      resaleLicensee: await this.getSimpleFieldValue('Resale licensee', true),
      client: await this.getCompositeFieldValueByLabel('Client', true),
      ppx: await this.getSimpleFieldValue('PPx', true),
      ppxPrice: await this.getSimpleFieldValue('- USD/month    - USD/year', true),
      averageYield: await this.getSimpleFieldValue('Average yield', true),
      averageYieldValue: await this.getSimpleFieldValue('- M↑    - M↓', true),
      defaultYield: await this.getSimpleFieldValue('Default yield', true),
      defaultYieldValue: await this.getSimpleFieldValue('42.00% M↑    29.58% M↓', true),
      spx: await this.getSimpleFieldValue('SPx', true),
      spxPrice: await this.getSimpleFieldValue('- USD/month    - USD/year', true),
      baseCurrency: await this.getSimpleFieldValue('Base currency', true),
      baseCurrencyValue: await this.getSimpleFieldValue('USD', true),
      billingCurrency: await this.getSimpleFieldValue('Billing currency', true),
      billingCurrencyValue: await this.getSimpleFieldValue('USD', true),
    };
  }
}

module.exports = new AgreementDetailsPage();

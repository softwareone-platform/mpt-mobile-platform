const { $,$$ } = require('@wdio/globals');

const DetailsPage = require('./base/details.page');
const { getSelector, selectors } = require('./utils/selectors');
const { PAUSE, SCROLL } = require('./utils/constants');

/**
 * Product Details Page - displays detailed information for a single product.
 * Accessed by tapping a product item from the Products list page.
 */
class ProductDetailsPage extends DetailsPage {
  get itemPrefix() {
    return 'PRD-';
  }

  get pageName() {
    return 'Product';
  }

  /** @alias for itemIdText */
  get productIdText() {
    return this.itemIdText;
  }

  /**
   * Product details screen exposes status with a dedicated test ID.
   */
  get statusText() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeOther[@name="product-details-header-status"]/following-sibling::XCUIElementTypeStaticText[1]',
        android: selectors.byResourceId('product-details-header-status'),
      }),
    );
  }

  /**
   * Product status is rendered inside a nested text node within the chip container.
   * @returns {Promise<string>}
   */
  async getStatus() {
    const statusValue = await this.statusText.getText().catch(() => '');
    if (statusValue) {
      return statusValue.trim();
    }

    const knownStatusSelector = getSelector({
      ios: '//XCUIElementTypeStaticText[@name="Published" or @name="Unpublished" or @name="Pending"]',
      android: '//android.widget.TextView[@text="Published" or @text="Unpublished" or @text="Pending"]',
    });

    const knownStatusElements = await $$(knownStatusSelector);
    for (const element of knownStatusElements) {
      const text = await element.getText().catch(() => '');
      if (text) {
        return text.trim();
      }
    }

    return super.getStatus().catch(() => '');
  }

  /**
   * Check whether the Vendor composite field is visible.
   * @returns {Promise<boolean>}
   */
  async hasVendorField() {
    return this.getCompositeField('Vendor').isDisplayed().catch(() => false);
  }

  /**
   * Get description text from the Description card.
   * @returns {Promise<string>}
   */
  async getDescriptionValue() {
    const textSelector = getSelector({
      ios: '//XCUIElementTypeStaticText',
      android: '//android.widget.TextView',
    });

    for (let attempt = 0; attempt < SCROLL.MAX_SCROLL_ATTEMPTS; attempt++) {
      const textElements = await $$(textSelector);
      const values = [];

      for (const element of textElements) {
        const value = (await element.getText()).trim();
        if (value) {
          values.push(value);
        }
      }

      const descriptionIndex = values.findIndex((value) => value === 'Description');
      if (descriptionIndex >= 0 && values[descriptionIndex + 1]) {
        return values[descriptionIndex + 1];
      }

      await this.scrollDown();
      await browser.pause(PAUSE.NAVIGATION);
    }

    return '';
  }

  /**
   * Get all visible product details as an object.
   * @returns {Promise<Object>} Product details object
   */
  async getAllProductDetails() {
    await this.scrollToTop();

    const hasVendorField = await this.hasVendorField();

    return {
      productId: await this.getItemId(),
      status: await this.getStatus(),
      vendor: hasVendorField ? await this.getCompositeFieldValueByLabel('Vendor', true) : '',
      name: await this.getSimpleFieldValue('Name', true),
      website: await this.getSimpleFieldValue('Website', true),
      description: await this.getDescriptionValue(),
    };
  }
}

module.exports = new ProductDetailsPage();

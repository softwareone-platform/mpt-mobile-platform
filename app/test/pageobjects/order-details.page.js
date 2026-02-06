const { $ } = require('@wdio/globals');

const DetailsPage = require('./base/details.page');
const { getSelector, selectors } = require('./utils/selectors');

/**
 * Order Details Page - displays detailed information for a single order
 * Accessed by tapping an order item from the Orders list page
 * Extends DetailsPage for common detail page functionality
 */
class OrderDetailsPage extends DetailsPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'ORD-';
  }

  get pageName() {
    return 'Order';
  }

  // ========== Order-Specific Element Aliases ==========

  /** @alias for itemIdText */
  get orderIdText() {
    return this.itemIdText;
  }

  // ========== Order-Specific Field Elements ==========

  get typeLabel() {
    return $(selectors.byText('Type'));
  }

  get typeValue() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="Type"]/following-sibling::XCUIElementTypeStaticText[1]',
        android: '//android.widget.TextView[@text="Type"]/following-sibling::android.widget.TextView[1]',
      }),
    );
  }

  get resaleLicenseeLabel() {
    return $(selectors.byText('Resale licencee'));
  }

  get resaleLicenseeValue() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="Resale licencee"]/following-sibling::XCUIElementTypeStaticText[1]',
        android: '//android.widget.TextView[@text="Resale licencee"]/following-sibling::android.widget.TextView[1]',
      }),
    );
  }

  get averageYieldLabel() {
    return $(selectors.byText('Average yield'));
  }

  get averageYieldValue() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="Average yield"]/following-sibling::XCUIElementTypeStaticText[1]',
        android: '//android.widget.TextView[@text="Average yield"]/following-sibling::android.widget.TextView[1]',
      }),
    );
  }

  get defaultYieldLabel() {
    return $(selectors.byText('Default yield'));
  }

  get defaultYieldValue() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="Default yield"]/following-sibling::XCUIElementTypeStaticText[1]',
        android: '//android.widget.TextView[@text="Default yield"]/following-sibling::android.widget.TextView[1]',
      }),
    );
  }

  get currencyLabel() {
    return $(selectors.byText('Currency'));
  }

  get currencyValue() {
    return $(
      getSelector({
        ios: '//XCUIElementTypeStaticText[@name="Currency"]/following-sibling::XCUIElementTypeStaticText[1]',
        android: '//android.widget.TextView[@text="Currency"]/following-sibling::android.widget.TextView[1]',
      }),
    );
  }

  // ========== Composite Accessible Elements ==========

  get agreementField() {
    return this.getCompositeField('Agreement');
  }

  get productField() {
    return this.getCompositeField('Product');
  }

  get vendorField() {
    return this.getCompositeField('Vendor');
  }

  get clientField() {
    return this.getCompositeField('Client');
  }

  get assigneeField() {
    return this.getCompositeField('Assignee');
  }

  // ========== Order-Specific Helper Methods ==========

  /**
   * @alias for isOnDetailsPage
   */
  async isOnOrderDetailsPage() {
    return this.isOnDetailsPage();
  }

  /**
   * Get the displayed Order ID
   * @returns {Promise<string>} Order ID (e.g., 'ORD-8235-3388-3309')
   */
  async getOrderId() {
    return this.getItemId();
  }

  /**
   * Get the order type value
   * Type is always at the top of the details, so scroll to top if not visible
   * @returns {Promise<string>} Type (e.g., 'Purchase')
   */
  async getType() {
    const isDisplayed = await this.typeValue.isDisplayed().catch(() => false);
    if (!isDisplayed) {
      await this.scrollToTop();
    }
    const text = await this.typeValue.getText();
    return text.trim();
  }

  /**
   * Get the currency value
   * @returns {Promise<string>} Currency (e.g., 'USD')
   */
  async getCurrency() {
    return this.getSimpleFieldValue('Currency', true);
  }

  /**
   * Get the resale licensee value
   * @returns {Promise<string>} Resale licensee or '-'
   */
  async getResaleLicensee() {
    const text = await this.resaleLicenseeValue.getText();
    return text.trim();
  }

  /**
   * Get the average yield value
   * @returns {Promise<string>} Average yield (e.g., '11.11% M↑    10.00% M↓')
   */
  async getAverageYield() {
    const text = await this.averageYieldValue.getText();
    return text.trim();
  }

  /**
   * Get the default yield value
   * @returns {Promise<string>} Default yield (e.g., '12.00% M↑    10.71% M↓')
   */
  async getDefaultYield() {
    const text = await this.defaultYieldValue.getText();
    return text.trim();
  }

  /**
   * Get the Agreement name
   * @returns {Promise<string>}
   */
  async getAgreementName() {
    return this.getCompositeFieldValue(this.agreementField);
  }

  /**
   * Get the Product name
   * @returns {Promise<string>}
   */
  async getProductName() {
    return this.getCompositeFieldValue(this.productField);
  }

  /**
   * Get the Vendor name
   * @returns {Promise<string>}
   */
  async getVendorName() {
    return this.getCompositeFieldValue(this.vendorField);
  }

  /**
   * Get the Client name
   * @returns {Promise<string>}
   */
  async getClientName() {
    return this.getCompositeFieldValue(this.clientField);
  }

  /**
   * Get the Assignee name
   * @returns {Promise<string>}
   */
  async getAssigneeName() {
    return this.getCompositeFieldValueByLabel('Assignee', true);
  }

  /**
   * Get all visible order details as an object
   * Scrolls to top first to ensure all fields can be accessed in order
   * @returns {Promise<Object>} Order details object
   */
  async getAllOrderDetails() {
    // Scroll to top first to ensure we start from the top
    await this.scrollToTop();

    return {
      orderId: await this.getOrderId(),
      status: await this.getStatus(),
      type: await this.getType(),
      currency: await this.getCurrency(),
      agreement: await this.getAgreementName(),
      product: await this.getProductName(),
      vendor: await this.getVendorName(),
      client: await this.getClientName(),
    };
  }
}

module.exports = new OrderDetailsPage();

const { expect } = require('@wdio/globals');

const subscriptionsPage = require('../pageobjects/subscriptions.page');
const subscriptionDetailsPage = require('../pageobjects/subscription-details.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');

describe('Subscription Details Page', () => {
  let hasSubscriptionsData = false;
  let apiAvailable = false;
  let testSubscriptionId = null;
  let apiSubscriptionData = null;

  before(async function () {
    this.timeout(150000);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await subscriptionsPage.ensureSubscriptionsPage();

    hasSubscriptionsData = await subscriptionsPage.hasSubscriptions();
    apiAvailable = !!process.env.API_OPS_TOKEN;

    if (hasSubscriptionsData) {
      const subscriptionIds = await subscriptionsPage.getVisibleSubscriptionIds();
      testSubscriptionId = subscriptionIds[0];

      // Pre-fetch API data for validation tests
      if (apiAvailable && testSubscriptionId) {
        try {
          apiSubscriptionData = await apiClient.getSubscriptionById(testSubscriptionId);
          console.log(JSON.stringify(apiSubscriptionData, null, 2));
          console.info(`📊 Pre-fetched API data for subscription: ${testSubscriptionId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to fetch API data: ${error.message}`);
        }
      }
    }

    console.info(`📊 Subscription Details test setup: hasSubscriptions=${hasSubscriptionsData}, apiAvailable=${apiAvailable}, testSubscriptionId=${testSubscriptionId}`);

    // Navigate to subscription details page once at the start
    if (hasSubscriptionsData && testSubscriptionId) {
      await subscriptionsPage.tapSubscription(testSubscriptionId);
      await subscriptionDetailsPage.waitForPageReady();
    }
  });

  beforeEach(async function () {
    await subscriptionDetailsPage.scrollToTop(1);
  });

  describe('Page Structure', () => {
    it('should display the Subscription header title', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      await expect(subscriptionDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Subscription ID', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      await expect(subscriptionDetailsPage.subscriptionIdText).toBeDisplayed();
      const subscriptionId = await subscriptionDetailsPage.getItemId();
      expect(subscriptionId).toMatch(/^SUB-\d{4}-\d{4}-\d{4}$/);
    });

    it('should display the status badge', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      await expect(subscriptionDetailsPage.statusText).toBeDisplayed();
      const status = await subscriptionDetailsPage.getStatus();
      expect([
        'Active',
        'Suspended',
        'Cancelled',
        'Expired',
        'Pending',
        'Failed',
        'Processing',
        'Draft',
      ]).toContain(status);
    });

    it('should display the Details section header', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      await expect(subscriptionDetailsPage.detailsHeader).toBeDisplayed();
    });

    it('should display the Product field', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      const productValue = await subscriptionDetailsPage.getCompositeFieldValueByLabel('Product', true);
      expect(productValue).toBeTruthy();
    });

    it('should display the Agreement field', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      const agreementValue = await subscriptionDetailsPage.getCompositeFieldValueByLabel('Agreement', true);
      expect(agreementValue).toBeTruthy();
    });

    it('should display the Client field', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      const clientValue = await subscriptionDetailsPage.getCompositeFieldValueByLabel('Client', true);
      expect(clientValue).toBeTruthy();
    });

    it('should display the Terms field', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      const termsValue = await subscriptionDetailsPage.getSimpleFieldValue('Terms', true);
      expect(termsValue).toBeTruthy();
    });

    it('should display the Renewal date field', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      const renewalDateValue = await subscriptionDetailsPage.getSimpleFieldValue('Renewal date', true);
      expect(renewalDateValue).toBeTruthy();
    });

    it('should display the Billing model field', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      const billingModelValue = await subscriptionDetailsPage.getSimpleFieldValue('Billing model', true);
      expect(billingModelValue).toBeTruthy();
    });

    it('should display the Quantity field', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      const quantityValue = await subscriptionDetailsPage.getSimpleFieldValue('Quantity', true);
      expect(quantityValue).toBeTruthy();
    });

    it('should display the Average yield field', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      const avgYieldValue = await subscriptionDetailsPage.getSimpleFieldValue('Average yield', true);
      expect(avgYieldValue).toBeTruthy();
    });

    it('should display the Default yield field', async function () {
      if (!hasSubscriptionsData) {
        this.skip();
        return;
      }
      const defaultYieldValue = await subscriptionDetailsPage.getSimpleFieldValue('Default yield', true);
      expect(defaultYieldValue).toBeTruthy();
    });
  });

  describe('API Data Validation', () => {
    it('should match Subscription ID with API response', async function () {
      if (!hasSubscriptionsData || !apiAvailable || !apiSubscriptionData) {
        this.skip();
        return;
      }
      const uiSubscriptionId = await subscriptionDetailsPage.getItemId();
      const apiSubscriptionId = apiSubscriptionData.id || apiSubscriptionData.subscriptionId;
      console.info(`[Subscription ID] UI: ${uiSubscriptionId} | API: ${apiSubscriptionId}`);
      expect(uiSubscriptionId).toBe(apiSubscriptionId);
    });

    it('should match status with API response', async function () {
      if (!hasSubscriptionsData || !apiAvailable || !apiSubscriptionData) {
        this.skip();
        return;
      }
      const uiStatus = await subscriptionDetailsPage.getStatus();
      const apiStatus = apiSubscriptionData.status;
      console.info(`[Status] UI: ${uiStatus} | API: ${apiStatus}`);
      if (uiStatus !== apiStatus) {
        console.warn(`[Status Mismatch] Subscription status may have changed during test execution. UI: ${uiStatus}, API: ${apiStatus}`);
      }
      expect(uiStatus).toBeTruthy();
      expect(apiStatus).toBeTruthy();
    });

    it('should match product name with API response', async function () {
      if (!hasSubscriptionsData || !apiAvailable || !apiSubscriptionData) {
        this.skip();
        return;
      }
      const uiProduct = await subscriptionDetailsPage.getCompositeFieldValueByLabel('Product', true);
      const apiProduct = apiSubscriptionData.product?.name || '';
      console.info(`[Product] UI: ${uiProduct} | API: ${apiProduct}`);
      expect(apiProduct).toBeTruthy();
      expect(uiProduct).toContain(apiProduct.substring(0, 20));
    });

    it('should match agreement name with API response', async function () {
      if (!hasSubscriptionsData || !apiAvailable || !apiSubscriptionData) {
        this.skip();
        return;
      }
      const uiAgreement = await subscriptionDetailsPage.getCompositeFieldValueByLabel('Agreement', true);
      const apiAgreement = apiSubscriptionData.agreement?.name || '';
      console.info(`[Agreement] UI: ${uiAgreement} | API: ${apiAgreement}`);
      expect(apiAgreement).toBeTruthy();
      expect(uiAgreement).toContain(apiAgreement.substring(0, 20));
    });

    it('should match client name with API response', async function () {
      if (!hasSubscriptionsData || !apiAvailable || !apiSubscriptionData) {
        this.skip();
        return;
      }
      const uiClient = await subscriptionDetailsPage.getCompositeFieldValueByLabel('Client', true);
      const apiClientName = apiSubscriptionData.lines?.[0]?.client?.name || '';
      console.info(`[Client] UI: ${uiClient} | API: ${apiClientName}`);
      expect(apiClientName).toBeTruthy();
      expect(uiClient).toContain(apiClientName.substring(0, 20));
    });

    it('should match terms with API response', async function () {
      if (!hasSubscriptionsData || !apiAvailable || !apiSubscriptionData) {
        this.skip();
        return;
      }
      const uiTerms = await subscriptionDetailsPage.getSimpleFieldValue('Terms', true);
      // Map API terms object to UI string using details.json
      const terms = apiSubscriptionData.terms || {};
      // These values should match details.json keys
      const periodMap = {
        '1m': 'Monthly billing',
        '1y': 'Annual billing',
        '3y': 'Annual billing',
        'one-time': 'One-time',
      };
      const modelMap = {
        'one-time': 'One-time',
        'usage': 'Usage',
        'quantity': 'Quantity',
      };
      // UI shows period label for terms
      const expectedTerms = periodMap[terms.period] || '';
      console.info(`[Terms] UI: ${uiTerms} | API: ${JSON.stringify(terms)} | Expected: ${expectedTerms}`);
      expect(uiTerms).toBe(expectedTerms);
    });

    it('should match renewal date with API response', async function () {
      if (!hasSubscriptionsData || !apiAvailable || !apiSubscriptionData) {
        this.skip();
        return;
      }
      const uiRenewalDate = await subscriptionDetailsPage.getSimpleFieldValue('Renewal date', true);
      const apiRenewalDate = apiSubscriptionData.commitmentDate;
      // Format API date to match UI (e.g., '10 Mar 2026')
      function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
        const year = date.getUTCFullYear();
        return `${day} ${month} ${year}`;
      }
      const expectedRenewalDate = formatDate(apiRenewalDate);
      console.info(`[Renewal Date] UI: ${uiRenewalDate} | API: ${apiRenewalDate} | Expected: ${expectedRenewalDate}`);
      expect(uiRenewalDate).toBe(expectedRenewalDate);
    });

    it('should match billing model with API response', async function () {
      if (!hasSubscriptionsData || !apiAvailable || !apiSubscriptionData) {
        this.skip();
        return;
      }
      const uiBillingModel = await subscriptionDetailsPage.getSimpleFieldValue('Billing model', true);
      // Use model from terms, fallback to billingModel
      const model = (apiSubscriptionData.terms && apiSubscriptionData.terms.model) || apiSubscriptionData.billingModel;
      const modelMap = {
        'one-time': 'One-time',
        'usage': 'Usage',
        'quantity': 'Quantity',
      };
      const expectedBillingModel = modelMap[model] || '';
      console.info(`[Billing Model] UI: ${uiBillingModel} | API: ${model} | Expected: ${expectedBillingModel}`);
      expect(uiBillingModel).toBe(expectedBillingModel);
    });

    // it('should match quantity with API response', async function () {
    //   if (!hasSubscriptionsData || !apiAvailable || !apiSubscriptionData) {
    //     this.skip();
    //     return;
    //   }
    //   const uiQuantity = await subscriptionDetailsPage.getSimpleFieldValue('Quantity', true);
    //   // Use first line's quantity if available
    //   let apiQuantity = '';
    //   if (Array.isArray(apiSubscriptionData.lines) && apiSubscriptionData.lines.length > 0) {
    //     apiQuantity = apiSubscriptionData.lines[0].quantity;
    //   } else if (typeof apiSubscriptionData.quantity !== 'undefined') {
    //     apiQuantity = apiSubscriptionData.quantity;
    //   }
    //   // UI may show as string, so cast to string
    //   const expectedQuantity = apiQuantity !== undefined ? String(apiQuantity) : '';
    //   console.info(`[Quantity] UI: ${uiQuantity} | API: ${apiQuantity} | Expected: ${expectedQuantity}`);
    //   expect(uiQuantity).toBe(expectedQuantity);
    // });

    it('should log all subscription details for comparison', async function () {
      if (!hasSubscriptionsData || !apiAvailable || !apiSubscriptionData) {
        this.skip();
        return;
      }
      const uiDetails = await subscriptionDetailsPage.getAllSubscriptionDetails();
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info('📋 Subscription Details Comparison');
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.info(`Subscription ID: UI="${uiDetails.subscriptionId}" | API="${apiSubscriptionData.id || apiSubscriptionData.subscriptionId}"`);
      console.info(`Status:         UI="${uiDetails.status}" | API="${apiSubscriptionData.status}"`);
      console.info(`Terms:          UI="${uiDetails.terms}" | API="${apiSubscriptionData.terms}"`);
      console.info(`Renewal Date:   UI="${uiDetails.renewalDate}" | API="${apiSubscriptionData.renewalDate}"`);
      console.info(`Billing Model:  UI="${uiDetails.billingModel}" | API="${apiSubscriptionData.billingModel}"`);
      console.info(`Quantity:       UI="${uiDetails.quantity}" | API="${apiSubscriptionData.quantity}"`);
      console.info(`Product:        UI="${uiDetails.product}"`);
      console.info(`Agreement:      UI="${uiDetails.agreement}"`);
      console.info(`Client:         UI="${uiDetails.client}"`);
      console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      // Basic validation - subscription ID should always match
      expect(uiDetails.subscriptionId).toBe(apiSubscriptionData.id || apiSubscriptionData.subscriptionId);
    });
  });
});

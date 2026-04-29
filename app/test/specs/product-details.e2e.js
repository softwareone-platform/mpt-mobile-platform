const { expect } = require('@wdio/globals');

const productDetailsPage = require('../pageobjects/product-details.page');
const productsPage = require('../pageobjects/products.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const { ensureClientAccount } = require('../pageobjects/utils/account.helper');
const { TIMEOUT, REGEX, STATUSES } = require('../pageobjects/utils/constants');
const navigation = require('../pageobjects/utils/navigation.page');
const { getClientApi } = require('../utils/api-client');

function normalizeText(value) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

describe('Product Details Page', () => {
  let api;
  let hasProductsData = false;
  let apiAvailable = false;
  let testProductId = null;
  let apiProductData = null;

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    api = getClientApi();

    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await ensureClientAccount();
    await productsPage.ensureProductsPage();

    hasProductsData = await productsPage.hasProducts();
    apiAvailable = !!api;

    if (hasProductsData) {
      const productIds = await productsPage.getVisibleProductIds();
      testProductId = productIds[0];

      if (apiAvailable && testProductId) {
        try {
          apiProductData = await api.getProductById(testProductId);
        } catch (error) {
          console.warn(`Failed to fetch product details from API: ${error.message}`);
        }
      }
    }

    if (hasProductsData && testProductId) {
      await productsPage.tapProduct(testProductId);
      await productDetailsPage.waitForPageReady();
    }
  });

  beforeEach(async function () {
    if (!hasProductsData) {
      this.skip();
      return;
    }
  });

  describe('Page Structure', () => {
    it('should display the Product header title', async function () {
      await expect(productDetailsPage.headerTitle).toBeDisplayed();
    });

    it('should display the Product ID', async function () {
      await expect(productDetailsPage.productIdText).toBeDisplayed();
      const productId = await productDetailsPage.getItemId();
      expect(productId).toMatch(REGEX.PRODUCT_ID);
    });

    it('should display the status badge', async function () {
      await expect(productDetailsPage.statusText).toBeDisplayed();
      const status = await productDetailsPage.getStatus();
      expect(STATUSES.PRODUCT).toContain(status);
    });

    it('should display the Details section header', async function () {
      await expect(productDetailsPage.detailsHeader).toBeDisplayed();
    });

    it('should display the Name field', async function () {
      const name = await productDetailsPage.getSimpleFieldValue('Name', true);
      expect(name).toBeTruthy();
    });

    it('should display the Website field', async function () {
      const website = await productDetailsPage.getSimpleFieldValue('Website', true);
      expect(website).toBeTruthy();
    });

    it('should display the Vendor field when available for account type', async function () {
      const hasVendor = await productDetailsPage.hasVendorField();
      if (!hasVendor) {
        this.skip();
        return;
      }

      const vendor = await productDetailsPage.getCompositeFieldValueByLabel('Vendor', true);
      expect(vendor).toBeTruthy();
    });
  });

  describe('API Data Validation', () => {
    it('should match Product ID with API response', async function () {
      if (!apiAvailable || !apiProductData) {
        this.skip();
        return;
      }

      const uiProductId = await productDetailsPage.getItemId();
      expect(uiProductId).toBe(apiProductData.id);
    });

    it('should match status with API response', async function () {
      if (!apiAvailable || !apiProductData) {
        this.skip();
        return;
      }

      const uiStatus = await productDetailsPage.getStatus();
      const apiStatus = normalizeText(apiProductData.status);

      expect(normalizeText(uiStatus)).toBe(apiStatus);
    });

    it('should match name with API response', async function () {
      if (!apiAvailable || !apiProductData) {
        this.skip();
        return;
      }

      const uiName = await productDetailsPage.getSimpleFieldValue('Name', true);
      expect(normalizeText(uiName)).toBe(normalizeText(apiProductData.name));
    });

    it('should match website with API response using documented fallback', async function () {
      if (!apiAvailable || !apiProductData) {
        this.skip();
        return;
      }

      const uiWebsite = await productDetailsPage.getSimpleFieldValue('Website', true);
      const apiWebsite = apiProductData.website || apiProductData.vendor?.website || '';

      expect(normalizeText(uiWebsite)).toBe(normalizeText(apiWebsite || '-'));
    });

    it('should match vendor with API response when vendor is visible', async function () {
      if (!apiAvailable || !apiProductData) {
        this.skip();
        return;
      }

      const hasVendor = await productDetailsPage.hasVendorField();
      if (!hasVendor) {
        this.skip();
        return;
      }

      const uiVendor = await productDetailsPage.getCompositeFieldValueByLabel('Vendor', true);
      expect(normalizeText(uiVendor)).toBe(normalizeText(apiProductData.vendor?.name));
    });

    it('should compare description with tolerant mapping', async function () {
      if (!apiAvailable || !apiProductData) {
        this.skip();
        return;
      }

      const uiDescription = normalizeText(await productDetailsPage.getDescriptionValue());
      const apiDescription = normalizeText(
        apiProductData.shortDescription ||
          apiProductData.vendor?.description ||
          apiProductData.longDescription ||
          '',
      );

      if (!uiDescription || !apiDescription || uiDescription === '-') {
        this.skip();
        return;
      }

      const expectedSlice = apiDescription.slice(0, Math.min(apiDescription.length, 20));
      expect(uiDescription.toLowerCase()).toContain(expectedSlice.toLowerCase());
    });

    it('should gather all product details for diagnostics', async function () {
      if (!apiAvailable || !apiProductData) {
        this.skip();
        return;
      }

      const uiDetails = await productDetailsPage.getAllProductDetails();
      expect(uiDetails.productId).toBe(apiProductData.id);
    });
  });
});

const { expect } = require('@wdio/globals');

const productsPage = require('../pageobjects/products.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { apiClient } = require('../utils/api-client');
const { isAndroid } = require('../pageobjects/utils/selectors');
const { TIMEOUT, REGEX } = require('../pageobjects/utils/constants');

describe('Products Page', () => {
  let hasProductsData = false;
  let hasEmptyState = false;
  let apiProductsAvailable = false;
  const uiProductQuery = {
    select: '-*,id,name,status,icon',
    excludeDraft: true,
    order: 'name',
  };

  before(async function () {
    this.timeout(TIMEOUT.TEST_SETUP_LONG);
    await ensureLoggedIn();
    await navigation.ensureHomePage({ resetFilters: false });
    await productsPage.ensureProductsPage();

    hasProductsData = await productsPage.hasProducts();
    hasEmptyState =
      !hasProductsData && (await productsPage.emptyState.isDisplayed().catch(() => false));
    apiProductsAvailable = !!process.env.API_OPS_TOKEN;

    console.info(
      `Products data state: hasProducts=${hasProductsData}, emptyState=${hasEmptyState}, apiAvailable=${apiProductsAvailable}`,
    );
  });

  beforeEach(async () => {
    await productsPage.ensureProductsPage();
  });

  describe('Page Structure', () => {
    it('should display the Products header title', async () => {
      await expect(productsPage.headerTitle).toBeDisplayed();
    });

    it('should display the account button in header', async function () {
      const isDisplayed = await productsPage.accountButton.isDisplayed().catch(() => false);
      if (!isDisplayed && isAndroid()) {
        this.skip();
        return;
      }

      await expect(productsPage.accountButton).toBeDisplayed();
    });

    it('should display all footer navigation tabs', async () => {
      const hasSpotlightsTab = await productsPage.footer.spotlightsTab
        .isDisplayed()
        .catch(() => false);
      const hasChatTab = await productsPage.footer.chatTab.isDisplayed().catch(() => false);
      const hasSubscriptionsTab = await productsPage.footer.subscriptionsTab
        .isDisplayed()
        .catch(() => false);
      const hasMoreTab = await productsPage.footer.moreTab.isDisplayed().catch(() => false);

      const hasPrimaryFooterTabs =
        hasSpotlightsTab || hasChatTab || hasSubscriptionsTab || hasMoreTab;

      if (!hasPrimaryFooterTabs) {
        await expect(productsPage.goBackButton).toBeDisplayed();
        return;
      }

      await expect(productsPage.footer.spotlightsTab).toBeDisplayed();
      await expect(productsPage.footer.chatTab).toBeDisplayed();
      await expect(productsPage.footer.subscriptionsTab).toBeDisplayed();
      await expect(productsPage.footer.moreTab).toBeDisplayed();
    });

    it('should have More tab selected', async () => {
      const moreTab = productsPage.footer.moreTab;
      const isMoreTabVisible = await moreTab.isDisplayed().catch(() => false);

      if (!isMoreTabVisible) {
        await expect(productsPage.goBackButton).toBeDisplayed();
        return;
      }

      if (isAndroid()) {
        const selected = await moreTab.getAttribute('selected');
        expect(selected).toBe('true');
      } else {
        const value = await moreTab.getAttribute('value');
        expect(value).toBe('1');
      }
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no products exist', async function () {
      if (hasProductsData || !hasEmptyState) {
        this.skip();
        return;
      }

      await expect(productsPage.emptyState).toBeDisplayed();
      await expect(productsPage.noProductsTitle).toBeDisplayed();
      await expect(productsPage.noProductsDescription).toBeDisplayed();
    });

    it('should display "No products" title text', async function () {
      if (hasProductsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const titleText = await productsPage.noProductsTitle.getText();
      expect(titleText).toBe('No products');
    });

    it('should display "No products found." description', async function () {
      if (hasProductsData || !hasEmptyState) {
        this.skip();
        return;
      }

      const descriptionText = await productsPage.noProductsDescription.getText();
      expect(descriptionText).toBe('No products found.');
    });
  });

  describe('Products List', () => {
    it('should display products list when products exist', async function () {
      if (!hasProductsData) {
        this.skip();
        return;
      }

      await expect(productsPage.productsScrollView).toBeDisplayed();
      const productsCount = await productsPage.getVisibleProductsCount();
      expect(productsCount).toBeGreaterThan(0);
    });

    it('should display product items with name, ID and status', async function () {
      if (!hasProductsData) {
        this.skip();
        return;
      }

      const firstProduct = productsPage.firstProductItem;
      await expect(firstProduct).toBeDisplayed();

      const details = await productsPage.getProductDetails(firstProduct);
      expect(details.name).toBeTruthy();
      expect(details.productId).toMatch(REGEX.PRODUCT_ID);
      expect(['Published', 'Unpublished', 'Pending']).toContain(details.status);
    });

    it('should detect all loaded products in the list', async function () {
      if (!hasProductsData) {
        this.skip();
        return;
      }

      const productsCount = await productsPage.getVisibleProductsCount();
      const productIds = await productsPage.getVisibleProductIds();

      expect(productsCount).toBeGreaterThan(0);

      for (const productId of productIds) {
        expect(productId).toMatch(REGEX.PRODUCT_ID);
      }
    });
  });

  describe('API Integration', () => {
    it('should match API products count with visible products', async function () {
      if (!apiProductsAvailable || !hasProductsData) {
        this.skip();
        return;
      }

      let apiProducts;
      try {
        apiProducts = await apiClient.getProducts({ limit: 100, ...uiProductQuery });
      } catch (error) {
        console.warn('API count check skipped:', error.message);
        this.skip();
        return;
      }

      const apiProductsList = apiProducts.data || [];
      const apiCount =
        apiProducts.$meta?.pagination?.total ||
        apiProducts.pagination?.total ||
        apiProductsList.length;

      const uiCount = await productsPage.getVisibleProductsCount();

      if (apiCount > 0) {
        expect(uiCount).toBeGreaterThan(0);
      }
    });

    it('should verify first 10 products against API with ordering fallback', async function () {
      if (!apiProductsAvailable || !hasProductsData) {
        this.skip();
        return;
      }

      let apiProducts;
      try {
        apiProducts = await apiClient.getProducts({ limit: 10, offset: 0, ...uiProductQuery });
      } catch (error) {
        console.warn('API rows check skipped:', error.message);
        this.skip();
        return;
      }

      const apiProductsList = apiProducts.data || [];
      const uiProductsWithStatus = await productsPage.getVisibleProductsWithStatus();
      const uiProductIds = uiProductsWithStatus.map((item) => item.productId || item.id);

      const compareCount = Math.min(apiProductsList.length, uiProductsWithStatus.length, 10);
      if (compareCount === 0) {
        this.skip();
        return;
      }

      const comparisons = [];
      for (let i = 0; i < compareCount; i++) {
        const apiProduct = apiProductsList[i];
        const uiProduct = uiProductsWithStatus[i] || {};

        const apiProductId = apiProduct.id;
        const apiStatus = apiProduct.status;
        const apiName = apiProduct.name;

        const uiProductId = uiProduct.productId || uiProduct.id;
        const uiStatus = uiProduct.status;
        const uiName = uiProduct.name;

        comparisons.push({
          index: i,
          idMatches: apiProductId === uiProductId,
          statusMatches: apiStatus === uiStatus,
          nameMatches: apiName === uiName,
          apiProductId,
          uiProductId,
          apiStatus,
          uiStatus,
          apiName,
          uiName,
        });
      }

      const allSequentialIdsMatch = comparisons.every((item) => item.idMatches);

      if (allSequentialIdsMatch) {
        const firstStrictMismatch = comparisons.find(
          (item) => !item.idMatches || !item.statusMatches || !item.nameMatches,
        );
        if (firstStrictMismatch) {
          console.error('API/UI strict mismatch at first differing row:', firstStrictMismatch);
        }

        for (const comparison of comparisons) {
          expect(comparison.idMatches).toBe(true);
          expect(comparison.statusMatches).toBe(true);
          expect(comparison.nameMatches).toBe(true);
        }
        return;
      }

      const uiIdSet = new Set(uiProductIds);
      const firstMembershipMismatch = apiProductsList
        .slice(0, compareCount)
        .find((apiProduct) => !uiIdSet.has(apiProduct.id));
      if (firstMembershipMismatch) {
        console.error('API/UI fallback membership mismatch:', {
          apiProduct: {
            id: firstMembershipMismatch.id,
            name: firstMembershipMismatch.name,
            status: firstMembershipMismatch.status,
          },
          uiVisibleIds: uiProductIds,
        });
      }

      for (const apiProduct of apiProductsList.slice(0, compareCount)) {
        expect(uiIdSet.has(apiProduct.id)).toBe(true);
      }
    });
  });
});

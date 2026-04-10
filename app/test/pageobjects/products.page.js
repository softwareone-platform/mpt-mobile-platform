const { selectors } = require('./utils/selectors');
const { PAUSE, RETRY } = require('./utils/constants');
const morePage = require('./more.page');

const ListPage = require('./base/list.page');

/**
 * Products Page - extends ListPage for common list functionality.
 * Provides product-specific methods and backward-compatible aliases.
 */
class ProductsPage extends ListPage {
  get itemPrefix() {
    return 'PRD-';
  }

  get pageName() {
    return 'Products';
  }

  get loadingIndicatorId() {
    return 'products-loading-indicator';
  }

  get emptyStateId() {
    return 'products-empty-state';
  }

  get errorStateId() {
    return 'products-error-state';
  }

  get noProductsTitle() {
    return $(selectors.byText('No products'));
  }

  get noProductsDescription() {
    return $(selectors.byText('No products found.'));
  }

  /** @alias for scrollView */
  get productsScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get productItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstProductItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} productId - Product ID (e.g., 'PRD-7208-0459')
   */
  getProductById(productId) {
    return this.getItemById(productId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Product status (Published, Unpublished, Pending)
   */
  getProductsByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnProductsPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasProducts() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleProductsCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} productId - Product ID to tap
   */
  async tapProduct(productId) {
    return this.tapItem(productId);
  }

  /** @alias for tapFirstItem */
  async tapFirstProduct() {
    return this.tapFirstItem();
  }

  /**
   * @alias for scrollToItem
   * @param {string} productId - Product ID to find
   * @param {number} maxScrolls - Maximum scroll attempts
   */
  async scrollToProduct(productId, maxScrolls) {
    return this.scrollToItem(productId, maxScrolls);
  }

  /**
   * Get product details from a product item's accessibility label.
   * Expected format: "<name>, PRD-XXXX-XXXX, <status>"
   * @param {WebdriverIO.Element} productElement - Product item element
   * @returns {Promise<{productId: string, id: string, name: string, status: string, label: string}>}
   */
  async getItemDetails(productElement) {
    const label =
      (await productElement.getAttribute('name')) ||
      (await productElement.getAttribute('content-desc'));

    const idMatch = label.match(/(PRD-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    const nameMatch = label.match(/^(.+?),\s*PRD-/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    const statusMatch = label.match(/,\s*([^,]+)$/);
    const status = statusMatch ? statusMatch[1].trim() : '';

    return { productId: id, id, name, status, label };
  }

  /**
   * Get product details from a product element.
   * @param {WebdriverIO.Element} productElement - Product item element
   * @returns {Promise<{productId: string, id: string, name: string, status: string, label: string}>}
   */
  async getProductDetails(productElement) {
    return this.getItemDetails(productElement);
  }

  /**
   * Get all visible product IDs.
   * @returns {Promise<string[]>}
   */
  async getVisibleProductIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible products with statuses.
   * @returns {Promise<Array<{productId: string, id: string, name: string, status: string, label: string}>>}
   */
  async getVisibleProductsWithStatus() {
    return this.getVisibleItemsWithStatus();
  }

  /**
   * Ensures the app is on the Products page, navigating there if needed.
   */
  async ensureProductsPage() {
    const isOnProducts = await this.isOnProductsPage();
    if (isOnProducts) {
      return;
    }

    for (let i = 0; i < RETRY.MAX_BACK_ATTEMPTS; i++) {
      const isFooterVisible = await this.footer.chatTab.isDisplayed().catch(() => false);
      if (isFooterVisible) {
        break;
      }

      await browser.back();
      await browser.pause(PAUSE.NAVIGATION);
    }

    await morePage.navigateToProducts();
    await this.waitForScreenReady();
  }
}

module.exports = new ProductsPage();

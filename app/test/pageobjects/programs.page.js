const { selectors } = require('./utils/selectors');

const ListPage = require('./base/list.page');

/**
 * Programs Page - extends ListPage for common list functionality
 * Provides program-specific methods and backward-compatible aliases
 * 
 * Variant: Full (Title + Subtitle ID + Picture)
 * ID Format: PRG-XXXX-XXXX (3 groups)
 * Status Values: Unpublished, Draft, Published
 */
class ProgramsPage extends ListPage {
  // ========== Abstract Property Implementations ==========

  get itemPrefix() {
    return 'PRG-';
  }

  get pageName() {
    return 'Programs';
  }

  get loadingIndicatorId() {
    return 'programs-loading-indicator';
  }

  get emptyStateId() {
    return 'programs-empty-state';
  }

  get errorStateId() {
    return 'programs-error-state';
  }

  // ========== Empty State Elements (page-specific) ==========

  get noProgramsTitle() {
    return $(selectors.byText('No programs'));
  }

  get noProgramsDescription() {
    return $(selectors.byText('No programs found.'));
  }

  // ========== ID Pattern Override ==========
  // Programs use 3-group IDs: PRG-XXXX-XXXX (unlike 4-group IDs in other entities)

  /**
   * Get item details from an item's accessibility label
   * Override for PRG- 3-group format: "Name, PRG-XXXX-XXXX, Status"
   * @param {WebdriverIO.Element} itemElement - List item element
   * @returns {Promise<{programId: string, id: string, name: string, status: string, label: string}>}
   */
  async getItemDetails(itemElement) {
    const label = (await itemElement.getAttribute('name')) || (await itemElement.getAttribute('content-desc'));
    
    // PRG- uses 3-group format: PRG-XXXX-XXXX
    const idMatch = label.match(/(PRG-\d{4}-\d{4})/);
    const id = idMatch ? idMatch[1] : '';

    // Extract name (everything before the ID)
    const nameMatch = label.match(/^(.+?),\s*PRG-/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    // Extract status (everything after the last comma)
    const statusMatch = label.match(/,\s*(\w+)$/);
    const status = statusMatch ? statusMatch[1] : '';

    return { programId: id, id, name, status, label };
  }

  // ========== Backward-Compatible Aliases ==========
  // These maintain compatibility with existing tests

  /** @alias for scrollView */
  get programsScrollView() {
    return this.scrollView;
  }

  /** @alias for listItems */
  get programItems() {
    return this.listItems;
  }

  /** @alias for firstListItem */
  get firstProgramItem() {
    return this.firstListItem;
  }

  /**
   * @alias for getItemById
   * @param {string} programId - Program ID (e.g., 'PRG-7725-9433')
   */
  getProgramById(programId) {
    return this.getItemById(programId);
  }

  /**
   * @alias for getItemsByStatus
   * @param {string} status - Program status (Unpublished, Draft, Published)
   */
  getProgramsByStatus(status) {
    return this.getItemsByStatus(status);
  }

  /** @alias for isOnPage */
  async isOnProgramsPage() {
    return this.isOnPage();
  }

  /** @alias for hasItems */
  async hasPrograms() {
    return this.hasItems();
  }

  /** @alias for getVisibleItemsCount */
  async getVisibleProgramsCount() {
    return this.getVisibleItemsCount();
  }

  /**
   * @alias for tapItem
   * @param {string} programId - Program ID to tap
   */
  async tapProgram(programId) {
    return this.tapItem(programId);
  }

  /** @alias for tapFirstItem */
  async tapFirstProgram() {
    return this.tapFirstItem();
  }

  /**
   * Get program details from a program element
   * @alias for getItemDetails with program-specific naming
   * @param {WebdriverIO.Element} programElement - Program list item element
   * @returns {Promise<{programId: string, id: string, name: string, status: string, label: string}>}
   */
  async getProgramDetails(programElement) {
    return this.getItemDetails(programElement);
  }

  /**
   * Get all visible program IDs
   * @returns {Promise<string[]>}
   */
  async getVisibleProgramIds() {
    return this.getVisibleItemIds();
  }

  /**
   * Get all visible programs with their statuses
   * @returns {Promise<Array<{programId: string, id: string, name: string, status: string, label: string}>>}
   */
  async getVisibleProgramsWithStatus() {
    return this.getVisibleItemsWithStatus();
  }
}

module.exports = new ProgramsPage();

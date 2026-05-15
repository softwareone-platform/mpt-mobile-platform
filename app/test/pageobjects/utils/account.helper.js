const headingPage = require('../base/heading.page');
const profilePage = require('../profile.page');
const navigation = require('./navigation.page');
const { getEnv } = require('../../utils/env');
const { PAUSE, TIMEOUT } = require('./constants');
const { isIOS } = require('./selectors');

/**
 * ACC- IDs for the Operations test account, keyed by environment.
 * Used to detect and switch to the correct account without full profile inspection.
 *
 * The Operations account is required to access entities that are only reachable
 * as sub-lists of Client/Vendor detail pages (e.g. Licensees via Account > Licensees).
 *
 * To detect the active account: open the profile screen and inspect the
 * `profile-account-item-{accountId}` element. When selected, the item renders a
 * checkmark icon whose accessible text appears in the element's `name` attribute
 * (iOS) or `content-desc` (Android), making it detectable without a dedicated testID.
 */
const OPS_ACCOUNT_IDS = {
  test: 'ACC-4850-1126',
};

const OPS_ACCOUNT_ID = getEnv('OPS_ACCOUNT_ID', OPS_ACCOUNT_IDS.test);

/**
 * ACC- IDs for the Client/Buyer test account, keyed by environment.
 * Used to detect and switch to the client account for tests that validate
 * client-scoped data (agreements, orders, subscriptions, etc.).
 *
 * Unlike OPS_ACCOUNT_IDS, there is no universal client test account to hardcode here.
 * When CLIENT_ACCOUNT_ID is not set via env var, ensureClientAccount() will log a
 * warning and skip the account switch — tests will run under whichever account is
 * currently active.
 */
const CLIENT_ACCOUNT_IDS = {
  test: '', // No default — must be supplied via CLIENT_ACCOUNT_ID env var
};

const CLIENT_ACCOUNT_ID = getEnv('CLIENT_ACCOUNT_ID', CLIENT_ACCOUNT_IDS.test);

/**
 * ACC- ID for the Vendor test account.
 * Used to detect and switch to the vendor account for tests that validate
 * vendor-scoped data (journals, role-gated field visibility, etc.).
 *
 * Must be supplied via the VENDOR_ACCOUNT_ID env var — there is no fallback default.
 * When unset, ensureVendorAccount() will log a warning and skip the account switch.
 */
const VENDOR_ACCOUNT_ID = getEnv('VENDOR_ACCOUNT_ID', '');

/**
 * Opens the profile/account-switcher screen via the header account button.
 */
async function openProfileScreen() {
  await headingPage.navAccountButton.click();
  await browser.pause(PAUSE.NAVIGATION);
}

/**
 * Checks whether the given account is currently active.
 * Opens the profile screen, finds the account item by ID, and inspects its
 * accessible label for the checkmark indicator that React Native renders when
 * `isSelected` is true.
 *
 * @param {string} accountId - The ACC- ID to check.
 * @param {string} label - Human-readable label for logging (e.g. 'Operations', 'Client').
 * @returns {Promise<boolean>} True if the given account is the active account.
 */
async function isAccountActive(accountId, label) {
  if (!accountId) {
    console.warn(`⚠️ [is${label}AccountActive] Account ID not configured`);
    return false;
  }

  await openProfileScreen();

  try {
    const accountItem = profilePage.getAccountItemById(accountId);
    const exists = await accountItem.isExisting().catch(() => false);

    if (!exists) {
      console.info(`⚠️ [is${label}AccountActive] Account item ${accountId} not found in list`);
      return false;
    }

    const attribute = isIOS() ? 'name' : 'content-desc';
    const attrLabel = String((await accountItem.getAttribute(attribute).catch(() => '')) || '');
    console.info(`[is${label}AccountActive] ${accountId} label: "${attrLabel}"`);

    return attrLabel.toLowerCase().includes('check');
  } finally {
    await headingPage.backButton.click().catch(() => {});
    await browser.pause(PAUSE.NAVIGATION);
  }
}

/**
 * Ensures the given account is the active account.
 *
 * Navigation flow:
 * 1. Open the profile/account-switcher screen.
 * 2. Find the account item by `profile-account-item-{accountId}` testID.
 * 3. Tap it — if already selected, `handleSwitchAccount` returns early (no-op).
 *    If not selected, the app switches accounts (shows ActivityIndicator on the item,
 *    disables the back button via `isSwitching`, then re-enables it on completion).
 * 4. Poll for the back button to become enabled again (= switch finished or was a no-op).
 * 5. Navigate back and return to the home page.
 *
 * @param {string} accountId - The ACC- ID to switch to.
 * @param {string} label - Human-readable label for logging (e.g. 'Operations', 'Client').
 * @throws {Error} If the account item cannot be found in the profile list.
 */
async function ensureAccount(accountId, label) {
  if (!accountId) {
    console.warn(`⚠️ [ensure${label}Account] Account ID not configured — skipping account switch`);
    return;
  }

  console.info(`🔄 [ensure${label}Account] Ensuring ${label} account ${accountId} is active`);
  await openProfileScreen();

  const accountItem = profilePage.getAccountItemById(accountId);
  const exists = await accountItem.isExisting().catch(() => false);

  if (!exists) {
    await headingPage.backButton.click().catch(() => {});
    throw new Error(`[ensure${label}Account] ${label} account ${accountId} not found in account list`);
  }

  await accountItem.click();

  // Allow React state to process the tap before polling back-button state.
  await browser.pause(500);

  // While a switch is in progress, ProfileScreen disables the back button via
  // `isSwitching`. Poll until it is enabled again (switch complete or was a no-op).
  const deadline = Date.now() + TIMEOUT.SCREEN_READY;
  while (Date.now() < deadline) {
    const backEnabled = await headingPage.backButton.isEnabled().catch(() => true);
    if (backEnabled) break;
    await browser.pause(PAUSE.POLL_INTERVAL);
  }

  await browser.pause(PAUSE.ANIMATION_SETTLE);
  await headingPage.backButton.click();
  await browser.pause(PAUSE.NAVIGATION);
  await navigation.ensureHomePage({ resetFilters: false });

  console.info(`✅ [ensure${label}Account] ${label} account ${accountId} is now active`);
}

async function isOperationsAccountActive() {
  return isAccountActive(OPS_ACCOUNT_ID, 'Operations');
}

async function ensureOperationsAccount() {
  return ensureAccount(OPS_ACCOUNT_ID, 'Operations');
}

async function isClientAccountActive() {
  return isAccountActive(CLIENT_ACCOUNT_ID, 'Client');
}

async function ensureClientAccount() {
  return ensureAccount(CLIENT_ACCOUNT_ID, 'Client');
}

async function isVendorAccountActive() {
  return isAccountActive(VENDOR_ACCOUNT_ID, 'Vendor');
}

async function ensureVendorAccount() {
  return ensureAccount(VENDOR_ACCOUNT_ID, 'Vendor');
}

module.exports = {
  OPS_ACCOUNT_ID,
  OPS_ACCOUNT_IDS,
  CLIENT_ACCOUNT_ID,
  CLIENT_ACCOUNT_IDS,
  VENDOR_ACCOUNT_ID,
  isOperationsAccountActive,
  ensureOperationsAccount,
  isClientAccountActive,
  ensureClientAccount,
  isVendorAccountActive,
  ensureVendorAccount,
};

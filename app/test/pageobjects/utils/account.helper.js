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
 * Opens the profile/account-switcher screen via the header account button.
 */
async function openProfileScreen() {
  await headingPage.navAccountButton.click();
  await browser.pause(PAUSE.NAVIGATION);
}

/**
 * Checks whether the Operations account is currently active.
 * Opens the profile screen, finds the account item by ID, and inspects its
 * accessible label for the checkmark indicator that React Native renders when
 * `isSelected` is true.
 *
 * @returns {Promise<boolean>} True if the Operations account is the active account.
 */
async function isOperationsAccountActive() {
  if (!OPS_ACCOUNT_ID) {
    console.warn('⚠️ [isOperationsAccountActive] OPS_ACCOUNT_ID not configured');
    return false;
  }

  await openProfileScreen();

  try {
    const accountItem = profilePage.getAccountItemById(OPS_ACCOUNT_ID);
    const exists = await accountItem.isExisting().catch(() => false);

    if (!exists) {
      console.info(`⚠️ [isOperationsAccountActive] Account item ${OPS_ACCOUNT_ID} not found in list`);
      return false;
    }

    const attribute = isIOS() ? 'name' : 'content-desc';
    const label = String((await accountItem.getAttribute(attribute).catch(() => '')) || '');
    console.info(`[isOperationsAccountActive] ${OPS_ACCOUNT_ID} label: "${label}"`);

    // When the item is selected, a MaterialIcons "check" icon is rendered inside it.
    // On iOS the icon's accessible text is included in the parent element's `name`.
    return label.toLowerCase().includes('check');
  } finally {
    await headingPage.backButton.click().catch(() => {});
    await browser.pause(PAUSE.NAVIGATION);
  }
}

/**
 * Ensures the Operations account is the active account.
 *
 * Navigation flow:
 * 1. Open the profile/account-switcher screen.
 * 2. Find the account item by `profile-account-item-{OPS_ACCOUNT_ID}` testID.
 * 3. Tap it — if already selected, `handleSwitchAccount` returns early (no-op).
 *    If not selected, the app switches accounts (shows ActivityIndicator on the item,
 *    disables the back button via `isSwitching`, then re-enables it on completion).
 * 4. Poll for the back button to become enabled again (= switch finished or was a no-op).
 * 5. Navigate back and return to the home page.
 *
 * @throws {Error} If the Operations account item cannot be found in the profile list.
 */
async function ensureOperationsAccount() {
  if (!OPS_ACCOUNT_ID) {
    console.warn('⚠️ [ensureOperationsAccount] OPS_ACCOUNT_ID not configured — skipping account switch');
    return;
  }

  console.info(`🔄 [ensureOperationsAccount] Ensuring Operations account ${OPS_ACCOUNT_ID} is active`);
  await openProfileScreen();

  const accountItem = profilePage.getAccountItemById(OPS_ACCOUNT_ID);
  const exists = await accountItem.isExisting().catch(() => false);

  if (!exists) {
    await headingPage.backButton.click().catch(() => {});
    throw new Error(`[ensureOperationsAccount] Operations account ${OPS_ACCOUNT_ID} not found in account list`);
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

  console.info(`✅ [ensureOperationsAccount] Operations account ${OPS_ACCOUNT_ID} is now active`);
}

module.exports = {
  OPS_ACCOUNT_ID,
  OPS_ACCOUNT_IDS,
  isOperationsAccountActive,
  ensureOperationsAccount,
};

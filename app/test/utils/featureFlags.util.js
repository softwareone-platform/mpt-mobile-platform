/**
 * Feature Flag Test Utilities
 * 
 * Provides helpers for feature flag-aware testing.
 * Works in conjunction with the feature flag discovery in wdio.conf.js
 * 
 * TWO MODES OF OPERATION:
 * 
 * 1. DEFAULT (Pipeline/Normal Run):
 *    - Fetches portal version from the backend API
 *    - Applies version-based gating (minVersion/maxVersion)
 *    - Tests adapt to the environment's actual feature availability
 * 
 * 2. LOCAL OVERRIDE (--build --feature-flag):
 *    - When flags are explicitly overridden via the test script
 *    - Overridden flags use the explicit value (ignoring portal version)
 *    - Non-overridden flags still use portal version gating
 * 
 * @example
 * const { isFlagEnabled, skipIfFlagDisabled } = require('../utils/featureFlags.util');
 * 
 * it('should show tabs when enabled', function() {
 *   skipIfFlagDisabled.call(this, 'FEATURE_ACCOUNT_TABS');
 *   // Test tabs functionality...
 * });
 */

/**
 * Get the current feature flag configuration from global scope
 * @returns {object} Feature flags object with helper methods
 */
const getFeatureFlags = () => {
    return global.featureFlags || {
        raw: {},
        portalVersion: null,
        explicitOverrides: {},
        hasOverrides: false,
        flags: [],
        isStaticallyEnabled: () => false,
        isEnabled: () => false,
        isOverridden: () => false,
        getFlag: () => null,
    };
};

/**
 * Check if a feature flag is effectively enabled
 * Priority: explicit override > portal version gating
 * @param {string} flagKey - The feature flag key (e.g., 'FEATURE_ACCOUNT_TABS')
 * @returns {boolean} True if flag is enabled
 */
const isFlagEnabled = (flagKey) => {
    const featureFlags = getFeatureFlags();
    // Prefer version-aware check, fallback to static check for backwards compatibility
    if (typeof featureFlags.isEnabled === 'function') {
        return featureFlags.isEnabled(flagKey);
    }
    return featureFlags.isStaticallyEnabled(flagKey);
};

/**
 * Check if a feature flag was explicitly overridden via --feature-flag
 * @param {string} flagKey - The feature flag key
 * @returns {boolean} True if flag was explicitly overridden
 */
const isFlagOverridden = (flagKey) => {
    const featureFlags = getFeatureFlags();
    if (typeof featureFlags.isOverridden === 'function') {
        return featureFlags.isOverridden(flagKey);
    }
    return false;
};

/**
 * Check if any flags have explicit overrides (local testing mode)
 * @returns {boolean} True if running with explicit flag overrides
 */
const hasExplicitOverrides = () => {
    return getFeatureFlags().hasOverrides || false;
};

/**
 * Check if a feature flag is statically enabled (ignoring version constraints)
 * Use isFlagEnabled() instead for version-aware checks
 * @param {string} flagKey - The feature flag key
 * @returns {boolean} True if flag exists and is statically enabled
 */
const isFlagStaticallyEnabled = (flagKey) => {
    return getFeatureFlags().isStaticallyEnabled(flagKey);
};

/**
 * Get the portal version fetched from the backend API
 * This is the version used for feature flag version gating
 * @returns {string|null} Portal version string or null if not available
 */
const getPortalVersion = () => {
    return getFeatureFlags().portalVersion || null;
};

/**
 * Get detailed configuration for a specific flag
 * @param {string} flagKey - The feature flag key
 * @returns {object|null} Flag configuration or null if not found
 * @example
 * const config = getFlagConfig('FEATURE_ACCOUNT_TABS');
 * // { 
 * //   key: 'FEATURE_ACCOUNT_TABS', 
 * //   enabled: true, 
 * //   minVersion: '5.0.0', 
 * //   maxVersion: null,
 * //   effectivelyEnabled: true,  // considers portal version + overrides
 * //   isOverridden: false        // true if explicitly set via --feature-flag
 * // }
 */
const getFlagConfig = (flagKey) => {
    return getFeatureFlags().getFlag(flagKey);
};

/**
 * Get all discovered feature flags
 * @returns {Array<object>} Array of flag configurations
 */
const getAllFlags = () => {
    return getFeatureFlags().flags;
};

/**
 * Skip test if feature flag is not enabled
 * Must be called with `this` context from test: skipIfFlagDisabled.call(this, flagKey)
 * @param {string} flagKey - The feature flag key
 * @param {string} [message] - Optional custom skip message
 */
function skipIfFlagDisabled(flagKey, message) {
    if (!isFlagEnabled(flagKey)) {
        const msg = message || `Skipping: Feature flag '${flagKey}' is disabled`;
        console.info(`    ⏭️  ${msg}`);
        this.skip();
    }
}

/**
 * Skip test if feature flag IS enabled (for testing disabled state)
 * Must be called with `this` context from test: skipIfFlagEnabled.call(this, flagKey)
 * @param {string} flagKey - The feature flag key
 * @param {string} [message] - Optional custom skip message
 */
function skipIfFlagEnabled(flagKey, message) {
    if (isFlagEnabled(flagKey)) {
        const msg = message || `Skipping: Feature flag '${flagKey}' is enabled (test requires disabled state)`;
        console.info(`    ⏭️  ${msg}`);
        this.skip();
    }
}

/**
 * Conditional assertion based on flag state
 * Executes different assertion functions depending on whether flag is enabled
 * @param {string} flagKey - The feature flag key
 * @param {Function} ifEnabled - Async function to execute if flag is enabled
 * @param {Function} ifDisabled - Async function to execute if flag is disabled
 * @returns {Promise<void>}
 * 
 * @example
 * await assertBasedOnFlag('FEATURE_ACCOUNT_TABS',
 *   async () => {
 *     // Flag enabled: tabs should be visible
 *     await expect(ProfilePage.accountTabs).toBeDisplayed();
 *   },
 *   async () => {
 *     // Flag disabled: tabs should NOT be visible
 *     await expect(ProfilePage.accountTabs).not.toBeDisplayed();
 *   }
 * );
 */
const assertBasedOnFlag = async (flagKey, ifEnabled, ifDisabled) => {
    if (isFlagEnabled(flagKey)) {
        await ifEnabled();
    } else {
        await ifDisabled();
    }
};

/**
 * Log feature flag status for debugging
 * Shows effective state, portal version, and override status
 * @param {string} flagKey - The feature flag key
 */
const logFlagStatus = (flagKey) => {
    const config = getFlagConfig(flagKey);
    const portalVersion = getPortalVersion();
    
    if (config) {
        const effectiveStatus = config.effectivelyEnabled ? '✅ ENABLED' : '❌ DISABLED';
        const version = config.minVersion ? ` (minVersion: ${config.minVersion})` : '';
        const portalVer = portalVersion ? ` [portal: ${portalVersion}]` : '';
        const override = config.isOverridden ? ' ⚡OVERRIDE' : '';
        console.info(`    🚩 Flag ${flagKey}: ${effectiveStatus}${version}${portalVer}${override}`);
    } else {
        console.warn(`    🚩 Flag ${flagKey}: ⚠️ NOT FOUND`);
    }
};

/**
 * Create a describe block that only runs if flag is enabled
 * @param {string} flagKey - The feature flag key
 * @param {string} title - Describe block title
 * @param {Function} fn - Describe block function
 * 
 * @example
 * describeIfFlagEnabled('FEATURE_ACCOUNT_TABS', 'Account Tabs', () => {
 *   it('should show All tab', async () => { ... });
 * });
 */
const describeIfFlagEnabled = (flagKey, title, fn) => {
    const enabled = isFlagEnabled(flagKey);
    const prefix = enabled ? '' : '[SKIPPED - Flag Disabled] ';
    
    if (enabled) {
        describe(title, fn);
    } else {
        describe.skip(`${prefix}${title}`, fn);
    }
};

/**
 * Create a describe block that only runs if flag is disabled
 * @param {string} flagKey - The feature flag key
 * @param {string} title - Describe block title
 * @param {Function} fn - Describe block function
 */
const describeIfFlagDisabled = (flagKey, title, fn) => {
    const disabled = !isFlagEnabled(flagKey);
    const prefix = disabled ? '' : '[SKIPPED - Flag Enabled] ';
    
    if (disabled) {
        describe(title, fn);
    } else {
        describe.skip(`${prefix}${title}`, fn);
    }
};

module.exports = {
    getFeatureFlags,
    isFlagEnabled,
    isFlagOverridden,
    hasExplicitOverrides,
    isFlagStaticallyEnabled,
    getPortalVersion,
    getFlagConfig,
    getAllFlags,
    skipIfFlagDisabled,
    skipIfFlagEnabled,
    assertBasedOnFlag,
    logFlagStatus,
    describeIfFlagEnabled,
    describeIfFlagDisabled,
};

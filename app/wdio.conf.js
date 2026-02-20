const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const dotenv = require('dotenv');
const semver = require('semver');
const { Reporter, ReportingApi } = require('@reportportal/agent-js-webdriverio');

// Load .env file if it exists (for local development and Windows batch execution)
dotenv.config({ path: path.join(__dirname, '.env') });

const SCREENSHOT_FOLDER = '../screenshots';

// ============================================================================
// Feature Flag Discovery
// ============================================================================
// Reads feature flags from the app's configuration and makes them available
// to tests. This enables tests to conditionally assert based on flag state.
// 
// TWO MODES OF OPERATION:
// 
// 1. DEFAULT (Pipeline/Normal Run):
//    - Fetches portal version from the backend API
//    - Applies version-based gating (minVersion/maxVersion)
//    - Tests adapt to the environment's actual feature availability
// 
// 2. LOCAL OVERRIDE (--build --feature-flag):
//    - When flags are explicitly overridden via the test script
//    - Overridden flags use the explicit value (ignoring portal version)
//    - Non-overridden flags still use portal version gating
// 
// This ensures:
// - Pipeline tests automatically adapt to environment capabilities
// - Local testing can force specific flag states for development/debugging
// 
// Note: minVersion/maxVersion refer to the PORTAL version (backend API),
// not the mobile app version. The portal is currently on v4.x (QA) or v5.x (TEST).
// ============================================================================

// Fallback portal version (matches portalVersionService.ts)
const FALLBACK_PORTAL_VERSION = '4.0.0';

/**
 * Parse explicit feature flag overrides from environment variable
 * Set by run-local-test.sh when using --feature-flag option
 * @returns {object} Map of flagKey -> boolean value for overridden flags
 */
const parseExplicitOverrides = () => {
    const overridesEnv = process.env.FEATURE_FLAG_OVERRIDES;
    const overrides = {};
    
    if (!overridesEnv) {
        return overrides;
    }
    
    // Format: FLAG1=true,FLAG2=false
    overridesEnv.split(',').forEach(pair => {
        const [key, value] = pair.trim().split('=');
        if (key && value !== undefined) {
            overrides[key] = value === 'true';
        }
    });
    
    return overrides;
};

/**
 * Fetch portal version from the backend API
 * This is the same endpoint the app uses to determine feature availability
 * Supports both AUTH0_API_URL (direct manifest URL) and API_BASE_URL (portal base URL)
 * @returns {string} Portal version string (e.g., "4.2.1") or fallback
 */
const fetchPortalVersion = () => {
    // Try AUTH0_API_URL first (direct manifest URL used by the app)
    let apiUrl = process.env.AUTH0_API_URL;
    
    // Fallback: Derive API URL from API_BASE_URL (used in CI environments)
    // Portal URL pattern: https://portal.s1.show -> API URL: https://api.s1.show/public/
    if (!apiUrl && process.env.API_BASE_URL) {
        try {
            const portalUrl = new URL(process.env.API_BASE_URL);
            // Replace 'portal' subdomain with 'api' and add /public/ path
            const apiHost = portalUrl.hostname.replace(/^portal\./, 'api.');
            apiUrl = `${portalUrl.protocol}//${apiHost}/public/`;
            console.info('ℹ️ Derived API URL from API_BASE_URL:', apiUrl);
        } catch {
            console.warn('⚠️ Could not parse API_BASE_URL:', process.env.API_BASE_URL);
        }
    }
    
    if (!apiUrl) {
        console.warn('⚠️ AUTH0_API_URL and API_BASE_URL not set, using fallback portal version:', FALLBACK_PORTAL_VERSION);
        return FALLBACK_PORTAL_VERSION;
    }
    
    try {
        // Fetch the portal manifest (same endpoint as portalVersionService.ts)
        // Using execFileSync with absolute path and curl args array to avoid shell injection (S4721, S4036)
        const curlArgs = ['-s', '-f', '--connect-timeout', '5', '--max-time', '10', apiUrl, '-H', 'Accept: application/json'];
        const output = execFileSync('/usr/bin/curl', curlArgs, { 
            encoding: 'utf8', 
            timeout: 15000,
            stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();
        
        if (output) {
            const manifest = JSON.parse(output);
            if (manifest.version) {
                console.info('✅ Portal version fetched:', manifest.version);
                return manifest.version;
            }
        }
    } catch (error) {
        console.warn('⚠️ Could not fetch portal version from API:', error.message);
    }
    
    return FALLBACK_PORTAL_VERSION;
};

/**
 * Compare two version strings using semver
 * @param {string} version1 - First version
 * @param {string} version2 - Second version
 * @returns {number|null} -1, 0, or 1 for comparison, null if invalid
 */
const compareVersions = (version1, version2) => {
    const v1 = semver.coerce(version1);
    const v2 = semver.coerce(version2);
    
    if (!v1 || !v2) {
        return null;
    }
    
    return semver.compare(v1, v2);
};

/**
 * Check if a feature flag is enabled for a given portal version
 * Applies the same logic as the app's featureFlagsService
 * @param {object} flagConfig - Flag configuration object
 * @param {string|null} portalVersion - Portal version string
 * @returns {boolean} Whether the flag is effectively enabled
 */
const isFlagEnabledForVersion = (flagConfig, portalVersion) => {
    // Simple boolean flag
    if (typeof flagConfig === 'boolean') {
        return flagConfig;
    }
    
    // Flag is explicitly disabled
    if (!flagConfig.enabled) {
        return false;
    }
    
    // No version constraints - use static enabled value
    if (!flagConfig.minVersion && !flagConfig.maxVersion) {
        return flagConfig.enabled;
    }
    
    // No portal version available - use static enabled value
    if (!portalVersion) {
        return flagConfig.enabled;
    }
    
    // Check minVersion constraint
    if (flagConfig.minVersion) {
        const comparison = compareVersions(portalVersion, flagConfig.minVersion);
        if (comparison === null || comparison < 0) {
            return false;
        }
    }
    
    // Check maxVersion constraint
    if (flagConfig.maxVersion) {
        const comparison = compareVersions(portalVersion, flagConfig.maxVersion);
        if (comparison === null || comparison > 0) {
            return false;
        }
    }
    
    return true;
};

/**
 * Discover feature flags from the app's configuration file
 * @returns {object} Feature flags configuration with helper methods
 */
const discoverFeatureFlags = () => {
    const flagsPath = path.join(__dirname, 'src/config/feature-flags/featureFlags.json');
    
    // Parse any explicit overrides from command line (via run-local-test.sh)
    const explicitOverrides = parseExplicitOverrides();
    const hasOverrides = Object.keys(explicitOverrides).length > 0;
    
    // Fetch portal version from the backend API
    const portalVersion = fetchPortalVersion();
    
    /**
     * Determine effective flag state with override priority:
     * 1. Explicit override (from --feature-flag) takes precedence
     * 2. Otherwise, use portal version-based gating
     */
    const getEffectiveState = (flagKey, flagConfig) => {
        // Check for explicit override first
        if (flagKey in explicitOverrides) {
            return explicitOverrides[flagKey];
        }
        // Fall back to portal version-based evaluation
        return isFlagEnabledForVersion(flagConfig, portalVersion);
    };
    
    try {
        const flags = JSON.parse(fs.readFileSync(flagsPath, 'utf8'));
        
        const featureFlags = {
            raw: flags,
            portalVersion: portalVersion,
            explicitOverrides: explicitOverrides,
            hasOverrides: hasOverrides,
            flags: Object.entries(flags).map(([key, config]) => ({
                key,
                enabled: typeof config === 'boolean' ? config : config.enabled,
                minVersion: config.minVersion || null,
                maxVersion: config.maxVersion || null,
                // Calculate effective state (override > portal version)
                effectivelyEnabled: getEffectiveState(key, config),
                isOverridden: key in explicitOverrides,
            })),
            /**
             * Check if a flag is statically enabled (ignoring version constraints)
             * Use isEnabled() instead for version-aware checks
             * @param {string} flagKey - The feature flag key
             * @returns {boolean}
             */
            isStaticallyEnabled: (flagKey) => {
                const flag = flags[flagKey];
                if (!flag) return false;
                return typeof flag === 'boolean' ? flag : flag.enabled;
            },
            /**
             * Check if a flag is effectively enabled
             * Priority: explicit override > portal version gating
             * This is the recommended method to use in tests
             * @param {string} flagKey - The feature flag key
             * @returns {boolean}
             */
            isEnabled: (flagKey) => {
                const flag = flags[flagKey];
                if (!flag) return false;
                return getEffectiveState(flagKey, flag);
            },
            /**
             * Check if a flag was explicitly overridden via command line
             * @param {string} flagKey - The feature flag key
             * @returns {boolean}
             */
            isOverridden: (flagKey) => {
                return flagKey in explicitOverrides;
            },
            /**
             * Get configuration for a specific flag
             * @param {string} flagKey - The feature flag key
             * @returns {object|null}
             */
            getFlag: (flagKey) => {
                const flag = flags[flagKey];
                if (!flag) return null;
                return {
                    key: flagKey,
                    enabled: typeof flag === 'boolean' ? flag : flag.enabled,
                    minVersion: flag.minVersion || null,
                    maxVersion: flag.maxVersion || null,
                    effectivelyEnabled: getEffectiveState(flagKey, flag),
                    isOverridden: flagKey in explicitOverrides,
                };
            }
        };
        
        // Log discovered flags with version context
        console.info('');
        console.info('╔══════════════════════════════════════════════════════════════════╗');
        console.info('║                    🚩 FEATURE FLAGS DISCOVERED                   ║');
        console.info('╠══════════════════════════════════════════════════════════════════╣');
        
        if (portalVersion) {
            console.info(`║  🌐 Portal Version: ${portalVersion.padEnd(45)}║`);
        }
        
        if (hasOverrides) {
            console.info(`║  ⚡ Local Overrides: ${Object.keys(explicitOverrides).length} flag(s) explicitly set              ║`);
        }
        
        console.info('╠══════════════════════════════════════════════════════════════════╣');
        
        if (Object.keys(flags).length === 0) {
            console.info('║  No feature flags configured                                     ║');
        } else {
            Object.entries(flags).forEach(([key, config]) => {
                const effectiveEnabled = getEffectiveState(key, config);
                const isOverridden = key in explicitOverrides;
                const minV = config.minVersion || 'none';
                
                // Show effective state
                const status = effectiveEnabled ? '✅' : '❌';
                const keyPadded = key.substring(0, 30).padEnd(30);
                const minVPadded = minV.substring(0, 10).padEnd(10);
                
                // Add indicator for override or version gating
                let note = '';
                if (isOverridden) {
                    note = ' ⚡'; // Override indicator
                } else {
                    const staticEnabled = typeof config === 'boolean' ? config : config.enabled;
                    if (staticEnabled && !effectiveEnabled) {
                        note = ' (ver)'; // Version gating indicator
                    }
                }
                console.info(`║  ${status} ${keyPadded} minVersion: ${minVPadded}${note}║`);
            });
        }
        console.info('╚══════════════════════════════════════════════════════════════════╝');
        console.info('');
        
        return featureFlags;
    } catch (error) {
        console.warn('⚠️ Could not read feature flags:', error.message);
        return {
            raw: {},
            portalVersion: portalVersion,
            explicitOverrides: explicitOverrides,
            hasOverrides: hasOverrides,
            flags: [],
            isStaticallyEnabled: () => false,
            isEnabled: () => false,
            isOverridden: () => false,
            getFlag: () => null,
        };
    }
};

// Discover feature flags at module load time and store globally
global.featureFlags = discoverFeatureFlags();

// Generate timestamped log directory for this test run
const getLogDir = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const platform = (process.env.PLATFORM_NAME || 'iOS').toLowerCase();
    return path.join('test-results', 'logs', `${platform}-${timestamp}`);
};
const LOG_OUTPUT_DIR = getLogDir();

// Platform detection helpers
const isAndroid = () => (process.env.PLATFORM_NAME || 'iOS').toLowerCase() === 'android';

// Define platform-specific capabilities
const iosCapabilities = {
    platformName: 'iOS',
    'appium:deviceName': process.env.DEVICE_NAME || 'iPhone 16',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '26.0',
    'appium:automationName': 'XCUITest',
    'appium:bundleId': process.env.APP_BUNDLE_ID || 'com.softwareone.marketplaceMobile',
    'appium:udid': process.env.DEVICE_UDID,
    'appium:noReset': true,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 900,
    'appium:launchTimeout': 240000,
    'appium:wdaLaunchTimeout': 240000,
    'appium:wdaConnectionTimeout': 240000,
    'appium:wdaStartupRetries': 4,
    'appium:wdaStartupRetryInterval': 30000,
    'appium:shouldUseSingletonTestManager': false,
    'appium:simpleIsVisibleCheck': true,
    'appium:usePrebuiltWDA': false,
    'appium:derivedDataPath': '/tmp/wda-derived-data'
};

const androidCapabilities = {
    platformName: 'Android',
    'appium:deviceName': process.env.DEVICE_NAME || 'Pixel 8',
    'appium:platformVersion': process.env.PLATFORM_VERSION || '14',
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': process.env.APP_PACKAGE || 'com.softwareone.marketplaceMobile',
    'appium:appActivity': process.env.APP_ACTIVITY || '.MainActivity',
    'appium:udid': process.env.DEVICE_UDID,
    'appium:noReset': true,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 900,
    'appium:autoGrantPermissions': true,
    'appium:ignoreHiddenApiPolicyError': true
};

exports.config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    // WebdriverIO supports running e2e tests as well as unit and component tests.
    runner: 'local',
    hostname: process.env.APPIUM_HOST || 'localhost',
    port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
    //
    // ===================
    // Log Output Directory
    // ===================
    // Directory to store all logs from the test run (timestamped per run)
    outputDir: LOG_OUTPUT_DIR,
    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // of the configuration file being run.
    //
    // The specs are defined as an array of spec files (optionally using wildcards
    // that will be expanded). The test for each spec file will be run in a separate
    // worker process. In order to have a group of spec files run in the same worker
    // process simply enclose them in an array within the specs array.
    //
    // The path of the spec files will be resolved relative from the directory of
    // of the config file unless it's absolute.
    //
    // Wrapping specs in a nested array runs them sequentially in a single worker process.
    // This is important because welcome.e2e.js establishes authentication state needed by other tests.
    // Also, usually only one Appium session can be active at a time on a device, so running in parallel would fail.
    specs: [[
        // Welcome tests must run first to establish authentication
        './test/specs/welcome.e2e.js',
        './test/specs/**/*.js'
    ]],
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    suites: {
        welcome: ['./test/specs/welcome.e2e.js'],
        navigation: [
            './test/specs/navigation.e2e.js',
            './test/specs/order-details-navigation.e2e.js',
        ],
        spotlight: ['./test/specs/spotlight-filters.e2e.js'],
        profile: ['./test/specs/profile.e2e.js'],
        personalInformation: ['./test/specs/personal-information.e2e.js'],
        orders: [
            './test/specs/orders.e2e.js',
            './test/specs/order-details.e2e.js',
        ],
        subscriptions: [
            './test/specs/subscriptions.e2e.js',
            './test/specs/subscription-details.e2e.js',
        ],
        agreements: [
            './test/specs/agreements.e2e.js',
            './test/specs/agreement-details.e2e.js',
        ],
        programs: [
            './test/specs/programs.e2e.js',,
        ],
        enrollments: [
            './test/specs/enrollments.e2e.js',
        ],
        licensees: [
            './test/specs/licensees.e2e.js',
        ],
        buyers: [
            './test/specs/buyers.e2e.js',
            './test/specs/buyer-details.e2e.js',
        ],
        invoices: [
            './test/specs/invoices.e2e.js',
            './test/specs/invoice-details.e2e.js',
        ],
        creditMemos: [
            './test/specs/credit-memos.e2e.js',
            './test/specs/credit-memo-details.e2e.js',
        ],
        users: [
            './test/specs/users.e2e.js',
            './test/specs/user-details.e2e.js',
        ],
        logout: [
            './test/specs/logout.e2e.js',
        ],
        // Feature flag validation tests
        featureFlags: ['./test/specs/feature-flags.e2e.js'],
    },
    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. Let's
    // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
    // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
    // files and you set maxInstances to 10, all spec files will get tested at the same time
    // and 30 processes will get spawned. The property handles how many capabilities
    // from the same test should run tests.
    //
    maxInstances: 1,
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://saucelabs.com/platform/platform-configurator
    //
    capabilities: [isAndroid() ? androidCapabilities : iosCapabilities],

    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'warn',
    //
    // Set specific log levels per logger
    // Silence verbose webdriver/appium logs while keeping test framework output
    // loggers:
    // - webdriver, webdriverio
    // - @wdio/browserstack-service, @wdio/lighthouse-service, @wdio/sauce-service
    // - @wdio/mocha-framework, @wdio/jasmine-framework
    // - @wdio/local-runner
    // - @wdio/sumologic-reporter
    // - @wdio/cli, @wdio/config, @wdio/utils
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevels: {
        webdriver: 'warn',
        webdriverio: 'warn',
        '@wdio/local-runner': 'info',
        '@wdio/mocha-framework': 'info',
        '@wdio/cli': 'info',
    },
    // logLevels: {
    //     webdriver: 'info',
    //     '@wdio/appium-service': 'info'
    // },
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    // baseUrl: 'http://localhost:8080',
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 30000,
    //
    // Default timeout in milliseconds for request
    // if browser driver or grid doesn't send response
    connectionRetryTimeout: 300000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They enhance
    // your test setup with almost no effort. Unlike plugins, they don't add new
    // commands. Instead, they hook themselves up into the test process.
    services: [],

    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: https://webdriver.io/docs/frameworks
    //
    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    framework: 'mocha',
    
    //
    // The number of times to retry the entire specfile when it fails as a whole
    // specFileRetries: 1,
    //
    // Delay in seconds between the spec file retry attempts
    // specFileRetriesDelay: 0,
    //
    // Whether or not retried spec files should be retried immediately or deferred to the end of the queue
    // specFileRetriesDeferred: false,
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: https://webdriver.io/docs/dot-reporter
    reporters: [
        'spec',
        ['junit', {
            outputDir: './test-results/junit',
            outputFileFormat: function(options) {
                return `results-${options.cid}.xml`
            }
        }],
        // Only enable Report Portal when proper configuration is available
        ...(process.env.REPORT_PORTAL_API_KEY && process.env.REPORT_PORTAL_API_KEY !== 'value not set' ? [
            [Reporter, {
                apiKey: process.env.REPORT_PORTAL_API_KEY,
                endpoint: (process.env.REPORT_PORTAL_ENDPOINT || 'http://localhost:8080') + '/api/v2',
                project: process.env.REPORT_PORTAL_PROJECT || 'default_personal',
                launch: process.env.REPORT_PORTAL_LAUNCH_NAME || 'Appium Tests Launch',
                description: process.env.REPORT_PORTAL_LAUNCH_DESCRIPTION || 'Appium tests against ReactNative Marketplace Mobile App',
                attachPicturesToLogs: false,
                reportSeleniumCommands: true,  // Disable to reduce API calls
                seleniumCommandsLogLevel: 'debug',
                autoAttachScreenshots: false,
                screenshotsLogLevel: 'error',
                mode: 'DEFAULT',  // Valid values: DEFAULT, DEBUG
                launchUuidPrint: true,  // Print launch UUID for debugging
                launchUuidPrintOutput: 'stdout',
                debug: false,  // Disable debug logging to reduce noise
                restClientConfig: {
                    timeout: 5000,  // 5 second timeout for individual API calls
                },
            }]
        ] : [])
    ],

    // Reporter sync settings for ReportPortal
    reporterSyncTimeout: 10000,  // 10 seconds max wait for reporter sync
    reporterSyncInterval: 500,

    // Options to be passed to Mocha.
    // See the full list at http://mochajs.org/
    mochaOpts: {
        ui: 'bdd',
        timeout: 600000, // 10 minutes - OTP retrieval can take 4+ minutes
        require: ['./test/fixtures/otp.fixture.js']
    },

    //
    // =====
    // Hooks
    // =====

    /**
     * Helper function to capture and save screenshot on test/hook failure
     * @param {object} test - test object containing title and parent
     * @param {string} prefix - prefix for the filename (e.g., hook name or test context)
     */
    captureFailureScreenshot: async function(test, prefix = '') {
        try {
            const path = require('path');
            const timestamp = new Date()
                .toISOString()
                .replace(/[^0-9]/g, '')
                .slice(0, -5)
            const sanitizedPrefix = prefix ? prefix.replace(/ /g, '-') + '_' : '';
            const sanitizedParent = (test.parent || '').replace(/ /g, '-');
            const sanitizedTitle = test.title.replace(/ /g, '-');
            const fileName = `${timestamp}_${sanitizedPrefix}${sanitizedParent ? sanitizedParent + '_' : ''}${sanitizedTitle}.png`
            const filePath = path.resolve(__dirname, SCREENSHOT_FOLDER, fileName)
            
            console.info(`📸 Capturing screenshot: ${filePath}`)
            await browser.saveScreenshot(filePath)
            console.info(`✅ Screenshot saved: ${fileName}`)
            
            // Send screenshot to ReportPortal if configured
            if (process.env.REPORT_PORTAL_API_KEY && process.env.REPORT_PORTAL_API_KEY !== 'value not set') {
                try {
                    const screenshotData = fs.readFileSync(filePath);
                    const logMessage = prefix ? `Screenshot on ${prefix} failure: ${test.title}` : `Screenshot on failure: ${test.title}`;
                    ReportingApi.log('ERROR', logMessage, {
                        name: fileName,
                        type: 'image/png',
                        content: screenshotData.toString('base64')
                    });
                    console.info(`📤 Screenshot sent to ReportPortal`);
                } catch (rpError) {
                    console.warn('⚠️ Failed to send screenshot to ReportPortal:', rpError.message);
                }
            }
        } catch (error) {
            console.error('❌ Failed to capture screenshot:', error.message);
        }
    },
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    /**
     * Gets executed once before all workers get launched.
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     */
    onPrepare: function (config, capabilities) {
        const path = require('path');
        const screenshotDir = path.resolve(__dirname, SCREENSHOT_FOLDER);
        
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
            console.info(`Created screenshot directory: ${screenshotDir}`);
        } else {
            console.info(`Screenshot directory ready: ${screenshotDir}`);
        }

        // Log test execution configuration
        const platform = (process.env.PLATFORM_NAME || 'iOS').toUpperCase();
        const specs = config.specs || [];
        const suites = config.suites || {};
        
        // Detect if running specific suite or spec from command line
        const cliArgs = process.argv.join(' ');
        const suiteMatch = cliArgs.match(/--suite\s+(\S+)/);
        const specMatch = cliArgs.match(/--spec\s+(\S+)/);
        
        console.info('');
        console.info('╔══════════════════════════════════════════════════════════════════╗');
        console.info('║                    🧪 TEST EXECUTION CONFIGURATION               ║');
        console.info('╠══════════════════════════════════════════════════════════════════╣');
        console.info(`║  Platform:   ${platform.padEnd(52)}║`);
        
        if (specMatch) {
            // Running specific spec file
            const specFile = specMatch[1];
            console.info(`║  Mode:       Specific Test File                                  ║`);
            console.info(`║  Test File:  ${specFile.padEnd(52)}║`);
        } else if (suiteMatch) {
            // Running specific suite
            const suiteName = suiteMatch[1];
            const suiteSpecs = suites[suiteName] || [];
            console.info(`║  Mode:       Test Suite                                          ║`);
            console.info(`║  Suite:      ${suiteName.padEnd(52)}║`);
            if (suiteSpecs.length > 0) {
                console.info(`║  Files:      ${suiteSpecs.length} spec file(s)                                      ║`);
                suiteSpecs.forEach((spec, i) => {
                    const shortSpec = spec.replace('./test/specs/', '');
                    console.info(`║              ${(i + 1) + '. ' + shortSpec.padEnd(50)}║`);
                });
            }
        } else {
            // Running all specs
            console.info(`║  Mode:       All Test Specs                                      ║`);
            console.info(`║  Specs:      ${specs.length} spec pattern(s) configured                       ║`);
        }
        
        console.info('╠══════════════════════════════════════════════════════════════════╣');
        console.info(`║  Log Dir:    ${LOG_OUTPUT_DIR.padEnd(52)}║`);
        console.info('╚══════════════════════════════════════════════════════════════════╝');
        console.info('');
    },
    /**
     * Gets executed before a worker process is spawned and can be used to initialize specific service
     * for that worker as well as modify runtime environments in an async fashion.
     * @param  {string} cid      capability id (e.g 0-0)
     * @param  {object} caps     object containing capabilities for session that will be spawn in the worker
     * @param  {object} specs    specs to be run in the worker process
     * @param  {object} args     object that will be merged with the main configuration once worker is initialized
     * @param  {object} execArgv list of string arguments passed to the worker process
     */
    // onWorkerStart: function (cid, caps, specs, args, execArgv) {
    // },
    /**
     * Gets executed just after a worker process has exited.
     * @param  {string} cid      capability id (e.g 0-0)
     * @param  {number} exitCode 0 - success, 1 - fail
     * @param  {object} specs    specs to be run in the worker process
     * @param  {number} retries  number of retries used
     */
    // onWorkerEnd: function (cid, exitCode, specs, retries) {
    // },
    /**
     * Gets executed just before initialising the webdriver session and test framework. It allows you
     * to manipulate configurations depending on the capability or spec.
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that are to be run
     * @param {string} cid worker id (e.g. 0-0)
     */
    // beforeSession: function (config, capabilities, specs, cid) {
    // },
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs        List of spec file paths that are to be run
     * @param {object}         browser      instance of created browser/device session
     */
    before: function (capabilities, specs) {
        // Log spec file being executed
        const specFile = specs && specs.length > 0 ? specs[0] : 'unknown';
        const shortSpec = specFile.replace(/.*\/test\/specs\//, '');
        console.info('');
        console.info('┌──────────────────────────────────────────────────────────────────┐');
        console.info(`│  📄 SPEC FILE: ${shortSpec.padEnd(50)}│`);
        console.info('└──────────────────────────────────────────────────────────────────┘');
    },
    /**
     * Runs before a WebdriverIO command gets executed.
     * @param {string} commandName hook command name
     * @param {Array} args arguments that command would receive
     */
    // beforeCommand: function (commandName, args) {
    // },
    /**
     * Hook that gets executed before the suite starts
     * @param {object} suite suite details
     */
    beforeSuite: function (suite) {
        // Log suite (describe block) being executed
        console.info('');
        console.info(`  📦 SUITE: ${suite.title}`);
        console.info('  ' + '─'.repeat(60));
    },
    /**
     * Function to be executed before a test (in Mocha/Jasmine) starts.
     */
    beforeTest: function (test, context) {
        // Log individual test (it block) being executed
        console.info(`    🧪 TEST: ${test.title}`);
    },
    /**
     * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
     * beforeEach in Mocha)
     */
    // beforeHook: function (test, context, hookName) {
    // },
    /**
     * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
     * afterEach in Mocha)
     */
    afterHook: async function (test, context, { error, passed }, hookName) {
        // Capture screenshot if a hook (like beforeEach) fails
        if (!passed && error) {
            await this.captureFailureScreenshot(test, hookName);
        }
    },
    /**
     * Function to be executed after a test (in Mocha/Jasmine only)
     * @param {object}  test             test object
     * @param {object}  context          scope object the test was executed with
     * @param {Error}   result.error     error object in case the test fails, otherwise `undefined`
     * @param {*}       result.result    return object of test function
     * @param {number}  result.duration  duration of test
     * @param {boolean} result.passed    true if test has passed, otherwise false
     * @param {object}  result.retries   information about spec related retries, e.g. `{ attempts: 0, limit: 0 }`
     */
    afterTest: async function(test, context, { passed, duration, error }) {
        // Determine test status - check if test was skipped
        // Mocha's this.skip() throws an error with specific patterns
        const isMochaSkip = error && (
            error.name === 'Pending' ||
            (error.message && error.message.match(/^sync skip|^async skip/i))
        );
        const isSkipped = test.pending || isMochaSkip;
        
        let status;
        if (isSkipped) {
            status = '⏭️  SKIP';
        } else if (passed) {
            status = '✅ PASS';
        } else {
            status = '❌ FAIL';
        }
        const durationStr = duration ? ` (${(duration / 1000).toFixed(2)}s)` : '';
        console.info(`       ${status}${durationStr}`);
        
        if (!passed && !isSkipped) {
            await this.captureFailureScreenshot(test);
        }
    },


    /**
     * Hook that gets executed after the suite has ended
     * @param {object} suite suite details
     */
    // afterSuite: function (suite) {
    // },
    /**
     * Runs after a WebdriverIO command gets executed
     * @param {string} commandName hook command name
     * @param {Array} args arguments that command would receive
     * @param {number} result 0 - command success, 1 - command error
     * @param {object} error error object if any
     */
    // afterCommand: function (commandName, args, result, error) {
    // },
    /**
     * Gets executed after all tests are done. You still have access to all global variables from
     * the test.
     * @param {number} result 0 - test pass, 1 - test fail
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // after: function (result, capabilities, specs) {
    // },
    /**
     * Gets executed right after terminating the webdriver session.
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs List of spec file paths that ran
     */
    // afterSession: function (config, capabilities, specs) {
    // },
    /**
     * Gets executed after all workers got shut down and the process is about to exit. An error
     * thrown in the onComplete hook will result in the test run failing.
     * @param {object} exitCode 0 - success, 1 - fail
     * @param {object} config wdio configuration object
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {<Object>} results object containing test results
     */
    onComplete: function () {
        fs.rm(SCREENSHOT_FOLDER, { recursive: true }, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.info('Directory successfully removed.');
        }
        });
    },
    /**
    * Gets executed when a refresh happens.
    * @param {string} oldSessionId session ID of the old session
    * @param {string} newSessionId session ID of the new session
    */
    // onReload: function(oldSessionId, newSessionId) {
    // }
    /**
    * Hook that gets executed before a WebdriverIO assertion happens.
    * @param {object} params information about the assertion to be executed
    */
    // beforeAssertion: function(params) {
    // }
    /**
    * Hook that gets executed after a WebdriverIO assertion happened.
    * @param {object} params information about the assertion that was executed, including its results
    */
    // afterAssertion: function(params) {
    // }
}

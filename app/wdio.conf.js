const fs = require('fs');
const path = require('path');
const { Reporter, ReportingApi } = require('@reportportal/agent-js-webdriverio');

const SCREENSHOT_FOLDER = '../screenshots';

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
    specs: [
        // Welcome tests must run first to establish authentication
        './test/specs/welcome.e2e.js',
        './test/specs/**/*.js'
    ],
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    suites: {
        welcome: ['./test/specs/welcome.e2e.js'],
        home: ['./test/specs/home.e2e.js'],
        navigation: ['./test/specs/navigation.e2e.js'],
        failing: ['./test/specs/failing.e2e.js']
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
        timeout: 150000, // Increased to 2.5 minutes to accommodate OTP tests
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
            
            console.log(`📸 Capturing screenshot: ${filePath}`)
            await browser.saveScreenshot(filePath)
            console.log(`✅ Screenshot saved: ${fileName}`)
            
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
                    console.log(`📤 Screenshot sent to ReportPortal`);
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
            console.log(`Created screenshot directory: ${screenshotDir}`);
        } else {
            console.log(`Screenshot directory ready: ${screenshotDir}`);
        }

        // Log test execution configuration
        const platform = (process.env.PLATFORM_NAME || 'iOS').toUpperCase();
        const specs = config.specs || [];
        const suites = config.suites || {};
        
        // Detect if running specific suite or spec from command line
        const cliArgs = process.argv.join(' ');
        const suiteMatch = cliArgs.match(/--suite\s+(\S+)/);
        const specMatch = cliArgs.match(/--spec\s+(\S+)/);
        
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════════╗');
        console.log('║                    🧪 TEST EXECUTION CONFIGURATION               ║');
        console.log('╠══════════════════════════════════════════════════════════════════╣');
        console.log(`║  Platform:   ${platform.padEnd(52)}║`);
        
        if (specMatch) {
            // Running specific spec file
            const specFile = specMatch[1];
            console.log(`║  Mode:       Specific Test File                                  ║`);
            console.log(`║  Test File:  ${specFile.padEnd(52)}║`);
        } else if (suiteMatch) {
            // Running specific suite
            const suiteName = suiteMatch[1];
            const suiteSpecs = suites[suiteName] || [];
            console.log(`║  Mode:       Test Suite                                          ║`);
            console.log(`║  Suite:      ${suiteName.padEnd(52)}║`);
            if (suiteSpecs.length > 0) {
                console.log(`║  Files:      ${suiteSpecs.length} spec file(s)                                      ║`);
                suiteSpecs.forEach((spec, i) => {
                    const shortSpec = spec.replace('./test/specs/', '');
                    console.log(`║              ${(i + 1) + '. ' + shortSpec.padEnd(50)}║`);
                });
            }
        } else {
            // Running all specs
            console.log(`║  Mode:       All Test Specs                                      ║`);
            console.log(`║  Specs:      ${specs.length} spec pattern(s) configured                       ║`);
        }
        
        console.log('╠══════════════════════════════════════════════════════════════════╣');
        console.log(`║  Log Dir:    ${LOG_OUTPUT_DIR.padEnd(52)}║`);
        console.log('╚══════════════════════════════════════════════════════════════════╝');
        console.log('');
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
        console.log('');
        console.log('┌──────────────────────────────────────────────────────────────────┐');
        console.log(`│  📄 SPEC FILE: ${shortSpec.padEnd(50)}│`);
        console.log('└──────────────────────────────────────────────────────────────────┘');
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
        console.log('');
        console.log(`  📦 SUITE: ${suite.title}`);
        console.log('  ' + '─'.repeat(60));
    },
    /**
     * Function to be executed before a test (in Mocha/Jasmine) starts.
     */
    beforeTest: function (test, context) {
        // Log individual test (it block) being executed
        console.log(`    🧪 TEST: ${test.title}`);
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
    afterTest: async function(test, context, { passed, duration }) {
        // Log test result
        const status = passed ? '✅ PASS' : '❌ FAIL';
        const durationStr = duration ? ` (${(duration / 1000).toFixed(2)}s)` : '';
        console.log(`       ${status}${durationStr}`);
        
        if (!passed) {
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
            console.log(err);
        } else {
            console.log('Directory successfully removed.');
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

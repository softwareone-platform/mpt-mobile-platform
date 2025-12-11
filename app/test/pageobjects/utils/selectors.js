/**
 * Platform-agnostic selector helper
 * Returns iOS or Android selectors based on current platform
 * 
 * Usage:
 *   const { getSelector, selectors } = require('./utils/selectors');
 *   
 *   // Option 1: Using getSelector for custom selectors
 *   get myElement() {
 *       return $(getSelector({
 *           ios: '//XCUIElementTypeStaticText[@name="text"]',
 *           android: '//android.widget.TextView[@text="text"]'
 *       }));
 *   }
 *   
 *   // Option 2: Using built-in selector helpers
 *   get myButton() {
 *       return $(selectors.button('Click Me'));
 *   }
 */

/**
 * Checks if current platform is Android
 * @returns {boolean}
 */
const isAndroid = () => {
    return (process.env.PLATFORM_NAME || 'iOS').toLowerCase() === 'android';
};

/**
 * Checks if current platform is iOS
 * @returns {boolean}
 */
const isIOS = () => !isAndroid();

/**
 * Returns appropriate selector based on current platform
 * @param {Object} selectors - { ios: string, android: string }
 * @returns {string} - Platform-specific selector
 */
const getSelector = ({ ios, android }) => {
    if (!ios || !android) {
        throw new Error('Both ios and android selectors must be provided');
    }
    return isAndroid() ? android : ios;
};

/**
 * Common selector patterns for React Native elements
 */
const selectors = {
    /**
     * Find element by exact text content
     * @param {string} text - The exact text to match
     * @returns {string} Platform-specific selector
     */
    byText: (text) => getSelector({
        ios: `//*[@name="${text}"]`,
        android: `//*[@text="${text}"]`
    }),
    
    /**
     * Find element containing text
     * @param {string} text - Text that should be contained
     * @returns {string} Platform-specific selector
     */
    byContainsText: (text) => getSelector({
        ios: `//*[contains(@name, "${text}")]`,
        android: `//*[contains(@text, "${text}")]`
    }),
    
    /**
     * Find element by accessibility ID (recommended for cross-platform)
     * Works with testID on React Native
     * @param {string} id - The accessibility identifier
     * @returns {string} Accessibility ID selector
     */
    byAccessibilityId: (id) => `~${id}`,
    
    /**
     * Find a text input field
     * @returns {string} Platform-specific selector for text field
     */
    textField: () => getSelector({
        ios: '//XCUIElementTypeTextField',
        android: '//android.widget.EditText'
    }),
    
    /**
     * Find a secure text input field (password)
     * @returns {string} Platform-specific selector for secure field
     */
    secureTextField: () => getSelector({
        ios: '//XCUIElementTypeSecureTextField',
        android: '//android.widget.EditText[@password="true"]'
    }),
    
    /**
     * Find a button by its text/label
     * @param {string} name - Button text or accessibility label
     * @returns {string} Platform-specific selector
     */
    button: (name) => getSelector({
        ios: `//*[@name="${name}"]`,
        android: `//android.widget.Button[@text="${name}"] | //*[@content-desc="${name}"]`
    }),
    
    /**
     * Find static text element
     * @param {string} text - The text content
     * @returns {string} Platform-specific selector
     */
    staticText: (text) => getSelector({
        ios: `//XCUIElementTypeStaticText[@name="${text}"]`,
        android: `//android.widget.TextView[@text="${text}"]`
    }),
    
    /**
     * Find an image element
     * @returns {string} Platform-specific selector for image
     */
    image: () => getSelector({
        ios: '//XCUIElementTypeImage',
        android: '//android.widget.ImageView'
    }),
    
    /**
     * Find a scroll view
     * @returns {string} Platform-specific selector for scroll view
     */
    scrollView: () => getSelector({
        ios: '//XCUIElementTypeScrollView',
        android: '//android.widget.ScrollView'
    }),
    
    /**
     * Find accessible element by index
     * @param {number} index - 1-based index
     * @returns {string} Platform-specific selector
     */
    accessibleByIndex: (index) => getSelector({
        ios: `(//XCUIElementTypeOther[@accessible="true"])[${index}]`,
        android: `(//*[@clickable="true"])[${index}]`
    }),
    
    /**
     * Find element by resource/accessibility ID
     * @param {string} id - The resource or accessibility ID
     * @returns {string} Platform-specific selector
     */
    byResourceId: (id) => getSelector({
        ios: `~${id}`,
        android: `//*[@resource-id="${id}"]`
    }),
    
    /**
     * Find a switch/toggle element
     * @returns {string} Platform-specific selector for switch
     */
    switchElement: () => getSelector({
        ios: '//XCUIElementTypeSwitch',
        android: '//android.widget.Switch'
    })
};

module.exports = {
    isAndroid,
    isIOS,
    getSelector,
    selectors
};

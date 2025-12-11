# Test Element Identification Strategy

This document outlines recommendations for adding testable identifiers to React Native components in the MPT Mobile Platform application to improve test automation reliability and maintainability.

## Executive Summary

Currently, the test automation framework relies heavily on value-based locators (text content, XPath with `@name` attributes) to identify UI elements. This approach is fragile and leads to:

- **Broken tests** when text content changes (translations, copy updates)
- **Platform-specific locators** (e.g., `//XCUIElementTypeTextField`)
- **Ambiguous selectors** that may match multiple elements
- **Maintenance overhead** when UI structure changes

**Recommendation**: Implement a consistent `testID` strategy using React Native's built-in accessibility props, which work across both iOS and Android.

---

## Current State Analysis

### Existing Locator Patterns

From the current Page Object Model files:

```javascript
// welcome.page.js - Value-based locators (fragile)
get welcomeTitle () {
    return $('//*[@name="Welcome"]');
}

get continueButton () {
    return $('//*[@name="Continue"]');
}

get emailRequiredErrorLabel () {
    return $('//*[@name="Email is required"]');
}

// verify.page.js - Platform-specific type selectors
get otpInput1 () {
    return $('(//XCUIElementTypeOther[@accessible="true"])[1]');
}

// footer.page.js - Accessibility-state dependent
get spotlightsTab () {
    return $('//*[contains(@name, "Spotlight, tab, 1 of 4")]');
}
```

### Problems with Current Approach

| Issue | Impact | Example |
|-------|--------|---------|
| Text content changes | Tests break | Changing "Continue" to "Next" breaks button locator |
| Localization | Tests fail for non-English | Translation changes break all locators |
| iOS-specific selectors | Android tests fail | `XCUIElementTypeTextField` doesn't exist on Android |
| Positional indexing | Brittle tests | `[1]`, `[2]` indices break when elements are added/removed |
| Accessibility state in locators | Unpredictable | Tab position "1 of 4" changes if tabs are added |

---

## Recommended Solution: `testID` Prop

### Overview

React Native provides the `testID` prop which maps to:
- **iOS**: `accessibilityIdentifier` (used by XCUITest)
- **Android**: `resource-id` (used by UIAutomator2)

This is the **only cross-platform approach** that provides stable, value-agnostic element identification.

### How It Works

```tsx
// React Native component with testID
<TouchableOpacity testID="continue-button" onPress={handleContinue}>
  <Text>{t('auth.welcome.continueButton')}</Text>
</TouchableOpacity>
```

In Appium tests, this becomes:
```javascript
// iOS: uses accessibilityIdentifier
get continueButton() {
    return $('~continue-button');  // Appium accessibility id selector
}

// Works identically on Android!
```

---

## Implementation Strategy

### Phase 1: Establish Naming Convention

#### TestID Naming Pattern

Use a consistent, hierarchical naming convention:

```
[screen]-[component]-[element]-[variant?]
```

**Examples:**
| Element | testID |
|---------|--------|
| Welcome screen continue button | `welcome-continue-button` |
| Welcome screen email input | `welcome-email-input` |
| Welcome screen email error | `welcome-email-error` |
| OTP verification input field 1 | `otp-input-1` |
| OTP verification input field 2 | `otp-input-2` |
| Bottom tab - Spotlight | `nav-tab-spotlight` |
| Bottom tab - Orders | `nav-tab-orders` |
| Header logo | `header-logo` |
| Account list item | `account-list-item-{id}` |

#### Rules

1. **Use kebab-case** (lowercase with hyphens)
2. **Be descriptive** but concise
3. **Include context** (screen or component name)
4. **Use suffixes** for element types: `-button`, `-input`, `-text`, `-label`, `-icon`, `-tab`, `-item`
5. **Use dynamic IDs** for list items: `item-{id}` or `item-{index}`

### Phase 2: Create Helper Utility

Create a utility module for generating consistent testIDs:

**`app/src/utils/testID.ts`**
```typescript
/**
 * Utility for generating consistent testID values for UI components.
 * These IDs are used by Appium tests for cross-platform element identification.
 * 
 * Usage:
 *   <Button testID={testID('welcome', 'continue', 'button')} />
 *   <TextInput testID={testID('welcome', 'email', 'input')} />
 */

type TestIDSuffix = 'button' | 'input' | 'text' | 'label' | 'icon' | 'tab' | 'item' | 'container' | 'image' | 'link';

/**
 * Generates a consistent testID string.
 * 
 * @param screen - The screen or component context (e.g., 'welcome', 'otp', 'nav')
 * @param element - The element identifier (e.g., 'continue', 'email', 'spotlight')
 * @param suffix - The element type suffix
 * @param variant - Optional variant or index (e.g., '1', 'primary')
 * @returns A formatted testID string
 * 
 * @example
 * testID('welcome', 'continue', 'button')        // 'welcome-continue-button'
 * testID('otp', 'digit', 'input', '3')           // 'otp-digit-input-3'
 * testID('nav', 'spotlight', 'tab')              // 'nav-spotlight-tab'
 */
export function testID(
    screen: string,
    element: string,
    suffix: TestIDSuffix,
    variant?: string | number
): string {
    const parts = [screen, element, suffix];
    if (variant !== undefined) {
        parts.push(String(variant));
    }
    return parts.join('-');
}

/**
 * Generates testID for list items with dynamic IDs.
 * 
 * @param context - The list context (e.g., 'account', 'subscription')
 * @param id - The unique identifier for the item
 * @returns A formatted testID string
 * 
 * @example
 * listItemTestID('account', 'acc-123')           // 'account-item-acc-123'
 * listItemTestID('subscription', 42)             // 'subscription-item-42'
 */
export function listItemTestID(context: string, id: string | number): string {
    return `${context}-item-${id}`;
}

/**
 * Constants for common testIDs used across the app.
 * Import these in components to ensure consistency.
 */
export const TestIDs = {
    // Welcome Screen
    WELCOME_EMAIL_INPUT: 'welcome-email-input',
    WELCOME_EMAIL_ERROR: 'welcome-email-error',
    WELCOME_CONTINUE_BUTTON: 'welcome-continue-button',
    WELCOME_TROUBLE_LINK: 'welcome-trouble-link',
    WELCOME_TITLE: 'welcome-title-text',
    WELCOME_SUBTITLE: 'welcome-subtitle-text',
    WELCOME_LOGO: 'welcome-logo-image',

    // OTP Verification Screen
    OTP_TITLE: 'otp-title-text',
    OTP_MESSAGE: 'otp-message-text',
    OTP_INPUT_PREFIX: 'otp-digit-input',  // Append -1, -2, etc.
    OTP_VERIFY_BUTTON: 'otp-verify-button',
    OTP_CHANGE_EMAIL_BUTTON: 'otp-change-email-button',
    OTP_RESEND_BUTTON: 'otp-resend-button',

    // Navigation
    NAV_TAB_SPOTLIGHT: 'nav-tab-spotlight',
    NAV_TAB_ORDERS: 'nav-tab-orders',
    NAV_TAB_SUBSCRIPTIONS: 'nav-tab-subscriptions',
    NAV_TAB_MORE: 'nav-tab-more',
    NAV_ACCOUNT_BUTTON: 'nav-account-button',

    // Common
    HEADER_LOGO: 'header-logo-image',
    LOADING_INDICATOR: 'loading-indicator',
} as const;

export type TestIDKey = keyof typeof TestIDs;
```

### Phase 3: Update Components

#### Example: AuthInput Component

**Before:**
```tsx
const AuthInput: React.FC<AuthInputProps> = ({
    error,
    containerStyle,
    style,
    ...textInputProps
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <TextInput
                style={[styles.input, error && styles.inputError, style]}
                placeholderTextColor={Color.gray.gray4}
                clearButtonMode="while-editing"
                {...textInputProps}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};
```

**After:**
```tsx
interface AuthInputProps extends TextInputProps {
    error?: string;
    containerStyle?: any;
    testID?: string;        // Add testID prop
    errorTestID?: string;   // Add error testID prop
}

const AuthInput: React.FC<AuthInputProps> = ({
    error,
    containerStyle,
    style,
    testID,
    errorTestID,
    ...textInputProps
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <TextInput
                testID={testID}
                style={[styles.input, error && styles.inputError, style]}
                placeholderTextColor={Color.gray.gray4}
                clearButtonMode="while-editing"
                {...textInputProps}
            />
            {error && (
                <Text testID={errorTestID} style={styles.errorText}>
                    {error}
                </Text>
            )}
        </View>
    );
};
```

#### Example: AuthButton Component

**Before:**
```tsx
const AuthButton: React.FC<AuthButtonProps> = ({
    title,
    onPress,
    loading = false,
    variant = 'primary',
}) => {
    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={loading}
        >
            {/* ... */}
        </TouchableOpacity>
    );
};
```

**After:**
```tsx
interface AuthButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    variant?: 'primary' | 'secondary';
    testID?: string;  // Add testID prop
}

const AuthButton: React.FC<AuthButtonProps> = ({
    title,
    onPress,
    loading = false,
    variant = 'primary',
    testID,
}) => {
    return (
        <TouchableOpacity
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={title}
            style={buttonStyles}
            onPress={onPress}
            disabled={loading}
        >
            {/* ... */}
        </TouchableOpacity>
    );
};
```

#### Example: WelcomeScreen Usage

```tsx
import { TestIDs } from '@/utils/testID';

const WelcomeScreen: React.FC<WelcomeScreenProps> = () => {
    // ... existing code ...

    return (
        <AuthLayout
            title={t('auth.welcome.title')}
            subtitle={t('auth.welcome.subtitle')}
            titleTestID={TestIDs.WELCOME_TITLE}
            subtitleTestID={TestIDs.WELCOME_SUBTITLE}
            logoTestID={TestIDs.WELCOME_LOGO}
        >
            <View style={styles.form}>
                <AuthInput
                    testID={TestIDs.WELCOME_EMAIL_INPUT}
                    errorTestID={TestIDs.WELCOME_EMAIL_ERROR}
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={t('auth.welcome.emailPlaceholder')}
                    error={emailError}
                    containerStyle={styles.inputContainer}
                />
                <AuthButton
                    testID={TestIDs.WELCOME_CONTINUE_BUTTON}
                    title={t('auth.welcome.continueButton')}
                    onPress={handleContinue}
                    loading={loading}
                />
                <TouchableOpacity 
                    testID={TestIDs.WELCOME_TROUBLE_LINK}
                    style={styles.troubleLink}
                    onPress={() => console.log('Trouble signing in pressed')}
                >
                    <Text style={styles.troubleText}>
                        {t('auth.welcome.troubleSigningIn')}
                    </Text>
                </TouchableOpacity>
            </View>
        </AuthLayout>
    );
};
```

#### Example: Navigation Tabs

For navigation tabs, add testID to the tab bar button options:

```tsx
// MainTabs.tsx
<Tab.Navigator
    screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
            // ... existing code ...
        },
        tabBarButtonTestID: `nav-tab-${route.name}`,  // Add this
        // ... other options ...
    })}
>
```

Or for custom tab items:

```tsx
// TabItem.tsx
const TabItem = ({ label, selected, onPress, testID }: Props) => {
    return (
        <TouchableOpacity
            testID={testID}
            style={[styles.container, selected && styles.itemSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.label, selected && styles.labelSelected]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};
```

### Phase 4: Update Page Objects

#### Example: Updated welcome.page.js

**Before:**
```javascript
get welcomeTitle () {
    return $('//*[@name="Welcome"]');
}

get continueButton () {
    return $('//*[@name="Continue"]');
}

get emailInput () {
    return $('//XCUIElementTypeTextField');
}
```

**After:**
```javascript
get welcomeTitle () {
    return $('~welcome-title-text');
}

get welcomeSubtitle () {
    return $('~welcome-subtitle-text');
}

get emailInput () {
    return $('~welcome-email-input');
}

get emailError () {
    return $('~welcome-email-error');
}

get continueButton () {
    return $('~welcome-continue-button');
}

get troubleSigningInLink () {
    return $('~welcome-trouble-link');
}

get logo () {
    return $('~welcome-logo-image');
}
```

#### Appium Selector Syntax

| Selector Type | Syntax | Usage |
|--------------|--------|-------|
| Accessibility ID (testID) | `~element-id` | Primary method - cross-platform |
| Resource ID (Android) | `android=new UiSelector().resourceId("element-id")` | Android-specific fallback |
| XPath with accessibility | `//*[@content-desc="element-id"]` | Last resort |

**Recommendation**: Always use the `~` (accessibility ID) selector as it's the most reliable cross-platform approach.

---

## Special Cases

### Dynamic Lists

For lists with dynamic content, use indexed or ID-based testIDs:

```tsx
// ListItemWithImage.tsx
const ListItemWithImage = ({ id, title, subtitle, onPress }: Props) => (
    <TouchableOpacity
        testID={`account-item-${id}`}
        style={styles.container}
        onPress={onPress}
    >
        {/* ... */}
    </TouchableOpacity>
);
```

Page Object pattern for dynamic items:
```javascript
// accounts.page.js
getAccountItem(id) {
    return $(`~account-item-${id}`);
}

async getAccountItemByIndex(index) {
    const items = await $$('~account-item-*');  // May need adjustment
    return items[index];
}

async getAllAccountItems() {
    return $$('[id^="account-item-"]');  // Prefix match
}
```

### OTP Input Fields

```tsx
// OTPInput.tsx
{digits.map((digit, index) => (
    <TextInput
        key={index}
        testID={`otp-digit-input-${index + 1}`}
        value={digit}
        onChangeText={(value) => handleDigitChange(index, value)}
        // ...
    />
))}
```

Page Object:
```javascript
getOtpInput(digit) {
    return $(`~otp-digit-input-${digit}`);
}

get allOtpInputs() {
    return [1, 2, 3, 4, 5, 6].map(i => this.getOtpInput(i));
}
```

### Conditional Elements

For elements that appear based on state:

```tsx
{loading && (
    <ActivityIndicator testID="loading-indicator" />
)}

{error && (
    <Text testID="error-message">{error}</Text>
)}
```

---

## Accessibility Considerations

When adding `testID`, also consider accessibility props for better a11y:

```tsx
<TouchableOpacity
    testID="submit-button"
    accessibilityRole="button"
    accessibilityLabel="Submit form"
    accessibilityHint="Double tap to submit your changes"
>
    <Text>Submit</Text>
</TouchableOpacity>
```

**Note**: `testID` is for testing, while `accessibilityLabel` is for screen readers. Keep them separate and purpose-appropriate.

---

## Migration Plan

### Recommended Rollout Order

1. **Authentication Flow** (highest test coverage need)
   - WelcomeScreen
   - OTPVerificationScreen
   - AuthInput, AuthButton, AuthLayout components

2. **Navigation Components**
   - MainTabs
   - SecondaryTabs  
   - TabItem components

3. **Core Screens**
   - Spotlight screen
   - Orders screen
   - Subscriptions screen
   - More/Settings screen

4. **Shared Components**
   - ListItemWithImage
   - Avatar
   - Common UI elements

### Implementation Checklist

For each component:

- [ ] Add `testID` prop to component interface
- [ ] Pass `testID` to the root interactive element
- [ ] Add to `TestIDs` constants if reused
- [ ] Update corresponding Page Object file
- [ ] Verify in Appium Inspector (iOS and Android)
- [ ] Update existing tests to use new selectors
- [ ] Run test suite to validate

---

## Validation & Testing

### Verify TestIDs in Appium Inspector

1. Build and install the app
2. Start Appium Inspector
3. Connect to the app
4. Use the element inspector to verify:
   - iOS: Check `accessibilityIdentifier` attribute
   - Android: Check `resource-id` attribute

### Cross-Platform Verification Script

Create a simple verification test:

```javascript
// test/specs/testid-verification.e2e.js
describe('TestID Verification', () => {
    it('should find welcome screen elements by testID', async () => {
        const emailInput = await $('~welcome-email-input');
        const continueButton = await $('~welcome-continue-button');
        
        await expect(emailInput).toBeDisplayed();
        await expect(continueButton).toBeDisplayed();
    });
});
```

---

## Alternative Approaches (Not Recommended)

### 1. Using `accessibilityLabel` Only

**Pros:**
- Works for both testing and screen readers

**Cons:**
- Couples test identifiers to accessibility text
- Changing accessibility text breaks tests
- Not truly "value-agnostic"

### 2. Using `nativeID` (iOS Only)

**Pros:**
- Sets `nativeID` directly on iOS views

**Cons:**
- iOS-only, doesn't work on Android
- Not the standard React Native approach

### 3. Using Data Attributes (Web-like)

**Pros:**
- Familiar to web developers

**Cons:**
- Not supported in React Native
- Would require custom native module

---

## Summary

| Aspect | Current State | Recommended State |
|--------|--------------|-------------------|
| Locator Strategy | Text/value-based XPath | Accessibility ID (`testID`) |
| Platform Support | iOS-specific selectors | Cross-platform unified |
| Maintainability | Breaks with text changes | Stable identifiers |
| Test Reliability | Fragile, positional | Robust, semantic |
| Selector Syntax | `//*[@name="text"]` | `~element-testid` |

**Key Benefits:**
- ✅ Platform-agnostic (iOS & Android)
- ✅ Value-agnostic (survives translation/copy changes)
- ✅ Semantic and readable selectors
- ✅ Follows React Native best practices
- ✅ Improves test maintenance and reliability
- ✅ Easy to implement incrementally

---

## References

- [React Native Testing Overview](https://reactnative.dev/docs/testing-overview)
- [React Native testID Documentation](https://reactnative.dev/docs/view#testid)
- [Appium Accessibility ID Selector](http://appium.io/docs/en/writing-running-appium/finding-elements/)
- [WebDriverIO Appium Selectors](https://webdriver.io/docs/selectors/#accessibility-id)
- [iOS XCUITest - accessibilityIdentifier](https://developer.apple.com/documentation/uikit/uiaccessibilityidentification/1623132-accessibilityidentifier)
- [Android UIAutomator - Resource ID](https://developer.android.com/training/testing/ui-automator)

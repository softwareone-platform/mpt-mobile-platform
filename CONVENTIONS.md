# Coding Conventions

This document outlines the coding conventions and patterns used in the MPT Mobile Platform project.

## Table of Contents

- [Quick Reference](#quick-reference)
- [File Naming Conventions](#file-naming-conventions)
- [Import Ordering](#import-ordering)
- [Export Patterns](#export-patterns)
- [Component Structure](#component-structure)
- [TypeScript Patterns](#typescript-patterns)
- [Style Patterns](#style-patterns)
- [Context Patterns](#context-patterns)
- [Hook Patterns](#hook-patterns)
- [Service Patterns](#service-patterns)
- [Screen Patterns](#screen-patterns)
- [Testing Patterns](#testing-patterns)
- [Error Handling](#error-handling)
- [TestID Patterns](#testid-patterns)
- [Constants Patterns](#constants-patterns)
- [Text and Copy Conventions](#text-and-copy-conventions)
- [Architecture Principles](#architecture-principles)
- [E2E Testing Conventions](#e2e-testing-conventions)

---

## Quick Reference

### Do's ✅

- Use design tokens for all colors, spacing, typography
- Follow import ordering (React → Third-party → Internal)
- Use TypeScript interfaces for props and API types
- Create custom hooks with `use` prefix
- Add `testID` props for E2E testing
- Use `useCallback` and `useMemo` for performance
- Write tests for all utilities and services
- Use i18n translations instead of hardcoded strings
- Use `===` and `!==` for comparisons
- Handle all promises with `await`, `.then()`, or explicit `void`
- Use `console.error()`, `console.warn()`, or `console.info()` for logging

### Don'ts ❌

- Don't use inline styles
- Don't use color/spacing literals
- Don't use `any` type
- Don't create components without TypeScript props interface
- Don't forget to handle loading and error states
- Don't use `console.log()` - it's banned by ESLint
- Don't use `==` or `!=` - always use strict equality
- Don't leave promises unhandled (floating promises)
- Don't use `var` - use `const` or `let`
- Don't import from relative paths when aliases are available
- Don't use empty `catch {}` blocks - always log errors
- Don't use magic numbers - extract to named constants
- Don't hold mutable state in singletons
- Don't abstract until you have 3+ similar implementations
- Don't skip null checks for `route.params`

---

## File Naming Conventions

| Category | Convention | Examples |
|----------|------------|----------|
| **Components** | PascalCase with `.tsx` extension | `AuthButton.tsx`, `OTPInput.tsx`, `UserProfile.tsx` |
| **Services** | camelCase with `Service` suffix | `authService.ts`, `billingService.ts`, `accountService.ts` |
| **Hooks** | camelCase with `use` prefix | `useApi.ts`, `useAuth.ts`, `useUserData.ts` |
| **Context** | PascalCase with `Context` suffix | `AuthContext.tsx`, `NavigationContext.tsx` |
| **Types** | camelCase (lowercase) | `navigation.ts`, `api.ts`, `auth.ts` |
| **Utils** | camelCase | `validation.ts`, `apiError.ts`, `image.ts` |
| **Constants** | camelCase | `auth.ts`, `api.ts`, `icons.ts` |
| **Tests** | Same name with `.test.ts(x)` suffix | `validation.test.ts`, `OTPInput.test.tsx` |
| **Styles** | camelCase | `button.ts`, `authLayout.ts`, `otpInput.ts` |
| **Config** | kebab-case | `feature-flags.json`, `env.config.ts` |

---

## Import Ordering

Imports must follow this specific order with newlines between groups:

```typescript
// 1. React/React Native core
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// 2. Third-party libraries (alphabetized)
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

// 3. Internal imports using @ path aliases (alphabetized)
import { AuthButton } from '@/components/auth';
import { useAuth } from '@/context/AuthContext';
import { screenStyle, linkStyle } from '@/styles';
import { Color } from '@/styles/tokens';
import type { AuthStackParamList } from '@/types/navigation';
import { TestIDs } from '@/utils/testID';
```

**Rules:**
- Newlines between import groups
- Alphabetical ordering within each group (case-insensitive)
- No duplicate imports
- Type imports use `import type` syntax

---

## Export Patterns

### Default Exports
Use for components and services:

```typescript
// Component
const AuthButton: React.FC<AuthButtonProps> = ({ ... }) => { ... };
export default AuthButton;

// Service class
class AuthenticationService { ... }
export default new AuthenticationService();
```

### Named Exports
Use for hooks, types, and utilities:

```typescript
export const useAuth = () => { ... };
export type ApiError = { ... };
export const validateEmail = (email: string): boolean => { ... };
```

### Barrel Files (index.ts)
Use for grouped re-exports:

```typescript
// Components barrel file
export { default as AuthButton } from './AuthButton';
export { default as AuthInput } from './AuthInput';
export { default as OTPInput } from './OTPInput';

// Constants barrel file
export { AUTH_CONSTANTS } from './auth';
export * from './api';
export * from './links';
```

---

## Component Structure

Follow this strict ordering within component files:

```typescript
// 1. Imports (following import order rules)
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/context/AuthContext';
import { Color, Spacing } from '@/styles/tokens';

// 2. Helper functions (pure functions, outside component)
const sanitizeNumericInput = (text: string, maxLength: number): string => {
  return text.replace(/[^0-9]/g, '').slice(0, maxLength);
};

// 3. Interface/type definitions (Props suffix convention)
interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  testID?: string;
}

// 4. Component definition (React.FC pattern)
const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  testID,
}) => {
  // 4a. Hooks (useTranslation, useAuth, useNavigation, etc.)
  const { t } = useTranslation();
  
  // 4b. State declarations
  const [focused, setFocused] = useState(false);
  
  // 4c. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 4d. Handlers/callbacks
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);
  
  // 4e. Computed values
  const buttonStyles = variant === 'primary' ? styles.button : styles.secondaryButton;
  
  // 4f. Render
  return (
    <TouchableOpacity testID={testID} style={buttonStyles} onPress={handlePress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

// 5. Styles (at bottom, using StyleSheet.create)
const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 24,
    backgroundColor: Color.brand.primary,
  },
  buttonText: {
    color: Color.brand.white,
    fontSize: 16,
  },
});

// 6. Default export
export default AuthButton;
```

---

## TypeScript Patterns

### Interface vs Type

**Use `interface` for:**
- Object shapes
- Props definitions
- API responses
- Context values

```typescript
interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

**Use `type` for:**
- Unions
- Primitives
- Simple type aliases

```typescript
type AuthState = 'loading' | 'unauthenticated' | 'authenticated';
type TestIDSuffix = 'button' | 'input' | 'text' | 'label';
type UserId = string;
```

### Naming Conventions

| Pattern | Naming Convention | Example |
|---------|-------------------|---------|
| Props | `[ComponentName]Props` | `AuthButtonProps`, `OTPInputProps` |
| Context Values | `[ContextName]ContextValue` | `AuthContextValue`, `NavigationContextValue` |
| API Responses | `[Entity]Response` | `UserResponse`, `InvoiceResponse` |
| Param Lists | `[StackName]ParamList` | `AuthStackParamList`, `MainTabParamList` |

### Generics

Use generics for reusable functions and hooks:

```typescript
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);
  return response.json() as T;
}

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
}: UsePaginatedQueryParams<T>) {
  // Implementation
}
```

---

## Style Patterns

### Design Tokens

Use design tokens from `@/styles/tokens` instead of hardcoded values:

```typescript
// ✅ Correct - using design tokens
import { Color, Spacing, BorderRadius, Typography } from '@/styles/tokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.background.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  title: {
    ...Typography.heading1,
    color: Color.text.primary,
  },
});

// ❌ Incorrect - hardcoded values
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',  // Don't do this
    padding: 16,                  // Don't do this
  },
});
```

### StyleSheet Usage

Always use `StyleSheet.create()` at the bottom of component files:

```typescript
const styles = StyleSheet.create({
  container: screenStyle.containerCenterContent,
  button: buttonStyle.authPrimary,
  title: emptyStateStyle.title,
});
```

### ESLint Rules

The following are enforced:
- **No inline styles** (warning) - use `StyleSheet.create()`
- **No color literals** (warning) - use design tokens
- **No unused styles** (warning) - remove unused style definitions

---

## Context Patterns

Follow this structure for React Context:

```typescript
// 1. Imports
import { createContext, ReactNode, useContext, useMemo } from 'react';

// 2. Interface for context value
interface InvoicesContextValue {
  invoices: Invoice[];
  invoicesLoading: boolean;
  fetchInvoices: () => void;
}

// 3. Create context with undefined default
const InvoicesContext = createContext<InvoicesContextValue | undefined>(undefined);

// 4. Provider component
export const InvoicesProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    // Fetch logic
    setInvoicesLoading(false);
  }, []);

  const value = useMemo(
    () => ({ invoices, invoicesLoading, fetchInvoices }),
    [invoices, invoicesLoading, fetchInvoices]
  );

  return (
    <InvoicesContext.Provider value={value}>
      {children}
    </InvoicesContext.Provider>
  );
};

// 5. Custom hook with error handling
export const useInvoices = () => {
  const context = useContext(InvoicesContext);
  if (!context) {
    throw new Error('useInvoices must be used inside InvoicesProvider');
  }
  return context;
};
```

---

## Hook Patterns

### Query Hooks (TanStack React Query)

```typescript
export const useInvoicesData = (
  userId: string | undefined,
  currentAccountId: string | undefined
) => {
  const { getInvoices } = useBillingApi();

  return usePaginatedQuery<Invoice>({
    queryKey: ['invoices', userId, currentAccountId],
    queryFn: getInvoices,
    enabled: !!userId && !!currentAccountId,
  });
};
```

### API Service Hooks

```typescript
export function useBillingApi() {
  const api = useApi();

  const getInvoices = useCallback(
    async (offset = 0, limit = 50): Promise<PaginatedResponse<Invoice>> => {
      const endpoint = `/v1/billing/invoices?offset=${offset}&limit=${limit}`;
      return api.get<PaginatedResponse<Invoice>>(endpoint);
    },
    [api]
  );

  return useMemo(() => ({ getInvoices }), [getInvoices]);
}
```

---

## Service Patterns

### Hook-Based Services

```typescript
export function useBillingApi() {
  const api = useApi();

  const getInvoices = useCallback(
    async (offset = DEFAULT_OFFSET, limit = DEFAULT_PAGE_SIZE): Promise<PaginatedResponse<Invoice>> => {
      const endpoint = `/v1/billing/invoices` +
        `?select=-*,id,status` +
        `&filter(group.buyers)` +
        `&order=-audit.created.at` +
        `&offset=${offset}&limit=${limit}`;
      return api.get<PaginatedResponse<Invoice>>(endpoint);
    },
    [api]
  );

  return useMemo(() => ({ getInvoices }), [getInvoices]);
}
```

### Class-Based Services (Singletons)

Use for services that need initialization or don't depend on React context:

```typescript
class AuthenticationService {
  private auth0: Auth0;
  
  constructor() {
    this.auth0 = new Auth0({ domain, clientId });
  }

  async sendPasswordlessEmail(email: string): Promise<Auth0PasswordlessResponse> {
    return this.auth0.auth.passwordlessWithEmail({
      email,
      send: 'code',
    });
  }
}

export default new AuthenticationService();
```

---

## Screen Patterns

### Screen with Context Provider

```typescript
// Content component (consumes context)
const InvoicesScreenContent = () => {
  const { invoices, invoicesLoading } = useInvoices();
  
  return (
    <StatusMessage isLoading={invoicesLoading}>
      <ListView data={invoices} />
    </StatusMessage>
  );
};

// Screen wrapper (provides context)
const InvoicesScreen = () => (
  <InvoicesProvider>
    <InvoicesScreenContent />
  </InvoicesProvider>
);

export default InvoicesScreen;
```

---

## Testing Patterns

### Test File Structure

```typescript
import { validateOTP, validateEmail } from '@/utils/validation';

describe('Validation Utils', () => {
  describe('validateOTP', () => {
    it('should validate correct OTP codes with default length', () => {
      const validCodes = ['123456', '000000'];
      validCodes.forEach((code) => {
        expect(validateOTP(code)).toBe(true);
      });
    });

    it('should reject invalid OTP codes', () => {
      expect(validateOTP('abcdef')).toBe(false);
      expect(validateOTP('12345')).toBe(false);
      expect(validateOTP('')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });
});
```

### Mock Patterns

```typescript
// Mock React Native modules
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: { create: (styles: any) => styles },
  Platform: { OS: 'ios' },
}));

// Mock Auth0
jest.mock('react-native-auth0', () => {
  return jest.fn().mockImplementation(() => ({
    auth: {
      passwordlessWithEmail: jest.fn(),
      loginWithEmail: jest.fn(),
    },
  }));
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));
```

---

## Error Handling

### API Error Type

```typescript
export type ApiError = {
  name: 'API Error';
  status: number | null;
  message: string;
  details?: unknown;
};

export const createApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      name: 'API Error',
      status: null,
      message: error.message,
      details: error,
    };
  }
  return {
    name: 'API Error',
    status: null,
    message: 'Unknown error occurred',
    details: error,
  };
};

export const isUnauthorisedError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as ApiError).status === 401;
  }
  return false;
};
```

### Error Handling in Components

```typescript
try {
  await login(email, otp);
} catch (error) {
  console.error(
    'OTP verification error:',
    error instanceof Error ? error.message : 'Unknown error'
  );
  
  if (error instanceof Error) {
    const translationKey = auth0ErrorParsingService.getTranslationKeyForError(error);
    setOtpError(t(translationKey));
  } else {
    setOtpError(t('auth.errors.unknownError'));
  }
}
```

---

## TestID Patterns

### TestID Constants

```typescript
// utils/testID.ts
export const TestIDs = {
  // Welcome Screen
  WELCOME_EMAIL_INPUT: 'welcome-email-input',
  WELCOME_CONTINUE_BUTTON: 'welcome-continue-button',
  
  // OTP Screen
  OTP_INPUT_PREFIX: 'otp-digit-input',
  OTP_VERIFY_BUTTON: 'otp-verify-button',
  
  // Navigation
  NAV_TAB_SPOTLIGHT: 'nav-tab-spotlight',
  NAV_TAB_PROFILE: 'nav-tab-profile',
};

// Helper function for dynamic TestIDs
export type TestIDSuffix = 'button' | 'input' | 'text' | 'label' | 'container';

export function testID(screen: string, element: string, suffix: TestIDSuffix): string {
  return [screen, element, suffix].join('-');
}
```

### Usage in Components

```typescript
<TouchableOpacity 
  testID={TestIDs.WELCOME_CONTINUE_BUTTON} 
  onPress={handleContinue}
>
  <Text>{t('welcome.continue')}</Text>
</TouchableOpacity>

<OTPInput 
  testIDPrefix={TestIDs.OTP_INPUT_PREFIX} 
  value={otp} 
  onChange={setOtp}
/>
```

---

## Constants Patterns

### Constant Objects with `as const`

```typescript
export const AUTH_CONSTANTS = {
  OTP_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TOKEN_REFRESH_THRESHOLD: 300, // 5 minutes in seconds
} as const;

export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_OFFSET = 0;
```

### Barrel File Exports

```typescript
// constants/index.ts
export { AUTH_CONSTANTS } from './auth';
export * from './api';
export * from './links';
```

---

## Text and Copy Conventions

### Sentence Case

All user-facing text (labels, buttons, headings, messages) should use **sentence case**. This means only the first letter of the sentence is capitalized, except for proper nouns.

```
✅ Correct (sentence case):
- "Label text"
- "Save changes"
- "Your account settings"
- "Sign in to continue"
- "No results found"

❌ Incorrect (title case):
- "Label Text"
- "Save Changes"
- "Your Account Settings"
- "Sign In To Continue"
- "No Results Found"
```

### Proper Nouns and Brand Names

Proper nouns, product names, and brand names retain their official capitalization:

```
✅ Correct:
- "Microsoft Azure"
- "Sign in with Google"
- "SoftwareONE Marketplace"
- "Connect to Auth0"
- "View in App Store"

❌ Incorrect:
- "Microsoft azure"
- "Sign in with google"
- "Softwareone marketplace"
```

### Examples in Translations (i18n)

```json
{
  "welcome": {
    "title": "Welcome to SoftwareONE",
    "subtitle": "Sign in to your account",
    "continueButton": "Continue"
  },
  "settings": {
    "title": "Account settings",
    "notifications": "Push notifications",
    "language": "Language preferences",
    "signOut": "Sign out"
  },
  "errors": {
    "networkError": "Unable to connect to the server",
    "invalidEmail": "Please enter a valid email address"
  }
}
```

### Quick Reference

| Text Type | Case | Example |
|-----------|------|---------|
| Button labels | Sentence case | "Save changes" |
| Screen titles | Sentence case | "Account settings" |
| Form labels | Sentence case | "Email address" |
| Error messages | Sentence case | "Please enter a valid email" |
| Product names | Official capitalization | "Microsoft Azure" |
| Brand names | Official capitalization | "SoftwareONE" |

---

## Architecture Principles

### Statelessness & Pure Functions

```typescript
// ✅ Good: Pure function, explicitly passed context
const isFeatureEnabled = (key: FeatureFlagKey, portalVersion: PortalVersionInfo): boolean => {
  return checkFeature(key, portalVersion);
};

// ❌ Bad: Hidden mutable state in singleton
class FeatureService {
  private portalVersion: PortalVersionInfo; // hidden state!
  setPortalVersion(v: PortalVersionInfo) { this.portalVersion = v; }
}
```

**Rules:**
- Prefer pure functions over stateful classes
- Pass context as parameters, don't hold globally
- No hidden shared mutable state
- Functions should be deterministic based on inputs

### Separation of Concerns

| Layer | Responsibility |
|-------|----------------|
| **Services** | API communication only |
| **Contexts** | State management & side effects |
| **Hooks** | Data fetching logic |
| **Components** | UI rendering |

### Code Organization Rules

| Rule | Guideline |
|------|----------|
| **Rule of Three** | Don't abstract until 3+ similar implementations |
| **File size** | Split at ~300-400 lines |
| **Service size** | Split at ~15-20 methods |
| **API grouping** | Group services by API path prefix |
| **No redundant data** | Don't pass both `id` and object containing `id` |

---

## E2E Testing Conventions

### Page Object Model (POM)

```javascript
// ✅ Good: Page object encapsulates UI interactions
class AgreementsPage extends ListPage {
  get agreementsList() { return $(this.getSelector('agreements-list')); }
  
  async getVisibleAgreementsCount() {
    return (await this.agreementsList.$$('item')).length;
  }
}

// ❌ Bad: Selectors and logic scattered in tests
it('test', async () => {
  const count = (await $$('~agreements-list item')).length; // Don't do this
});
```

### Method Naming Prefixes

| Prefix | Purpose | Example |
|--------|---------|--------|
| `get*` | Retrieve values | `getVisibleCount()` |
| `has*` | Boolean checks | `hasEmptyState()` |
| `is*` | State checks | `isLoading()` |
| `wait*` | Async waits | `waitForList()` |
| `navigate*` | Navigation | `navigateToDetails()` |

### Test Structure (AAA Pattern)

```javascript
describe('Agreements Screen', () => {
  it('should display agreements list when agreements exist', async () => {
    // Arrange
    await agreementsPage.navigateTo();
    
    // Act
    await agreementsPage.waitForList();
    
    // Assert
    expect(await agreementsPage.hasAgreements()).toBe(true);
  });

  it('should skip when no data available', function() {
    if (!hasTestData) this.skip(); // Graceful degradation
  });
});
```

### E2E Testing Rules

| Rule | Description |
|------|-------------|
| **Centralized selectors** | Platform-specific selectors in `selectors.js` |
| **Named constants** | No magic numbers (`TIMEOUT_MS` not `30000`) |
| **Never empty catch** | Always log errors in catch blocks |
| **Validate inputs** | Check ID formats with regex |
| **JSDoc with @example** | Document API client methods |
| **Conditional skip** | Use `this.skip()` when prerequisites missing |

---

## ESLint Configuration Summary

The project enforces these rules (from `app/eslint.config.js`):

### Error Level (Build Breaking)

| Rule | Description |
|------|-------------|
| `react-hooks/rules-of-hooks` | Enforce React Hooks rules |
| `import/order` | Import ordering with groups and newlines |
| `import/no-duplicates` | No duplicate imports |
| `unused-imports/no-unused-imports` | Remove unused imports |
| `no-console` | **Only `console.warn`, `console.error`, `console.info` allowed** - `console.log` is banned |
| `eqeqeq` | Must use `===` and `!==` (no `==` or `!=`) |
| `no-var` | Use `const` or `let`, never `var` |
| `@typescript-eslint/no-floating-promises` | Must handle all promises (await, .then(), or void) |
| `prettier/prettier` | Code formatting via Prettier |

### Warning Level

| Rule | Description |
|------|-------------|
| `react-hooks/exhaustive-deps` | Verify effect dependencies |
| `react-native/no-unused-styles` | No unused StyleSheet styles |
| `react-native/no-inline-styles` | Use `StyleSheet.create()` instead |
| `react-native/no-color-literals` | Use design tokens, not hardcoded colors |
| `react-native/no-single-element-style-arrays` | Don't wrap single style in array |
| `@typescript-eslint/no-unused-vars` | No unused variables (ignores `_` prefixed) |
| `@typescript-eslint/no-explicit-any` | Avoid `any` type |
| `prefer-const` | Use `const` when variable is never reassigned |
| `no-debugger` | No debugger statements |

### Disabled Rules

| Rule | Reason |
|------|--------|
| `react/react-in-jsx-scope` | Not needed with new JSX transform |
| `react/prop-types` | Using TypeScript instead |
| `react-native/no-raw-text` | Disabled for flexibility |

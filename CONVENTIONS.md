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
- [Commit & PR Naming Convention](#commit--pr-naming-convention)
- [SonarCloud Quality Gate](#sonarcloud-quality-gate)

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
- Use shared constants (e.g. `EMPTY_VALUE`) instead of hardcoded fallback literals
- Use single quotes `'` in `t()` calls; only use backticks when interpolation is needed
- Use `===` and `!==` for comparisons
- Handle all promises with `await`, `.then()`, or explicit `void`
- Use `logger.error()`, `logger.warn()`, `logger.info()`, or `logger.trace()` for logging (see [LOGGING.md](../documents/LOGGING.md))

### Don'ts ❌

- Don't use inline styles
- Don't use color/spacing literals
- Don't use `any` type
- Don't create components without TypeScript props interface
- Don't forget to handle loading and error states
- Don't use `console.log()` - it's banned by ESLint (use `logger.*` methods instead)
- Don't use `==` or `!=` - always use strict equality
- Don't leave promises unhandled (floating promises)
- Don't use `var` - use `const` or `let`
- Don't import from relative paths when aliases are available
- Don't use empty `catch {}` blocks - always log errors
- Don't use magic numbers - extract to named constants
- Don't hardcode fallback strings (e.g. `'-'`) - use `EMPTY_VALUE` from `@/constants/common`
- Don't hold mutable state in singletons
- Don't abstract until you have 3+ similar implementations
- Don't skip null-checking `route.params` when the screen param type is `undefined`
- Don't forget to handle nullable properties inside params (e.g. `id?: string`)

---

## File Naming Conventions

| Category       | Convention                          | Examples                                                   |
| -------------- | ----------------------------------- | ---------------------------------------------------------- |
| **Components** | PascalCase with `.tsx` extension    | `AuthButton.tsx`, `OTPInput.tsx`, `UserProfile.tsx`        |
| **Services**   | camelCase with `Service` suffix     | `authService.ts`, `billingService.ts`, `accountService.ts` |
| **Hooks**      | camelCase with `use` prefix         | `useApi.ts`, `useAuth.ts`, `useUserData.ts`                |
| **Context**    | PascalCase with `Context` suffix    | `AuthContext.tsx`, `NavigationContext.tsx`                 |
| **Types**      | camelCase (lowercase)               | `navigation.ts`, `api.ts`, `auth.ts`                       |
| **Utils**      | camelCase                           | `validation.ts`, `apiError.ts`, `image.ts`                 |
| **Constants**  | camelCase                           | `auth.ts`, `api.ts`, `icons.ts`                            |
| **Tests**      | Same name with `.test.ts(x)` suffix | `validation.test.ts`, `OTPInput.test.tsx`                  |
| **Styles**     | camelCase                           | `button.ts`, `authLayout.ts`, `otpInput.ts`                |
| **Config**     | kebab-case                          | `feature-flags.json`, `env.config.ts`                      |

---

## Import Ordering

Imports must follow this specific order with newlines between groups:

```typescript
// 1. React/React Native core
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// 2. Third-party libraries (alphabetized)
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

// 3. Internal imports using @ path aliases (alphabetized)
import { AuthButton } from "@/components/auth";
import { useAuth } from "@/context/AuthContext";
import { screenStyle, linkStyle } from "@/styles";
import { Color } from "@/styles/tokens";
import type { AuthStackParamList } from "@/types/navigation";
import { TestIDs } from "@/utils/testID";
```

**Rules:**

- Newlines between import groups
- Alphabetical ordering within each group (case-insensitive)
- No duplicate imports
- Type imports use `import type` syntax
- **Import order is enforced by ESLint** (`import/order` rule). Do not manually reorder imports based on code review suggestions or AI recommendations — if lint passes, the order is correct. Changing the order requires updating the ESLint config first, then fixing all files.

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
export { default as AuthButton } from "./AuthButton";
export { default as AuthInput } from "./AuthInput";
export { default as OTPInput } from "./OTPInput";

// Constants barrel file
export { AUTH_CONSTANTS } from "./auth";
export * from "./api";
export * from "./links";
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

// 5. Styles (at bottom, import from shared styles)
import { buttonStyle } from '@/styles/components';

const styles = StyleSheet.create({
  button: buttonStyle.authPrimary,
  buttonText: buttonStyle.authPrimaryText,
  secondaryButton: buttonStyle.authSecondary,
});

// Or compose from shared style tokens:
const styles = StyleSheet.create({
  buttonPrimary: {
    ...buttonStyle.common,
    ...buttonStyle.primaryLight,
    ...buttonStyle.fullWidth,
  },
  buttonPrimaryText: buttonStyle.primaryLightText,
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
type AuthState = "loading" | "unauthenticated" | "authenticated";
type TestIDSuffix = "button" | "input" | "text" | "label";
type UserId = string;
```

**Use `inline type definition for props` for:**

- When there are only one or two props
- Types are only used in this component (no need to export interface)
- Type / interface is already defined elsewhere and is imported into component

```typescript
import type MainTabItem from '@/types/navigation';

const TabStack = ({ tab }: { tab: MainTabItem }) => { ... }

const CategoryOutlined = ({ color }: { color: string }) => { ... }
```

### Naming Conventions

| Pattern        | Naming Convention           | Example                                      |
| -------------- | --------------------------- | -------------------------------------------- |
| Props          | `[ComponentName]Props`      | `AuthButtonProps`, `OTPInputProps`           |
| Context Values | `[ContextName]ContextValue` | `AuthContextValue`, `NavigationContextValue` |
| API Responses  | `[Entity]Response`          | `UserResponse`, `InvoiceResponse`            |
| Param Lists    | `[StackName]ParamList`      | `AuthStackParamList`, `MainTabParamList`     |

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

### Two-Layer Style Architecture

```
@/styles/tokens/     →  Design tokens (Color, Spacing, Typography)
        ↓
@/styles/components/ →  Shared component styles (buttonStyle, screenStyle)
        ↓
Components/Screens   →  Import shared styles, never use tokens directly
```

### In Components/Screens - Import Shared Styles

```typescript
// ✅ Correct - import from shared styles only
import { buttonStyle, screenStyle } from "@/styles/components";

const styles = StyleSheet.create({
  button: buttonStyle.authPrimary,
  buttonText: buttonStyle.authPrimaryText,
  container: screenStyle.containerCenterContent,
});

// ✅ Correct - compose from multiple shared styles
const styles = StyleSheet.create({
  buttonPrimary: {
    ...buttonStyle.common,
    ...buttonStyle.primaryLight,
    ...buttonStyle.fullWidth,
  },
  buttonPrimaryText: buttonStyle.primaryLightText,
});

// ❌ Incorrect - using design tokens directly in component
import { Color, Spacing } from "@/styles/tokens"; // Don't do this in components!

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.background.primary, // Don't do this!
    padding: Spacing.md, // Don't do this!
  },
});
```

### In @/styles/components/ - Use Design Tokens

Design tokens should **only** be used in shared style files:

```typescript
// @/styles/components/button.ts
import { Color, Spacing, BorderRadius, Typography } from "@/styles/tokens";

export const buttonStyle = {
  authPrimary: {
    height: 48,
    borderRadius: BorderRadius.xl,
    backgroundColor: Color.brand.primary,
  },
  authPrimaryText: {
    ...Typography.button,
    color: Color.brand.white,
  },
} as const;
```

### ESLint Rules

The following are enforced:

- **No inline styles** (warning) - use `StyleSheet.create()`
- **No color literals** (warning) - use design tokens in shared styles
- **No unused styles** (warning) - remove unused style definitions
  - _Exception:_ Can be bypassed for dynamic styling (e.g., styles selected at runtime based on props/state)

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
  currentAccountId: string | undefined,
) => {
  const { getInvoices } = useBillingApi();

  return usePaginatedQuery<Invoice>({
    queryKey: ["invoices", userId, currentAccountId],
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
    [api],
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
    async (
      offset = DEFAULT_OFFSET,
      limit = DEFAULT_PAGE_SIZE,
    ): Promise<PaginatedResponse<Invoice>> => {
      const endpoint =
        `/v1/billing/invoices` +
        `?select=-*,id,status` +
        `&filter(group.buyers)` +
        `&order=-audit.created.at` +
        `&offset=${offset}&limit=${limit}`;
      return api.get<PaginatedResponse<Invoice>>(endpoint);
    },
    [api],
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

  async sendPasswordlessEmail(
    email: string,
  ): Promise<Auth0PasswordlessResponse> {
    return this.auth0.auth.passwordlessWithEmail({
      email,
      send: "code",
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

### Route Params Handling

How you access `route.params` depends on the screen's param type in the navigation type map.

#### Param type is `undefined` — always null-check `route.params`

When a screen declares its params as `undefined`, React Navigation may or may not supply `params` at runtime. Always guard before accessing:

```typescript
// Navigation type map
type RootStackParamList = {
  Home: undefined; // no params
};

// ✅ Good: null-check route.params
const HomeScreen = ({ route }: HomeScreenProps) => {
  const value = route.params?.someFlag; // safe
  // ...
};

// ❌ Bad: accessing params without check
const HomeScreen = ({ route }: HomeScreenProps) => {
  const value = route.params.someFlag; // may crash at runtime
};
```

#### Param type is an object — `route.params` is guaranteed

When the type map declares a concrete params object, TypeScript guarantees `route.params` is present. No null-check is needed on `route.params` itself:

```typescript
type RootStackParamList = {
  Details: { id: string };
};

// ✅ Good: route.params is guaranteed by TypeScript
const DetailsScreen = ({ route }: DetailsScreenProps) => {
  const { id } = route.params; // safe — always defined
};
```

#### Always handle nullable properties inside params

Even when `route.params` is guaranteed, individual properties can be optional. Always handle them:

```typescript
type RootStackParamList = {
  Profile: { userId: string; tab?: string };
};

// ✅ Good: handle optional property
const ProfileScreen = ({ route }: ProfileScreenProps) => {
  const { userId, tab } = route.params;
  const activeTab = tab ?? "overview"; // default for optional param
};

// ❌ Bad: assuming optional property exists
const ProfileScreen = ({ route }: ProfileScreenProps) => {
  const { userId, tab } = route.params;
  navigation.navigate(tab); // tab may be undefined!
};
```

#### Quick reference table

| Param type definition          | `route.params` null-check needed? | Nullable properties need handling? |
| ------------------------------ | --------------------------------- | ---------------------------------- |
| `undefined`                    | **Yes** — always null-check       | N/A (no params)                    |
| `{ id: string }`               | No — guaranteed by TypeScript     | No — all required                  |
| `{ id: string; tab?: string }` | No — guaranteed by TypeScript     | **Yes** — handle `tab`             |
| `{ id: string \| undefined }`  | No — guaranteed by TypeScript     | **Yes** — handle `id`              |

---

## Testing Patterns

### Test File Structure

```typescript
import { validateOTP, validateEmail } from "@/utils/validation";

describe("Validation Utils", () => {
  describe("validateOTP", () => {
    it("should validate correct OTP codes with default length", () => {
      const validCodes = ["123456", "000000"];
      validCodes.forEach((code) => {
        expect(validateOTP(code)).toBe(true);
      });
    });

    it("should reject invalid OTP codes", () => {
      expect(validateOTP("abcdef")).toBe(false);
      expect(validateOTP("12345")).toBe(false);
      expect(validateOTP("")).toBe(false);
    });
  });

  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("invalid-email")).toBe(false);
    });
  });
});
```

### Mock Patterns

```typescript
// Mock React Native modules
jest.mock("react-native", () => ({
  View: "View",
  Text: "Text",
  StyleSheet: { create: (styles: any) => styles },
  Platform: { OS: "ios" },
}));

// Mock Auth0
jest.mock("react-native-auth0", () => {
  return jest.fn().mockImplementation(() => ({
    auth: {
      passwordlessWithEmail: jest.fn(),
      loginWithEmail: jest.fn(),
    },
  }));
});

// Mock navigation
jest.mock("@react-navigation/native", () => ({
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
  name: "API Error";
  status: number | null;
  message: string;
  details?: unknown;
};

export const createApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return {
      name: "API Error",
      status: null,
      message: error.message,
      details: error,
    };
  }
  return {
    name: "API Error",
    status: null,
    message: "Unknown error occurred",
    details: error,
  };
};

export const isUnauthorisedError = (error: unknown): boolean => {
  if (error && typeof error === "object" && "status" in error) {
    return (error as ApiError).status === 401;
  }
  return false;
};
```

### Error Handling in Components

```typescript
import { logger } from "@/services/loggerService";

try {
  await login(email, otp);
} catch (error) {
  logger.error("OTP verification error", error, { operation: "login" });

  if (error instanceof Error) {
    const translationKey =
      auth0ErrorParsingService.getTranslationKeyForError(error);
    setOtpError(t(translationKey));
  } else {
    setOtpError(t("auth.errors.unknownError"));
  }
}
```

### Security: Masking 401/403 with 404

**Security Best Practice:** To prevent information disclosure, the backend typically returns `404 Not Found` instead of `401 Unauthorized` or `403 Forbidden` when a user lacks access to a resource.

**Why?**

- `401`/`403` reveals that the resource exists but you can't access it
- Attackers can enumerate which resources exist by observing status codes
- `404` is ambiguous - resource may not exist OR you lack permission

**Implementation:**

```typescript
// ✅ Backend returns 404 for unauthorized access
GET /api/accounts/secret-account-id
→ 404 Not Found (even if account exists but user lacks access)

// ✅ Frontend treats both as "not found" for UX
if (error.status === 404) {
  showMessage("Account not found");
  // User cannot distinguish between "doesn't exist" and "no permission"
}

// ❌ Don't expose different messages for 401/403
if (error.status === 403) {
  showMessage("Access denied"); // Leaks that resource exists!
}
```

**Exceptions:**

- Authentication endpoints (login/logout) can use `401` appropriately
- Admin dashboards where security is less critical
- When explicitly documented as acceptable

---

## TestID Patterns

### TestID Constants

```typescript
// utils/testID.ts
export const TestIDs = {
  // Welcome Screen
  WELCOME_EMAIL_INPUT: "welcome-email-input",
  WELCOME_CONTINUE_BUTTON: "welcome-continue-button",

  // OTP Screen
  OTP_INPUT_PREFIX: "otp-digit-input",
  OTP_VERIFY_BUTTON: "otp-verify-button",

  // Navigation
  NAV_TAB_SPOTLIGHT: "nav-tab-spotlight",
  NAV_TAB_PROFILE: "nav-tab-profile",
};

// Helper function for dynamic TestIDs
export type TestIDSuffix = "button" | "input" | "text" | "label" | "container";

export function testID(
  screen: string,
  element: string,
  suffix: TestIDSuffix,
): string {
  return [screen, element, suffix].join("-");
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

### Shared Fallback Constants

Use the shared `EMPTY_VALUE` constant for fallback display text. Never hardcode the literal `'-'` (or similar) in components — if the fallback ever changes, it should only need updating in one place.

```typescript
import { EMPTY_VALUE } from '@/constants/common';

// ✅ Good: shared constant
<Text>{data.shortDescription || EMPTY_VALUE}</Text>

// ❌ Bad: hardcoded fallback
<Text>{data.shortDescription || '-'}</Text>
```

### Barrel File Exports

```typescript
// constants/index.ts
export { AUTH_CONSTANTS } from "./auth";
export * from "./api";
export * from "./links";
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

### Quote Style in `t()` Calls

Use **single quotes** `'...'` for static translation keys. Only use **backticks** `` `...` `` when you need string interpolation.

```typescript
// ✅ Good: single quotes for static keys
t("details.eligibility");
t("settings.title");

// ✅ Good: backticks when interpolation is needed
t(`details.${sectionKey}`);
t(`errors.${errorCode}`);

// ❌ Bad: backticks without interpolation (unnecessary)
t(`details.website`);
t(`settings.title`);
```

### Translation File Organization (i18n)

Translation keys must live in the JSON file that matches their **domain**, not in unrelated files. The existing files map to feature areas:

| File               | Domain / Contents                            |
| ------------------ | -------------------------------------------- |
| `auth.json`        | Authentication, login, OTP                   |
| `billing.json`     | Invoices, credit memos, statements           |
| `marketplace.json` | Catalog, products, sellers                   |
| `program.json`     | Programs, enrollments                        |
| `account.json`     | Account settings, profile                    |
| `navigation.json`  | Tab labels, menu items                       |
| `settings.json`    | App settings, preferences                    |
| `shared.json`      | Truly cross-cutting keys (e.g. "Loading...") |
| `status.json`      | Status labels and badges                     |
| `details.json`     | Detail screen labels                         |
| `home.json`        | Home / spotlight                             |
| `admin.json`       | Admin-specific features                      |

**Rules:**

- Place keys in the most specific file that matches the feature (e.g. product detail keys go in `marketplace.json`, not `admin.json`).
- If a new feature area warrants its own file (e.g. `catalog.json`), create it and register it in `i18n/en/index.ts`.
- Only use `shared.json` for keys genuinely reused across 3+ features.
- Don't dump unrelated keys into an existing file just because it's convenient.

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

| Text Type      | Case                    | Example                      |
| -------------- | ----------------------- | ---------------------------- |
| Button labels  | Sentence case           | "Save changes"               |
| Screen titles  | Sentence case           | "Account settings"           |
| Form labels    | Sentence case           | "Email address"              |
| Error messages | Sentence case           | "Please enter a valid email" |
| Product names  | Official capitalization | "Microsoft Azure"            |
| Brand names    | Official capitalization | "SoftwareONE"                |

---

## Architecture Principles

### Statelessness & Pure Functions

```typescript
// ✅ Good: Pure function, explicitly passed context
const isFeatureEnabled = (
  key: FeatureFlagKey,
  portalVersion: PortalVersionInfo,
): boolean => {
  return checkFeature(key, portalVersion);
};

// ❌ Bad: Hidden mutable state in singleton
class FeatureService {
  private portalVersion: PortalVersionInfo; // hidden state!
  setPortalVersion(v: PortalVersionInfo) {
    this.portalVersion = v;
  }
}
```

**Rules:**

- Prefer pure functions over stateful classes
- Pass context as parameters, don't hold globally
- No hidden shared mutable state
- Functions should be deterministic based on inputs

### Separation of Concerns

| Layer          | Responsibility                  |
| -------------- | ------------------------------- |
| **Services**   | API communication only          |
| **Contexts**   | State management & side effects |
| **Hooks**      | Data fetching logic             |
| **Components** | UI rendering                    |

### Code Organization Rules

| Rule                  | Guideline                                       |
| --------------------- | ----------------------------------------------- |
| **Rule of Three**     | Don't abstract until 3+ similar implementations |
| **File size**         | Split at ~300-400 lines                         |
| **Service size**      | Split at ~15-20 methods                         |
| **API grouping**      | Group services by API path prefix               |
| **No redundant data** | Don't pass both `id` and object containing `id` |

---

## E2E Testing Conventions

### Page Object Model (POM)

```javascript
// ✅ Good: Page object encapsulates UI interactions
class AgreementsPage extends ListPage {
  get agreementsList() {
    return $(this.getSelector("agreements-list"));
  }

  async getVisibleAgreementsCount() {
    return (await this.agreementsList.$$("item")).length;
  }
}

// ❌ Bad: Selectors and logic scattered in tests
it("test", async () => {
  const count = (await $$("~agreements-list item")).length; // Don't do this
});
```

### Method Naming Prefixes

| Prefix      | Purpose         | Example               |
| ----------- | --------------- | --------------------- |
| `get*`      | Retrieve values | `getVisibleCount()`   |
| `has*`      | Boolean checks  | `hasEmptyState()`     |
| `is*`       | State checks    | `isLoading()`         |
| `wait*`     | Async waits     | `waitForList()`       |
| `navigate*` | Navigation      | `navigateToDetails()` |

### Test Structure (AAA Pattern)

```javascript
describe("Agreements Screen", () => {
  it("should display agreements list when agreements exist", async () => {
    // Arrange
    await agreementsPage.navigateTo();

    // Act
    await agreementsPage.waitForList();

    // Assert
    expect(await agreementsPage.hasAgreements()).toBe(true);
  });

  it("should skip when no data available", function () {
    if (!hasTestData) this.skip(); // Graceful degradation
  });
});
```

### E2E Testing Rules

| Rule                      | Description                                   |
| ------------------------- | --------------------------------------------- |
| **Centralized selectors** | Platform-specific selectors in `selectors.js` |
| **Named constants**       | No magic numbers (`TIMEOUT_MS` not `30000`)   |
| **Never empty catch**     | Always log errors in catch blocks             |
| **Validate inputs**       | Check ID formats with regex                   |
| **JSDoc with @example**   | Document API client methods                   |
| **Conditional skip**      | Use `this.skip()` when prerequisites missing  |

---

## Commit & PR Naming Convention

The project follows [Conventional Commits](https://www.conventionalcommits.org/). Because GitHub auto-squash derives the merge commit message from the **PR title**, PR titles **must** follow this format.

### Format

```
<type>: <short description>
```

Optionally include a scope:

```
<type>(<scope>): <short description>
```

### Allowed Types

| Type       | Purpose                                                 |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature or user-facing change                       |
| `fix`      | Bug fix                                                 |
| `chore`    | Maintenance, dependency updates, config changes         |
| `docs`     | Documentation only                                      |
| `test`     | Adding or updating tests                                |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style`    | Formatting, whitespace — no logic changes               |
| `ci`       | CI/CD workflow changes                                  |
| `perf`     | Performance improvement                                 |
| `build`    | Build system or external dependency changes             |
| `revert`   | Reverts a previous commit                               |

### Examples

```
feat: add biometric login support
fix: resolve OTP input crash on Android
chore: bump expo to SDK 54
docs: update CONVENTIONS.md with commit rules
test: add unit tests for validation utils
refactor: extract account switching logic into hook
ci: add Android build to main CI workflow
```

### Rules

- **PR titles must use this convention** — the squash-merge commit inherits the PR title.
- Type is always lowercase (`feat`, not `Feat`).
- Description starts lowercase, no trailing period.
- Keep descriptions concise (≤ 72 characters total).
- Individual commit messages within a PR are free-form, but using the convention is encouraged.

---

## ESLint Configuration Summary

The project enforces these rules (from `app/eslint.config.js`):

### Error Level (Build Breaking)

| Rule                                      | Description                                                                                               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `react-hooks/rules-of-hooks`              | Enforce React Hooks rules                                                                                 |
| `import/order`                            | Import ordering with groups and newlines                                                                  |
| `import/no-duplicates`                    | No duplicate imports                                                                                      |
| `unused-imports/no-unused-imports`        | Remove unused imports                                                                                     |
| `no-console`                              | **Prefer `logger.*` methods** - `console.log` is banned; `console.warn/error/info` allowed for edge cases |
| `eqeqeq`                                  | Must use `===` and `!==` (no `==` or `!=`)                                                                |
| `no-var`                                  | Use `const` or `let`, never `var`                                                                         |
| `@typescript-eslint/no-floating-promises` | Must handle all promises (await, .then(), or void)                                                        |
| `prettier/prettier`                       | Code formatting via Prettier                                                                              |

### Warning Level

| Rule                                          | Description                                   |
| --------------------------------------------- | --------------------------------------------- |
| `react-hooks/exhaustive-deps`                 | Verify effect dependencies                    |
| `react-native/no-unused-styles`               | No unused StyleSheet styles                   |
| `react-native/no-inline-styles`               | Use `StyleSheet.create()` instead             |
| `react-native/no-color-literals`              | Use design tokens, not hardcoded colors       |
| `react-native/no-single-element-style-arrays` | Don't wrap single style in array              |
| `@typescript-eslint/no-unused-vars`           | No unused variables (ignores `_` prefixed)    |
| `@typescript-eslint/no-explicit-any`          | Avoid `any` type                              |
| `prefer-const`                                | Use `const` when variable is never reassigned |
| `no-debugger`                                 | No debugger statements                        |

### Disabled Rules

| Rule                       | Reason                            |
| -------------------------- | --------------------------------- |
| `react/react-in-jsx-scope` | Not needed with new JSX transform |
| `react/prop-types`         | Using TypeScript instead          |
| `react-native/no-raw-text` | Disabled for flexibility          |

---

## SonarCloud Quality Gate

SonarCloud runs on every PR and main branch push. PRs must pass the quality gate to merge.

### Conditions on New Code (PRs & All Branches)

| Metric                         | Requirement                |
| ------------------------------ | -------------------------- |
| **Coverage**                   | ≥ 80%                      |
| **Duplicated Lines**           | ≤ 3%                       |
| **Maintainability Rating**     | A                          |
| **Reliability Rating**         | A (no new bugs)            |
| **Security Rating**            | A (no new vulnerabilities) |
| **Security Hotspots Reviewed** | ≥ 50%                      |
| **Blocker Issues**             | 0                          |
| **Critical Issues**            | ≤ 1                        |
| **Major Issues**               | ≤ 3                        |
| **Code Smells**                | ≤ 30                       |

### Conditions on Overall Code (Long-lived Branches)

| Metric               | Requirement |
| -------------------- | ----------- |
| **Coverage**         | ≥ 70%       |
| **Duplicated Lines** | ≤ 1%        |

### Coverage Exclusions

The following are excluded from coverage requirements (see `sonar-project.properties`):

```
- **/__tests__/**        # Test files
- **/types/**            # Type definitions
- **/constants/**        # Constants
- **/styles/**/*.ts      # Style files
- **/hooks/queries/**    # Query hooks (mostly TanStack wrappers)
- **/i18n/**             # Translation files
- *.d.ts                 # Declaration files
- *.tsx                  # React components (UI-focused)
```

### Dashboard

- **View results:** https://sonarcloud.io/project/overview?id=softwareone-pc_mpt-mobile-platform
- **PR analysis:** Linked in PR comments automatically

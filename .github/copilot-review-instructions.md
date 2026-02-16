# Copilot Review Instructions

This is a TypeScript codebase for a React Native mobile app using Expo. There is no Python code in this project. All source code lives under the `app/` directory.

When reviewing pull requests, validate changes against the conventions defined in `CONVENTIONS.md` at the repository root. Focus on the following areas:

## File Naming

- Components use PascalCase with `.tsx` extension (e.g., `AuthButton.tsx`)
- Services use camelCase with `Service` suffix (e.g., `authService.ts`)
- Hooks use camelCase with `use` prefix (e.g., `useApi.ts`)
- Context files use PascalCase with `Context` suffix (e.g., `AuthContext.tsx`)
- Types use camelCase (e.g., `navigation.ts`)
- Tests use the same name with `.test.ts(x)` suffix
- Config files use kebab-case (e.g., `feature-flags.json`)

## Import Ordering

Imports must follow this order with newlines between groups:

1. React/React Native core
2. Third-party libraries (alphabetized)
3. Internal imports using `@/` path aliases (alphabetized)

Type imports must use `import type` syntax.

## TypeScript

- Use `interface` for object shapes, props, API responses, and context values
- Use `type` for unions, primitives, and simple aliases
- Props interfaces must use `[ComponentName]Props` naming
- Avoid `any` type
- Use generics for reusable functions and hooks

## Component Structure

Components must follow this ordering:

1. Imports
2. Helper functions (pure functions, outside component)
3. Interface/type definitions
4. Component definition using `React.FC` pattern
5. Styles (using `StyleSheet.create`, imported from `@/styles/components`)
6. Default export

## Style Patterns

- Never use inline styles; use `StyleSheet.create()`
- Never use color or spacing literals; use design tokens via shared styles
- Components import from `@/styles/components`, never directly from `@/styles/tokens`
- Design tokens are only used inside `@/styles/components/` files

## Banned Practices

- No `console.log()` — only `console.error()`, `console.warn()`, `console.info()` are allowed
- No `==` or `!=` — always use `===` and `!==`
- No `var` — use `const` or `let`
- No floating promises — handle with `await`, `.then()`, or explicit `void`
- No unused imports or variables (variables prefixed with `_` are exempt)
- No empty `catch {}` blocks — always log errors
- No magic numbers — extract to named constants

## Testing

- Tests must be written as functions, not classes
- Follow AAA (Arrange-Act-Assert) pattern strictly
- No `if` statements or branching logic inside tests
- Prefer fixtures over mocks
- Use `it.each` or `describe.each` for testing permutations of the same behavior
- When mocking is unavoidable, always use `jest.fn()` with proper type constraints

## Text and Copy

- All user-facing text must use sentence case (e.g., "Save changes" not "Save Changes")
- Proper nouns and brand names retain their official capitalization
- Use i18n translations (`t()`) instead of hardcoded strings

## Context and Hook Patterns

- Create context with `undefined` default value
- Provider components must include a custom hook with error handling for missing provider
- Use `useCallback` and `useMemo` for performance
- Query hooks should use TanStack React Query patterns

## Error Handling

- Components must handle both loading and error states
- Use typed `ApiError` for API errors
- Never leave errors unhandled

## Architecture

- Prefer pure functions over stateful classes
- Pass context as parameters, don't hold globally
- No hidden shared mutable state
- Follow Rule of Three — don't abstract until 3+ similar implementations
- Split files at ~300-400 lines

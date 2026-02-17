# Copilot Review Instructions

This is a TypeScript codebase for a React Native mobile app using Expo. There is no Python code in this project.

## Sources of Truth

All coding conventions and project context are maintained in two files. Always read and apply them when reviewing:

- **`CONVENTIONS.md`** (repository root) — The single source of truth for all coding standards including file naming, import ordering, TypeScript patterns, component structure, style patterns, testing, error handling, and architecture principles.
- **`CLAUDE.md`** (repository root) — The single source of truth for project context including tech stack, project structure, dependencies, state management, navigation, API integration, and development commands.

Do not rely on rules stated in this file alone. Always validate PR changes against the full and current content of `CONVENTIONS.md` and `CLAUDE.md`.

## PR Review Guidelines

When reviewing a pull request, check the following in addition to the conventions:

### Change Quality

- Every changed file must have a clear purpose related to the PR description
- No unrelated changes should be bundled into the PR
- New files must follow the established directory structure defined in `CLAUDE.md`
- File sizes should stay under ~300-400 lines; suggest splitting if exceeded

### Test Coverage

- New utilities, services, and hooks must include corresponding test files
- Tests must exist alongside source files in `__tests__` directories
- Modified logic should have updated or new tests covering the changes
- Test files must use `.test.ts` or `.test.tsx` extensions

### Backwards Compatibility

- Changes to shared components, hooks, or contexts must not break existing consumers
- Changes to API service functions must maintain their existing signatures or be additive
- Changes to navigation types must be compatible with all screens using them

### Dependencies

- New dependencies must be justified and not duplicate existing functionality
- No dependencies with known security vulnerabilities

### Internationalization

- All user-facing strings must use `t()` from `react-i18next`, not hardcoded text
- New translation keys must be added to the appropriate file in `app/src/i18n/en/`

### Type Safety

- No new occurrences of `any` type
- No type assertions (`as`) unless strictly necessary with a justifying comment
- New interfaces and types must follow the naming conventions in `CONVENTIONS.md`

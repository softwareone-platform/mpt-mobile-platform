# Logging & Telemetry

Centralized logging with environment-aware filtering and automatic AppInsights integration.

## Quick Guide

### Available Log Levels

```typescript
import { logger } from "@/services/loggerService";

logger.debug("Detailed debug info", { operation: "functionName" });
logger.info("General information", { operation: "functionName" });
logger.warn("Warning message", { operation: "functionName" });
logger.error("Error occurred", error, { operation: "functionName" });
logger.trace("Critical business event", { operation: "functionName" });
```

### When to Use Each Level

| Level   | Use Case                                               | Example                              |
| ------- | ------------------------------------------------------ | ------------------------------------ |
| `debug` | Detailed debugging, development                        | "Request payload: {...}"             |
| `info`  | General information flow                               | "User profile loaded"                |
| `warn`  | Non-critical issues                                    | "API retry attempt 2/3"              |
| `error` | Errors and exceptions                                  | "Failed to load user data"           |
| `trace` | **Critical business events (always logged, wildcard)** | "User logged in", "Account switched" |

### Environment Behavior

Log levels have a priority system. Setting `LOG_LEVEL` enables that level and all higher-priority levels.

**Note:** `trace` is a wildcard that **always logs** regardless of `LOG_LEVEL` setting.

| `LOG_LEVEL`        | `debug`                  | `info`                   | `warn`                   | `error`                  | `trace` (wildcard)       |
| ------------------ | ------------------------ | ------------------------ | ------------------------ | ------------------------ | ------------------------ |
| **debug**          | ✅ Console + AppInsights | ✅ Console + AppInsights | ✅ Console + AppInsights | ✅ Console + AppInsights | ✅ Console + AppInsights |
| **info** (default) | ❌                       | ✅ Console + AppInsights | ✅ Console + AppInsights | ✅ Console + AppInsights | ✅ Console + AppInsights |
| **warn**           | ❌                       | ❌                       | ✅ Console + AppInsights | ✅ Console + AppInsights | ✅ Console + AppInsights |
| **error**          | ❌                       | ❌                       | ❌                       | ✅ Console + AppInsights | ✅ Console + AppInsights |

### Context Format

**Always include `operation`** - the only required field:

```typescript
logger.info("Operation completed", { operation: "loadUserProfile" });
logger.error("Operation failed", error, { operation: "saveSettings" });
```

**Optional fields** (use sparingly):

```typescript
{
  operation: 'required',
  userId: '123',        // User identifier (optional)
  accountId: '456',     // Account identifier (optional)
  // Any other relevant data
}
```

## AppInsights Integration

**Automatic behavior:**

- If log level is enabled for environment → logs to **both console and AppInsights**
- `warn`/`error` → sends `trackTrace` to AppInsights
- `error` with Error object → also sends `trackException` to AppInsights
- No manual AppInsights calls needed (except for `trackEvent` for business metrics)

## Business Events vs Logs

**Use `logger.trace()` for critical business events:**

```typescript
logger.trace("User logged in", { operation: "login" });
logger.trace("Account switched", { operation: "switchAccount" });
```

**Note:** `trace` always logs to console and AppInsights, regardless of `LOG_LEVEL` configuration. Use it for events you always want to track in production.

**Use `appInsightsService.trackEvent()` for metrics:**

```typescript
appInsightsService.trackEvent({
  name: "FeatureUsed",
  properties: { feature: "darkMode", enabled: true },
});
```

## Migration from console.\*

❌ **Don't:**

```typescript
console.log("Something happened"); // Banned by ESLint
console.info("User logged in");
console.error("Error:", error);
```

✅ **Do:**

```typescript
logger.trace("User logged in", { operation: "login" });
logger.error("Error occurred", error, { operation: "loadData" });
```

## Configuration

Set log level via `LOG_LEVEL` environment variable:

- `debug` - All logs (most verbose)
- `info` - Info and above (default)
- `warn` - Warnings and above
- `error` - Errors only (least verbose)

**Priority system:** Higher log levels include all higher-priority logs. `trace` is a wildcard that always logs regardless of `LOG_LEVEL`.

- `error` - Errors only (least verbose)

**Priority system:** Higher log levels include all higher-priority logs. `trace` is always included regardless of configured level.

See [loggerService.ts](../app/src/services/loggerService.ts) for implementation.

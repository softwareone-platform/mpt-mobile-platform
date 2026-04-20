# Appium Version & Binary Sync

This document explains why different Appium versions may be observed on a machine, where Appium binaries can come from, and how to ensure the Appium server the test scripts start matches the version referenced in the project `package.json`.

Why versions get out of sync
- Global installs: `npm install -g appium@x` places a binary on your PATH (e.g. `/usr/local/bin/appium`).
- Local project install: `npm install --save-dev appium@x` installs `node_modules/.bin/appium` — this is project-scoped.
- `npx appium@x` downloads/uses the requested version on demand.
- Different shells / PATH ordering: a different `appium` in PATH may be invoked depending on the environment (CI vs interactive shell).
- Multiple package managers or wrapper scripts may shadow the binary (Homebrew, custom wrappers).

Notes about Python virtualenvs:
- The Appium *server* is the Node.js `appium` package; Python virtualenvs normally contain the Appium *client* (Appium Python client), not the server. If you see `appium` from a Python venv, it's likely a wrapper script or a PATH confusion.

How the test script chooses which Appium to run
- The script reads the `app/package.json` dependency for `appium` (devDependencies or dependencies) and tries to prefer:
  1. `node_modules/.bin/appium` when its version matches the requested version
  2. `npx appium@<requested>` to run the exact requested version
  3. Global `appium` binary (falls back, with a warning if versions differ)
- Use the `--force-global` flag to force using the globally installed `appium` even if a local or npx option is available.

Quick checks to diagnose versions
```bash
# Show the global binary in PATH
which appium
command -v appium
# Show all appium found on PATH
type -a appium
# Check global version
appium --version
# Check local project-installed version (run inside app/)
./node_modules/.bin/appium --version || npx appium --version
# Check package.json declared version
node -e "console.log(require('./app/package.json').devDependencies?.appium||require('./app/package.json').dependencies?.appium||'')"
# List global npm-installed appium
npm list -g --depth=0 | grep appium || true
# List project-installed appium
(cd app && npm list --depth=0 | grep appium) || true
```

How to make them consistent
- Preferred: keep `appium` in `app/package.json` (devDependencies) and run `npm ci` in `app/` before test runs. The script will then prefer the local binary.
  ```bash
  cd app
  npm ci
  ```
- To run a specific version without installing locally: `npx appium@<version>`
- To update the global binary (if you rely on it):
  ```bash
  npm install -g appium@3.1.1
  ```
- If you use CI, ensure the CI runner either installs the same global `appium` or runs `npm ci` and uses `npx appium@<version>`.

Commands to fix common problems
```bash
# Install project-local appium matching package.json
cd app
npm install --save-dev appium@$(node -e "console.log(require('./package.json').devDependencies?.appium||require('./package.json').dependencies?.appium||'')")

# Or explicitly install a matching version globally
npm install -g appium@3.1.1

# Use the script with force-global (if you want the global binary)
./scripts/run-local-test.sh --force-global welcome
```

If you still see an unexpected older Appium server after starting the script:
- Inspect the PID and the executable path:
```bash
ps -fp <PID>
ls -l $(command -v appium)
```
- Check `/tmp/appium.log` (the script redirects Appium logs there) for driver versions and server banner to identify which server binary is running.

## Appium Driver CLI Command Syntax (Common Pitfall)

`appium driver` subcommands are ordered as:

```bash
appium driver <subcommand> <driver-name> [flags]
```

Examples:

```bash
# ✅ Correct
appium driver update xcuitest
appium driver update uiautomator2

# ❌ Wrong order (will fail with "invalid choice")
appium driver xcuitest update
```

Major driver updates are blocked by default and require explicit opt-in:

```bash
appium driver update uiautomator2 --unsafe
```

Use `--unsafe` only when you intentionally accept potential breaking changes.

## Not All `/session` Timeouts Are Version Mismatch

If WDIO shows:

- `WebDriverError: The operation was aborted due to timeout` on `POST /session`
- `Unable to start WebDriverAgent session`
- `connect ECONNREFUSED 127.0.0.1:8100`

then the root cause is often iOS WebDriverAgent (WDA) startup/build failure, not Appium binary mismatch.

Typical Appium log signs in `/tmp/appium.log`:

- `xcodebuild exited with code '65'`
- retries around WDA startup

This means Appium is running but WDA did not come up on port `8100`.

Quick checks:

```bash
# Appium server log (WDA/xcodebuild errors)
tail -n 200 /tmp/appium.log

# WDIO worker log for this run
tail -n 200 app/test-results/logs/ios-*/wdio.log
```

Concrete failure signature seen in this project:

- `fatal error: module file .../ExplicitPrecompiledModules/Foundation-*.pcm not found`
- `Unable to Install “WebDriverAgentRunner-Runner”`
- `XCUnit.framework/Info.plist missing .../com.apple.mobile.installd.staging/...`

This usually indicates stale/corrupted WDA derived data or simulator install staging artifacts.

Recovery commands:

```bash
# 1) Stop any running Appium server first
pkill -f appium || true

# 2) Clear WDA derived data used by this project
rm -rf /tmp/wda-derived-data

# 3) (Optional but useful) reset simulator install staging state
xcrun simctl shutdown all
xcrun simctl boot <SIMULATOR_UDID>

# 4) Re-run test with verbose logs
./scripts/run-local-test.sh -p ios --skip-build welcome --verbose
```

For this repo, `scripts/run-local-test.sh` now clears `/tmp/wda-derived-data` automatically before iOS test execution.

Project-specific note:

- `scripts/run-local-test.sh` now prefers the currently booted iOS simulator (UDID/name/version) when `DEVICE_UDID`, `DEVICE_NAME`, or `PLATFORM_VERSION` are not set, reducing failures caused by stale hardcoded simulator defaults.
- `scripts/setup-test-env.sh` now resolves iOS simulator `DEVICE_UDID`, `DEVICE_NAME`, and `PLATFORM_VERSION` from the selected `--start-emulator` simulator (exact name), and otherwise falls back to the currently booted simulator when available.
- In `app/wdio.conf.js`, `appium:launchTimeout` is removed because newer `xcuitest` driver versions report it as unrecognized.

If you want, I can also add CI instructions to pin the Appium server used in GitHub Actions.

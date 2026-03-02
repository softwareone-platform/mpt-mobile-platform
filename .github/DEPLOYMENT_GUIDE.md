# Deployment Guide — Test, QA & Production

This document explains how builds are promoted through environments (test → QA → prod) using the **iOS TestFlight Deployment** workflow.

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Source of truth for version** | `app/app.config.js` — `version` and `buildNumber` fields |
| **Deployment workflow** | `.github/workflows/ios-testflight.yml` — manual dispatch only |
| **Version bump types** | `none`, `build`, `patch`, `minor`, `major` |
| **Environments** | `test`, `qa`, `prod` — each with its own secrets/variables |
| **Git tags** | Created automatically on every successful deployment (e.g. `v1.4.1-build8-test`) |
| **Chore PR** | Auto-created when version is bumped, to sync `app.config.js` back to `main` |

## How the Workflow Works

The TestFlight workflow (`ios-testflight.yml`) is triggered manually from the **Actions** tab. You select:

1. **Version bump type** — determines how the version/build number changes
2. **Target environment** — `test`, `qa`, or `prod`

On every run the workflow:

1. Checks out the selected ref (branch or tag)
2. Runs tests
3. Bumps the version in `app.config.js` (unless `none`)
4. Builds, signs, and uploads the IPA to TestFlight
5. Tags the **build commit** (e.g. `v1.4.1-build8-qa`)
6. Creates a chore PR to merge the version bump back to `main` (only when bump ≠ `none`)

---

## Option A: Sequential Deployment (Recommended)

Deploy from `main` branch, promoting through environments sequentially. The version bump PR is merged between the first deployment and subsequent ones.

### Flow Diagram

```
 main branch
   │
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ Step 1: Deploy to TEST                                   │
   │  │   Trigger: main branch                                   │
   │  │   Version bump: build / patch / minor / major            │
   │  │                                                          │
   │  │   → Builds & uploads to TestFlight (test)                │
   │  │   → Creates git tag: v1.5.0-build1-test                  │
   │  │   → Creates chore PR: "bump version to 1.5.0 build 1"   │
   │  └──────────────────────────────────────────────────────────┘
   │
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ Step 2: Merge the chore PR                               │
   │  │                                                          │
   │  │   main now has version 1.5.0 build 1 in app.config.js   │
   │  └──────────────────────────────────────────────────────────┘
   │
   ▼
 main (version synced)
   │
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ Step 3: Deploy to QA                                     │
   │  │   Trigger: main branch                                   │
   │  │   Version bump: none  ← important!                       │
   │  │                                                          │
   │  │   → Builds & uploads to TestFlight (qa)                  │
   │  │   → Creates git tag: v1.5.0-build1-qa                    │
   │  │   → No chore PR (bump = none)                            │
   │  └──────────────────────────────────────────────────────────┘
   │
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ Step 4: Deploy to PROD                                   │
   │  │   Trigger: main branch                                   │
   │  │   Version bump: none  ← important!                       │
   │  │                                                          │
   │  │   → Builds & uploads to TestFlight (prod)                │
   │  │   → Creates git tag: v1.5.0-build1-prod                  │
   │  │   → No chore PR (bump = none)                            │
   │  └──────────────────────────────────────────────────────────┘
```

### Step-by-Step

#### 1. Deploy to Test (with version bump)

1. Go to **Actions** → **iOS TestFlight Deployment** → **Run workflow**
2. Select branch: `main`
3. Version bump: choose `build`, `patch`, `minor`, or `major`
4. Environment: `test`
5. Click **Run workflow**

After success:
- The build is uploaded to TestFlight under the **test** environment
- A git tag like `v1.5.0-build1-test` is created on the build commit
- A chore PR is opened: `chore: bump version to 1.5.0 build 1`

#### 2. Merge the Chore PR

Review and merge the auto-generated PR. This updates `app.config.js` on `main` so the source code version matches what was deployed.

#### 3. Deploy to QA (no version bump)

1. Go to **Actions** → **iOS TestFlight Deployment** → **Run workflow**
2. Select branch: `main` (now contains the merged version bump)
3. Version bump: **`none`**
4. Environment: `qa`
5. Click **Run workflow**

Because `main` already has the correct version and bump is `none`, the identical version is built. No chore PR is created.

#### 4. Deploy to Prod (no version bump)

Same as QA but select environment: `prod`.

### Why This Works

- The version bump happens once (test deployment) and is merged to `main`
- QA and prod deployments use `none` — they read the already-bumped version from `main`
- All three environments end up with the **same version and build number** on App Store Connect
- Only **one chore PR** is created for the entire promotion cycle

---

## Option B: Deploy from Git Tag

Use the git tag created by a prior deployment to deploy the exact same commit to another environment. This is useful when you want to guarantee the same commit is deployed everywhere, regardless of what has landed on `main` since.

### Flow Diagram

```
 main branch
   │
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ Step 1: Deploy to TEST (same as Option A)                │
   │  │   Trigger: main branch                                   │
   │  │   Version bump: patch (e.g. 1.4.1 → 1.5.0)              │
   │  │                                                          │
   │  │   → Tag created: v1.5.0-build1-test                      │
   │  │   → Chore PR created                                     │
   │  └──────────────────────────────────────────────────────────┘
   │
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ Step 2: Merge the chore PR                               │
   │  └──────────────────────────────────────────────────────────┘
   │
   ▼
 Tag: v1.5.0-build1-test  (points to the original build commit)
   │
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ Step 3: Deploy to QA from TAG                            │
   │  │   Trigger: tag v1.5.0-build1-test                        │
   │  │   Version bump: same as step 1 (e.g. patch)  ← critical │
   │  │                                                          │
   │  │   → Tag created: v1.5.0-build1-qa                        │
   │  │   → Chore PR created (IGNORE — already merged)           │
   │  └──────────────────────────────────────────────────────────┘
   │
   │  ┌──────────────────────────────────────────────────────────┐
   │  │ Step 4: Deploy to PROD from TAG                          │
   │  │   Trigger: tag v1.5.0-build1-test                        │
   │  │   Version bump: same as step 1 (e.g. patch)  ← critical │
   │  │                                                          │
   │  │   → Tag created: v1.5.0-build1-prod                      │
   │  │   → Chore PR created (IGNORE — already merged)           │
   │  └──────────────────────────────────────────────────────────┘
```

### Step-by-Step

#### 1. Deploy to Test (with version bump)

Same as Option A step 1. A git tag is created on success.

#### 2. Merge the Chore PR

Same as Option A step 2.

#### 3. Deploy to QA from the Git Tag

1. Go to **Actions** → **iOS TestFlight Deployment** → **Run workflow**
2. **Select the git tag** (e.g. `v1.5.0-build1-test`) as the ref — not `main`
3. Version bump: **use the same bump type as step 1** (e.g. `patch`)
4. Environment: `qa`
5. Click **Run workflow**

#### 4. Deploy to Prod from the Git Tag

Same as step 3 but select environment: `prod`.

### Why You Must Repeat the Same Version Bump

The git tag points to the commit **before** the chore PR was merged. At that commit, `app.config.js` still has the **old** version number. The workflow bumps the version during the build, so:

- `none` → old version is used → **version mismatch** on App Store Connect
- Same bump type → version is re-calculated to the same value → **versions match**

The build artifact is identical in both cases (same source commit, same dependencies), but App Store Connect requires version/build numbers to match across environments.

### Handling Duplicate Chore PRs

When deploying from a tag with a version bump, the workflow creates a new chore PR for each environment. Since the chore PR from the test deployment was already merged, these subsequent PRs are redundant.

**Action required:** Close the duplicate chore PRs without merging. They will target `main` with the same version change that's already there.

> **Tip:** You can identify duplicate PRs by their title — they'll all say `chore: bump version to X.Y.Z build N`. Only the first one (from the test deployment) needs to be merged.

---

## Option A vs Option B — When to Use Which

| | Option A (Sequential) | Option B (Git Tag) |
|---|---|---|
| **Guarantees same commit** | Only if no new commits land on `main` between deployments | Yes — always the exact same commit |
| **Chore PRs to manage** | 1 (from test) | 1 real + 1–2 to close (from QA/prod) |
| **Version bump selection** | `none` for QA/prod | Must repeat same bump type |
| **Complexity** | Simpler | Slightly more involved |
| **Best for** | Fast promotion when `main` is stable | When `main` has moved ahead and you want to deploy a specific commit |

**Recommendation:** Use **Option A** for most releases. Use **Option B** when you need to guarantee the exact commit deployed to test is what goes to QA/prod, especially if `main` has received new merges since the test deployment.

---

## Version Bump Types Reference

| Type | Example (from 1.4.1 build 7) | When to use |
|------|------|-------------|
| `major` | → 2.0.0 build 1 | Breaking changes, major redesigns |
| `minor` | → 1.5.0 build 1 | New features, significant enhancements |
| `patch` | → 1.4.2 build 1 | Bug fixes, small improvements |
| `build` | → 1.4.1 build 8 | Same version, new build (default) |
| `none` | → 1.4.1 build 7 | Re-deploy same version (promotion) |

> `major`, `minor`, and `patch` bumps reset the build number to 1.

---

## Git Tags

Every successful deployment creates a tag in the format:

```
v{version}-build{buildNumber}-{environment}
```

Examples:
- `v1.5.0-build1-test`
- `v1.5.0-build1-qa`
- `v1.5.0-build1-prod`

Tags are placed on the **build commit** (the commit that was checked out for the build), not on `main` after the chore PR merge.

To list all deployment tags:

```bash
git tag -l "v*-build*"
```

---

## End-to-End Example

Starting from version `1.4.1 build 7` in `app.config.js` on `main`:

### Using Option A

```
1. Deploy to test:   main, bump=patch  → builds 1.4.2 build 1, tag: v1.4.2-build1-test, chore PR opened
2. Merge chore PR:   main now has 1.4.2 build 1
3. Deploy to QA:     main, bump=none   → builds 1.4.2 build 1, tag: v1.4.2-build1-qa
4. Deploy to prod:   main, bump=none   → builds 1.4.2 build 1, tag: v1.4.2-build1-prod

Result: all environments have 1.4.2 (1), one chore PR merged.
```

### Using Option B

```
1. Deploy to test:   main, bump=patch  → builds 1.4.2 build 1, tag: v1.4.2-build1-test, chore PR opened
2. Merge chore PR:   main now has 1.4.2 build 1
3. Deploy to QA:     tag v1.4.2-build1-test, bump=patch  → builds 1.4.2 build 1, tag: v1.4.2-build1-qa, duplicate PR (close it)
4. Deploy to prod:   tag v1.4.2-build1-test, bump=patch  → builds 1.4.2 build 1, tag: v1.4.2-build1-prod, duplicate PR (close it)

Result: all environments have 1.4.2 (1), one chore PR merged, two duplicate PRs closed.
```

---

## Troubleshooting

### QA/Prod build has a different version than test

**Cause:** Used Option A but forgot to merge the chore PR before deploying to QA/prod, so `main` still had the old version.

**Fix:** Merge the chore PR first, then re-deploy to QA/prod with `bump=none`.

### QA/Prod build from tag has the old version

**Cause:** Used Option B with `bump=none`. The tag points to the pre-bump commit, so the old version was used.

**Fix:** Re-deploy from the same tag with the **same bump type** used for the test deployment.

### Duplicate chore PR conflicts with main

**Cause:** Deployed from tag (Option B) and the chore PR shows merge conflicts because `main` already has the version bump.

**Fix:** Close the duplicate PR without merging — the version is already correct on `main`.

### Tag already exists error

**Cause:** Deploying the same version+build+environment combination twice.

**Fix:** The workflow handles this gracefully with a warning. The existing tag is preserved.

---

## Related Documentation

- [TestFlight Setup Checklist](.github/TESTFLIGHT_SETUP.md) — secrets, certificates, and first-time setup
- [iOS TestFlight Workflow](.github/workflows/ios-testflight.yml) — the workflow source
- [CONVENTIONS.md](CONVENTIONS.md) — commit and PR naming conventions

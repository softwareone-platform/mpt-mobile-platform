# Copilot Code Review Setup

This repository is configured with custom review instructions in `.github/copilot-review-instructions.md` that GitHub Copilot uses when reviewing pull requests. The instructions enforce the coding conventions defined in `CONVENTIONS.md`.

## Enabling automatic Copilot code review

Copilot code review is a native GitHub feature enabled through repository settings, not through GitHub Actions workflows.

### Steps

1. Go to the repository **Settings** → **Copilot** → **Code review**
2. Enable **automatic code review** for pull requests
3. Copilot will automatically review new PRs and provide comments based on the instructions in `.github/copilot-review-instructions.md`

### Requesting a review manually

On any open pull request, click **Reviewers** in the sidebar and select **Copilot** from the suggested reviewers list.

### Prerequisites

- The organization must have a **GitHub Copilot Enterprise** or **GitHub Copilot Business** plan with code review enabled
- An organization admin must enable Copilot code review in **Organization settings** → **Copilot** → **Policies** → **Code review**
- Repository access must be granted under **Organization settings** → **Copilot** → **Policies** → **Repository access**

### How it works

- When Copilot reviews a PR, it reads `.github/copilot-review-instructions.md` for custom guidelines
- Reviews cover file naming, import ordering, TypeScript patterns, component structure, style patterns, testing, and architecture
- Copilot posts inline review comments on specific lines that violate the conventions
- The review runs alongside existing CI checks (linting, tests, SonarCloud) defined in `pr-build.yml`

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Copilot not appearing in reviewers list | Verify Copilot code review is enabled in organization and repository settings |
| Reviews not triggered automatically | Enable automatic review in **Settings** → **Copilot** → **Code review** |
| Copilot not following custom instructions | Verify `.github/copilot-review-instructions.md` exists and is on the default branch |

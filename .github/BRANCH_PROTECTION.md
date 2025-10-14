# Branch Protection Rules Setup

This guide explains how to configure branch protection rules in GitHub to enforce the branching strategy.

## Why Branch Protection?

Branch protection rules prevent:

- Direct commits to important branches
- Force pushes that rewrite history
- Merging code that doesn't pass CI checks
- Merging without code review

## Setup Instructions

### Navigate to Settings

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Branches** in the left sidebar
4. Click **Add branch protection rule**

---

## Protection Rules by Branch

### 1. `main` Branch (Production)

**Branch name pattern**: `main`

**Settings to enable:**

- ✅ **Require a pull request before merging**
  - ✅ **Require approvals**: `2` (two reviewers)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ✅ **Require review from Code Owners** (optional, if you have CODEOWNERS file)

- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - **Status checks to require:**
    - `Validate Android`
    - `Validate iOS`
    - `Determine Environment`

- ✅ **Require conversation resolution before merging**

- ✅ **Require linear history** (optional, enforces rebase/squash merging)

- ✅ **Do not allow bypassing the above settings**

- ❌ **Allow force pushes**: Disabled
- ❌ **Allow deletions**: Disabled

**Restrictions:**

- **Restrict who can push to matching branches**: Add only CI/CD service account or senior developers

---

### 2. `uat` Branch

**Branch name pattern**: `uat`

**Settings to enable:**

- ✅ **Require a pull request before merging**
  - ✅ **Require approvals**: `2`
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**

- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - **Status checks to require:**
    - `Validate Android`
    - `Validate iOS`

- ✅ **Require conversation resolution before merging**

- ❌ **Allow force pushes**: Disabled
- ❌ **Allow deletions**: Disabled

---

### 3. `qa` Branch

**Branch name pattern**: `qa`

**Settings to enable:**

- ✅ **Require a pull request before merging**
  - ✅ **Require approvals**: `1`
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**

- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - **Status checks to require:**
    - `Validate Android`
    - `Validate iOS`

- ✅ **Require conversation resolution before merging**

- ❌ **Allow force pushes**: Disabled
- ❌ **Allow deletions**: Disabled

---

### 4. `develop` Branch

**Branch name pattern**: `develop`

**Settings to enable:**

- ✅ **Require a pull request before merging**
  - ✅ **Require approvals**: `1`
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**

- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - **Status checks to require:**
    - `Validate Android`
    - `Validate iOS`

- ✅ **Require conversation resolution before merging**

- ❌ **Allow force pushes**: Disabled
- ❌ **Allow deletions**: Disabled

---

## Status Checks Setup

### How to add status checks

Status checks won't appear in the list until they've run at least once. To make them available:

1. Create a PR to the branch you're protecting
2. Wait for CI checks to run
3. Go back to branch protection settings
4. The status checks will now appear in the searchable list
5. Select the required checks

### Required Status Checks by Branch

| Branch    | Required Status Checks                                      |
| --------- | ----------------------------------------------------------- |
| `main`    | `Validate Android`, `Validate iOS`, `Determine Environment` |
| `uat`     | `Validate Android`, `Validate iOS`                          |
| `qa`      | `Validate Android`, `Validate iOS`                          |
| `develop` | `Validate Android`, `Validate iOS`                          |

---

## CODEOWNERS File (Optional)

Create a `.github/CODEOWNERS` file to automatically request reviews from specific people or teams:

```
# Default owners for everything in the repo
*       @your-github-username @team-lead

# Platform-specific code
/ios/   @ios-team-lead
/android/ @android-team-lead

# CI/CD workflows
/.github/workflows/ @devops-team

# Configuration files
*.config.js @senior-dev
*.json @senior-dev
```

Then enable **"Require review from Code Owners"** in branch protection.

---

## Rulesets (Alternative to Branch Protection Rules)

GitHub now offers **Rulesets** as a more powerful alternative. To use rulesets:

1. Go to **Settings** → **Rules** → **Rulesets**
2. Click **New ruleset** → **New branch ruleset**
3. Configure similar rules as above
4. Rulesets can target multiple branches with one rule

**Advantages of Rulesets:**

- Apply rules to multiple branches at once
- More granular control
- Better organization
- Can apply to tags as well

---

## Testing Branch Protection

After setting up, test that it works:

```bash
# This should fail
git checkout main
git commit --allow-empty -m "test"
git push origin main
# Expected: "remote: error: GH006: Protected branch update failed"

# This should work
git checkout -b feature/test-protection
git commit --allow-empty -m "test"
git push origin feature/test-protection
# Create PR and verify approval is required
```

---

## Troubleshooting

### "Required status check is not found"

**Cause**: The status check hasn't run yet
**Solution**: Create a test PR, let CI run, then add the status check to protection rules

### "Cannot push to protected branch"

**Cause**: Branch protection is working correctly
**Solution**: Create a PR instead of pushing directly

### "Status checks failed"

**Cause**: CI checks (lint, tests, builds) are failing
**Solution**: Fix the failing checks before merging

### Admin bypass

Repository admins can bypass branch protection by default. To prevent this:

- Enable **"Do not allow bypassing the above settings"**
- Or use **Rulesets** with enforcement for admins

---

## Summary Checklist

- [ ] Configure protection for `main` (2 approvals, all status checks)
- [ ] Configure protection for `uat` (2 approvals, all status checks)
- [ ] Configure protection for `qa` (1 approval, all status checks)
- [ ] Configure protection for `develop` (1 approval, all status checks)
- [ ] Add required status checks after first PR run
- [ ] Create CODEOWNERS file (optional)
- [ ] Test branch protection with a test commit
- [ ] Document any team-specific variations

For more information, see [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

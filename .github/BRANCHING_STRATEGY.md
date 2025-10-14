# Branching Strategy

This project uses a **GitFlow-inspired** branching strategy optimized for mobile app development with multiple environments.

## Branch Structure

```
main (production)
  ↑
uat (user acceptance testing)
  ↑
qa (quality assurance)
  ↑
develop (development)
  ↑
feature/* (feature branches)
```

## Branches

### `main` - Production

- **Purpose**: Production-ready code
- **Triggers**: Tag-based releases (`v*.*.*`)
- **Protection**: Highly protected, requires PR approval
- **Deployment**: Builds and deploys to production App Store & Play Store
- **Merge from**: `uat` only
- **Direct commits**: ❌ Never

### `uat` - User Acceptance Testing

- **Purpose**: Pre-production testing environment
- **Triggers**: Push to `uat` branch
- **Protection**: Requires PR approval
- **Deployment**: Builds and deploys to UAT environment (private stores)
- **Merge from**: `qa` only
- **Direct commits**: ❌ Never

### `qa` - Quality Assurance

- **Purpose**: QA testing environment
- **Triggers**: Push to `qa` branch
- **Protection**: Requires PR approval
- **Deployment**: Builds and deploys to QA environment (private stores)
- **Merge from**: `develop` only
- **Direct commits**: ❌ Never

### `develop` - Development

- **Purpose**: Integration branch for active development
- **Triggers**: Push to `develop` branch
- **Protection**: Requires PR approval, passing CI checks
- **Deployment**: Builds and deploys to dev environment (private stores)
- **Merge from**: `feature/*` branches
- **Direct commits**: ❌ Never (except hotfixes in emergency)

### `feature/*` - Feature Branches

- **Purpose**: Individual feature development
- **Naming**: `feature/ticket-123-description` or `feature/short-description`
- **Created from**: `develop`
- **Merged to**: `develop` via Pull Request
- **Lifecycle**: Delete after merge
- **Direct commits**: ✅ Yes

## Workflow

### 1. Feature Development

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/add-login-screen

# Work on feature
git add .
git commit -m "feat: add login screen"
git push origin feature/add-login-screen

# Create PR to develop
# After approval and CI passes, merge and delete branch
```

### 2. Environment Promotion

```bash
# Promote develop → qa
git checkout qa
git pull origin qa
git merge develop
git push origin qa

# Promote qa → uat
git checkout uat
git pull origin uat
git merge qa
git push origin uat

# Promote uat → main
git checkout main
git pull origin main
git merge uat
git push origin main
```

### 3. Production Release

```bash
# After merging to main, tag the release
git checkout main
git pull origin main
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# This triggers the production CI/CD workflow
```

### 4. Hotfix (Emergency Production Fix)

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Fix the issue
git add .
git commit -m "fix: critical bug in login"
git push origin hotfix/critical-bug-fix

# Create PR to main
# After merge, backport to other branches
git checkout uat
git merge main
git push origin uat

git checkout qa
git merge uat
git push origin qa

git checkout develop
git merge qa
git push origin develop
```

## Pull Request Requirements

### PR to `develop`

- ✅ Passing CI checks (lint, type-check, tests)
- ✅ At least 1 approval
- ✅ PR validation builds (Android + iOS) must succeed

### PR to `qa`, `uat`, `main`

- ✅ Passing CI checks
- ✅ At least 2 approvals (recommended)
- ✅ PR validation builds must succeed
- ✅ QA sign-off (for `uat` and `main`)

## CI/CD Behavior

| Branch/Tag   | Trigger | Environment   | Builds        | Uploads Artifact | Deploy (when enabled)  |
| ------------ | ------- | ------------- | ------------- | ---------------- | ---------------------- |
| `develop`    | Push    | dev           | Android + iOS | ✅ Yes           | Private Store (Dev)    |
| `qa`         | Push    | qa            | Android + iOS | ✅ Yes           | Private Store (QA)     |
| `uat`        | Push    | uat           | Android + iOS | ✅ Yes           | Private Store (UAT)    |
| `v*.*.*` tag | Tag     | production    | Android + iOS | ✅ Yes           | App Store + Play Store |
| PR to any    | PR      | Auto-detected | Android + iOS | ❌ No            | ❌ No                  |

## Version Management

- **Version source**: `package.json` version field
- **Version updates**: Manual (update `package.json` before release)
- **Build numbers**: Auto-incremented by GitHub Actions (`github.run_number`)
- **Format**: `versionName: 1.2.3`, `versionCode: 123`

### Versioning Workflow

```bash
# Update version for new release
npm version minor  # or major/patch
# This updates package.json to 1.2.0

git add package.json
git commit -m "chore: bump version to 1.2.0"
git push origin develop

# Follow promotion workflow
# When merged to main, tag the release
git tag v1.2.0
git push origin v1.2.0
```

## Best Practices

1. **Keep branches up to date**: Regularly merge parent branches down

   ```bash
   # In develop, merge main changes
   git checkout develop
   git merge main
   ```

2. **Small, focused PRs**: Easier to review and less likely to have conflicts

3. **Descriptive commit messages**: Follow conventional commits
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `chore:` - Maintenance tasks
   - `docs:` - Documentation
   - `refactor:` - Code refactoring
   - `test:` - Adding tests

4. **Delete merged branches**: Keep repository clean

5. **Tag production releases**: Always tag `main` after merging

6. **Manual workflow execution**: All CI/CD workflows support manual triggers via GitHub Actions UI

## Environment Variables per Branch

Each environment has its own GitHub Environment with specific secrets and variables:

- **dev**: Development API endpoints, dev certificates
- **qa**: QA API endpoints, QA certificates
- **uat**: UAT API endpoints, UAT certificates
- **production**: Production API endpoints, production certificates

See `.github/CI_CD_SETUP.md` for complete setup instructions.

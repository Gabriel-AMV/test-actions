# CI/CD Setup Guide

This document explains how to configure the CI/CD pipelines for deploying to private Play Store and App Store.

## Overview

- **2 Reusable Workflows**: `android-ci.yml`, `ios-ci.yml`
- **4 Environment Workflows**: `ci-dev.yml`, `ci-qa.yml`, `ci-uat.yml`, `ci-production.yml`
- **4 GitHub Environments**: dev, qa, uat, production

## Branch Strategy

| Branch       | Environment | Triggers          |
| ------------ | ----------- | ----------------- |
| `develop`    | dev         | Push to develop   |
| `qa`         | qa          | Push to qa        |
| `uat`        | uat         | Push to uat       |
| `main` + tag | production  | Push tag `v*.*.*` |

---

## Prerequisites

### 1. Android Requirements

- **Keystore file** for signing (`.jks`)
- **Google Play Console** account with private Play Store access
- **Service Account JSON** with Play Store API access

#### Create Service Account:

1. Go to Google Cloud Console
2. Enable Google Play Developer API
3. Create Service Account
4. Download JSON key
5. Grant access in Play Console → Settings → API access

### 2. iOS Requirements

- **Apple Developer account** ($99/year)
- **Distribution certificate** (`.p12`)
- **Provisioning profiles** for each environment
- **App Store Connect API Key** (`.p8`)

#### Create App Store Connect API Key:

1. Go to App Store Connect → Users and Access → Keys
2. Create new API Key with "App Manager" role
3. Download `.p8` file (one-time download!)
4. Note Key ID and Issuer ID

#### Create Certificate (.p12):

1. Open Keychain Access (Mac)
2. Request Certificate from Certificate Authority
3. Upload to Apple Developer Portal
4. Download certificate
5. Export as `.p12` with password

#### Create Provisioning Profiles:

1. Go to Apple Developer Portal
2. Create App IDs for each environment:
   - `com.company.filetest.dev`
   - `com.company.filetest.qa`
   - `com.company.filetest.uat`
   - `com.company.filetest`
3. Create Distribution provisioning profiles for each App ID
4. Download `.mobileprovision` files

---

## GitHub Setup

### Step 1: Create GitHub Environments

Go to: **Repository → Settings → Environments**

Create 4 environments:

- `dev`
- `qa`
- `uat`
- `production`

For **production environment only**, enable:

- ✅ Required reviewers (select team members)
- ✅ Wait timer (optional, e.g., 10 minutes)

### Step 2: Configure Environment Secrets

For **EACH environment** (dev, qa, uat, production), add these secrets:

#### Environment-Specific Secrets:

| Secret Name                         | Description                       | Example                    |
| ----------------------------------- | --------------------------------- | -------------------------- |
| `PACKAGE_NAME`                      | Android package name              | `com.company.filetest.dev` |
| `APPLE_CERTIFICATE_BASE64`          | Base64 encoded `.p12` file        | See encoding below         |
| `APPLE_CERTIFICATE_PASSWORD`        | Certificate password              | Your password              |
| `APPLE_PROVISIONING_PROFILE_BASE64` | Base64 encoded `.mobileprovision` | See encoding below         |

#### Shared Repository Secrets:

Add these at **Repository level** (Settings → Secrets and variables → Actions):

| Secret Name                         | Description                   |
| ----------------------------------- | ----------------------------- |
| `ANDROID_KEYSTORE_BASE64`           | Base64 encoded keystore file  |
| `ANDROID_KEYSTORE_PASSWORD`         | Keystore password             |
| `ANDROID_KEY_ALIAS`                 | Key alias name                |
| `ANDROID_KEY_PASSWORD`              | Key password                  |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON`   | Service account JSON content  |
| `APPLE_TEAM_ID`                     | Apple Team ID (10 characters) |
| `APP_STORE_CONNECT_API_KEY_ID`      | API Key ID                    |
| `APP_STORE_CONNECT_ISSUER_ID`       | Issuer ID (UUID)              |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | `.p8` file content            |

### Step 3: Encode Files to Base64

#### On macOS/Linux:

```bash
# Android Keystore
base64 -i keystore.jks | pbcopy

# iOS Certificate
base64 -i certificate.p12 | pbcopy

# iOS Provisioning Profile
base64 -i profile.mobileprovision | pbcopy

# App Store Connect API Key
cat AuthKey_ABC123.p8 | pbcopy
```

#### On Windows (PowerShell):

```powershell
# Android Keystore
[Convert]::ToBase64String([IO.File]::ReadAllBytes("keystore.jks")) | Set-Clipboard

# iOS Certificate
[Convert]::ToBase64String([IO.File]::ReadAllBytes("certificate.p12")) | Set-Clipboard

# iOS Provisioning Profile
[Convert]::ToBase64String([IO.File]::ReadAllBytes("profile.mobileprovision")) | Set-Clipboard
```

---

## Environment Variables

Copy `.env.example` to create environment-specific files (optional for local development):

- `.env.development`
- `.env.qa`
- `.env.uat`
- `.env.production`

**Note:** These files are for local development only. CI/CD reads from GitHub Environment variables.

Update `app.config.js` to use these variables for bundle IDs and app names.

---

## How It Works

### Deployment Flow:

1. **Developer pushes to branch** (e.g., `develop`)
2. **GitHub Actions triggers** (`ci-dev.yml`)
3. **Calls reusable workflows**:
   - `android-ci.yml` (builds & uploads to Play Store)
   - `ios-ci.yml` (builds & uploads to TestFlight)
4. **Workflows run in parallel** (Android + iOS simultaneously)
5. **Artifacts uploaded** to private stores

### Build Process:

#### Android:

1. Install Node.js dependencies
2. Run `expo prebuild --platform android` (generates `/android` folder)
3. Setup Java & Gradle
4. Decode & configure keystore
5. Build signed AAB: `./gradlew bundleRelease`
6. Upload to Play Store using Fastlane

#### iOS:

1. Install Node.js dependencies
2. Run `expo prebuild --platform ios` (generates `/ios` folder)
3. Install CocoaPods
4. Import certificate & provisioning profile using Fastlane
5. Build IPA using Fastlane: `build_app`
6. Upload to TestFlight using Fastlane

---

## Testing the Setup

### Test Without Deployment:

Comment out the "Upload" steps in `android-ci.yml` and `ios-ci.yml` first, then:

```bash
# Test dev environment
git checkout develop
git commit --allow-empty -m "Test CI/CD"
git push origin develop

# Check GitHub Actions tab for build status
```

### Full Deployment Test:

1. Push to `develop` branch
2. Go to **Actions** tab in GitHub
3. Watch workflows run
4. Check Play Console & App Store Connect for uploads

---

## Troubleshooting

### Android Build Fails:

- ✅ Check keystore base64 encoding (no newlines)
- ✅ Verify package name matches in Play Console
- ✅ Ensure service account has permissions

### iOS Build Fails:

- ✅ Check certificate/profile are for Distribution (not Development)
- ✅ Verify bundle ID matches provisioning profile
- ✅ Ensure App Store Connect API key has correct permissions
- ✅ Check certificate hasn't expired

### Fastlane Issues:

- ✅ Check Ruby version (3.2+)
- ✅ Verify API key file format (should start with `-----BEGIN PRIVATE KEY-----`)
- ✅ Ensure team ID is correct (10 characters)

### Expo Prebuild Issues:

- ✅ Check `app.config.js` is properly configured
- ✅ Verify all Expo dependencies are installed
- ✅ Ensure Node.js version is 20+

---

## Production Deployment

To deploy to production:

```bash
# From main branch
git checkout main
git merge uat  # or merge from your release branch
git tag v1.0.0
git push origin main --tags
```

The `ci-production.yml` workflow will trigger and require manual approval before deploying.

---

## Cost Considerations

- **GitHub Actions minutes:**
  - 2,000 free minutes/month (private repos)
  - macOS runners use 10x multiplier
  - Each iOS build: ~20-30 minutes = 200-300 minutes consumed
  - Budget for ~4-6 iOS builds per month on free tier

- **Alternative:** Use self-hosted macOS runner for unlimited builds

---

## Security Best Practices

1. ✅ Never commit certificates or keys to Git
2. ✅ Use strong passwords for keystores/certificates
3. ✅ Rotate App Store Connect API keys annually
4. ✅ Limit GitHub Environment access to necessary personnel
5. ✅ Enable required reviewers for production
6. ✅ Use separate keystores per environment (optional)

---

## Support

For issues:

1. Check GitHub Actions logs
2. Review Fastlane output for detailed errors
3. Verify all secrets are correctly configured
4. Ensure certificates/profiles haven't expired

---

## Future Enhancements

- [ ] Add PR checks (build validation)
- [ ] Add automated testing before deployment
- [ ] Add Slack/Discord notifications
- [ ] Add version bump automation
- [ ] Add release notes generation
- [ ] Commit `/ios` and `/android` folders to skip prebuild (faster builds)

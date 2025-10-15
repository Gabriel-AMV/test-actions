# Fastlane Match Quick Setup Guide

## Prerequisites

⚠️ **You need a macOS machine** to initialize Match (borrow a Mac or use GitHub Actions).

## Step 1: Create Private Git Repository

Create a **private** repository for certificates:
- Example: `https://github.com/your-org/ios-certificates`

## Step 2: Set Environment Variables

Before running any Fastlane commands, set these environment variables:

### On macOS/Linux (Terminal):

```bash
# Required for Match
export MATCH_GIT_URL="https://github.com/your-org/ios-certificates"
export MATCH_PASSWORD="your-strong-password-here"

# Apple Developer Account
export APPLE_ID="your-apple-id@example.com"
export APPLE_TEAM_ID="YOUR_TEAM_ID"  # Find in Apple Developer Portal

# App Configuration
export BUNDLE_ID="com.yourcompany.yourapp"
export APP_NAME="Your App Name"

# Optional: If using private GitHub repo
export MATCH_GIT_BASIC_AUTHORIZATION="base64-encoded-username:token"
```

### On Windows (PowerShell):

```powershell
# Required for Match
$env:MATCH_GIT_URL="https://github.com/your-org/ios-certificates"
$env:MATCH_PASSWORD="your-strong-password-here"

# Apple Developer Account
$env:APPLE_ID="your-apple-id@example.com"
$env:APPLE_TEAM_ID="YOUR_TEAM_ID"

# App Configuration
$env:BUNDLE_ID="com.yourcompany.yourapp"
$env:APP_NAME="Your App Name"

# Optional: If using private GitHub repo
$env:MATCH_GIT_BASIC_AUTHORIZATION="base64-encoded-username:token"
```

### On Windows (Command Prompt):

```cmd
REM Required for Match
set MATCH_GIT_URL=https://github.com/your-org/ios-certificates
set MATCH_PASSWORD=your-strong-password-here

REM Apple Developer Account
set APPLE_ID=your-apple-id@example.com
set APPLE_TEAM_ID=YOUR_TEAM_ID

REM App Configuration
set BUNDLE_ID=com.yourcompany.yourapp
set APP_NAME=Your App Name

REM Optional: If using private GitHub repo
set MATCH_GIT_BASIC_AUTHORIZATION=base64-encoded-username:token
```

## Step 3: Initialize Match (On macOS)

```bash
cd src/mobile/mobile-sop
bundle install
bundle exec fastlane match init
```

When prompted:
1. Select `git` as storage mode
2. Enter your certificates repository URL (value of `MATCH_GIT_URL`)

## Step 4: Generate Certificates (On macOS)

```bash
# For App Store builds
bundle exec fastlane match appstore

# For Ad-Hoc distribution (optional)
bundle exec fastlane match adhoc

# For Development (optional)
bundle exec fastlane match development
```

You'll be prompted for:
- **Apple ID password** (your Apple Developer account password)
- **Match password** (to encrypt certificates)

## Step 5: Configure GitHub Secrets

Add these secrets to your GitHub repository settings:

### Required Secrets:

| Secret Name | Value | How to Get |
|------------|-------|------------|
| `MATCH_GIT_URL` | `https://github.com/your-org/ios-certificates` | URL of your certificates repository |
| `MATCH_PASSWORD` | Password you used in Step 4 | The password you created when running `fastlane match` |
| `MATCH_GIT_BASIC_AUTHORIZATION` | `dXNlcm5hbWU6dG9rZW4=` | Base64 of `username:token` (see below) |
| `SENTRY_AUTH_TOKEN` | Your Sentry token | Already configured |

### Optional Secrets:

| Secret Name | Value | When Needed |
|------------|-------|-------------|
| `APPLE_ID` | `your-apple-id@example.com` | Only if uploading to App Store |

### GitHub Variables:

Make sure these are set in your repository variables:

| Variable Name | Example Value | Where to Find |
|--------------|---------------|---------------|
| `APPLE_TEAM_ID` | `AB12CD34EF` | Apple Developer Portal → Membership |
| `BUNDLE_ID` | `com.yourcompany.yourapp` | Your app's bundle identifier |
| `APP_NAME` | `Your App Name` | Your app's display name |

### How to Generate MATCH_GIT_BASIC_AUTHORIZATION:

If your certificates repo is private, you need Git credentials:

1. **Create GitHub Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scope: `repo` (Full control of private repositories)
   - Copy the token

2. **Encode credentials:**

   On macOS/Linux:
   ```bash
   echo -n "your-github-username:ghp_yourTokenHere" | base64
   ```

   On Windows (PowerShell):
   ```powershell
   [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("your-github-username:ghp_yourTokenHere"))
   ```

3. **Add to GitHub Secrets** as `MATCH_GIT_BASIC_AUTHORIZATION`

## Alternative: Use GitHub Actions to Initialize Match

If you don't have access to a Mac, you can use GitHub Actions:

1. **Set up all secrets first** (MATCH_GIT_URL, MATCH_PASSWORD, APPLE_ID, etc.)

2. **Create temporary workflow** `.github/workflows/match-init.yml`:

```yaml
name: Initialize Match
on: workflow_dispatch

jobs:
  init:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
          working-directory: './src/mobile/mobile-sop'

      - name: Initialize Match and Generate Certificates
        working-directory: ./src/mobile/mobile-sop
        env:
          MATCH_GIT_URL: ${{ secrets.MATCH_GIT_URL }}
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          MATCH_GIT_BASIC_AUTHORIZATION: ${{ secrets.MATCH_GIT_BASIC_AUTHORIZATION }}
          MATCH_KEYCHAIN_PASSWORD: ${{ github.run_id }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_TEAM_ID: ${{ vars.APPLE_TEAM_ID }}
          BUNDLE_ID: ${{ vars.BUNDLE_ID }}
          APP_NAME: ${{ vars.APP_NAME }}
          FASTLANE_USER: ${{ secrets.APPLE_ID }}
          FASTLANE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
        run: |
          bundle install
          bundle exec fastlane match appstore
```

3. **Run the workflow manually** from GitHub Actions tab

4. **Delete the workflow file** after successful initialization

## Verification

After setup, verify certificates were created:

1. Check your certificates repository - it should have files like:
   - `certs/distribution/`
   - `profiles/appstore/`
   - `match_version.txt`

2. Run a test build using the new workflow

## Troubleshooting

### Error: "Could not find action, lane or variable"

Make sure you're in the correct directory:
```bash
cd src/mobile/mobile-sop
```

### Error: "No password supplied"

Set `MATCH_PASSWORD` environment variable before running commands.

### Error: "Could not find certificate"

Run `fastlane match` again to regenerate:
```bash
bundle exec fastlane match appstore --force
```

### Error: "Authentication failed"

Check that:
- `APPLE_ID` is correct
- `APPLE_TEAM_ID` matches your team
- Your Apple ID password is correct
- Two-factor authentication is set up (app-specific password may be needed)

## Next Steps

Once Match is initialized:

1. Update `mobile-ci-cd.yml` to use the new workflow:
   ```yaml
   build-ios:
     uses: ./.github/workflows/mobile-build-ios-with-match.yml
   ```

2. Test the workflow by pushing a commit

3. Certificates will be automatically synced in CI/CD

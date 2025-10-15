# Fastlane Match Setup Guide

This guide explains how to set up Fastlane Match for automated certificate and provisioning profile management.

## What is Fastlane Match?

Fastlane Match is a tool that automatically manages your iOS certificates and provisioning profiles by storing them in a Git repository. This eliminates the need to manually manage certificates and ensures all team members and CI/CD systems use the same credentials.

## Benefits

- **No more manual certificate management**: Match handles certificate creation, renewal, and installation
- **Team sync**: All developers and CI servers use the same certificates
- **Secure storage**: Certificates are encrypted and stored in a private Git repository
- **Easy revocation**: Simply run `fastlane match nuke` to revoke all certificates
- **CI/CD friendly**: Works seamlessly in GitHub Actions

## Initial Setup (One-time)

### 1. Create a Private Git Repository

Create a **private** Git repository to store your certificates. This can be on:
- GitHub (recommended)
- GitLab
- Bitbucket
- Any private Git server

**Example**: `https://github.com/your-org/ios-certificates.git`

### 2. Initialize Match (Run locally)

From your project root, run:

```bash
cd src/mobile/mobile-sop
bundle install
bundle exec fastlane match init
```

Follow the prompts:
- Select `git` as storage mode
- Enter your certificates repository URL
- This creates the `Matchfile` configuration

### 3. Generate Certificates

Generate certificates for each environment you need:

```bash
# For App Store / TestFlight builds
bundle exec fastlane match appstore

# For Ad-Hoc distribution
bundle exec fastlane match adhoc

# For Development builds
bundle exec fastlane match development
```

You'll be prompted for:
- **Apple ID**: Your Apple Developer account email
- **Team ID**: Your Apple Developer Team ID
- **Bundle ID**: Your app's bundle identifier
- **Password**: A password to encrypt the certificates (save this securely!)

### 4. Configure GitHub Secrets

Add these secrets to your GitHub repository:

#### Required Secrets:

1. **MATCH_GIT_URL**
   - The Git URL of your certificates repository
   - Example: `https://github.com/your-org/ios-certificates.git`

2. **MATCH_PASSWORD**
   - The password you used to encrypt certificates during `fastlane match` setup

3. **MATCH_GIT_BASIC_AUTHORIZATION** (if using private GitHub repo)
   - Base64 encoded credentials: `username:personal_access_token`
   - Generate a Personal Access Token with `repo` scope
   - Encode it: `echo -n "username:token" | base64`

4. **SENTRY_AUTH_TOKEN**
   - Your Sentry auth token (already configured)

#### Optional Secrets:

5. **APPLE_ID**
   - Your Apple Developer account email
   - Only needed if you plan to upload to App Store Connect later

#### GitHub Variables:

Make sure these are configured:
- **APPLE_TEAM_ID**: Your Apple Developer Team ID
- **BUNDLE_ID**: Your app's bundle identifier
- **APP_NAME**: Your app's display name

## How to Use in CI/CD

The workflow is already configured in `.github/workflows/mobile-build-ios-with-match.yml`.

To use Match instead of manual certificates, update your main workflow:

```yaml
build-ios:
  name: Build iOS
  needs: determine-environment
  uses: ./.github/workflows/mobile-build-ios-with-match.yml  # Changed this line
  with:
    environment: ${{ needs.determine-environment.outputs.environment }}
    export-method: ${{ needs.determine-environment.outputs.export-method }}
    upload-artifact: true
  secrets: inherit
```

## How It Works

1. **Match downloads certificates**: When the workflow runs, Fastlane Match clones your certificates repository
2. **Decrypts with password**: Uses `MATCH_PASSWORD` to decrypt the certificates
3. **Installs to keychain**: Installs certificates and provisioning profiles to the macOS keychain
4. **Builds your app**: Uses the installed certificates to sign your IPA
5. **Clean up**: Removes keychain after build completes

## Local Development

Developers on your team can also use Match:

```bash
# Install certificates on your machine
cd src/mobile/mobile-sop
bundle exec fastlane match development

# Or for App Store builds
bundle exec fastlane match appstore
```

They'll need:
- Access to the certificates Git repository
- The `MATCH_PASSWORD`

## Troubleshooting

### Certificate expired or invalid

Renew certificates:
```bash
bundle exec fastlane match appstore --force
```

### Want to start fresh

Revoke all certificates and start over:
```bash
bundle exec fastlane match nuke appstore
bundle exec fastlane match appstore
```

⚠️ **Warning**: This revokes certificates for all team members!

### Build fails with "No matching provisioning profiles"

1. Check that `BUNDLE_ID` matches your app's bundle identifier
2. Ensure certificates exist for the correct type (appstore/adhoc/development)
3. Verify `MATCH_PASSWORD` is correct

## Security Best Practices

1. **Never commit certificates to your main repository**
2. **Use a separate private repository** for certificates
3. **Limit access** to the certificates repository
4. **Rotate MATCH_PASSWORD** periodically
5. **Use GitHub Secrets** for sensitive values
6. **Enable 2FA** on your Apple Developer account

## Comparison: Manual vs Match

### Manual (Current)
- ❌ Store certificates as base64 in GitHub Secrets
- ❌ Manual export/import of certificates
- ❌ Hard to sync across team
- ❌ Complex keychain setup in CI
- ❌ Manual renewal process

### Match (New)
- ✅ Automated certificate management
- ✅ Automatic sync across team and CI
- ✅ Simple setup and renewal
- ✅ Version controlled certificates
- ✅ One command to install certificates

## Additional Resources

- [Fastlane Match Documentation](https://docs.fastlane.tools/actions/match/)
- [Codesigning Guide](https://codesigning.guide/)
- [GitHub Actions for iOS](https://docs.github.com/en/actions/deployment/deploying-xcode-applications/installing-an-apple-certificate-on-macos-runners-for-xcode-development)

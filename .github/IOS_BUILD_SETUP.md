# iOS Build Setup Instructions

This document explains how to configure the required GitHub secrets for the iOS build workflow.

## Required GitHub Secrets

Navigate to your repository's **Settings > Secrets and variables > Actions** and add the following secrets:

### 1. `IOS_CERTIFICATE_BASE64`

Your iOS distribution certificate in base64 format.

**How to create:**

```bash
# Export your certificate from Keychain as .p12 file, then convert to base64
base64 -i certificate.p12 | pbcopy
```

Paste the output into this secret.

### 2. `IOS_CERTIFICATE_PASSWORD`

The password you set when exporting the .p12 certificate.

### 3. `IOS_PROVISIONING_PROFILE_BASE64`

Your provisioning profile in base64 format.

**How to create:**

```bash
# Convert your .mobileprovision file to base64
base64 -i YourProfile.mobileprovision | pbcopy
```

Paste the output into this secret.

### 4. `IOS_PROVISIONING_PROFILE_NAME`

The exact name of your provisioning profile (e.g., "FileTest Distribution Profile").

**How to find:**

- Open your .mobileprovision file in a text editor
- Look for the `<key>Name</key>` entry
- The value after it is your profile name

### 5. `IOS_BUNDLE_IDENTIFIER`

Your app's bundle identifier (e.g., "com.yourcompany.filetest").

**Current value in app.json:** You need to add a `bundleIdentifier` to your `app.json` under `ios` section.

### 6. `IOS_DEVELOPMENT_TEAM`

Your Apple Developer Team ID (10-character string).

**How to find:**

- Login to https://developer.apple.com/account
- Go to "Membership details"
- Copy your Team ID

## Before Running the Workflow

1. Make sure you have a valid iOS Distribution Certificate
2. Make sure you have a valid App Store provisioning profile
3. Add the bundle identifier to your `app.json`:

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.filetest"
    }
  }
}
```

## Running the Workflow

The workflow will automatically run when you:

- Push changes to the `main` branch that affect iOS-related files
- Manually trigger it from the Actions tab using "Run workflow"

## Build Output

After successful build, the IPA file will be available as an artifact:

- Go to Actions tab
- Click on your workflow run
- Download the artifact named `FileTest-iOS-[run-number]`

## Troubleshooting

### Certificate Issues

- Ensure your certificate is not expired
- Make sure you're using a Distribution certificate, not Development
- Verify the password is correct

### Provisioning Profile Issues

- Ensure the profile matches your bundle identifier
- Verify the profile is not expired
- Make sure the profile is for Distribution/App Store

### Build Failures

- Check that all secrets are correctly set
- Verify your app.json configuration
- Ensure your Xcode project name matches (currently set to "FileTest")

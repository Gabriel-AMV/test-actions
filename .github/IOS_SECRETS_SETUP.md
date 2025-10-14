# iOS Secrets Setup Guide

Step-by-step guide to get each iOS secret for GitHub Actions.

---

## Prerequisites

- **Mac computer** (required for certificate generation)
- **Apple Developer account** ($99/year)
- **Xcode** installed
- **App Store Connect** access

---

## 1. APPLE_TEAM_ID

### What is it?

Your Apple Developer Team ID (10 character alphanumeric string).

### How to get it:

**Option A: From Apple Developer Portal**

1. Go to https://developer.apple.com/account
2. Sign in with your Apple ID
3. Look at the top right - you'll see your team name
4. Click on "Membership" in the sidebar
5. Your Team ID is shown (e.g., `A1B2C3D4E5`)

**Option B: From Keychain Access (Mac)**

1. Open **Keychain Access**
2. Find your distribution certificate
3. Double-click it
4. Look for "Organizational Unit" - that's your Team ID

**Result:** Add to GitHub as repository secret `APPLE_TEAM_ID`

---

## 2. APPLE_CERTIFICATE_BASE64

### What is it?

Your iOS Distribution Certificate exported as `.p12` file, then converted to base64.

### How to create it:

#### Step 1: Generate Certificate Signing Request (CSR)

**Option A: Using Terminal (Recommended)**

```bash
# Generate private key and CSR
openssl req -new -newkey rsa:2048 -nodes \
  -keyout ios_distribution.key \
  -out CertificateSigningRequest.certSigningRequest \
  -subj "/emailAddress=your@email.com/CN=Your Full Name/O=Your Company Name/C=US"
# CN = Your personal name (e.g., "John Smith")
# O = Your company/organization name (optional)
# C = Country code (e.g., "US")
```

This creates:

- `ios_distribution.key` - Your private key (keep this secure!)
- `CertificateSigningRequest.certSigningRequest` - CSR to upload to Apple

**Option B: Using Keychain Access (GUI)**

1. Open **Keychain Access** (Mac)
2. Menu: **Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority**
3. Enter your email address
4. Common Name: Your name or company name
5. Select: **"Saved to disk"**
6. Click **Continue**
7. Save the `.certSigningRequest` file

#### Step 2: Create Distribution Certificate in Apple Developer Portal

1. Go to https://developer.apple.com/account/resources/certificates/list
2. Click **"+"** to create a new certificate
3. Select **"iOS Distribution"** (for App Store and Ad Hoc)
4. Click **Continue**
5. Upload the `.certSigningRequest` file you created
6. Click **Continue**
7. Download the certificate (`.cer` file)


#### Step 3: Install Certificate and Create .p12

**Option A: Using Terminal (Recommended)**

```bash
# Convert the .cer to .pem
openssl x509 -in distribution.cer -inform DER -out distribution.pem -outform PEM

# Combine certificate and private key into .p12
openssl pkcs12 -export \
  -inkey ios_distribution.key \
  -in distribution.pem \
  -out distribution.p12 \
  -name "iOS Distribution Certificate"
# Enter a password when prompted - save this password!
```


You now have `distribution.p12` ready to convert to base64. **Skip to Step 5**.

**Option B: Using Keychain Access (GUI)**

1. Double-click the downloaded `.cer` file
2. It will be added to your Keychain
3. In Keychain Access, you should now see "Apple Distribution: Your Name (Team ID)"

#### Step 4: Export as .p12 (GUI method only)

1. In **Keychain Access**, find the certificate you just installed
2. **Important:** Expand the certificate (click the arrow) - you should see a private key underneath
3. Select **both** the certificate AND the private key (hold Cmd and click both)
4. Right-click → **"Export 2 items..."**
5. File format: **Personal Information Exchange (.p12)**
6. Save it (e.g., `distribution.p12`)
7. Enter a password when prompted (save this password!)
8. You may need to enter your Mac password to allow the export

#### Step 5: Convert to Base64

**Mac/Linux:**

```bash
base64 -i distribution.p12 | pbcopy
```

**Windows (PowerShell):**

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("distribution.p12")) | Set-Clipboard
```

**Result:** Paste into GitHub Environment secret `APPLE_CERTIFICATE_BASE64` (one per environment)

---

## 3. APPLE_CERTIFICATE_PASSWORD

### What is it?

The password you set when exporting the `.p12` file.

### Where to get it:

This is the password you entered in Step 4 above when exporting the certificate.

**Important:**

- If you lose this password, you'll need to export the certificate again
- Use a strong password and store it securely

**Result:** Paste into GitHub Environment secret `APPLE_CERTIFICATE_PASSWORD` (one per environment)

---

## 4. APPLE_PROVISIONING_PROFILE_BASE64

### What is it?

A provisioning profile that links your app, certificate, and devices. Required for building iOS apps.

### How to create it:

#### Step 1: Create App ID

1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Click **"+"** to add a new identifier
3. Select **"App IDs"** → Continue
4. Select **"App"** → Continue
5. Description: `FileTest Dev` (or qa/uat/production)
6. Bundle ID: **Explicit** → Enter your bundle ID:
   - Dev: `com.company.filetest.dev`
   - QA: `com.company.filetest.qa`
   - UAT: `com.company.filetest.uat`
   - Production: `com.company.filetest`
7. Select capabilities (if needed, e.g., Push Notifications)
8. Click **Continue** → **Register**

**Repeat for each environment (dev, qa, uat, production)**

#### Step 2: Create Provisioning Profile

1. Go to https://developer.apple.com/account/resources/profiles/list
2. Click **"+"** to add a new profile
3. Select **"App Store Connect"** (for TestFlight/App Store distribution)
4. Click **Continue**
5. Select the App ID you created (e.g., `com.company.filetest.dev`)
6. Click **Continue**
7. Select your **Distribution Certificate** (the one you created earlier)
8. Click **Continue**
9. Profile Name: `FileTest Dev Distribution` (or qa/uat/production)
10. Click **Generate**
11. Click **Download** (saves as `.mobileprovision` file)

**Repeat for each environment (dev, qa, uat, production)**

#### Step 3: Convert to Base64

**Mac/Linux:**

```bash
base64 -i FileTest_Dev_Distribution.mobileprovision | pbcopy
```

**Windows (PowerShell):**

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("FileTest_Dev_Distribution.mobileprovision")) | Set-Clipboard
```

**Result:** Paste into GitHub Environment secret `APPLE_PROVISIONING_PROFILE_BASE64` (one per environment)

## Summary: Add Secrets to GitHub

### Repository-level secrets (shared across all environments):

Go to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

Add these:

- `APPLE_TEAM_ID` (10 characters, e.g., `A1B2C3D4E5`)
- `APP_STORE_CONNECT_API_KEY_ID` (Key ID, e.g., `ABC123XYZ`)
- `APP_STORE_CONNECT_ISSUER_ID` (UUID format)
- `APP_STORE_CONNECT_API_KEY_CONTENT` (entire `.p8` file content)
- `SENTRY_AUTH_TOKEN` (optional, for uploading source maps)

### Environment-level secrets (per environment):

Go to: **Repository → Settings → Environments → [Select environment] → Add secret**

For **each environment** (dev, qa, uat, production), add:

- `APPLE_CERTIFICATE_BASE64` (your `.p12` file as base64)
- `APPLE_CERTIFICATE_PASSWORD` (password for the `.p12` file)
- `APPLE_PROVISIONING_PROFILE_BASE64` (your `.mobileprovision` file as base64)

### Environment-level variables (per environment):

Go to: **Repository → Settings → Environments → [Select environment] → Add variable**

For **each environment** (dev, qa, uat, production), add:

- `BUNDLE_ID` (e.g., `com.company.filetest.dev`)

---

You only need:

- ✅ `APPLE_TEAM_ID`
- ✅ `APPLE_CERTIFICATE_BASE64` (per environment)
- ✅ `APPLE_CERTIFICATE_PASSWORD` (per environment)
- ✅ `APPLE_PROVISIONING_PROFILE_BASE64` (per environment)

---

## Quick Start Checklist

- [ ] Have Mac computer with Xcode installed
- [ ] Have Apple Developer account ($99/year)
- [ ] Generate Certificate Signing Request (CSR)
- [ ] Create Distribution Certificate in Apple Developer Portal
- [ ] Export certificate as `.p12` with password
- [ ] Create App IDs for all environments (dev, qa, uat, production)
- [ ] Create Provisioning Profiles for all environments
- [ ] Convert all files to base64
- [ ] Add all secrets to GitHub
- [ ] Create GitHub Environments (dev, qa, uat, production)

---

## Certificate Expiration

**Distribution Certificates expire after 1 year.**

When it expires:

1. Create a new distribution certificate (follow Step 2 above)
2. Export as new `.p12` file
3. Update provisioning profiles to use new certificate
4. Update GitHub secrets with new base64 values

**Provisioning Profiles expire after 1 year.**

When they expire:

1. Go to Apple Developer Portal → Profiles
2. Click **Edit** on the expired profile
3. Select your certificate and click **Generate**
4. Download and convert to base64
5. Update GitHub Environment secrets
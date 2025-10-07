# Android Secrets Setup Guide

Step-by-step guide to get each Android secret for GitHub Actions.

---

## 1. ANDROID_KEYSTORE_BASE64

### What is it?

A keystore file (`.jks` or `.keystore`) used to sign your Android app. Required for release builds.

### How to create it:

**Option A: Create new keystore (first time)**

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

You'll be asked:

- **Keystore password**: Choose a strong password (save this!)
- **Name, Organization, etc.**: Fill in your details
- **Key password**: Can be same as keystore password

**Option B: Use existing keystore**

If you already have a keystore from previous builds, use that file.

### Convert to Base64:

**Windows (PowerShell):**

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("my-release-key.jks")) | Set-Clipboard
```

**Mac/Linux:**

```bash
base64 -i my-release-key.jks | pbcopy
```

**Result:** Paste the base64 string into GitHub secret `ANDROID_KEYSTORE_BASE64`

---

## 2. ANDROID_KEYSTORE_PASSWORD

### What is it?

The password you set when creating the keystore.

### Where to get it:

- This is the password you entered when running `keytool -genkey`
- If you forgot it, you'll need to create a new keystore

**Result:** Paste the password into GitHub secret `ANDROID_KEYSTORE_PASSWORD`

---

## 3. ANDROID_KEY_ALIAS

### What is it?

The alias name for the key inside the keystore.

### Where to get it:

- This is the value you set with `-alias` flag when creating the keystore
- In the example above, it was `my-key-alias`

**To check your keystore alias:**

```bash
keytool -list -v -keystore my-release-key.jks
```

Look for "Alias name:" in the output.

**Result:** Paste the alias into GitHub secret `ANDROID_KEY_ALIAS`

---

## 4. ANDROID_KEY_PASSWORD

### What is it?

The password for the specific key (alias) inside the keystore.

### Where to get it:

- This is the password you entered for the key when creating the keystore
- Often it's the same as the keystore password

**Result:** Paste the password into GitHub secret `ANDROID_KEY_PASSWORD`

---

## 5. PACKAGE_NAME

### What is it?

Your Android app's package name (application ID).

### Where to get it:

**Option 1: From app.config.js**

```javascript
android: {
  package: process.env.PACKAGE_ID || 'com.anonymous.FileTest';
}
```

**Option 2: From android/app/build.gradle** (after prebuild)

```gradle
applicationId "com.company.filetest"
```

### For each environment:

| Environment | Example Package Name       |
| ----------- | -------------------------- |
| dev         | `com.company.filetest.dev` |
| qa          | `com.company.filetest.qa`  |
| uat         | `com.company.filetest.uat` |
| production  | `com.company.filetest`     |

**Result:** Add `PACKAGE_NAME` to **each GitHub Environment** (not repository secrets)

---

## 6. PLAY_STORE_SERVICE_ACCOUNT_JSON

### What is it?

A JSON file that gives GitHub Actions permission to upload to Google Play Store.

### How to create it:

#### Step 1: Enable Google Play Developer API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Play Android Developer API**:
   - Search for "Google Play Android Developer API"
   - Click "Enable"

#### Step 2: Create Service Account

1. In Google Cloud Console, go to **IAM & Admin → Service Accounts**
2. Click **"Create Service Account"**
3. Name: `github-actions-deploy` (or any name)
4. Click **"Create and Continue"**
5. Skip granting access (click "Continue")
6. Click **"Done"**

#### Step 3: Create Key

1. Click on the service account you just created
2. Go to **"Keys"** tab
3. Click **"Add Key" → "Create new key"**
4. Choose **JSON** format
5. Click **"Create"**
6. A JSON file will download automatically

#### Step 4: Grant Access in Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Go to **Settings → API access**
3. Click **"Link"** next to the service account you created
4. Grant permissions:
   - ✅ View app information and download bulk reports
   - ✅ **Manage production releases**
   - ✅ **Manage testing track releases**
5. Click **"Invite user"**

#### Step 5: Copy JSON Content

Open the downloaded JSON file and copy **ALL** the content (it should look like this):

```json
{
  "type": "service_account",
  "project_id": "your-project-12345",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions-deploy@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  ...
}
```

**Result:** Paste the **entire JSON content** into GitHub secret `PLAY_STORE_SERVICE_ACCOUNT_JSON`

---

## Summary: Add Secrets to GitHub

### Repository-level secrets (shared across all environments):

Go to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

Add these:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `PLAY_STORE_SERVICE_ACCOUNT_JSON`

### Environment-level secrets (per environment):

Go to: **Repository → Settings → Environments → [Select environment] → Add secret**

For each environment (dev, qa, uat, production), add:

- `PACKAGE_NAME`

---

## Testing Without Play Store Upload

The upload steps are currently commented out, so you can test the build without these:

- ❌ `PLAY_STORE_SERVICE_ACCOUNT_JSON` (not needed yet)
- ❌ `PACKAGE_NAME` (not needed yet)

You only need:

- ✅ `ANDROID_KEYSTORE_BASE64`
- ✅ `ANDROID_KEYSTORE_PASSWORD`
- ✅ `ANDROID_KEY_ALIAS`
- ✅ `ANDROID_KEY_PASSWORD`

---

## Quick Start Checklist

- [ ] Create keystore with `keytool`
- [ ] Convert keystore to base64
- [ ] Note down keystore password, alias, and key password
- [ ] Create Google Cloud project & enable Play Developer API (skip if only testing builds)
- [ ] Create service account & download JSON (skip if only testing builds)
- [ ] Grant service account access in Play Console (skip if only testing builds)
- [ ] Add all secrets to GitHub
- [ ] Create GitHub Environments (dev, qa, uat, production)
- [ ] Test with a push to `develop` branch

---

## Need Help?

- **Forgot keystore password?** → Need to create a new keystore
- **Service account not showing in Play Console?** → Wait 10-15 minutes, then refresh
- **Permission denied errors?** → Check service account has correct permissions in Play Console
- **Build fails with signing errors?** → Verify base64 encoding is correct (no newlines/spaces)

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

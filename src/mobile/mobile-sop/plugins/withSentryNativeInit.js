const {
  withAndroidManifest,
  withAppDelegate,
  AndroidConfig,
} = require('@expo/config-plugins');

/**
 * Custom Expo Config Plugin for Sentry Native Initialization
 * This plugin configures native Sentry initialization to capture crashes
 * that occur before JavaScript initialization.
 */

/**
 * Adds Sentry auto-init configuration to AndroidManifest.xml
 */
function withSentryAndroidManifest(config, pluginConfig = {}) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);
    const { dsn } = pluginConfig;

    // Ensure meta-data array exists
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    // Check if Sentry DSN meta-data already exists
    const existingDsnMetaData = mainApplication['meta-data'].find(
      (meta) => meta.$['android:name'] === 'io.sentry.dsn'
    );

    if (!existingDsnMetaData && dsn) {
      // Add Sentry DSN meta-data
      mainApplication['meta-data'].push({
        $: {
          'android:name': 'io.sentry.dsn',
          'android:value': dsn,
        },
      });
    }

    // Check if Sentry auto-init meta-data already exists
    const existingAutoInitMetaData = mainApplication['meta-data'].find(
      (meta) => meta.$['android:name'] === 'io.sentry.auto-init'
    );

    if (!existingAutoInitMetaData) {
      // Add Sentry auto-init meta-data
      mainApplication['meta-data'].push({
        $: {
          'android:name': 'io.sentry.auto-init',
          'android:value': 'true',
          'tools:replace': 'android:value',
        },
      });

      // Ensure tools namespace is present
      if (!androidManifest.manifest.$['xmlns:tools']) {
        androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
      }
    }

    return config;
  });
}

/**
 * Adds Sentry native initialization to iOS AppDelegate
 */
function withSentryIosAppDelegate(config, pluginConfig = {}) {
  return withAppDelegate(config, async (config) => {
    const appDelegate = config.modResults;
    const { dsn } = pluginConfig;

    // Import statement to add
    const sentryImport = '#import <Sentry/Sentry.h>';

    // Check if Sentry import already exists
    if (!appDelegate.contents.includes(sentryImport)) {
      // Add import after the last #import statement
      const lastImportIndex = appDelegate.contents.lastIndexOf('#import');
      if (lastImportIndex !== -1) {
        const endOfLineIndex = appDelegate.contents.indexOf('\n', lastImportIndex);
        appDelegate.contents =
          appDelegate.contents.slice(0, endOfLineIndex + 1) +
          sentryImport +
          '\n' +
          appDelegate.contents.slice(endOfLineIndex + 1);
      }
    }

    // Sentry initialization code
    const sentryInitCode = `
  // Initialize Sentry for native crash reporting before JS loads
  [SentrySDK startWithConfigureOptions:^(SentryOptions *options) {
    options.dsn = @"${dsn || 'YOUR_SENTRY_DSN'}";
    options.debug = NO; // Set to YES for debug logs
    options.tracesSampleRate = @1.0; // Adjust sample rate as needed
    options.enableAutoPerformanceTracing = YES;
  }];
`;

    // Check if Sentry initialization already exists
    if (!appDelegate.contents.includes('[SentrySDK startWithConfigureOptions:')) {
      // Find the didFinishLaunchingWithOptions method
      const methodPattern = /- \(BOOL\)application:\(UIApplication \*\)application didFinishLaunchingWithOptions:\(NSDictionary \*\)launchOptions\s*\{/;
      const match = appDelegate.contents.match(methodPattern);

      if (match) {
        const methodStartIndex = match.index + match[0].length;
        appDelegate.contents =
          appDelegate.contents.slice(0, methodStartIndex) +
          sentryInitCode +
          appDelegate.contents.slice(methodStartIndex);
      }
    }

    return config;
  });
}

/**
 * Main plugin function
 */
const withSentryNativeInit = (config, pluginConfig = {}) => {
  // Apply Android configuration
  config = withSentryAndroidManifest(config, pluginConfig);

  // Apply iOS configuration
  config = withSentryIosAppDelegate(config, pluginConfig);

  return config;
};

module.exports = withSentryNativeInit;

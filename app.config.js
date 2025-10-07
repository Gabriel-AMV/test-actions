module.exports = {
  expo: {
    extra: {
      eas: {
        projectId: 'd1d4fbf2-a735-4483-b145-85cd17f84141',
      },
    },
    name: process.env.APP_NAME || 'FileTest',
    slug: 'FileTest',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.BUNDLE_ID || 'com.anonymous.FileTest',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: process.env.PACKAGE_NAME || 'com.anonymous.FileTest',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'react-native',
          organization: 'b79a2ba2275a',
        },
      ],
    ],
  },
};

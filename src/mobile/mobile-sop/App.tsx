import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { queryClient } from './src/config/queryClient';
import { initDatabase } from './src/database';
import { logger } from './src/utils/logger';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  // Disable automatic native SDK initialization (handled by config plugin)
  autoInitializeNativeSdk: false,

  // Environment-specific configuration
  environment: __DEV__ ? 'development' : 'production',
  enabled: !__DEV__, // Disable Sentry in development to save quota

  // Adds more context data to events (IP address, cookies, user, etc.)
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Performance Monitoring
  tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in prod
  enableAutoPerformanceTracing: true,
  enableAppStartTracking: true,
  enableNativeFramesTracking: true,
  enableStallTracking: true,
  enableUserInteractionTracing: true,

  // Configure Session Replay
  replaysSessionSampleRate: __DEV__ ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
    // HTTP instrumentation for network request tracking
    Sentry.reactNativeTracingIntegration(),
  ],

  // Data scrubbing - filter sensitive data
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.Authorization;
      delete event.request.headers['X-Auth-Token'];
    }

    // Scrub sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.data?.password) {
          breadcrumb.data.password = '[Filtered]';
        }
        if (breadcrumb.data?.token) {
          breadcrumb.data.token = '[Filtered]';
        }
        return breadcrumb;
      });
    }

    return event;
  },

  // Spotlight for local debugging
  // spotlight: __DEV__,
});

export default Sentry.wrap(function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        logger.info('Initializing app...');

        // Initialize database
        await initDatabase();
        logger.info('Database initialized');

        setIsReady(true);
      } catch (err) {
        logger.error('App initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize app');
      }
    }

    initialize();
  }, []);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
});

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

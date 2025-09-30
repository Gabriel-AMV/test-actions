import { ENV } from '@config/env';
import * as Sentry from '@sentry/react-native';

class Logger {
  debug(message: string, ...args: unknown[]): void {
    if (ENV.ENABLE_LOGGING) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (ENV.ENABLE_LOGGING) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${message}`, ...args);

    // Send warnings to Sentry as breadcrumbs (not errors)
    Sentry.addBreadcrumb({
      level: 'warning',
      message,
      data: args[0] as { [key: string]: unknown } | undefined,
    });
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${message}`, ...args);

    // Send errors to Sentry
    const error = args[0] instanceof Error ? args[0] : new Error(message);
    Sentry.captureException(error, {
      contexts: {
        logger: {
          message,
          args: args[0],
        },
      },
    });
  }
}

export const logger = new Logger();

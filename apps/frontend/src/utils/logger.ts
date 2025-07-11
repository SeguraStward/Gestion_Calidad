/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Utility Logger class for standardized logging across the application.
 *
 * Provides static methods for different log levels: debug, info, warn, error, and log.
 * - In production, debug messages are suppressed.
 * - Log messages use `console.log` in production and `console.debug` otherwise.
 */
export class Logger {
  private static readonly IS_PRODUCTION = process.env.NODE_ENV == 'production'

  static debug(message: string, ...args: any[]): void {
    if (!this.IS_PRODUCTION) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  static info(message: string, ...args: any[]): void {
    console.info(`[INFO] ${message}`, ...args)
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args)
  }

  static error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args)
  }

  static log(message: string, ...args: any[]): void {
    if (this.IS_PRODUCTION) {
      console.log(`[LOG] ${message}`, ...args)
    } else {
      console.debug(`[LOG] ${message}`, ...args)
    }
  }
}

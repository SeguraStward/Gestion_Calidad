export class LogManager {
  private static readonly IS_PRODUCTION = process.env.NODE_ENV === 'production'

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
}

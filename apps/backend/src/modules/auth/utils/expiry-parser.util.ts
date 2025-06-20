import { Logger } from '@nestjs/common';

const logger = new Logger('ExpiryParser');

export function parseExpiryToMilliseconds(expiryString: string): number {
  if (!expiryString) {
    logger.error('Empty expiry string provided');
    throw new Error('Empty expiry string provided');
  }

  const unit = expiryString.slice(-1);
  const value = parseInt(expiryString.slice(0, -1), 10);

  if (isNaN(value)) {
    logger.error(`Invalid expiry string format: ${expiryString}`);
    throw new Error('Invalid expiry string format');
  }

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      logger.error(`Invalid expiry unit: ${unit} in ${expiryString}`);
      throw new Error('Invalid expiry unit');
  }
}

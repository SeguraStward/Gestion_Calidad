import { ConfigService } from '@nestjs/config';
import { CookieConfig, TokenType } from '../types';

export class CookieUtil {
  constructor(private readonly configService: ConfigService) {}

  private getCookieDomain(): string | undefined {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv == 'production') {
      return this.configService.get<string>('COOKIE_DOMAIN') || undefined;
    }

    return undefined;
  }

  private parseExpiryToMilliseconds(expiryString: string): number {
    if (!expiryString) throw new Error('Empty expiry string provided');

    const unit = expiryString.slice(-1);
    const value = parseInt(expiryString.slice(0, -1), 10);

    if (isNaN(value)) throw new Error('Invalid expiry string format');

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
        throw new Error('Invalid expiry unit');
    }
  }

  getCookieMaxAge(tokenType: TokenType): number {
    const expiryString = this.configService.get<string>(tokenType);
    return this.parseExpiryToMilliseconds(expiryString);
  }

  getBaseCookieConfig(): Pick<CookieConfig, 'domain' | 'httpOnly' | 'secure' | 'sameSite' | 'path'> {
    return {
      domain: this.getCookieDomain(),
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    };
  }

  getAuthTokenConfig(): CookieConfig {
    return {
      ...this.getBaseCookieConfig(),
      maxAge: this.getCookieMaxAge('JWT_EXPIRATION'),
    };
  }

  getRefreshTokenConfig(): CookieConfig {
    return {
      ...this.getBaseCookieConfig(),
      maxAge: this.getCookieMaxAge('JWT_REFRESH_EXPIRATION'),
    };
  }

  getActiveRoleConfig(): CookieConfig {
    return {
      ...this.getBaseCookieConfig(),
      maxAge: this.getCookieMaxAge('JWT_EXPIRATION'),
    };
  }
}

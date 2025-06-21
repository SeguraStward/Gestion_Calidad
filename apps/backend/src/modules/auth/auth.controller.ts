import { Controller, Get, Logger, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleUser } from './interfaces';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger: Logger;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(AuthController.name);
  }

  private getCookieMaxAge(key: 'JWT_EXPIRATION' | 'JWT_REFRESH_EXPIRATION'): number {
    const expiryString = this.configService.get<string>(key);
    const unit = expiryString.slice(-1);
    const value = parseInt(expiryString.slice(0, -1), 10);
    if (isNaN(value)) return 0; // Default or throw error

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
        return 0; // Default or throw error
    }
  }

  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirect to Google authentication page' })
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Guard initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    this.logger.debug('Google auth callback initiated');
    try {
      if (!req.user) {
        this.logger.error('User not found in request after Google OAuth callback');
        return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_001`);
      }

      // Assuming req.user from GoogleStrategy has an 'email' property
      const googleUser = req.user as { email: string; [key: string]: any };
      const allowedDomain = '@est.una.ac.cr';

      if (!googleUser.email || !googleUser.email.endsWith(allowedDomain)) {
        this.logger.warn(`Login attempt from disallowed domain: ${googleUser.email || 'No email provided'}`);
        return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_002`);
      }

      const result = await this.authService.googleLogin(req.user as GoogleUser);
      this.logger.debug(`User ${result.user.email} authenticated successfully via Google.`);

      res.cookie('auth_token', result.token, {
        domain: '.arayaroma.software',
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        maxAge: this.getCookieMaxAge('JWT_EXPIRATION'),
        sameSite: 'lax',
        path: '/',
      });

      res.cookie('refresh_token', result.refreshToken, {
        domain: '.arayaroma.software',
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        maxAge: this.getCookieMaxAge('JWT_REFRESH_EXPIRATION'),
        sameSite: 'lax',
        path: '/',
      });

      return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/select-role`);
    } catch (error) {
      this.logger.error(
        `Google authentication callback error: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Handle specific authentication errors with standardized error codes
      if (error instanceof UnauthorizedException) {
        const errorCode = error.getResponse()['code'];

        switch (errorCode) {
          case 'USER_NOT_FOUND':
            return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_010`);
          case 'ACCOUNT_INACTIVE':
            return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_011`);
          default:
            // Fallback to checking error message for backward compatibility
            const errorMessage = error.message;
            if (errorMessage.includes('pending activation') || errorMessage.includes('PRE_REGISTRATION')) {
              return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_003`);
            } else if (errorMessage.includes('deactivated') || errorMessage.includes('INACTIVE')) {
              return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_004`);
            } else if (errorMessage.includes('no access')) {
              return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_005`);
            }
            // Generic unauthorized error
            return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_006`);
        }
      }
    }
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @Get('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshTokenFromCookie = req.cookies.refresh_token;
    if (refreshTokenFromCookie) {
      try {
        await this.authService.revokeRefreshToken(refreshTokenFromCookie);
      } catch (error) {
        this.logger.warn(
          `Failed to revoke refresh token on logout: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    res.clearCookie('auth_token', {
      domain: '.arayaroma.software',
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      domain: '.arayaroma.software',
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('active_role_id', {
      domain: '.arayaroma.software',
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Return new access token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // JwtRefreshStrategy populates req.user with { id, email, refreshTokenFromCookie, refreshTokenDbId }
    const userFromStrategy = req.user as {
      id: string;
      email: string;
      refreshTokenDbId: string;
      refreshTokenFromCookie: string;
    };

    if (!userFromStrategy || !userFromStrategy.refreshTokenDbId) {
      this.logger.error('User object or refreshTokenDbId not found in request after JwtRefreshGuard.');
      throw new UnauthorizedException('Authentication data missing for refresh.');
    }

    try {
      const { token: newAccessToken, refreshToken: newRawRefreshToken } =
        await this.authService.refreshToken(userFromStrategy);

      res.cookie('auth_token', newAccessToken, {
        domain: '.arayaroma.software',
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        maxAge: this.getCookieMaxAge('JWT_EXPIRATION'),
        sameSite: 'lax',
        path: '/',
      });

      res.cookie('refresh_token', newRawRefreshToken, {
        domain: '.arayaroma.software',
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        maxAge: this.getCookieMaxAge('JWT_REFRESH_EXPIRATION'),
        sameSite: 'lax',
        path: '/',
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      this.logger.error(
        `Refresh token rotation error: ${error instanceof Error ? error.message : String(error)}`,
      );

      res.clearCookie('auth_token', {
        domain: '.arayaroma.software',
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/',
      });
      res.clearCookie('refresh_token', {
        domain: '.arayaroma.software',
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/',
      });

      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to refresh token due to an internal error.');
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RoleManagerService } from './role-manager.service';
import { Body } from '@nestjs/common/decorators/http/route-params.decorator';
import { parseExpiryToMilliseconds } from './utils/expiry-parser.util';
import { SwitchRoleDto } from './dto/switch-role.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger: Logger;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly roleManagerService: RoleManagerService, // Inject RoleManagerService
  ) {
    this.logger = new Logger(AuthController.name);
  }

  private getCookieMaxAge(key: 'JWT_EXPIRATION' | 'JWT_REFRESH_EXPIRATION'): number {
    const expiryString = this.configService.get<string>(key);
    if (!expiryString) {
      this.logger.error(`Missing environment variable: ${key}`);
      return 0; // Or some default value
    }

    return parseExpiryToMilliseconds(expiryString);
  }

  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirect to Google authentication page' })
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Guard initiates Google OAuth flow
  }

  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect after successful authentication' })
  @ApiResponse({ status: 403, description: 'Email domain not allowed' })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    this.logger.debug('Google auth callback initiated');
    try {
      if (!req.user) {
        this.logger.error('User not found in request after Google OAuth callback');
        return res.redirect(
          `${this.configService.get('FRONTEND_URL')}/auth/error?message=authentication_failed`,
        );
      }

      // Assuming req.user from GoogleStrategy has an 'email' property
      const googleUser = req.user as { email: string; [key: string]: any };
      const allowedDomain = '@est.una.ac.cr';

      if (!googleUser.email || !googleUser.email.endsWith(allowedDomain)) {
        this.logger.warn(`Login attempt from disallowed domain: ${googleUser.email || 'No email provided'}`);
        // Option 1: Redirect to an error page on the frontend
        return res.redirect(`${this.configService.get('FRONTEND_URL')}`);
        // Option 2: Throw a ForbiddenException (frontend would need to handle this 403 error)
        // throw new ForbiddenException(`Access restricted to ${allowedDomain} emails.`);
      }

      const result = await this.authService.googleLogin(req.user);
      this.logger.debug(`User ${result.user.email} authenticated successfully via Google.`);

      res.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        maxAge: this.getCookieMaxAge('JWT_EXPIRATION'),
        sameSite: 'lax',
        path: '/',
      });

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        maxAge: this.getCookieMaxAge('JWT_REFRESH_EXPIRATION'),
        sameSite: 'lax',
        path: '/',
      });

      return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/select-role`); // Or dashboard
    } catch (error) {
      this.logger.error(
        `Google authentication callback error: ${error instanceof Error ? error.message : String(error)}`,
      );
      // If it's a ForbiddenException we threw, let it propagate or handle specifically
      if (error instanceof ForbiddenException) {
        // If you chose Option 2 above, you might want to redirect here as well,
        // or let NestJS handle sending the 403 response.
        // For consistency with redirection:
        return res.redirect(
          `${this.configService.get('FRONTEND_URL')}/auth/error?message=domain_not_allowed`,
        );
      }
      return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?message=internal_error`);
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
        // Continue with clearing cookies even if DB revocation fails
      }
    }

    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('refresh_token', {
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
  @UseGuards(JwtRefreshGuard) // This guard uses JwtRefreshStrategy
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // JwtRefreshStrategy populates req.user with { id, email, refreshTokenFromCookie, refreshTokenDbId }
    const userFromStrategy = req.user as {
      id: string;
      email: string;
      refreshTokenDbId: string;
      refreshTokenFromCookie: string;
      fullName?: string;
      fullLastName?: string;
      activeRole?: any;
    };

    if (!userFromStrategy || !userFromStrategy.refreshTokenDbId) {
      this.logger.error('User object or refreshTokenDbId not found in request after JwtRefreshGuard.');
      throw new UnauthorizedException('Authentication data missing for refresh.');
    }

    // Ensure required properties are present
    const userForRefresh = {
      id: userFromStrategy.id,
      email: userFromStrategy.email,
      refreshTokenDbId: userFromStrategy.refreshTokenDbId,
      fullName: userFromStrategy.fullName ?? '',
      fullLastName: userFromStrategy.fullLastName ?? '',
      activeRole: userFromStrategy.activeRole,
    };

    try {
      const { token: newAccessToken, refreshToken: newRawRefreshToken } =
        await this.authService.refreshToken(userForRefresh);

      res.cookie('auth_token', newAccessToken, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        maxAge: this.getCookieMaxAge('JWT_EXPIRATION'),
        sameSite: 'lax',
        path: '/',
      });

      res.cookie('refresh_token', newRawRefreshToken, {
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
      // If authService.refreshToken throws (e.g., due to failure marking old token as used),
      // or if JwtRefreshStrategy threw (e.g. family invalidation), cookies should be cleared.
      // The strategy itself handles family invalidation if a used token is presented.
      // If an error occurs during rotation after validation, clear cookies.
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'lax',
        path: '/',
      });
      res.clearCookie('refresh_token', {
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

  // In AuthController.ts
  @Get('verify-token')
  @ApiOperation({ summary: 'Verify if token is valid' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid' })
  verifyToken(@Req() req: Request) {
    const token = req.cookies.auth_token;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const isValid = this.authService.validateToken(token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    return { valid: true };
  }

  // Add this new endpoint to your AuthController

  @Get('available-roles')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get available roles for current user' })
  @ApiResponse({ status: 200, description: 'List of available roles' })
  async getAvailableRoles(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.roleManagerService.getUserAvailableRoles(userId);
  }

  // helper function to set cookies
  private setCookies(res: Response, tokens: { accessToken?: string; refreshToken?: string }) {
    if (tokens.accessToken) {
      res.cookie('auth_token', tokens.accessToken, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        maxAge: this.getCookieMaxAge('JWT_EXPIRATION'),
        sameSite: 'lax',
        path: '/',
      });
    }

    if (tokens.refreshToken) {
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        maxAge: this.getCookieMaxAge('JWT_REFRESH_EXPIRATION'),
        sameSite: 'lax',
        path: '/',
      });
    }
  }

  @Post('switch-role')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Switch to another authorized role' })
  @ApiResponse({ status: 200, description: 'Role switched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async switchRole(
    @Req() req: Request,
    @Body() switchRoleDto: SwitchRoleDto, // Usar el DTO existente
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = (req.user as any).id;
    try {
      const result = await this.roleManagerService.switchUserRole(userId, switchRoleDto.roleId);
      this.setCookies(res, { accessToken: result.token });
      return { message: 'Role switched successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error switching role: ${errorMessage}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error al cambiar de rol');
    }
  }
}

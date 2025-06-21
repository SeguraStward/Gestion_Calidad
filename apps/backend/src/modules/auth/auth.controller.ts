import {
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  Body,
  Header,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleUser } from './interfaces';
import { LoginUserDto, CompleteProfileDto, UserResponseDto } from './dtos';
import { mapUserToResponse, validateUserData, logUserResponse } from './helpers/user-mapper.helper';

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

      // Log detailed user information for debugging
      this.logger.debug('Google OAuth user data:', JSON.stringify(req.user, null, 2));

      // Assuming req.user from GoogleStrategy has an 'email' property
      const googleUser = req.user as { email: string; [key: string]: any };
      const allowedDomain = '@est.una.ac.cr';

      if (!googleUser.email || !googleUser.email.endsWith(allowedDomain)) {
        this.logger.warn(`Login attempt from disallowed domain: ${googleUser.email || 'No email provided'}`);
        return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_002`);
      }

      // Validar que tengamos los datos mínimos necesarios
      if (!googleUser.email) {
        this.logger.error('Google user missing required email field');
        return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_008`);
      }

      this.logger.log(`Processing Google login for user: ${googleUser.email}`);
      const result = await this.authService.googleLogin(req.user as GoogleUser);
      this.logger.debug(`Google login result:`, JSON.stringify(result, null, 2));

      // Validar que el resultado contenga los datos básicos del usuario
      if (!result.user || !result.user.id || !result.user.email) {
        this.logger.error('Invalid user data returned from authentication service', result);
        return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_009`);
      }

      // Set cookies with detailed logging
      this.logger.debug('Setting auth cookies...');
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
      this.logger.debug('Auth cookies set successfully');

      // Redirect based on user status
      if (result.needsProfileCompletion) {
        this.logger.log(`Redirecting user ${result.user.email} to complete profile`);
        return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/complete-profile`);
      } else {
        this.logger.log(`Redirecting user ${result.user.email} to role selection`);
        return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/callback`);
      }
    } catch (error) {
      this.logger.error(
        `Google authentication callback error: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Handle specific authentication errors with standardized error codes
      if (error instanceof UnauthorizedException) {
        const errorResponse = error.getResponse() as any;
        const errorCode = errorResponse?.code;

        switch (errorCode) {
          case 'USER_NOT_FOUND':
            return res.redirect(
              `${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_010&action=register`,
            );
          case 'ACCOUNT_INACTIVE':
            return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_011`);
          case 'ACCOUNT_PENDING':
            return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_012`);
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

      // If it's not an UnauthorizedException, redirect to generic error
      return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error?code=AUTH_007`);
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
    res.clearCookie('user_active_role_id', {
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

  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'Return current user info', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  async getCurrentUserInfo(@Req() req: Request): Promise<UserResponseDto> {
    const jwtUser = req.user as { id: string; email: string; [key: string]: any };
    const timestamp = new Date().toISOString();

    this.logger.log(`[${timestamp}] 📡 Solicitud de perfil de usuario: ${jwtUser.email} (ID: ${jwtUser.id})`);

    try {
      this.logger.debug(`[${timestamp}] 🔍 Obteniendo datos de usuario desde base de datos...`);
      const user = await this.authService.getUserById(jwtUser.id);

      this.logger.debug(`[${timestamp}] 📊 Datos obtenidos de BD:`, {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        fullLastName: user.fullLastName,
        photoUrl: user.photoUrl,
        status: user.status,
      });

      validateUserData(user);
      const response = mapUserToResponse(user);

      this.logger.log(`[${timestamp}] ✅ Respuesta de perfil preparada para: ${user.email}`);
      logUserResponse(response, 'GET /auth/me');

      return response;
    } catch (error) {
      this.logger.error(`[${timestamp}] ❌ Error obteniendo info de usuario ${jwtUser.id}:`, error);
      throw new UnauthorizedException('User not found');
    }
  }

  @ApiOperation({ summary: 'Authenticate existing user' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  @Post('authenticate')
  async authenticate(@Body() loginDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.authService.googleLogin({
        googleId: loginDto.googleId,
        email: loginDto.email,
        firstName: '', // Will be updated from Google data if available
        picture: null, // Will be updated from Google data if available
      });

      this.logger.log(`User authentication successful: ${loginDto.email}`);

      // Set cookies
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

      return {
        message: 'Authentication successful',
        user: result.user,
        needsProfileCompletion: result.needsProfileCompletion || false,
      };
    } catch (error) {
      this.logger.error(`Authentication failed for ${loginDto.email}:`, error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Complete user profile' })
  @ApiResponse({ status: 200, description: 'Profile completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid profile data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  async completeProfile(@Body() profileData: CompleteProfileDto, @Req() req: Request) {
    const user = req.user as { id: string; email: string };

    try {
      const result = await this.authService.completeUserProfile(user.id, {
        fullName: profileData.fullName,
        fullLastName: profileData.fullLastName,
        phoneNumber: profileData.phoneNumber,
      });

      this.logger.log(`Profile completion successful for user: ${user.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Profile completion failed for user ${user.email}:`, error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Check authentication status after OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Return authentication status and user info',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @Get('callback/status')
  @UseGuards(JwtAuthGuard)
  async getCallbackStatus(@Req() req: Request) {
    const user = req.user as { id: string; email: string };
    try {
      const userInfo = await this.authService.getUserById(user.id);
      validateUserData(userInfo);
      const userResponse = mapUserToResponse(userInfo);
      logUserResponse(userResponse, 'GET /auth/callback/status');
      return {
        authenticated: true,
        user: userResponse,
        needsProfileCompletion: userInfo.status === 'PRE_REGISTRATION',
      };
    } catch (error) {
      this.logger.error(`Error getting callback status for user ${user.id}:`, error);
      throw new UnauthorizedException('Unable to verify authentication status');
    }
  }
}

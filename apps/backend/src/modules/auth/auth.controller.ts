import {
  Body,
  Controller,
  Get,
  Header,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleUser } from './types';
import { LoginUserDto, CompleteProfileDto, UserResponseDto, SetActiveRoleDto } from './dtos';
import { mapUserToResponse, validateUserData } from './helpers/user-mapper.helper';
import { CookieUtil } from './utils/cookie.util';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger: Logger;
  private readonly cookieUtil: CookieUtil;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new Logger(AuthController.name);
    this.cookieUtil = new CookieUtil(configService);
  }

  /**
   * Helper method to handle authentication errors with centralized error mapping
   */
  private handleAuthError(error: any, res: Response) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    let errorCode = 'AUTH_007'; // Default error code

    if (error instanceof UnauthorizedException) {
      const errorResponse = error.getResponse() as any;
      const responseCode = errorResponse?.code;
      const errorMessage = error.message || '';

      // Map specific error codes and patterns to frontend error codes
      const errorMap = {
        USER_NOT_FOUND: 'AUTH_010&action=register',
        ACCOUNT_INACTIVE: 'AUTH_011',
        ACCOUNT_PENDING: 'AUTH_012',
      };

      if (responseCode && errorMap[responseCode]) {
        errorCode = errorMap[responseCode];
      } else if (errorMessage.includes('pending activation') || errorMessage.includes('PRE_REGISTRATION')) {
        errorCode = 'AUTH_003';
      } else if (errorMessage.includes('deactivated') || errorMessage.includes('INACTIVE')) {
        errorCode = 'AUTH_004';
      } else if (errorMessage.includes('no access')) {
        errorCode = 'AUTH_005';
      } else {
        errorCode = 'AUTH_006';
      }
    }

    this.logger.error(`Authentication error handled: ${errorCode}`, error);
    return res.redirect(`${frontendUrl}/auth/error?code=${errorCode}`);
  }

  /**
   * Helper method to set authentication cookies
   */
  private setAuthCookies(res: Response, token: string, refreshToken: string) {
    const authTokenConfig = this.cookieUtil.getAuthTokenConfig();
    const refreshTokenConfig = this.cookieUtil.getRefreshTokenConfig();

    res.cookie('auth_token', token, authTokenConfig);
    res.cookie('refresh_token', refreshToken, refreshTokenConfig);

    this.logger.debug('Authentication cookies set successfully');
  }

  /**
   * Helper method to clear all authentication cookies
   */
  private clearAuthCookies(res: Response) {
    const clearCookieConfig = this.cookieUtil.getBaseCookieConfig();
    res.clearCookie('auth_token', clearCookieConfig);
    res.clearCookie('refresh_token', clearCookieConfig);
    res.clearCookie('active_role_id', clearCookieConfig);

    this.logger.debug('All authentication cookies cleared');
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
    try {
      const result = await this.processGoogleCallback(req);
      this.setAuthCookies(res, result.token, result.refreshToken);

      const redirectPath = result.needsProfileCompletion ? '/auth/complete-profile' : '/auth/callback';
      this.logger.log(`Redirecting user ${result.user.email} to ${redirectPath}`);

      return res.redirect(`${this.configService.get('FRONTEND_URL')}${redirectPath}`);
    } catch (error) {
      this.logger.error('Google authentication callback error:', error);
      return this.handleAuthError(error, res);
    }
  }

  /**
   * Process Google OAuth callback with validation
   */
  private async processGoogleCallback(req: Request) {
    if (!req.user) {
      this.logger.error('User not found in request after Google OAuth callback');
      throw new Error('Authentication data missing');
    }

    const googleUser = req.user as { email: string; [key: string]: any };
    // const allowedDomain = '@est.una.ac.cr';

    // // Validate domain
    // if (!googleUser.email?.endsWith(allowedDomain)) {
    //   this.logger.warn(`Login attempt from disallowed domain: ${googleUser.email || 'No email'}`);
    //   throw new Error('Domain not allowed');
    // }

    // Process login
    this.logger.log(`Processing Google login for user: ${googleUser.email}`);
    const result = await this.authService.googleLogin(req.user as GoogleUser);

    // Validate result
    if (!result.user?.id || !result.user?.email) {
      this.logger.error('Invalid user data returned from authentication service');
      throw new Error('Invalid user response');
    }

    return result;
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({ summary: 'Set active role for current user' })
  @ApiResponse({ status: 200, description: 'Active role set successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid role ID' })
  @Post('set-active-role')
  @UseGuards(JwtAuthGuard)
  async setActiveRole(
    @Body() setActiveRoleDto: SetActiveRoleDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as { id: string; email: string };

    try {
      await this.authService.setActiveRole(user.id, setActiveRoleDto.roleId);

      const activeRoleConfig = this.cookieUtil.getActiveRoleConfig();
      res.cookie('active_role_id', setActiveRoleDto.roleId, activeRoleConfig);

      return { message: 'Active role set successfully', roleId: setActiveRoleDto.roleId };
    } catch (error) {
      this.logger.error(`Error setting active role for user ${user.id}: ${error}`);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Get current active role' })
  @ApiResponse({ status: 200, description: 'Return current active role ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('active-role')
  @UseGuards(JwtAuthGuard)
  getActiveRole(@Req() req: Request) {
    const activeRoleId = req.cookies.active_role_id;
    return { activeRoleId: activeRoleId || null };
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

    // Clear all authentication cookies
    this.clearAuthCookies(res);
    return { message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Return new access token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userFromStrategy = req.user as {
      id: string;
      email: string;
      refreshTokenDbId: string;
      refreshTokenFromCookie: string;
    };

    if (!userFromStrategy?.refreshTokenDbId) {
      this.logger.error('Authentication data missing for refresh token');
      throw new UnauthorizedException('Authentication data missing for refresh.');
    }

    try {
      const { token: newAccessToken, refreshToken: newRawRefreshToken } =
        await this.authService.refreshToken(userFromStrategy);

      this.setAuthCookies(res, newAccessToken, newRawRefreshToken);
      return { accessToken: newAccessToken };
    } catch (error) {
      this.logger.error('Refresh token rotation error:', error);
      this.clearAuthCookies(res);

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

      validateUserData(user);
      const response = mapUserToResponse(user);

      this.logger.log(`[${timestamp}] ✅ Respuesta de perfil preparada para: ${user.email}`);

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
      this.setAuthCookies(res, result.token, result.refreshToken);

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

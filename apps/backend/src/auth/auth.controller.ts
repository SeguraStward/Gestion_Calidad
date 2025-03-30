// src/auth/auth.controller.ts
import { Controller, Get, UseGuards, Req, Res, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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

  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({ status: 302, description: 'Redirect to Google authentication page' })
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // This route initiates the Google OAuth flow
    // The guard redirects to Google's authentication page
  }

  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect after successful authentication' })
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    this.logger.debug('Google auth callback initiated');

    try {
      if (!req.user) {
        this.logger.warn('No user data received from Google');
        return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error`);
      }

      // invalid email address
      const userEmail = (req.user as { email: string }).email;
      if (!userEmail.endsWith('@est.una.ac.cr')) {
        this.logger.warn(`Invalid email domain: ${userEmail}`);
        //change url
        return res.redirect(`${this.configService.get('FRONTEND_URL')}/profile`);
      }

      const result = await this.authService.googleLogin(req.user);
      this.logger.debug('User authenticated successfully');

      // Set the token in an HTTP-only cookie
      res.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
      });

      // Redirect to frontend success page
      return res.redirect(`${this.configService.get('FRONTEND_URL')}/profile`);
    } catch (error) {
      this.logger.error(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/error`);
    }
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    // The JwtAuthGuard will add the user object to the request
    //then we return the user
    return req.user;
  }

  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token');
    return { message: 'Logged out successfully' };
  }
}

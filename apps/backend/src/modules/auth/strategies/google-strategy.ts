// src/auth/strategies/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/drive.file', // Permisos para crear/gestionar archivos en Drive
      ],
      prompt: 'consent', // Fuerza la pantalla de consentimiento para obtener refresh token
      accessType: 'offline', // Permite obtener refresh tokens
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: name?.givenName || '',
      fullLastName: name?.familyName || '',
      picture: photos[0]?.value,
      accessToken,
      refreshToken, // Guardar refresh token
    };

    done(null, user);
  }
}

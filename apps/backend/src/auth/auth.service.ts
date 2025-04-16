// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async googleLogin(googleUser: any) {
    // Find or create user based on Google information
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.googleId },
          {
            email: {
              email: googleUser.email,
              isVerified: true,
            },
          },
        ],
      },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: {
            // Changed to match UserEmail type
            email: googleUser.email,
            isVerified: true,
          },
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          googleId: googleUser.googleId,
          photoUrl: googleUser.picture,
        },
      });
    } else if (user.googleId !== googleUser.googleId) {
      // Update existing user with Google information
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.googleId,
          ...(user.photoUrl ? {} : { photoUrl: googleUser.picture }),
        },
      });
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email.email); // Note the nested email access

    return {
      user: {
        id: user.id,
        email: user.email.email, // Changed to access nested email
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.photoUrl,
      },
      token,
    };
  }

  generateToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
    });
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      return null;
    }
  }
}

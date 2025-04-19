import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { LoggerMiddleware } from '@core/http/middlewares/logger.middleware';

import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';

import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

import { UsersModule } from '@modules/users/users.module';
import { CampusesModule } from './modules/campuses/campuses.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.register({}),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    CampusesModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

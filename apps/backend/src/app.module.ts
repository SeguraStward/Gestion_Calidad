import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerMiddleware } from '@core/http/middlewares/logger.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    JwtModule.register({}),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [PrismaService],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

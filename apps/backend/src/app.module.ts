import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerMiddleware } from '@core/http/middlewares/logger.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { UsersModule } from '@modules/users/users.module';
import { UsersService } from '@modules/users/services/users.service';
import { DtoValidator } from '@core/common/dto-validator';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [PrismaService, UsersService, DtoValidator],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

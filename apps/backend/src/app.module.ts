import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerMiddleware } from '@core/http/middlewares/logger.middleware';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

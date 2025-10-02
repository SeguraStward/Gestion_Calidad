import { Module } from '@nestjs/common';
import { JourneyTimeConfigsController } from './journey-time-configs.controller';
import { JourneyTimeConfigsService } from './journey-time-configs.service';
import { JourneyTimeConfigsRepository } from './journey-time-configs.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JourneyTimeConfigsController],
  providers: [JourneyTimeConfigsService, JourneyTimeConfigsRepository, PrismaService],
  exports: [JourneyTimeConfigsService],
})
export class JourneyTimeConfigsModule {}

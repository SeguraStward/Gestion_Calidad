import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { CommSessionsService } from './comm-sessions.service';
import { CommSessionsController } from './comm-sessions.controller';
import { CommSessionsRepository } from './comm-sessions.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CommSessionsController],
  providers: [CommSessionsService, CommSessionsRepository, DtoValidator],
  exports: [CommSessionsService, CommSessionsRepository],
})
export class CommSessionsModule {}

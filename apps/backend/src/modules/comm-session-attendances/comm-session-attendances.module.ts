import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { CommSessionAttendancesService } from './comm-session-attendances.service';
import { CommSessionAttendancesController } from './comm-session-attendances.controller';
import { CommSessionAttendancesRepository } from './comm-session-attendances.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CommSessionAttendancesController],
  providers: [CommSessionAttendancesService, CommSessionAttendancesRepository, DtoValidator],
  exports: [CommSessionAttendancesService, CommSessionAttendancesRepository],
})
export class CommSessionAttendancesModule {}

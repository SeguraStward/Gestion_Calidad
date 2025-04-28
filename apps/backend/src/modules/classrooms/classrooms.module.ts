import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ClassroomsService } from './classrooms.service';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsRepository } from './classrooms.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ClassroomsController],
  providers: [ClassroomsService, ClassroomsRepository, DtoValidator],
  exports: [ClassroomsService, ClassroomsRepository],
})
export class ClassroomsModule {}

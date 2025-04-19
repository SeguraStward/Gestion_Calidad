import { Module } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { ClassroomsService } from './classrooms.service';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsRepository } from './classrooms.repository';

@Module({
  controllers: [ClassroomsController],
  providers: [PrismaService, ClassroomsService, ClassroomsRepository, DtoValidator],
  exports: [ClassroomsService, ClassroomsRepository],
})
export class ClassroomsModule {}

import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';

import { DtoValidator } from '@core/common/dto-validator';

import { PpaasService } from './ppaas.service';

import { PpaasController } from './ppaas.controller';

import { PpaasRepository } from './ppaas.repository';

@Module({
  imports: [PrismaModule],

  controllers: [PpaasController],

  providers: [PpaasService, PpaasRepository, DtoValidator],

  exports: [PpaasService, PpaasRepository],
})
export class PpaasModule {}

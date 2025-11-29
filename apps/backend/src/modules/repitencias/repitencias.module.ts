import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';

import { RepitenciasController } from './repitencias.controller';
import { RepitenciasService } from './repitencias.service';
import { RepitenciasRepository } from './repitencias.repository';

@Module({
  imports: [PrismaModule],
  controllers: [RepitenciasController],
  providers: [RepitenciasService, RepitenciasRepository],
  exports: [RepitenciasService, RepitenciasRepository],
})
export class RepitenciasModule {}

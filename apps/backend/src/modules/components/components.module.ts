import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ComponentsService } from './components.service';
import { ComponentsController } from './components.controller';
import { ComponentsRepository } from './components.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ComponentsController],
  providers: [ComponentsService, ComponentsRepository, DtoValidator],
  exports: [ComponentsService, ComponentsRepository],
})
export class ComponentsModule { }

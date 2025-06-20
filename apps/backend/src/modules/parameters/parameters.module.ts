import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { ParametersService } from './parameters.service';
import { ParametersController } from './parameters.controller';
import { ParametersRepository } from './parameters.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ParametersController],
  providers: [ParametersService, ParametersRepository, DtoValidator],
  exports: [ParametersService, ParametersRepository],
})
export class ParametersModule {}

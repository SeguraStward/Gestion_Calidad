import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';
import { CareersRepository } from './careers.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CareersController],
  providers: [CareersService, CareersRepository, DtoValidator],
  exports: [CareersService, CareersRepository],
})
export class CareersModule {}

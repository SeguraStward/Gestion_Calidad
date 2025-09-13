import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { DocumentCountersService } from './document-counters.service';
import { DocumentCountersController } from './document-counters.controller';
import { DocumentCountersRepository } from './document-counters.repository';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentCountersController],
  providers: [DocumentCountersService, DocumentCountersRepository, DtoValidator],
  exports: [DocumentCountersService, DocumentCountersRepository],
})
export class DocumentCountersModule { }

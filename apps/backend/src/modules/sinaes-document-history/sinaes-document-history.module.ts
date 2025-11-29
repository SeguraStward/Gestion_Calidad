import { Module } from '@nestjs/common';
import { SinaesDocumentHistoryService } from './sinaes-document-history.service';
import { SinaesDocumentHistoryController } from './sinaes-document-history.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SinaesDocumentHistoryService],
  controllers: [SinaesDocumentHistoryController],
  exports: [SinaesDocumentHistoryService],
})
export class SinaesDocumentHistoryModule { }

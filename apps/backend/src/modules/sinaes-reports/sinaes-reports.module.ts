import { Module } from '@nestjs/common';
import { SinaesReportsService } from './sinaes-reports.service';
import { SinaesReportsController } from './sinaes-reports.controller';
import { PdfGeneratorService } from './pdf-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SinaesReportsService, PdfGeneratorService],
  controllers: [SinaesReportsController],
  exports: [SinaesReportsService],
})
export class SinaesReportsModule { }

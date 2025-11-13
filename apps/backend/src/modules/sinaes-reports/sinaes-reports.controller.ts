import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  Req,
  Res,
  Logger,
  DefaultValuePipe,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import type { Response as ResponseType } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SinaesReportsService } from './sinaes-reports.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { GenerateReportFiltersDto } from './dtos/generate-report-filters.dto';
import { ComplianceReportDto } from './dtos/compliance-report.dto';
import { ResourceName } from '../auth/decorators/resource-name.decorator';

@ApiTags('SINAES Reports')
@ResourceName('SINAES_REPORT')
@Controller('sinaes-reports')
export class SinaesReportsController {
  private readonly logger = new Logger(SinaesReportsController.name);

  constructor(
    private readonly sinaesReportsService: SinaesReportsService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) { }

  /**
   * Generate a compliance report
   */
  @Get('compliance')
  @ApiOperation({ summary: 'Generate SINAES compliance report' })
  @ApiQuery({ name: 'dimensionId', required: false, description: 'Filter by dimension ID' })
  @ApiQuery({ name: 'componentId', required: false, description: 'Filter by component ID' })
  @ApiQuery({ name: 'criterionId', required: false, description: 'Filter by criterion ID' })
  @ApiQuery({ name: 'careerId', required: false, description: 'Filter by career ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'reportName', required: false, description: 'Optional report name' })
  @ApiQuery({ name: 'description', required: false, description: 'Optional description' })
  @ApiResponse({ status: 200, description: 'Report generated successfully', type: ComplianceReportDto })
  async generateComplianceReport(
    @Query() filters: GenerateReportFiltersDto,
    @Req() request: Request,
  ): Promise<ComplianceReportDto> {
    this.logger.log('📊 Generating compliance report');

    const user = (request as any).user;
    const userId = user?.sub || user?.id;

    return this.sinaesReportsService.generateComplianceReport(filters, userId);
  }

  /**
   * Get a saved report by ID
   */
  @Get('compliance/:id')
  @ApiOperation({ summary: 'Get a saved compliance report by ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully', type: ComplianceReportDto })
  async getReportById(@Param('id') id: string): Promise<ComplianceReportDto> {
    this.logger.log(`📋 Getting report ${id}`);
    return this.sinaesReportsService.getReportById(id);
  }

  /**
   * List all saved reports
   */
  @Get('compliance/list/all')
  @ApiOperation({ summary: 'List all saved compliance reports' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async listReports(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    this.logger.log(`📚 Listing reports (page ${page}, limit ${limit})`);
    return this.sinaesReportsService.listReports(page, limit);
  }

  /**
   * Delete a report
   */
  @Delete('compliance/:id')
  @ApiOperation({ summary: 'Delete a compliance report' })
  async deleteReport(@Param('id') id: string): Promise<void> {
    this.logger.log(`🗑️ Deleting report ${id}`);
    return this.sinaesReportsService.deleteReport(id);
  }

  /**
   * Export compliance report as PDF
   */
  @Post('compliance/:id/export-pdf')
  @ApiOperation({ summary: 'Export a compliance report as PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  async exportPdf(
    @Param('id') id: string,
    @Res() res: ResponseType,
  ): Promise<void> {
    this.logger.log(`📄 Exporting report ${id} as PDF`);

    try {
      // Obtener el reporte
      const report = await this.sinaesReportsService.getReportById(id);

      if (!report) {
        throw new HttpException(
          `Report with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Generar el PDF
      const pdfBuffer = await this.pdfGeneratorService.generateCompliancePdf(report);

      // Configurar headers para descarga
      const filename = `Reporte_Cumplimiento_SINAES_${report.reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
      this.logger.log(`✅ PDF exported successfully: ${filename}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`❌ Error exporting PDF: ${errorMessage}`, errorStack);
      throw new HttpException(
        'Error generating PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

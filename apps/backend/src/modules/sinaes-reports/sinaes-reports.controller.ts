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
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import type { Response as ResponseType } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SinaesReportsService } from './sinaes-reports.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { GenerateReportFiltersDto } from './dtos/generate-report-filters.dto';
import { ComplianceReportDto } from './dtos/compliance-report.dto';
import { DocumentsByCareerFiltersDto } from './dtos/documents-by-career-filters.dto';
import { DocumentsByCareerReportDto } from './dtos/documents-by-career.dto';
import { ResourceName } from '../auth/decorators/resource-name.decorator';
import { JwtAuthGuard } from '@src/modules/auth/guards';

@ApiTags('SINAES Reports')
@ApiBearerAuth()
@ResourceName('SINAES_REPORT')
@UseGuards(JwtAuthGuard)
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
    @Req() request: ExpressRequest & { user?: { sub?: string; id?: string } },
  ): Promise<ComplianceReportDto> {
    this.logger.log('📊 Generating compliance report');

    const user = request.user;
    const userId = user?.sub || user?.id;

    return this.sinaesReportsService.generateComplianceReport(filters, userId);
  }

  /**
   * Inventory-style report by career. Returns counts (no compliance %) and
   * the hierarchy locations where each career has documents — plus the
   * gaps (evidences with zero documents for that career).
   *
   * `careerIds` may arrive as a comma-separated string from the query parser;
   * it is split here before passing it to the service.
   */
  @Get('documents-by-career')
  @ApiOperation({
    summary:
      'Documents-by-career inventory: counts per hierarchy location + list of gaps. No compliance percentages.',
  })
  @ApiQuery({ name: 'careerIds', required: false, description: 'Comma-separated career IDs. Omit to include all active careers.' })
  @ApiQuery({ name: 'dimensionId', required: false })
  @ApiQuery({ name: 'componentId', required: false })
  @ApiQuery({ name: 'criterionId', required: false })
  @ApiResponse({ status: 200, type: DocumentsByCareerReportDto })
  async generateDocumentsByCareer(
    @Query('careerIds') careerIdsRaw: string | undefined,
    @Query() rest: DocumentsByCareerFiltersDto,
    @Req() request: ExpressRequest & { user?: { sub?: string; id?: string } },
  ): Promise<DocumentsByCareerReportDto> {
    const userId = request.user?.sub || request.user?.id;
    const careerIds = careerIdsRaw
      ? careerIdsRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    return this.sinaesReportsService.generateDocumentsByCareer(
      {
        careerIds,
        dimensionId: rest.dimensionId,
        componentId: rest.componentId,
        criterionId: rest.criterionId,
      },
      userId,
    );
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

  /**
   * Export a temporary/generated compliance report as PDF (without saving)
   */
  @Post('compliance/export-pdf-temp')
  @ApiOperation({ summary: 'Export a temporary compliance report as PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  async exportTempReportPdf(
    @Body() report: ComplianceReportDto,
    @Res() res: ResponseType,
  ): Promise<void> {
    this.logger.log(`📄 Exporting temporary report as PDF: ${report.reportName || 'Sin nombre'}`);

    try {
      // Validar y normalizar el reporte
      const normalizedReport: ComplianceReportDto = {
        ...report,
        reportName: report.reportName || 'Reporte de Cumplimiento',
        generatedAt: report.generatedAt || new Date(),
        filters: report.filters || {},
        statistics: report.statistics || {
          totalDimensions: 0,
          totalComponents: 0,
          totalCriteria: 0,
          totalEvidences: 0,
          evidencesWithDocuments: 0,
          evidencesMissing: 0,
          totalDocuments: 0,
          overallCompliance: 0,
          overallStatus: 'POOR',
        },
        dimensions: report.dimensions || [],
      };

      this.logger.debug(`📋 Normalized report data:`, {
        reportName: normalizedReport.reportName,
        hasFilters: !!normalizedReport.filters,
        hasStatistics: !!normalizedReport.statistics,
        dimensionsCount: normalizedReport.dimensions.length,
      });

      // Generar el PDF directamente del reporte en memoria
      const pdfBuffer = await this.pdfGeneratorService.generateCompliancePdf(normalizedReport);

      // Configurar headers para descarga
      const filename = `Reporte_Cumplimiento_SINAES_${normalizedReport.reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
      this.logger.log(`✅ Temporary PDF exported successfully: ${filename}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`❌ Error exporting temporary PDF: ${errorMessage}`, errorStack);
      throw new HttpException(
        'Error generating PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Export the documents-by-career inventory as a PDF. Receives the already-
   * generated report payload (no second DB round-trip), mirrors the pattern
   * of `compliance/export-pdf-temp`.
   */
  @Post('documents-by-career/export-pdf-temp')
  @ApiOperation({ summary: 'Export documents-by-career inventory as PDF' })
  async exportInventoryPdf(
    @Body() report: DocumentsByCareerReportDto,
    @Res() res: ResponseType,
  ): Promise<void> {
    this.logger.log(
      `📄 Exporting inventory PDF (${report?.careers?.length ?? 0} careers)`,
    );

    try {
      const normalized: DocumentsByCareerReportDto = {
        ...report,
        generatedAt: report.generatedAt || new Date(),
        summary: report.summary || {
          totalCareers: 0,
          totalDocuments: 0,
          careersWithDocuments: 0,
          careersWithoutDocuments: 0,
          totalEvidences: 0,
        },
        careers: report.careers || [],
        filters: report.filters || {},
      };

      const pdfBuffer = await this.pdfGeneratorService.generateInventoryPdf(normalized);
      const filename = `Inventario_Documentos_por_Carrera_${new Date().toISOString().split('T')[0]}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
      });
      res.send(pdfBuffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`❌ Error exporting inventory PDF: ${message}`, stack);
      throw new HttpException('Error generating inventory PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

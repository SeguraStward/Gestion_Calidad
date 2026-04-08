import { Test, TestingModule } from '@nestjs/testing';
import { Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PdfGeneratorService } from '@modules/sinaes-reports/pdf-generator.service';
import { ComplianceReportDto, ComplianceComponentDto, ComplianceStandardDto, EvidenceSummaryDto } from '@modules/sinaes-reports/dtos/compliance-report.dto';

jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn(),
      setViewport: jest.fn(),
      pdf: jest.fn().mockResolvedValue(Buffer.from('PDF_CONTENT')),
    }),
    close: jest.fn(),
  }),
}));

describe('PdfGeneratorService (Unitaria)', () => {
  let service: PdfGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfGeneratorService],
    }).compile();

    service = module.get<PdfGeneratorService>(PdfGeneratorService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCompliancePdf', () => {
    it('Retorna un Buffer o Stream conteniendo la estructura PDF generada', async () => {
      const mockReport = {
        id: 'report-1',
        reportName: 'Reporte 1',
        generatedAt: new Date(),
        filters: {},
        statistics: {
          totalDimensions: 1,
          totalComponents: 1,
          totalCriteria: 1,
          totalEvidences: 1,
          evidencesWithDocuments: 1,
          evidencesMissing: 0,
          totalDocuments: 1,
          overallCompliance: 100,
          overallStatus: 'EXCELLENT',
        },
        dimensions: [],
      } as any;

      const result = await service.generateCompliancePdf(mockReport);

      expect(result).toBeInstanceOf(Buffer);
      // Validamos que el PDF sea generado y devuelva una instancia de logica
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
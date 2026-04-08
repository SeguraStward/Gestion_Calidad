import { Test, TestingModule } from '@nestjs/testing';
import { Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { SinaesReportsService } from '@modules/sinaes-reports/sinaes-reports.service';
import { PdfGeneratorService } from '@modules/sinaes-reports/pdf-generator.service';
import { PrismaService } from '@src/prisma/prisma.service';

describe('SinaesReportsService (Unitaria)', () => {
  let service: SinaesReportsService;
  let prisma: jest.Mocked<PrismaService>;
  let pdfGenerator: jest.Mocked<PdfGeneratorService>;

  const mockCareer = {
    id: 'career-1',
    name: 'Ingeniería en Sistemas',
    code: 'IS-01',
    description: 'Ingeniería en Sistemas',
    status: 'ACTIVE',
  };

  const mockStandard = {
    id: 'std-1',
    name: 'Plan de estudios',
    code: '1.1',
    status: 'ACTIVE',
  };

  const mockDimension = {
    id: 'dim-1',
    code: 'D1',
    name: 'Dimensión 1',
    components: [{
      id: 'comp-1',
      code: 'C1',
      name: 'Componente 1',
      criteria: [{
        id: 'crit-1',
        code: 'CR1',
        name: 'Criterio 1',
        hasDirectEvidences: false,
        evidences: [],
        standards: [{
          id: 'std-1',
          code: 'S1',
          name: 'Estándar 1',
          evidences: [{
            id: 'ev-1',
            code: 'E1',
            name: 'Evidencia 1',
            proofDocuments: []
          }]
        }]
      }]
    }],
  };

  const mockFilterDto = {
    dimensionId: 'dim-1',
    includeEvidences: true,
  };

  const mockPrismaService = () => ({
    dimension: {
      findMany: jest.fn(),
    },
    sinaesComplianceReport: {
      create: jest.fn().mockResolvedValue({ id: 'report-1' }),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  });

  const mockPdfGeneratorService = () => ({
    generateComplianceReport: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SinaesReportsService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
        {
          provide: PdfGeneratorService,
          useFactory: mockPdfGeneratorService,
        }
      ],
    }).compile();

    service = module.get<SinaesReportsService>(SinaesReportsService);
    prisma = module.get(PrismaService) as any;
    pdfGenerator = module.get(PdfGeneratorService) as any;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateComplianceReport', () => {
    it('Genera el JSON estructurado con el resumen de cumplimiento SINAES', async () => {
      prisma.dimension.findMany.mockResolvedValue([mockDimension] as any);

      const result = await service.generateComplianceReport(mockFilterDto);

      expect(prisma.dimension.findMany).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.dimensions).toHaveLength(1);
      expect(result.statistics.totalDimensions).toBe(1);
    });
  });
});
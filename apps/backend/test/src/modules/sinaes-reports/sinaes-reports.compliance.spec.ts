import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SinaesReportsService } from '@modules/sinaes-reports/sinaes-reports.service';
import { PdfGeneratorService } from '@modules/sinaes-reports/pdf-generator.service';
import { PrismaService } from '@src/prisma/prisma.service';

/**
 * Pruebas unitarias del cálculo de cumplimiento SINAES.
 *
 * Se enfoca en la matemática del reporte (porcentajes, estados, estadísticas),
 * la deduplicación de evidencias que aparecen por dos caminos (directa y vía
 * estándar) y el nuevo `missingEvidences` que alimenta el panel de faltantes.
 * Prisma está mockeado; no hay base de datos.
 */
describe('SinaesReportsService — cálculo de cumplimiento (Unitaria)', () => {
  let service: SinaesReportsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrismaService = () => ({
    dimension: {
      findMany: jest.fn(),
    },
    sinaesComplianceReport: {
      create: jest.fn().mockResolvedValue({ id: 'report-1' }),
    },
    career: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  });

  const mockPdfGeneratorService = () => ({
    generateCompliancePdf: jest.fn(),
  });

  /**
   * Construye un evidencia simulada con N documentos probatorios.
   * Solo se usan `code` y la longitud del arreglo en el cálculo.
   */
  const evidence = (id: string, code: string, docCodes: string[] = []) => ({
    id,
    code,
    name: `Evidencia ${code}`,
    description: null,
    proofDocuments: docCodes.map((c) => ({ code: c })),
  });

  /**
   * Árbol de jerarquía con dos criterios:
   *  - CR1 (evidencias directas): E1 con 1 doc, E2 sin docs
   *  - CR2 (vía estándar S1): E3 con 2 docs, E4 sin docs
   * Resultado esperado: 4 evidencias, 2 con docs, 3 documentos, 50% (FAIR).
   */
  const buildTree = () => [
    {
      id: 'dim-1',
      code: 'D1',
      name: 'Dimensión 1',
      description: null,
      components: [
        {
          id: 'comp-1',
          code: 'C1',
          name: 'Componente 1',
          description: null,
          criteria: [
            {
              id: 'crit-1',
              code: 'CR1',
              name: 'Criterio 1',
              description: null,
              hasDirectEvidences: true,
              evidences: [
                evidence('ev-1', 'E1', ['CONV-001']),
                evidence('ev-2', 'E2', []),
              ],
              standards: [],
            },
            {
              id: 'crit-2',
              code: 'CR2',
              name: 'Criterio 2',
              description: null,
              hasDirectEvidences: false,
              evidences: [],
              standards: [
                {
                  id: 'std-1',
                  code: 'S1',
                  name: 'Estándar 1',
                  evidences: [
                    evidence('ev-3', 'E3', ['DOC-1', 'DOC-2']),
                    evidence('ev-4', 'E4', []),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SinaesReportsService,
        { provide: PrismaService, useFactory: mockPrismaService },
        { provide: PdfGeneratorService, useFactory: mockPdfGeneratorService },
      ],
    }).compile();

    service = module.get<SinaesReportsService>(SinaesReportsService);
    prisma = module.get(PrismaService) as any;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  describe('generateComplianceReport — agregados y estadísticas', () => {
    it('calcula porcentajes y conteos por evidencia/criterio/componente/dimensión', async () => {
      prisma.dimension.findMany.mockResolvedValue(buildTree() as any);

      const result = await service.generateComplianceReport({} as any);

      // Estadísticas globales
      expect(result.statistics.totalEvidences).toBe(4);
      expect(result.statistics.evidencesWithDocuments).toBe(2);
      expect(result.statistics.evidencesMissing).toBe(2);
      expect(result.statistics.totalDocuments).toBe(3);
      expect(result.statistics.overallCompliance).toBe(50);
      expect(result.statistics.overallStatus).toBe('FAIR');

      // Dimensión
      const dim = result.dimensions[0];
      expect(dim.totalCriteria).toBe(2);
      expect(dim.totalEvidences).toBe(4);
      expect(dim.compliancePercentage).toBe(50);
      expect(dim.complianceStatus).toBe('FAIR');

      // Criterios: ambos al 50% → PARTIAL
      const [cr1, cr2] = dim.components[0].criteria;
      expect(cr1.totalDocuments).toBe(1);
      expect(cr1.complianceStatus).toBe('PARTIAL');
      expect(cr2.totalDocuments).toBe(2);
      expect(cr2.complianceStatus).toBe('PARTIAL');
    });

    it('marca cada evidencia como COMPLETE/MISSING según tenga documentos', async () => {
      prisma.dimension.findMany.mockResolvedValue(buildTree() as any);

      const result = await service.generateComplianceReport({} as any);
      const crit1 = result.dimensions[0].components[0].criteria[0];

      const e1 = crit1.evidences.find((e) => e.code === 'E1')!;
      const e2 = crit1.evidences.find((e) => e.code === 'E2')!;
      expect(e1.hasDocuments).toBe(true);
      expect(e1.documentCount).toBe(1);
      expect(e1.documentCodes).toEqual(['CONV-001']);
      expect(e1.complianceStatus).toBe('COMPLETE');
      expect(e2.hasDocuments).toBe(false);
      expect(e2.complianceStatus).toBe('MISSING');
    });

    it('da 0% cuando no hay evidencias (árbol vacío)', async () => {
      prisma.dimension.findMany.mockResolvedValue([] as any);

      const result = await service.generateComplianceReport({} as any);

      expect(result.dimensions).toHaveLength(0);
      expect(result.statistics.totalEvidences).toBe(0);
      expect(result.statistics.overallCompliance).toBe(0);
      expect(result.statistics.overallStatus).toBe('POOR');
    });

    it('persiste el reporte generado (saveReport) y devuelve su id', async () => {
      prisma.dimension.findMany.mockResolvedValue(buildTree() as any);

      const result = await service.generateComplianceReport({} as any);

      expect(prisma.sinaesComplianceReport.create).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('report-1');
    });

    it('al filtrar por carrera adjunta la info de la carrera y resuelve el nombre de quien genera', async () => {
      prisma.dimension.findMany.mockResolvedValue(buildTree() as any);
      (prisma.career.findUnique as jest.Mock).mockResolvedValue({
        id: 'career-1',
        code: 'IS-01',
        name: 'Ingeniería en Sistemas',
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        fullName: 'Ana Quesada',
        email: 'ana@una.cr',
      });

      const result = await service.generateComplianceReport(
        { careerId: 'career-1' } as any,
        'user-1',
      );

      expect(result.career).toEqual({
        id: 'career-1',
        code: 'IS-01',
        name: 'Ingeniería en Sistemas',
      });
      // "Generado por" muestra el nombre legible, no el id crudo.
      expect(result.generatedBy).toBe('Ana Quesada');
    });
  });

  describe('deduplicación de evidencias', () => {
    it('cuenta una sola vez una evidencia que aparece como directa y vía estándar', async () => {
      // E1 aparece como evidencia directa del criterio Y dentro del estándar.
      const tree = [
        {
          id: 'dim-1',
          code: 'D1',
          name: 'Dimensión 1',
          description: null,
          components: [
            {
              id: 'comp-1',
              code: 'C1',
              name: 'Componente 1',
              description: null,
              criteria: [
                {
                  id: 'crit-1',
                  code: 'CR1',
                  name: 'Criterio 1',
                  description: null,
                  hasDirectEvidences: true,
                  evidences: [evidence('ev-1', 'E1', ['CONV-001'])],
                  standards: [
                    {
                      id: 'std-1',
                      code: 'S1',
                      name: 'Estándar 1',
                      // Misma evidencia (mismo id) que la directa.
                      evidences: [evidence('ev-1', 'E1', ['CONV-001'])],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      prisma.dimension.findMany.mockResolvedValue(tree as any);

      const result = await service.generateComplianceReport({} as any);

      // A pesar de aparecer dos veces, se cuenta una sola.
      expect(result.statistics.totalEvidences).toBe(1);
      expect(result.statistics.evidencesWithDocuments).toBe(1);
      expect(result.statistics.overallCompliance).toBe(100);
      expect(result.statistics.overallStatus).toBe('EXCELLENT');
    });
  });

  describe('collectMissingEvidences', () => {
    it('aplana solo las evidencias sin documentos con su ruta jerárquica completa', async () => {
      prisma.dimension.findMany.mockResolvedValue(buildTree() as any);

      const result = await service.generateComplianceReport({} as any);

      expect(result.missingEvidences).toBeDefined();
      const missing = result.missingEvidences!;
      // E2 y E4 son las únicas sin documentos.
      expect(missing).toHaveLength(2);
      const codes = missing.map((m) => m.evidenceCode).sort();
      expect(codes).toEqual(['E2', 'E4']);

      // La ruta jerárquica viene completa para el deep-link "Subir aquí".
      const e2 = missing.find((m) => m.evidenceCode === 'E2')!;
      expect(e2).toMatchObject({
        dimensionCode: 'D1',
        dimensionName: 'Dimensión 1',
        componentCode: 'C1',
        componentName: 'Componente 1',
        criterionCode: 'CR1',
        criterionName: 'Criterio 1',
        evidenceId: 'ev-2',
        evidenceName: 'Evidencia E2',
      });
    });

    it('devuelve lista vacía cuando todas las evidencias tienen documentos', async () => {
      const tree = [
        {
          id: 'dim-1',
          code: 'D1',
          name: 'Dimensión 1',
          description: null,
          components: [
            {
              id: 'comp-1',
              code: 'C1',
              name: 'Componente 1',
              description: null,
              criteria: [
                {
                  id: 'crit-1',
                  code: 'CR1',
                  name: 'Criterio 1',
                  description: null,
                  hasDirectEvidences: true,
                  evidences: [evidence('ev-1', 'E1', ['DOC-1'])],
                  standards: [],
                },
              ],
            },
          ],
        },
      ];
      prisma.dimension.findMany.mockResolvedValue(tree as any);

      const result = await service.generateComplianceReport({} as any);

      expect(result.missingEvidences).toEqual([]);
      expect(result.statistics.overallCompliance).toBe(100);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SinaesReportsService } from '@modules/sinaes-reports/sinaes-reports.service';
import { PdfGeneratorService } from '@modules/sinaes-reports/pdf-generator.service';
import { PrismaService } from '@src/prisma/prisma.service';

/**
 * Pruebas unitarias del inventario de documentos por carrera.
 *
 * A diferencia del reporte de cumplimiento, este NO calcula porcentajes: cuenta
 * documentos por carrera, los ubica en la jerarquía y arma la lista de
 * "brechas" (evidencias sin documentos para esa carrera). Comparte el mismo
 * helper de jerarquía que el cumplimiento. Prisma está mockeado.
 */
describe('SinaesReportsService — inventario por carrera (Unitaria)', () => {
  let service: SinaesReportsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrismaService = () => ({
    career: {
      findMany: jest.fn(),
    },
    dimension: {
      findMany: jest.fn(),
    },
  });

  const mockPdfGeneratorService = () => ({
    generateInventoryPdf: jest.fn(),
  });

  /** Documento simulado asociado a una o más carreras. */
  const doc = (id: string, code: string, careerIds: string[]) => ({
    id,
    code,
    name: `Documento ${code}`,
    fileUrl: `https://drive/${code}`,
    fileName: `${code}.pdf`,
    createdAt: new Date('2026-01-01'),
    careerProofDocuments: careerIds.map((careerId) => ({ careerId })),
  });

  const evidence = (id: string, code: string, docs: any[]) => ({
    id,
    code,
    name: `Evidencia ${code}`,
    proofDocuments: docs,
  });

  /**
   * Árbol con una evidencia directa que SÍ tiene un documento de career-1 y
   * otra evidencia SIN documentos (brecha para career-1).
   */
  const buildTree = () => [
    {
      id: 'dim-1',
      code: 'D1',
      name: 'Dimensión 1',
      components: [
        {
          id: 'comp-1',
          code: 'C1',
          name: 'Componente 1',
          criteria: [
            {
              id: 'crit-1',
              code: 'CR1',
              name: 'Criterio 1',
              evidences: [
                evidence('ev-1', 'E1', [doc('doc-1', 'DOC-1', ['career-1'])]),
                evidence('ev-2', 'E2', []),
              ],
              standards: [],
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

  it('devuelve un reporte vacío cuando no hay carreras activas', async () => {
    prisma.career.findMany.mockResolvedValue([] as any);

    const result = await service.generateDocumentsByCareer({});

    expect(result.summary.totalCareers).toBe(0);
    expect(result.careers).toHaveLength(0);
    // No debe consultar la jerarquía si no hay carreras.
    expect(prisma.dimension.findMany).not.toHaveBeenCalled();
  });

  it('cuenta documentos por carrera y arma las brechas', async () => {
    prisma.career.findMany.mockResolvedValue([
      { id: 'career-1', code: 'IS-01', name: 'Ingeniería en Sistemas' },
    ] as any);
    prisma.dimension.findMany.mockResolvedValue(buildTree() as any);

    const result = await service.generateDocumentsByCareer({});

    // Resumen
    expect(result.summary.totalCareers).toBe(1);
    expect(result.summary.totalDocuments).toBe(1);
    expect(result.summary.careersWithDocuments).toBe(1);
    expect(result.summary.careersWithoutDocuments).toBe(0);
    expect(result.summary.totalEvidences).toBe(2);

    // Inventario de la carrera
    const career = result.careers[0];
    expect(career.totalDocuments).toBe(1);
    expect(career.evidencesCovered).toBe(1);
    expect(career.evidencesUncovered).toBe(1);

    // Brecha: E2 (sin documentos para esta carrera)
    expect(career.gaps).toHaveLength(1);
    expect(career.gaps[0]).toMatchObject({
      dimensionCode: 'D1',
      componentCode: 'C1',
      criterionCode: 'CR1',
      evidenceCode: 'E2',
    });

    // Ubicación del documento en la jerarquía (conteo en cada nivel)
    expect(career.dimensions[0].documentCount).toBe(1);
    expect(career.dimensions[0].components[0].criteria[0].documentCount).toBe(1);
  });

  it('no atribuye a una carrera los documentos de otra', async () => {
    prisma.career.findMany.mockResolvedValue([
      { id: 'career-1', code: 'IS-01', name: 'Sistemas' },
    ] as any);
    // El único documento pertenece a 'career-2', no a la carrera del reporte.
    const tree = [
      {
        id: 'dim-1',
        code: 'D1',
        name: 'Dimensión 1',
        components: [
          {
            id: 'comp-1',
            code: 'C1',
            name: 'Componente 1',
            criteria: [
              {
                id: 'crit-1',
                code: 'CR1',
                name: 'Criterio 1',
                evidences: [
                  evidence('ev-1', 'E1', [doc('doc-1', 'DOC-1', ['career-2'])]),
                ],
                standards: [],
              },
            ],
          },
        ],
      },
    ];
    prisma.dimension.findMany.mockResolvedValue(tree as any);

    const result = await service.generateDocumentsByCareer({});

    const career = result.careers[0];
    expect(career.totalDocuments).toBe(0);
    expect(career.evidencesCovered).toBe(0);
    expect(career.evidencesUncovered).toBe(1);
    expect(career.gaps).toHaveLength(1);
    // El documento existe pero es de otra carrera → no cuenta en el resumen.
    expect(result.summary.totalDocuments).toBe(0);
  });
});

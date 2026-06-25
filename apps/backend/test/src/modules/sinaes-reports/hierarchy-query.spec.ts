import {
  buildDimensionWhere,
  buildComplianceProofDocsWhere,
  buildHierarchyInclude,
} from '@modules/sinaes-reports/hierarchy/hierarchy-query';

/**
 * Pruebas unitarias del helper compartido de jerarquía SINAES.
 *
 * Son funciones puras (sin BD ni Nest): construyen los objetos `where`/`include`
 * de Prisma que ANTES estaban duplicados a mano dentro de los dos reportes.
 * Validar su forma garantiza que ambos reportes consulten la jerarquía idéntica.
 */
describe('hierarchy-query (helper compartido SINAES)', () => {
  describe('buildDimensionWhere', () => {
    it('filtra por id cuando se provee dimensionId', () => {
      expect(buildDimensionWhere('dim-1')).toEqual({ id: 'dim-1' });
    });

    it('devuelve un where vacío (todas las dimensiones) cuando no hay dimensionId', () => {
      expect(buildDimensionWhere(undefined)).toEqual({});
    });
  });

  describe('buildComplianceProofDocsWhere', () => {
    it('por defecto solo trae documentos ACTIVOS', () => {
      expect(buildComplianceProofDocsWhere({})).toEqual({ status: 'ACTIVE' });
    });

    it('agrega el filtro por carrera vía careerProofDocuments', () => {
      const where = buildComplianceProofDocsWhere({ careerId: 'career-1' });
      expect(where).toEqual({
        status: 'ACTIVE',
        careerProofDocuments: { some: { careerId: 'career-1' } },
      });
    });

    it('con solo dateFrom arma createdAt.gte', () => {
      const where = buildComplianceProofDocsWhere({ dateFrom: '2026-01-01' });
      expect(where.status).toBe('ACTIVE');
      expect(where.createdAt).toEqual({ gte: new Date('2026-01-01') });
    });

    it('con solo dateTo arma createdAt.lte', () => {
      const where = buildComplianceProofDocsWhere({ dateTo: '2026-12-31' });
      expect(where.createdAt).toEqual({ lte: new Date('2026-12-31') });
    });

    it('con ambas fechas arma un rango gte/lte', () => {
      const where = buildComplianceProofDocsWhere({
        dateFrom: '2026-01-01',
        dateTo: '2026-12-31',
      });
      expect(where.createdAt).toEqual({
        gte: new Date('2026-01-01'),
        lte: new Date('2026-12-31'),
      });
    });

    it('combina carrera + rango de fechas', () => {
      const where = buildComplianceProofDocsWhere({
        careerId: 'career-1',
        dateFrom: '2026-01-01',
        dateTo: '2026-06-30',
      });
      expect(where).toEqual({
        status: 'ACTIVE',
        careerProofDocuments: { some: { careerId: 'career-1' } },
        createdAt: { gte: new Date('2026-01-01'), lte: new Date('2026-06-30') },
      });
    });
  });

  describe('buildHierarchyInclude', () => {
    const proofDocumentsArgs = { where: { status: 'ACTIVE' } } as any;

    it('inyecta los mismos proofDocumentsArgs en evidencias directas y de estándar', () => {
      const include = buildHierarchyInclude({ proofDocumentsArgs }) as any;

      const evidenceInclude =
        include.components.include.criteria.include.evidences;
      const standardEvidenceInclude =
        include.components.include.criteria.include.standards.include.evidences;

      // Mismo objeto de carga de documentos en ambos caminos a la evidencia.
      expect(evidenceInclude.include.proofDocuments).toBe(proofDocumentsArgs);
      expect(standardEvidenceInclude.include.proofDocuments).toBe(proofDocumentsArgs);
    });

    it('solo trae evidencias y estándares ACTIVOS, ordenados por código', () => {
      const include = buildHierarchyInclude({ proofDocumentsArgs }) as any;
      const criteriaInclude = include.components.include.criteria.include;

      expect(criteriaInclude.evidences.where).toEqual({ status: 'ACTIVE' });
      expect(criteriaInclude.evidences.orderBy).toEqual({ code: 'asc' });
      expect(criteriaInclude.standards.where).toEqual({ status: 'ACTIVE' });
      expect(criteriaInclude.standards.orderBy).toEqual({ code: 'asc' });
    });

    it('sin filtros estructurales deja los where de componente/criterio vacíos', () => {
      const include = buildHierarchyInclude({ proofDocumentsArgs }) as any;
      expect(include.components.where).toEqual({});
      expect(include.components.include.criteria.where).toEqual({});
    });

    it('filtra por componente y criterio cuando se proveen ids reales', () => {
      const include = buildHierarchyInclude({
        proofDocumentsArgs,
        componentId: 'comp-1',
        criterionId: 'crit-1',
      }) as any;
      expect(include.components.where).toEqual({ id: 'comp-1' });
      expect(include.components.include.criteria.where).toEqual({ id: 'crit-1' });
    });

    it("trata el sentinel 'all' como 'sin filtro'", () => {
      const include = buildHierarchyInclude({
        proofDocumentsArgs,
        componentId: 'all',
        criterionId: 'all',
      }) as any;
      expect(include.components.where).toEqual({});
      expect(include.components.include.criteria.where).toEqual({});
    });
  });
});

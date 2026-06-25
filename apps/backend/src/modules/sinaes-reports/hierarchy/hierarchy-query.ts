import { Prisma } from '@una-gc/database/prisma/generated/client';

/**
 * Shared SINAES hierarchy query helpers.
 *
 * The full tree (Dimension → Component → Criterion → {direct evidences |
 * Standard → evidences}) was previously hand-written — with the proof-document
 * sub-query repeated four times — inside both `generateComplianceReport` and
 * `generateDocumentsByCareer`. Any change to the hierarchy meant editing the
 * same nested `include` in several places, with a real risk of the copies
 * drifting apart. These helpers make the include the single source of truth;
 * each report only injects how it wants to load `proofDocuments`.
 */

/** Prisma args used to load `proofDocuments` at each evidence node. */
export type ProofDocumentsArgs = Prisma.QualityEvidence$proofDocumentsArgs;

export interface HierarchyIncludeOptions {
  /**
   * How each evidence should load its proof documents. Compliance filters by
   * career/date; the inventory pulls all active docs with their career links.
   * The SAME args are applied to direct-criterion evidences and to
   * standard-nested evidences.
   */
  proofDocumentsArgs: ProofDocumentsArgs;
  /** Optional structural narrowing. `'all'` is treated as "no filter". */
  componentId?: string;
  /** Optional structural narrowing. `'all'` is treated as "no filter". */
  criterionId?: string;
}

/** Treats falsy / `'all'` as "no filter", otherwise narrows by id. */
function idFilter(id?: string): Prisma.ComponentWhereInput {
  return id && id !== 'all' ? { id } : {};
}

/**
 * Build the `include` for `prisma.dimension.findMany` that brings the whole
 * SINAES tree down to each evidence's proof documents. Evidences and standards
 * are ordered by `code` so report output (and the "missing" lists derived from
 * it) is deterministic; ordering never affects the compliance math.
 */
export function buildHierarchyInclude(
  opts: HierarchyIncludeOptions,
): Prisma.DimensionInclude {
  const { proofDocumentsArgs, componentId, criterionId } = opts;

  const evidenceInclude = {
    where: { status: 'ACTIVE' as const },
    orderBy: { code: 'asc' as const },
    include: { proofDocuments: proofDocumentsArgs },
  };

  return {
    components: {
      where: idFilter(componentId),
      orderBy: { order: 'asc' },
      include: {
        criteria: {
          where: idFilter(criterionId) as Prisma.CriterionWhereInput,
          orderBy: { order: 'asc' },
          include: {
            evidences: evidenceInclude,
            standards: {
              where: { status: 'ACTIVE' },
              orderBy: { code: 'asc' },
              include: { evidences: evidenceInclude },
            },
          },
        },
      },
    },
  };
}

/** Where-clause for the top-level dimension query shared by both reports. */
export function buildDimensionWhere(dimensionId?: string): Prisma.DimensionWhereInput {
  return dimensionId ? { id: dimensionId } : {};
}

/**
 * Proof-document filter for the compliance report: only ACTIVE docs, optionally
 * scoped to a career and/or a creation-date window. Previously this exact block
 * was inlined twice (direct evidences + standard evidences) inside the report
 * method; centralizing it guarantees both evidence paths filter identically.
 */
export function buildComplianceProofDocsWhere(filters: {
  careerId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Prisma.ProofDocumentWhereInput {
  const where: Prisma.ProofDocumentWhereInput = { status: 'ACTIVE' };

  if (filters.careerId) {
    where.careerProofDocuments = { some: { careerId: filters.careerId } };
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
      ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
    };
  }

  return where;
}

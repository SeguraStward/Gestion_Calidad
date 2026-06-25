import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import {
  ComplianceReportDto,
  DimensionComplianceDto,
  ComponentComplianceDto,
  CriterionComplianceDto,
  EvidenceComplianceDto,
  ComplianceStatisticsDto,
  MissingEvidenceDto,
} from './dtos/compliance-report.dto';
import { GenerateReportFiltersDto } from './dtos/generate-report-filters.dto';
import {
  CareerDocumentRefDto,
  CareerGapDto,
  CareerInventoryDto,
  ComponentInventoryDto,
  CriterionInventoryDto,
  DimensionInventoryDto,
  DocumentsByCareerReportDto,
  EvidenceInventoryDto,
  StandardInventoryDto,
} from './dtos/documents-by-career.dto';
import { DocumentsByCareerFiltersDto } from './dtos/documents-by-career-filters.dto';
import {
  buildDimensionWhere,
  buildHierarchyInclude,
  buildComplianceProofDocsWhere,
} from './hierarchy/hierarchy-query';

/** Evidence with its proof documents from the Prisma query */
interface EvidenceWithDocs {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  proofDocuments: { code: string }[];
}

/** Standard with nested evidences */
interface StandardWithEvidences {
  id: string;
  name: string;
  evidences: EvidenceWithDocs[];
}

/** Criterion with direct evidences and standards */
interface CriterionWithHierarchy {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  hasDirectEvidences: boolean;
  evidences: EvidenceWithDocs[];
  standards: StandardWithEvidences[];
}

/** Component with criteria */
interface ComponentWithCriteria {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  criteria: CriterionWithHierarchy[];
}

/** Dimension with full component hierarchy */
interface DimensionWithHierarchy {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  components: ComponentWithCriteria[];
}

@Injectable()
export class SinaesReportsService {
  private readonly logger = new Logger(SinaesReportsService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Generate a compliance report based on filters
   * Calculates compliance rates for the SINAES hierarchy (Dimensions → Components → Criteria → Evidences)
   */
  async generateComplianceReport(
    filters: GenerateReportFiltersDto,
    userId?: string,
  ): Promise<ComplianceReportDto> {
    this.logger.log('🔍 Generating compliance report with filters:', filters);

    // Fetch the full SINAES hierarchy down to each evidence's proof documents.
    // The tree shape lives in `buildHierarchyInclude` (shared with the
    // documents-by-career report); here we only describe how to load the
    // proof documents (ACTIVE + optional career/date scope).
    const dimensions = (await this.prisma.dimension.findMany({
      where: buildDimensionWhere(filters.dimensionId),
      include: buildHierarchyInclude({
        proofDocumentsArgs: { where: buildComplianceProofDocsWhere(filters) },
        componentId: filters.componentId,
        criterionId: filters.criterionId,
      }),
      orderBy: { order: 'asc' },
    })) as unknown as DimensionWithHierarchy[];

    this.logger.log(`✅ Found ${dimensions.length} dimensions to process`);

    // Log detallado de la primera dimensión para debug
    if (dimensions.length > 0) {
      const firstDim = dimensions[0];
      this.logger.debug(`📊 First Dimension: ${firstDim.name} (ID: ${firstDim.id})`);
      this.logger.debug(`   - Components: ${firstDim.components.length}`);
      if (firstDim.components.length > 0) {
        const firstComp = firstDim.components[0];
        this.logger.debug(`   - First Component: ${firstComp.name} (${firstComp.criteria.length} criteria)`);
        if (firstComp.criteria.length > 0) {
          const firstCrit = firstComp.criteria[0];
          this.logger.debug(`   - First Criterion: ${firstCrit.name}`);
          this.logger.debug(`     * Standards: ${firstCrit.standards.length}`);
          this.logger.debug(`     * Direct Evidences: ${firstCrit.evidences.length}`);
          if (firstCrit.standards.length > 0) {
            const firstStd = firstCrit.standards[0];
            this.logger.debug(`     * First Standard: ${firstStd.name} (${firstStd.evidences.length} evidences)`);
            if (firstStd.evidences.length > 0) {
              const firstEvd = firstStd.evidences[0];
              this.logger.debug(`       - First Evidence: ${firstEvd.name} (${firstEvd.proofDocuments.length} docs)`);
            }
          }
        }
      }
    }

    // 3. Process each dimension and calculate compliance (pure in-memory math)
    const processedDimensions = dimensions.map((dimension) =>
      this.processDimension(dimension),
    );

    // 4. Calculate overall statistics + flatten the evidences that have no
    //    documents (the actionable "what's missing" list for the UI).
    const statistics = this.calculateOverallStatistics(processedDimensions);
    const missingEvidences = this.collectMissingEvidences(processedDimensions);

    // 5. Get career info if filtered
    let careerInfo = undefined;
    if (filters.careerId) {
      const career = await this.prisma.career.findUnique({
        where: { id: filters.careerId },
      });
      if (career) {
        careerInfo = {
          id: career.id,
          name: career.name,
          code: career.code,
        };
      }
    }

    // Resolve a readable name for "Generado por" instead of the raw user id.
    // The DB column `generatedBy` still stores the user id (FK) in saveReport;
    // this only affects the report payload the UI displays.
    let generatedByName: string | undefined = userId;
    if (userId) {
      const reporter = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, email: true },
      });
      generatedByName = reporter?.fullName || reporter?.email || userId;
    }

    // 6. Build final report
    const report: ComplianceReportDto = {
      reportName: filters.reportName,
      description: filters.description,
      filters: {
        dimensionId: filters.dimensionId,
        componentId: filters.componentId,
        criterionId: filters.criterionId,
        careerId: filters.careerId,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      },
      generatedAt: new Date(),
      generatedBy: generatedByName,
      statistics,
      dimensions: processedDimensions,
      missingEvidences,
      career: careerInfo,
    };

    // 7. Save report to database
    const savedReport = await this.saveReport(report, userId);
    report.id = savedReport.id;

    this.logger.log(`🎉 Report generated successfully with ID: ${savedReport.id}`);

    return report;
  }

  /**
   * Process a dimension and calculate compliance for all its components
   */
  private processDimension(dimension: DimensionWithHierarchy): DimensionComplianceDto {
    const components = dimension.components.map((component) =>
      this.processComponent(component),
    );

    // Calculate dimension totals
    const totalComponents = components.length;
    const totalCriteria = components.reduce((sum, c) => sum + c.totalCriteria, 0);
    const totalEvidences = components.reduce((sum, c) => sum + c.totalEvidences, 0);
    const evidencesWithDocuments = components.reduce((sum, c) => sum + c.evidencesWithDocuments, 0);
    const totalDocuments = components.reduce((sum, c) => sum + c.totalDocuments, 0);

    const compliancePercentage = totalEvidences > 0 ? (evidencesWithDocuments / totalEvidences) * 100 : 0;

    return {
      id: dimension.id,
      code: dimension.code,
      name: dimension.name,
      description: dimension.description,
      totalComponents,
      totalCriteria,
      totalEvidences,
      evidencesWithDocuments,
      totalDocuments,
      compliancePercentage: Math.round(compliancePercentage * 10) / 10, // Round to 1 decimal
      complianceStatus: this.getComplianceStatus(compliancePercentage),
      components,
    };
  }

  /**
   * Process a component and calculate compliance for all its criteria
   */
  private processComponent(component: ComponentWithCriteria): ComponentComplianceDto {
    const criteria = component.criteria.map((criterion) =>
      this.processCriterion(criterion),
    );

    // Calculate component totals
    const totalCriteria = criteria.length;
    const totalEvidences = criteria.reduce((sum, c) => sum + c.totalEvidences, 0);
    const evidencesWithDocuments = criteria.reduce((sum, c) => sum + c.evidencesWithDocuments, 0);
    const totalDocuments = criteria.reduce((sum, c) => sum + c.totalDocuments, 0);

    const compliancePercentage = totalEvidences > 0 ? (evidencesWithDocuments / totalEvidences) * 100 : 0;

    return {
      id: component.id,
      code: component.code,
      name: component.name,
      description: component.description,
      totalCriteria,
      totalEvidences,
      evidencesWithDocuments,
      totalDocuments,
      compliancePercentage: Math.round(compliancePercentage * 10) / 10,
      complianceStatus: this.getCriterionStatus(compliancePercentage),
      criteria,
    };
  }

  /**
   * Process a criterion and calculate compliance for all its evidences.
   * Collects evidences from both direct criterion evidences AND standards,
   * using a Map to avoid counting the same evidence twice.
   */
  private processCriterion(criterion: CriterionWithHierarchy): CriterionComplianceDto {
    const evidenceMap = new Map<string, EvidenceComplianceDto>();

    // Process direct evidences (criterion → evidence)
    if (criterion.evidences?.length) {
      for (const evidence of criterion.evidences) {
        if (!evidenceMap.has(evidence.id)) {
          evidenceMap.set(evidence.id, this.processEvidence(evidence));
        }
      }
    }

    // Process evidences through standards (criterion → standard → evidence)
    if (criterion.standards?.length) {
      for (const standard of criterion.standards) {
        if (standard.evidences?.length) {
          for (const evidence of standard.evidences) {
            if (!evidenceMap.has(evidence.id)) {
              evidenceMap.set(evidence.id, this.processEvidence(evidence));
            }
          }
        }
      }
    }

    const evidences = Array.from(evidenceMap.values());

    // Calculate criterion totals
    const totalEvidences = evidences.length;
    const evidencesWithDocuments = evidences.filter((e) => e.hasDocuments).length;
    const totalDocuments = evidences.reduce((sum, e) => sum + e.documentCount, 0);

    const compliancePercentage = totalEvidences > 0 ? (evidencesWithDocuments / totalEvidences) * 100 : 0;

    return {
      id: criterion.id,
      code: criterion.code,
      name: criterion.name,
      description: criterion.description,
      hasDirectEvidences: criterion.hasDirectEvidences,
      totalEvidences,
      evidencesWithDocuments,
      totalDocuments,
      compliancePercentage: Math.round(compliancePercentage * 10) / 10,
      complianceStatus: this.getCriterionStatus(compliancePercentage),
      evidences,
    };
  }

  /**
   * Process an evidence and count its documents
   */
  private processEvidence(evidence: EvidenceWithDocs): EvidenceComplianceDto {
    const documentCount = evidence.proofDocuments?.length || 0;
    const hasDocuments = documentCount > 0;
    const documentCodes = evidence.proofDocuments?.map((doc) => doc.code) || [];

    return {
      id: evidence.id,
      code: evidence.code,
      name: evidence.name,
      description: evidence.description,
      documentCount,
      hasDocuments,
      documentCodes,
      complianceStatus: hasDocuments ? 'COMPLETE' : 'MISSING',
    };
  }

  /**
   * Calculate overall statistics from all dimensions
   */
  private calculateOverallStatistics(dimensions: DimensionComplianceDto[]): ComplianceStatisticsDto {
    const totalDimensions = dimensions.length;
    const totalComponents = dimensions.reduce((sum, d) => sum + d.totalComponents, 0);
    const totalCriteria = dimensions.reduce((sum, d) => sum + d.totalCriteria, 0);
    const totalEvidences = dimensions.reduce((sum, d) => sum + d.totalEvidences, 0);
    const evidencesWithDocuments = dimensions.reduce((sum, d) => sum + d.evidencesWithDocuments, 0);
    const evidencesMissing = totalEvidences - evidencesWithDocuments;
    const totalDocuments = dimensions.reduce((sum, d) => sum + d.totalDocuments, 0);

    const overallCompliance = totalEvidences > 0 ? (evidencesWithDocuments / totalEvidences) * 100 : 0;

    return {
      totalDimensions,
      totalComponents,
      totalCriteria,
      totalEvidences,
      evidencesWithDocuments,
      evidencesMissing,
      totalDocuments,
      overallCompliance: Math.round(overallCompliance * 10) / 10,
      overallStatus: this.getComplianceStatus(overallCompliance),
    };
  }

  /**
   * Flatten every evidence with zero documents into a single list carrying its
   * full hierarchy path. Walks the already-processed tree (so it reuses the
   * same dedup the criterion processing did) and keeps the report's order.
   */
  private collectMissingEvidences(
    dimensions: DimensionComplianceDto[],
  ): MissingEvidenceDto[] {
    const missing: MissingEvidenceDto[] = [];

    for (const dim of dimensions) {
      for (const comp of dim.components) {
        for (const crit of comp.criteria) {
          for (const ev of crit.evidences) {
            if (ev.hasDocuments) continue;
            missing.push({
              dimensionCode: dim.code,
              dimensionName: dim.name,
              componentCode: comp.code,
              componentName: comp.name,
              criterionCode: crit.code,
              criterionName: crit.name,
              evidenceId: ev.id,
              evidenceCode: ev.code,
              evidenceName: ev.name,
            });
          }
        }
      }
    }

    return missing;
  }

  /**
   * Determine compliance status based on percentage
   * EXCELLENT: >= 90%
   * GOOD: >= 70%
   * FAIR: >= 50%
   * POOR: < 50%
   */
  private getComplianceStatus(
    percentage: number,
  ): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    if (percentage >= 90) return 'EXCELLENT';
    if (percentage >= 70) return 'GOOD';
    if (percentage >= 50) return 'FAIR';
    return 'POOR';
  }

  /**
   * Determine criterion/component compliance status
   * COMPLETE: 100%
   * PARTIAL: > 0% and < 100%
   * MISSING: 0%
   */
  private getCriterionStatus(percentage: number): 'COMPLETE' | 'PARTIAL' | 'MISSING' {
    if (percentage === 100) return 'COMPLETE';
    if (percentage > 0) return 'PARTIAL';
    return 'MISSING';
  }

  /**
   * Save report to database
   */
  private async saveReport(report: ComplianceReportDto, userId?: string) {
    const saved = await this.prisma.sinaesComplianceReport.create({
      data: {
        reportName: report.reportName,
        description: report.description,
        dimensionId: report.filters.dimensionId,
        componentId: report.filters.componentId,
        criterionId: report.filters.criterionId,
        careerId: report.filters.careerId,
        dateFrom: report.filters.dateFrom,
        dateTo: report.filters.dateTo,
        reportData: report as any,
        totalEvidences: report.statistics.totalEvidences,
        evidencesWithDocuments: report.statistics.evidencesWithDocuments,
        totalDocuments: report.statistics.totalDocuments,
        compliancePercentage: report.statistics.overallCompliance,
        complianceStatus: report.statistics.overallStatus,
        generatedBy: userId,
      },
    });

    return saved;
  }

  /**
   * Get a saved report by ID
   */
  async getReportById(id: string): Promise<ComplianceReportDto> {
    const report = await this.prisma.sinaesComplianceReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report.reportData as unknown as ComplianceReportDto;
  }

  /**
   * List all saved reports with pagination
   */
  async listReports(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.sinaesComplianceReport.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          dimension: true,
          component: true,
          criterion: true,
          career: true,
          generatedByUser: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
      this.prisma.sinaesComplianceReport.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete a report
   */
  async deleteReport(id: string): Promise<void> {
    await this.prisma.sinaesComplianceReport.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  INVENTARIO POR CARRERA
  //  Reporte que NO calcula cumplimiento — sólo cuenta documentos asociados
  //  a cada carrera y los ubica en la jerarquía SINAES. Las "brechas" son
  //  las evidencias donde la carrera tiene 0 documentos (dato crudo, sin
  //  etiquetas de incumplimiento).
  // ───────────────────────────────────────────────────────────────────────────

  async generateDocumentsByCareer(
    filters: DocumentsByCareerFiltersDto,
    userId?: string,
  ): Promise<DocumentsByCareerReportDto> {
    this.logger.log('🔍 Generating documents-by-career inventory', filters);

    // 1. Resolve target careers. When no `careerIds` is provided, every
    //    ACTIVE career is included.
    const careers = await this.prisma.career.findMany({
      where: {
        status: 'ACTIVE',
        ...(filters.careerIds?.length ? { id: { in: filters.careerIds } } : {}),
      },
      select: { id: true, code: true, name: true },
      orderBy: { name: 'asc' },
    });

    if (careers.length === 0) {
      return {
        generatedAt: new Date(),
        generatedBy: userId,
        summary: {
          totalCareers: 0,
          totalDocuments: 0,
          careersWithDocuments: 0,
          careersWithoutDocuments: 0,
          totalEvidences: 0,
        },
        careers: [],
        filters: { ...filters },
      };
    }

    const careerIdSet = new Set(careers.map((c) => c.id));

    // 2. Fetch the full SINAES tree, scoped by the optional structural filters,
    //    bringing every ACTIVE proof document at each evidence plus its
    //    career associations. One round-trip; the rest is in-memory math.
    //    Same tree shape as the compliance report (see buildHierarchyInclude);
    //    only the proof-document load differs — here we keep all active docs
    //    and pull their career links so we can attribute them per career.
    const dimensions = (await this.prisma.dimension.findMany({
      where: buildDimensionWhere(filters.dimensionId),
      include: buildHierarchyInclude({
        proofDocumentsArgs: {
          where: { status: 'ACTIVE' },
          include: { careerProofDocuments: { select: { careerId: true } } },
        },
        componentId: filters.componentId,
        criterionId: filters.criterionId,
      }),
      orderBy: { order: 'asc' },
    })) as any[];

    // 3. For each career, walk the tree once and build counts + gaps.
    const inventories: CareerInventoryDto[] = careers.map((career) =>
      this.buildCareerInventory(career, dimensions),
    );

    // 4. Summary across all careers in the report.
    const totalEvidences = this.countEvidencesInTree(dimensions);
    const allDocIds = new Set<string>();
    for (const dim of dimensions) {
      for (const comp of dim.components) {
        for (const crit of comp.criteria) {
          for (const ev of crit.evidences) {
            for (const doc of ev.proofDocuments) {
              if (doc.careerProofDocuments.some((r) => careerIdSet.has(r.careerId))) {
                allDocIds.add(doc.id);
              }
            }
          }
          for (const std of crit.standards) {
            for (const ev of std.evidences) {
              for (const doc of ev.proofDocuments) {
                if (doc.careerProofDocuments.some((r) => careerIdSet.has(r.careerId))) {
                  allDocIds.add(doc.id);
                }
              }
            }
          }
        }
      }
    }

    const careersWithDocuments = inventories.filter((c) => c.totalDocuments > 0).length;

    return {
      generatedAt: new Date(),
      generatedBy: userId,
      summary: {
        totalCareers: inventories.length,
        totalDocuments: allDocIds.size,
        careersWithDocuments,
        careersWithoutDocuments: inventories.length - careersWithDocuments,
        totalEvidences,
      },
      careers: inventories,
      filters: {
        careerIds: filters.careerIds,
        dimensionId: filters.dimensionId,
        componentId: filters.componentId,
        criterionId: filters.criterionId,
      },
    };
  }

  private countEvidencesInTree(dimensions: any[]): number {
    let n = 0;
    for (const dim of dimensions) {
      for (const comp of dim.components) {
        for (const crit of comp.criteria) {
          n += crit.evidences.length;
          for (const std of crit.standards) {
            n += std.evidences.length;
          }
        }
      }
    }
    return n;
  }

  private buildCareerInventory(
    career: { id: string; code: string; name: string },
    dimensions: any[],
  ): CareerInventoryDto {
    const gaps: CareerGapDto[] = [];
    const seenDocIds = new Set<string>(); // dedup count per career
    let evidencesCovered = 0;
    let evidencesUncovered = 0;

    const dimensionInventories: DimensionInventoryDto[] = [];

    for (const dim of dimensions) {
      const componentInventories: ComponentInventoryDto[] = [];
      let dimDocCount = 0;

      for (const comp of dim.components) {
        const criterionInventories: CriterionInventoryDto[] = [];
        let compDocCount = 0;

        for (const crit of comp.criteria) {
          // Direct evidences on the criterion
          const directEvidenceInv: EvidenceInventoryDto[] = [];
          for (const ev of crit.evidences) {
            const inv = this.buildEvidenceInventory(ev, career.id);
            directEvidenceInv.push(inv);
            if (inv.documentCount > 0) {
              evidencesCovered++;
              for (const d of inv.documents) seenDocIds.add(d.id);
            } else {
              evidencesUncovered++;
              gaps.push({
                dimensionCode: dim.code,
                dimensionName: dim.name,
                componentCode: comp.code,
                componentName: comp.name,
                criterionCode: crit.code,
                criterionName: crit.name,
                evidenceId: ev.id,
                evidenceCode: ev.code,
                evidenceName: ev.name,
              });
            }
          }

          // Evidences nested under standards
          const standardInventories: StandardInventoryDto[] = [];
          for (const std of crit.standards) {
            const stdEvidenceInv: EvidenceInventoryDto[] = [];
            let stdDocCount = 0;

            for (const ev of std.evidences) {
              const inv = this.buildEvidenceInventory(ev, career.id);
              stdEvidenceInv.push(inv);
              stdDocCount += inv.documentCount;
              if (inv.documentCount > 0) {
                evidencesCovered++;
                for (const d of inv.documents) seenDocIds.add(d.id);
              } else {
                evidencesUncovered++;
                gaps.push({
                  dimensionCode: dim.code,
                  dimensionName: dim.name,
                  componentCode: comp.code,
                  componentName: comp.name,
                  criterionCode: crit.code,
                  criterionName: crit.name,
                  standardCode: std.code,
                  standardName: std.name,
                  evidenceId: ev.id,
                  evidenceCode: ev.code,
                  evidenceName: ev.name,
                });
              }
            }

            standardInventories.push({
              id: std.id,
              code: std.code,
              name: std.name,
              documentCount: stdDocCount,
              evidences: stdEvidenceInv,
            });
          }

          const critDocCount =
            directEvidenceInv.reduce((s, e) => s + e.documentCount, 0) +
            standardInventories.reduce((s, st) => s + st.documentCount, 0);

          criterionInventories.push({
            id: crit.id,
            code: crit.code,
            name: crit.name,
            documentCount: critDocCount,
            directEvidences: directEvidenceInv,
            standards: standardInventories,
          });

          compDocCount += critDocCount;
        }

        componentInventories.push({
          id: comp.id,
          code: comp.code,
          name: comp.name,
          documentCount: compDocCount,
          criteria: criterionInventories,
        });

        dimDocCount += compDocCount;
      }

      dimensionInventories.push({
        id: dim.id,
        code: dim.code,
        name: dim.name,
        documentCount: dimDocCount,
        components: componentInventories,
      });
    }

    return {
      id: career.id,
      code: career.code,
      name: career.name,
      // totalDocuments is deduped per career — a single doc tagged to multiple
      // evidences would otherwise inflate the count.
      totalDocuments: seenDocIds.size,
      evidencesCovered,
      evidencesUncovered,
      dimensions: dimensionInventories,
      gaps,
    };
  }

  private buildEvidenceInventory(
    evidence: any,
    careerId: string,
  ): EvidenceInventoryDto {
    const documents: CareerDocumentRefDto[] = [];
    for (const doc of evidence.proofDocuments) {
      if (doc.careerProofDocuments.some((r: any) => r.careerId === careerId)) {
        documents.push({
          id: doc.id,
          code: doc.code,
          name: doc.name,
          fileUrl: doc.fileUrl,
          fileName: doc.fileName,
          createdAt: doc.createdAt,
        });
      }
    }

    return {
      id: evidence.id,
      code: evidence.code,
      name: evidence.name,
      documentCount: documents.length,
      documents,
    };
  }
}

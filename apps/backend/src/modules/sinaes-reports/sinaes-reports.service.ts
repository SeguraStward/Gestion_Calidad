import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import {
  ComplianceReportDto,
  DimensionComplianceDto,
  ComponentComplianceDto,
  CriterionComplianceDto,
  EvidenceComplianceDto,
  ComplianceStatisticsDto,
} from './dtos/compliance-report.dto';
import { GenerateReportFiltersDto } from './dtos/generate-report-filters.dto';

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

    // 1. Build where clause for filtering dimensions/components/criteria
    const whereClause: any = {};

    if (filters.dimensionId) {
      whereClause.id = filters.dimensionId;
    }

    // 2. Fetch dimensions with full hierarchy
    const dimensions = await this.prisma.dimension.findMany({
      where: whereClause,
      include: {
        components: {
          where: filters.componentId && filters.componentId !== 'all' ? { id: filters.componentId } : {},
          orderBy: { order: 'asc' },
          include: {
            criteria: {
              where: filters.criterionId && filters.criterionId !== 'all' ? { id: filters.criterionId } : {},
              orderBy: { order: 'asc' },
              include: {
                evidences: {
                  where: { status: 'ACTIVE' },
                  include: {
                    proofDocuments: {
                      where: {
                        status: 'ACTIVE',
                        ...(filters.careerId && {
                          careerProofDocuments: {
                            some: { careerId: filters.careerId },
                          },
                        }),
                        ...(filters.dateFrom && {
                          createdAt: { gte: new Date(filters.dateFrom) },
                        }),
                        ...(filters.dateTo && {
                          createdAt: {
                            ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
                            lte: new Date(filters.dateTo),
                          },
                        }),
                      },
                    },
                  },
                },
                standards: {
                  where: { status: 'ACTIVE' },
                  include: {
                    evidences: {
                      where: { status: 'ACTIVE' },
                      include: {
                        proofDocuments: {
                          where: {
                            status: 'ACTIVE',
                            ...(filters.careerId && {
                              careerProofDocuments: {
                                some: { careerId: filters.careerId },
                              },
                            }),
                            ...(filters.dateFrom && {
                              createdAt: { gte: new Date(filters.dateFrom) },
                            }),
                            ...(filters.dateTo && {
                              createdAt: {
                                ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
                                lte: new Date(filters.dateTo),
                              },
                            }),
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    this.logger.log(`✅ Found ${dimensions.length} dimensions to process`);

    // 3. Process each dimension and calculate compliance
    const processedDimensions: DimensionComplianceDto[] = [];

    for (const dimension of dimensions) {
      const dimensionData = await this.processDimension(dimension);
      processedDimensions.push(dimensionData);
    }

    // 4. Calculate overall statistics
    const statistics = this.calculateOverallStatistics(processedDimensions);

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
      generatedBy: userId,
      statistics,
      dimensions: processedDimensions,
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
  private async processDimension(dimension: any): Promise<DimensionComplianceDto> {
    const components: ComponentComplianceDto[] = [];

    for (const component of dimension.components) {
      const componentData = await this.processComponent(component);
      components.push(componentData);
    }

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
  private async processComponent(component: any): Promise<ComponentComplianceDto> {
    const criteria: CriterionComplianceDto[] = [];

    for (const criterion of component.criteria) {
      const criterionData = await this.processCriterion(criterion);
      criteria.push(criterionData);
    }

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
   * Process a criterion and calculate compliance for all its evidences
   */
  private async processCriterion(criterion: any): Promise<CriterionComplianceDto> {
    const evidences: EvidenceComplianceDto[] = [];

    // Handle direct evidences OR evidences through standards
    if (criterion.hasDirectEvidences) {
      // Process direct evidences
      for (const evidence of criterion.evidences) {
        evidences.push(this.processEvidence(evidence));
      }
    } else {
      // Process evidences through standards
      for (const standard of criterion.standards) {
        for (const evidence of standard.evidences) {
          evidences.push(this.processEvidence(evidence));
        }
      }
    }

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
  private processEvidence(evidence: any): EvidenceComplianceDto {
    const documentCount = evidence.proofDocuments?.length || 0;
    const hasDocuments = documentCount > 0;
    const documentCodes = evidence.proofDocuments?.map((doc: any) => doc.code) || [];

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
        reportData: report as any, // Store full report as JSON
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

    return report.reportData as any;
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
}

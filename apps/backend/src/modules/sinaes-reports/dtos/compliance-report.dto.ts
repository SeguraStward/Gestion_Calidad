import { ApiProperty } from '@nestjs/swagger';

/**
 * Evidence data with document count and compliance status
 */
export class EvidenceComplianceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ description: 'Number of proof documents associated with this evidence' })
  documentCount: number;

  @ApiProperty({ description: 'Whether this evidence has at least one document' })
  hasDocuments: boolean;

  @ApiProperty({ description: 'List of proof document codes', type: [String] })
  documentCodes: string[];

  @ApiProperty({
    description: 'Compliance status',
    enum: ['COMPLETE', 'MISSING'],
  })
  complianceStatus: 'COMPLETE' | 'MISSING';
}

/**
 * Criterion data with evidences and compliance calculation
 */
export class CriterionComplianceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ description: 'Whether this criterion has direct evidences (true) or uses standards (false)' })
  hasDirectEvidences: boolean;

  @ApiProperty({ description: 'Total evidences under this criterion' })
  totalEvidences: number;

  @ApiProperty({ description: 'Number of evidences with at least one document' })
  evidencesWithDocuments: number;

  @ApiProperty({ description: 'Total documents across all evidences' })
  totalDocuments: number;

  @ApiProperty({ description: 'Compliance percentage (0-100)' })
  compliancePercentage: number;

  @ApiProperty({
    description: 'Compliance status',
    enum: ['COMPLETE', 'PARTIAL', 'MISSING'],
  })
  complianceStatus: 'COMPLETE' | 'PARTIAL' | 'MISSING';

  @ApiProperty({ type: [EvidenceComplianceDto] })
  evidences: EvidenceComplianceDto[];
}

/**
 * Component data with criteria and compliance calculation
 */
export class ComponentComplianceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ description: 'Total criteria under this component' })
  totalCriteria: number;

  @ApiProperty({ description: 'Total evidences across all criteria' })
  totalEvidences: number;

  @ApiProperty({ description: 'Number of evidences with at least one document' })
  evidencesWithDocuments: number;

  @ApiProperty({ description: 'Total documents across all evidences' })
  totalDocuments: number;

  @ApiProperty({ description: 'Compliance percentage (0-100)' })
  compliancePercentage: number;

  @ApiProperty({
    description: 'Compliance status',
    enum: ['COMPLETE', 'PARTIAL', 'MISSING'],
  })
  complianceStatus: 'COMPLETE' | 'PARTIAL' | 'MISSING';

  @ApiProperty({ type: [CriterionComplianceDto] })
  criteria: CriterionComplianceDto[];
}

/**
 * Dimension data with components and compliance calculation
 */
export class DimensionComplianceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty({ description: 'Total components under this dimension' })
  totalComponents: number;

  @ApiProperty({ description: 'Total criteria across all components' })
  totalCriteria: number;

  @ApiProperty({ description: 'Total evidences across all criteria' })
  totalEvidences: number;

  @ApiProperty({ description: 'Number of evidences with at least one document' })
  evidencesWithDocuments: number;

  @ApiProperty({ description: 'Total documents across all evidences' })
  totalDocuments: number;

  @ApiProperty({ description: 'Compliance percentage (0-100)' })
  compliancePercentage: number;

  @ApiProperty({
    description: 'Compliance status',
    enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'],
  })
  complianceStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

  @ApiProperty({ type: [ComponentComplianceDto] })
  components: ComponentComplianceDto[];
}

/**
 * Overall statistics for the compliance report
 */
export class ComplianceStatisticsDto {
  @ApiProperty({ description: 'Total dimensions evaluated' })
  totalDimensions: number;

  @ApiProperty({ description: 'Total components evaluated' })
  totalComponents: number;

  @ApiProperty({ description: 'Total criteria evaluated' })
  totalCriteria: number;

  @ApiProperty({ description: 'Total evidences evaluated' })
  totalEvidences: number;

  @ApiProperty({ description: 'Number of evidences with at least one document' })
  evidencesWithDocuments: number;

  @ApiProperty({ description: 'Number of evidences without any documents' })
  evidencesMissing: number;

  @ApiProperty({ description: 'Total proof documents uploaded' })
  totalDocuments: number;

  @ApiProperty({ description: 'Overall compliance percentage (0-100)' })
  overallCompliance: number;

  @ApiProperty({
    description: 'Overall compliance status',
    enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'],
  })
  overallStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

/**
 * Complete compliance report DTO
 */
export class ComplianceReportDto {
  @ApiProperty({ required: false })
  id?: string;

  @ApiProperty({ required: false })
  reportName?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ description: 'Filters used to generate this report', required: false })
  filters?: {
    dimensionId?: string;
    componentId?: string;
    criterionId?: string;
    careerId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };

  @ApiProperty({ description: 'Timestamp when report was generated', required: false })
  generatedAt?: Date;

  @ApiProperty({ description: 'User who generated the report', required: false })
  generatedBy?: string;

  @ApiProperty({ description: 'Overall statistics', type: ComplianceStatisticsDto, required: false })
  statistics?: ComplianceStatisticsDto;

  @ApiProperty({ description: 'Dimension data with full hierarchy', type: [DimensionComplianceDto] })
  dimensions: DimensionComplianceDto[];

  @ApiProperty({ description: 'Career information if filtered by career', required: false })
  career?: {
    id: string;
    name: string;
    code: string;
  };
}

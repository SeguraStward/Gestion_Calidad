import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Inventario por carrera — reporte que NO usa métricas de cumplimiento (% ni
 * semáforo). Solo cuenta documentos probatorios asociados a una carrera y los
 * ubica en la jerarquía SINAES (Dimensión → Componente → Criterio → Estándar →
 * Evidencia). El admin lo usa para responder: "¿qué documentos tiene la
 * carrera X y dónde le faltan?".
 */

/** A concrete document associated with the career (used at the leaf level). */
export class CareerDocumentRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional() fileUrl?: string;
  @ApiPropertyOptional() fileName?: string;
  @ApiPropertyOptional() createdAt?: Date;
}

export class EvidenceInventoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() documentCount!: number;
  @ApiProperty({ type: [CareerDocumentRefDto] }) documents!: CareerDocumentRefDto[];
}

export class StandardInventoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() documentCount!: number;
  @ApiProperty({ type: [EvidenceInventoryDto] }) evidences!: EvidenceInventoryDto[];
}

export class CriterionInventoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() documentCount!: number;
  /** Evidences directly attached to the criterion (no standard in between). */
  @ApiProperty({ type: [EvidenceInventoryDto] }) directEvidences!: EvidenceInventoryDto[];
  @ApiProperty({ type: [StandardInventoryDto] }) standards!: StandardInventoryDto[];
}

export class ComponentInventoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() documentCount!: number;
  @ApiProperty({ type: [CriterionInventoryDto] }) criteria!: CriterionInventoryDto[];
}

export class DimensionInventoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() documentCount!: number;
  @ApiProperty({ type: [ComponentInventoryDto] }) components!: ComponentInventoryDto[];
}

/**
 * A flat row pointing at an evidence where the career has 0 documents.
 * The admin can read these top-to-bottom to see exactly what's missing.
 */
export class CareerGapDto {
  @ApiProperty() dimensionCode!: string;
  @ApiProperty() dimensionName!: string;
  @ApiProperty() componentCode!: string;
  @ApiProperty() componentName!: string;
  @ApiProperty() criterionCode!: string;
  @ApiProperty() criterionName!: string;
  @ApiPropertyOptional() standardCode?: string;
  @ApiPropertyOptional() standardName?: string;
  @ApiProperty() evidenceId!: string;
  @ApiProperty() evidenceCode!: string;
  @ApiProperty() evidenceName!: string;
}

export class CareerInventoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  /** Total proof documents associated with this career (across the whole tree). */
  @ApiProperty() totalDocuments!: number;
  /** Distinct evidences for which this career has at least one document. */
  @ApiProperty() evidencesCovered!: number;
  /** Distinct evidences in the (filtered) tree the career has not covered. */
  @ApiProperty() evidencesUncovered!: number;
  @ApiProperty({ type: [DimensionInventoryDto] }) dimensions!: DimensionInventoryDto[];
  @ApiProperty({ type: [CareerGapDto] }) gaps!: CareerGapDto[];
}

export class DocumentsByCareerSummaryDto {
  @ApiProperty() totalCareers!: number;
  /** Distinct documents linked to any of the (filtered) careers. */
  @ApiProperty() totalDocuments!: number;
  /** Careers that have at least one document. */
  @ApiProperty() careersWithDocuments!: number;
  /** Careers with zero documents. */
  @ApiProperty() careersWithoutDocuments!: number;
  /** Evidences considered in the inventory (after filters). */
  @ApiProperty() totalEvidences!: number;
}

export class DocumentsByCareerReportDto {
  @ApiProperty() generatedAt!: Date;
  @ApiPropertyOptional() generatedBy?: string;
  @ApiProperty() summary!: DocumentsByCareerSummaryDto;
  @ApiProperty({ type: [CareerInventoryDto] }) careers!: CareerInventoryDto[];
  @ApiProperty() filters!: {
    careerIds?: string[];
    dimensionId?: string;
    componentId?: string;
    criterionId?: string;
  };
}

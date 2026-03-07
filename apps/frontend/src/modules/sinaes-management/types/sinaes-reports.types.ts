/**
 * SINAES Compliance Reports Types
 * Coinciden con los DTOs del backend
 */

/**
 * Estado de cumplimiento general
 */
export type ComplianceStatus = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

/**
 * Estado de criterio específico
 */
export type CriterionStatus = 'COMPLETE' | 'PARTIAL' | 'MISSING';

/**
 * Filtros para generar reporte de cumplimiento
 */
export interface GenerateReportFilters {
  dimensionId?: string;
  componentId?: string;
  criterionId?: string;
  careerId?: string;
  dateFrom?: string; // ISO date string
  dateTo?: string; // ISO date string
  reportName?: string;
  description?: string;
}

/**
 * Evidencia con estado de cumplimiento
 */
export interface EvidenceCompliance {
  id: string;
  code: string;
  name: string;
  description?: string;
  documentCount: number;
  hasDocuments: boolean;
  documentCodes: string[];
  complianceStatus: 'COMPLETE' | 'MISSING';
}

/**
 * Criterio con estado de cumplimiento
 */
export interface CriterionCompliance {
  id: string;
  code: string;
  name: string;
  description?: string;
  hasDirectEvidences: boolean;
  evidences: EvidenceCompliance[];
  totalEvidences: number;
  evidencesWithDocuments: number;
  evidencesMissing: number;
  totalDocuments: number;
  compliancePercentage: number;
  complianceStatus: CriterionStatus;
}

/**
 * Componente con estado de cumplimiento
 */
export interface ComponentCompliance {
  id: string;
  code: string;
  name: string;
  description?: string;
  criteria: CriterionCompliance[];
  totalCriteria: number;
  totalEvidences: number;
  evidencesWithDocuments: number;
  totalDocuments: number;
  compliancePercentage: number;
  complianceStatus: 'COMPLETE' | 'PARTIAL' | 'MISSING';
}

/**
 * Dimensión con estado de cumplimiento
 */
export interface DimensionCompliance {
  id: string;
  code: string;
  name: string;
  description?: string;
  components: ComponentCompliance[];
  totalComponents: number;
  totalCriteria: number;
  totalEvidences: number;
  evidencesWithDocuments: number;
  totalDocuments: number;
  compliancePercentage: number;
  complianceStatus: ComplianceStatus;
}

/**
 * Estadísticas generales del reporte
 */
export interface ComplianceStatistics {
  totalDimensions: number;
  totalComponents: number;
  totalCriteria: number;
  totalEvidences: number;
  evidencesWithDocuments: number;
  evidencesMissing: number;
  totalDocuments: number;
  overallCompliance: number;
  overallStatus: ComplianceStatus;
}

/**
 * Información de filtros aplicados
 */
export interface AppliedFilters {
  dimension?: string;
  component?: string;
  criterion?: string;
  career?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Reporte completo de cumplimiento
 */
export interface ComplianceReport {
  id?: string;
  reportName: string;
  description?: string;
  generatedAt: string;
  generatedBy: string;
  filters: AppliedFilters;
  statistics?: ComplianceStatistics;
  dimensions?: DimensionCompliance[];
  career?: {
    id: string;
    name: string;
    code: string;
  };
}

/**
 * Reporte guardado (con metadata adicional)
 */
export interface SavedComplianceReport extends ComplianceReport {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta paginada de reportes (coincide con backend)
 */
export interface ReportsListResponse {
  data: SavedComplianceReport[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Helper: Obtener clase CSS según estado de cumplimiento
 */
export function getComplianceStatusClass(status: ComplianceStatus): string {
  const statusMap: Record<ComplianceStatus, string> = {
    EXCELLENT: 'bg-green-500 text-white',
    GOOD: 'bg-blue-500 text-white',
    FAIR: 'bg-yellow-500 text-gray-900',
    POOR: 'bg-red-500 text-white',
  };
  return statusMap[status];
}

/**
 * Helper: Obtener etiqueta en español según estado
 */
export function getComplianceStatusLabel(status: ComplianceStatus): string {
  const labelMap: Record<ComplianceStatus, string> = {
    EXCELLENT: 'Excelente',
    GOOD: 'Bueno',
    FAIR: 'Regular',
    POOR: 'Deficiente',
  };
  return labelMap[status];
}

/**
 * Helper: Obtener clase CSS según estado de criterio
 */
export function getCriterionStatusClass(status: CriterionStatus): string {
  const statusMap: Record<CriterionStatus, string> = {
    COMPLETE: 'bg-green-500 text-white',
    PARTIAL: 'bg-yellow-500 text-gray-900',
    MISSING: 'bg-red-500 text-white',
  };
  return statusMap[status];
}

/**
 * Helper: Obtener etiqueta en español según estado de criterio
 */
export function getCriterionStatusLabel(status: CriterionStatus): string {
  const labelMap: Record<CriterionStatus, string> = {
    COMPLETE: 'Completo',
    PARTIAL: 'Parcial',
    MISSING: 'Faltante',
  };
  return labelMap[status];
}

/**
 * Helper: Obtener color según porcentaje de cumplimiento
 */
export function getComplianceColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 70) return 'text-blue-600';
  if (percentage >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Helper: Obtener icono según porcentaje de cumplimiento
 */
export function getComplianceIcon(percentage: number): string {
  if (percentage >= 90) return '🌟';
  if (percentage >= 70) return '✅';
  if (percentage >= 50) return '⚠️';
  return '❌';
}

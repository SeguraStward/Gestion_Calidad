import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HttpClient } from '@/lib/http-client';
import type {
  ComplianceReport,
  GenerateReportFilters,
  SavedComplianceReport,
  ReportsListResponse,
} from '../types/sinaes-reports.types';
import type {
  DocumentsByCareerFilters,
  DocumentsByCareerReport,
} from '../types/documents-by-career.types';

/**
 * Query keys para React Query
 */
export const sinaesReportsKeys = {
  all: ['sinaes-reports'] as const,
  lists: () => [...sinaesReportsKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...sinaesReportsKeys.lists(), { page, limit }] as const,
  details: () => [...sinaesReportsKeys.all, 'detail'] as const,
  detail: (id: string) => [...sinaesReportsKeys.details(), id] as const,
};

/**
 * Servicio para gestión de reportes de cumplimiento SINAES
 */
class SinaesReportsService {
  private readonly baseUrl = '/sinaes-reports/compliance';

  /**
   * Generar nuevo reporte de cumplimiento
   */
  async generateReport(
    filters: GenerateReportFilters
  ): Promise<ComplianceReport> {
    const queryParams = new URLSearchParams();

    if (filters.dimensionId) queryParams.append('dimensionId', filters.dimensionId);
    if (filters.componentId) queryParams.append('componentId', filters.componentId);
    if (filters.criterionId) queryParams.append('criterionId', filters.criterionId);
    if (filters.careerId) queryParams.append('careerId', filters.careerId);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters.reportName) queryParams.append('reportName', filters.reportName);
    if (filters.description) queryParams.append('description', filters.description);

    const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await HttpClient.get<ComplianceReport>(url);
    return response.data;
  }

  /**
   * Obtener reporte guardado por ID
   */
  async getReportById(id: string): Promise<SavedComplianceReport> {
    const response = await HttpClient.get<SavedComplianceReport>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Listar reportes guardados (paginado)
   */
  async listReports(
    page: number = 1,
    limit: number = 10
  ): Promise<ReportsListResponse> {
    const response = await HttpClient.get<ReportsListResponse>(
      `${this.baseUrl}/list/all?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  /**
   * Eliminar reporte
   */
  async deleteReport(id: string): Promise<void> {
    await HttpClient.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Exportar reporte como PDF
   */
  async exportPdf(id: string): Promise<Blob> {
    const response = await HttpClient.post(
      `${this.baseUrl}/${id}/export-pdf`,
      {},
      {
        responseType: 'blob',
      }
    );

    return response.data;
  }

  /**
   * Exportar reporte temporal (generado sin guardar) como PDF
   */
  async exportTempReportPdf(report: ComplianceReport): Promise<Blob> {
    const response = await HttpClient.post(
      `${this.baseUrl}/export-pdf-temp`,
      report,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  }

  /**
   * Helper para descargar PDF
   */
  async downloadPdf(id: string, reportName: string): Promise<void> {
    const blob = await this.exportPdf(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Cumplimiento_${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Helper para descargar PDF de reporte temporal
   */
  async downloadTempReportPdf(report: ComplianceReport): Promise<void> {
    const blob = await this.exportTempReportPdf(report);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Cumplimiento_${report.reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export the documents-by-career inventory as a PDF. Sends the already-
   * computed report payload to the backend (mirrors `exportTempReportPdf`).
   */
  async downloadInventoryPdf(report: DocumentsByCareerReport): Promise<void> {
    const response = await HttpClient.post(
      '/sinaes-reports/documents-by-career/export-pdf-temp',
      report,
      { responseType: 'blob' },
    );
    const blob: Blob = response.data;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inventario_Documentos_por_Carrera_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const sinaesReportsService = new SinaesReportsService();

/**
 * Hook: Generar reporte de cumplimiento
 */
export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filters: GenerateReportFilters) =>
      sinaesReportsService.generateReport(filters),
    onSuccess: () => {
      // Invalidar lista de reportes para refrescar
      queryClient.invalidateQueries({ queryKey: sinaesReportsKeys.lists() });
    },
  });
}

/**
 * Hook: Obtener reporte por ID
 */
export function useReportById(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: sinaesReportsKeys.detail(id || ''),
    queryFn: () => sinaesReportsService.getReportById(id!),
    enabled: enabled && !!id,
  });
}

/**
 * Hook: Listar reportes guardados
 */
export function useReportsList(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: sinaesReportsKeys.list(page, limit),
    queryFn: () => sinaesReportsService.listReports(page, limit),
  });
}

/**
 * Hook: Eliminar reporte
 */
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sinaesReportsService.deleteReport(id),
    onSuccess: () => {
      // Invalidar lista de reportes
      queryClient.invalidateQueries({ queryKey: sinaesReportsKeys.lists() });
    },
  });
}

/**
 * Hook: Exportar PDF
 */
export function useExportPdf() {
  return useMutation({
    mutationFn: ({ id, reportName }: { id: string; reportName: string }) =>
      sinaesReportsService.downloadPdf(id, reportName),
  });
}

/**
 * Hook: Exportar PDF de reporte temporal (sin guardar)
 */
export function useExportTempReportPdf() {
  return useMutation({
    mutationFn: (report: ComplianceReport) =>
      sinaesReportsService.downloadTempReportPdf(report),
  });
}

/**
 * Hook: Exportar PDF del inventario por carrera.
 */
export function useExportInventoryPdf() {
  return useMutation({
    mutationFn: (report: DocumentsByCareerReport) =>
      sinaesReportsService.downloadInventoryPdf(report),
  });
}

/**
 * Documents-by-career inventory (no compliance %; just counts and gaps).
 * Runs whenever `filters` changes; it's a lightweight read-only report so we
 * use `useQuery` rather than a mutation.
 */
export function useDocumentsByCareer(
  filters: DocumentsByCareerFilters,
  enabled: boolean = true,
) {
  return useQuery<DocumentsByCareerReport>({
    queryKey: ['sinaes-reports', 'documents-by-career', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.careerIds?.length) params.append('careerIds', filters.careerIds.join(','));
      if (filters.dimensionId) params.append('dimensionId', filters.dimensionId);
      if (filters.componentId) params.append('componentId', filters.componentId);
      if (filters.criterionId) params.append('criterionId', filters.criterionId);
      const qs = params.toString();
      const url = `/sinaes-reports/documents-by-career${qs ? `?${qs}` : ''}`;
      const response = await HttpClient.get<DocumentsByCareerReport>(url);
      return response.data;
    },
    enabled,
    // Keep it fresh-ish but avoid spam — admins generate this on demand.
    staleTime: 60_000,
  });
}

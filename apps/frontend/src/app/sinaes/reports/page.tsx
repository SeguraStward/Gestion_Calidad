'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card';
import { Button } from '@una-gc/ui/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs';
import { Alert, AlertDescription } from '@una-gc/ui/components/alert';
import { Download, FileBarChart, History, Loader2, ShieldAlert, ChevronLeft, ChevronRight, GraduationCap, Trash2, AlertTriangle, Info, FileSpreadsheet } from 'lucide-react';
import { exportComplianceToExcel } from '@/modules/sinaes-management/utils/report-excel.export';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@una-gc/ui/components/alert-dialog';
import { ComplianceFilters } from '@/modules/sinaes-management/components/reports/compliance-filters';
import { ComplianceSummary } from '@/modules/sinaes-management/components/reports/compliance-summary';
import { ComplianceTable } from '@/modules/sinaes-management/components/reports/compliance-table';
import { ComplianceMissingPanel } from '@/modules/sinaes-management/components/reports/compliance-missing-panel';
import { CareerInventoryTab } from '@/modules/sinaes-management/components/reports/career-inventory-tab';
import {
  useGenerateReport,
  useExportPdf,
  useExportTempReportPdf,
  useReportsList,
  useDeleteReport,
} from '@/modules/sinaes-management/services/sinaes-reports.service';
import { useAuth } from '@/modules/auth/hooks';
import { toast } from 'sonner';
import type {
  GenerateReportFilters,
  ComplianceReport,
  SavedComplianceReport,
} from '@/modules/sinaes-management/types/sinaes-reports.types';

export default function SinaesReportsPage() {
  const { role, isAuthenticated } = useAuth();
  const isAdmin = role?.name === 'ADMINISTRADOR';

  const [activeTab, setActiveTab] = useState('generate');
  const [currentReport, setCurrentReport] = useState<ComplianceReport | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 10;

  // Hooks
  const generateReportMutation = useGenerateReport();
  const exportPdfMutation = useExportPdf();
  const exportTempReportPdfMutation = useExportTempReportPdf();
  const deleteReportMutation = useDeleteReport();
  const { data: savedReports, isLoading: isLoadingReports } = useReportsList(historyPage, historyLimit);

  // Confirm dialog state for delete (kept here so it sits outside the loop).
  const [reportToDelete, setReportToDelete] = useState<SavedComplianceReport | null>(null);

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    const target = reportToDelete;
    setReportToDelete(null);
    try {
      await deleteReportMutation.mutateAsync(target.id);
      // If the deleted report is the one currently displayed in Results,
      // clear it to avoid showing stale data.
      if (currentReport?.id === target.id) {
        setCurrentReport(null);
      }
      toast.success('Reporte eliminado del historial');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'No se pudo eliminar el reporte';
      toast.error(msg);
    }
  };

  // Protección de ruta: solo administradores
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 py-20">
        <ShieldAlert className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Acceso Restringido</h1>
        <p className="text-muted-foreground text-center max-w-md">
          No tiene permisos para acceder a los reportes de cumplimiento SINAES.
          Contacte al administrador si necesita acceso.
        </p>
      </div>
    );
  }

  const handleGenerateReport = async (filters: GenerateReportFilters) => {
    try {
      const report = await generateReportMutation.mutateAsync(filters);
      setCurrentReport(report);
      setActiveTab('results');
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar el reporte. Por favor intente nuevamente.');
    }
  };

  const handleExportExcel = () => {
    if (!currentReport) {
      toast.warning('No hay reporte para exportar');
      return;
    }
    try {
      exportComplianceToExcel(currentReport);
      toast.success('Excel exportado exitosamente');
    } catch (error) {
      console.error('Error exportando Excel:', error);
      toast.error('Error al exportar el Excel. Por favor intente nuevamente.');
    }
  };

  const handleExportPdf = async () => {
    if (!currentReport) {
      toast.warning('No hay reporte para exportar');
      return;
    }

    try {
      // Si el reporte tiene ID (está guardado), usar el endpoint con ID
      if (currentReport.id) {
        await exportPdfMutation.mutateAsync({
          id: currentReport.id,
          reportName: currentReport.reportName,
        });
      } else {
        // Si es un reporte temporal (recién generado), usar el nuevo endpoint
        await exportTempReportPdfMutation.mutateAsync(currentReport);
      }
      toast.success('PDF exportado exitosamente');
    } catch (error) {
      console.error('Error exportando PDF:', error);
      toast.error('Error al exportar el PDF. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reportes de Cumplimiento SINAES
          </h1>
          <p className="text-muted-foreground">
            Genere y visualice reportes de cumplimiento para acreditación SINAES
          </p>
        </div>
        {currentReport && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button
              onClick={handleExportPdf}
              disabled={exportPdfMutation.isPending || exportTempReportPdfMutation.isPending}
            >
              {(exportPdfMutation.isPending || exportTempReportPdfMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            Generar Reporte
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!currentReport}>
            <FileBarChart className="h-4 w-4" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Inventario por Carrera
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Tab: Generar Reporte */}
        <TabsContent value="generate" className="space-y-6">
          <ComplianceFilters
            onGenerateReport={handleGenerateReport}
            isGenerating={generateReportMutation.isPending}
          />

          {generateReportMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                Error al generar el reporte. Por favor, intente nuevamente.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Tab: Resultados */}
        <TabsContent value="results" className="max-h-[calc(100vh-150px)] overflow-y-auto space-y-6 pb-20 pr-1">
          {currentReport ? (
            <>
              {/* Información del reporte */}
              <Card>
                <CardHeader>
                  <CardTitle>{currentReport.reportName}</CardTitle>
                  {currentReport.description && (
                    <CardDescription>{currentReport.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Generado por:</span>
                      <span className="font-medium">{currentReport.generatedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="font-medium">
                        {new Date(currentReport.generatedAt).toLocaleString('es-CR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Aviso: el reporte está filtrado por carrera, el % es relativo a ella */}
              {currentReport.career && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Este reporte está filtrado por la carrera{' '}
                    <strong>{currentReport.career.name}</strong>. Los porcentajes y el
                    conteo de documentos reflejan únicamente la evidencia asociada a
                    esta carrera.
                  </AlertDescription>
                </Alert>
              )}

              {/* Resumen de estadísticas */}
              <ComplianceSummary statistics={currentReport.statistics} />

              {/* Panel accionable de evidencias faltantes. Solo se muestra cuando
                  el reporte trae el campo (reportes generados con esta versión);
                  los reportes guardados antiguos lo omiten en vez de mostrar un
                  estado de "todo completo" engañoso. */}
              {currentReport.missingEvidences !== undefined &&
                currentReport.dimensions &&
                currentReport.dimensions.length > 0 && (
                  <ComplianceMissingPanel
                    missingEvidences={currentReport.missingEvidences}
                    careerId={currentReport.career?.id}
                    careerCode={currentReport.career?.code}
                    careerName={currentReport.career?.name}
                  />
                )}

              {/* Tabla de detalles */}
              {currentReport.dimensions && currentReport.dimensions.length > 0 ? (
                <ComplianceTable dimensions={currentReport.dimensions} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center gap-3 py-8">
                    <FileBarChart className="h-12 w-12 text-muted-foreground opacity-50" />
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground">
                        No se encontraron dimensiones para los filtros seleccionados
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Esto puede ocurrir si:
                      </p>
                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                        <li>• Los IDs seleccionados no existen en la base de datos</li>
                        <li>• Los filtros de fecha excluyen todos los datos</li>
                        <li>• No hay evidencias registradas para la carrera seleccionada</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-3">
                        Intenta generar un reporte sin filtros (selecciona "Todas" en cada campo)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileBarChart className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No hay reporte generado aún</p>
                  <p className="text-sm">
                    Vaya a la pestaña "Generar Reporte" para crear uno nuevo
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Inventario por Carrera */}
        <TabsContent value="inventory" className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <CareerInventoryTab />
        </TabsContent>

        {/* Tab: Historial */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Guardados</CardTitle>
              <CardDescription>
                Historial de reportes de cumplimiento generados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReports ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedReports && savedReports.data && savedReports.data.length > 0 ? (
                <div className="space-y-4">
                  {savedReports.data.map((report: SavedComplianceReport) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h4 className="font-medium">{report.reportName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Generado el {new Date(report.createdAt).toLocaleDateString('es-CR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Saved records nest the full report under `reportData`;
                            // flatten it (keeping id/name) so Results can read
                            // dimensions/statistics. Fall back to the record itself.
                            const data = (report as any).reportData;
                            const full = data
                              ? { ...data, id: report.id, reportName: report.reportName }
                              : report;
                            setCurrentReport(full as ComplianceReport);
                            setActiveTab('results');
                          }}
                        >
                          Ver Reporte
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            exportPdfMutation.mutate({
                              id: report.id,
                              reportName: report.reportName,
                            })
                          }
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setReportToDelete(report)}
                          disabled={deleteReportMutation.isPending}
                          title="Eliminar reporte"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {/* Pagination controls */}
                  {savedReports.meta && savedReports.meta.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Página {savedReports.meta.page} de {savedReports.meta.totalPages}
                        {' '}({savedReports.meta.total} reportes)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={historyPage <= 1}
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={historyPage >= savedReports.meta.totalPages}
                          onClick={() => setHistoryPage((p) => p + 1)}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <History className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No hay reportes guardados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm delete dialog for saved reports */}
      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              ¿Eliminar reporte del historial?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el reporte <strong>{reportToDelete?.reportName}</strong> de forma permanente.
              Esta acción no afecta los documentos ni la estructura SINAES, solo el reporte guardado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteReportMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteReportMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReportMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

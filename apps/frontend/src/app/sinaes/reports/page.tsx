'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card';
import { Button } from '@una-gc/ui/components/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs';
import { Alert, AlertDescription } from '@una-gc/ui/components/alert';
import { Download, FileBarChart, History, Loader2 } from 'lucide-react';
import { ComplianceFilters } from '@/modules/sinaes-management/components/reports/compliance-filters';
import { ComplianceSummary } from '@/modules/sinaes-management/components/reports/compliance-summary';
import { ComplianceTable } from '@/modules/sinaes-management/components/reports/compliance-table';
import {
  useGenerateReport,
  useExportPdf,
  useExportTempReportPdf,
  useReportsList,
} from '@/modules/sinaes-management/services/sinaes-reports.service';
import type {
  GenerateReportFilters,
  ComplianceReport,
} from '@/modules/sinaes-management/types/sinaes-reports.types';

export default function SinaesReportsPage() {
  const [activeTab, setActiveTab] = useState('generate');
  const [currentReport, setCurrentReport] = useState<ComplianceReport | null>(null);

  // Hooks
  const generateReportMutation = useGenerateReport();
  const exportPdfMutation = useExportPdf();
  const exportTempReportPdfMutation = useExportTempReportPdf();
  const { data: savedReports, isLoading: isLoadingReports } = useReportsList(1, 10);

  const handleGenerateReport = async (filters: GenerateReportFilters) => {
    try {
      const response = await generateReportMutation.mutateAsync(filters);
      console.log('📊 Report received from backend:', response);

      // El backend devuelve { data: { ... } }, necesitamos extraer el data
      const report = (response as any).data || response;

      console.log('📊 Extracted report:', report);
      console.log('📊 Report dimensions:', report.dimensions);
      console.log('📊 Report statistics:', report.statistics);

      setCurrentReport(report);
      setActiveTab('results');
    } catch (error) {
      console.error('Error generando reporte:', error);
    }
  };

  const handleExportPdf = async () => {
    if (!currentReport) {
      alert('No hay reporte para exportar');
      return;
    }

    try {
      // Si el reporte tiene ID (está guardado), usar el endpoint con ID
      if ('reportId' in currentReport && currentReport.reportId) {
        await exportPdfMutation.mutateAsync({
          id: currentReport.reportId,
          reportName: currentReport.reportName,
        });
      } else {
        // Si es un reporte temporal (recién generado), usar el nuevo endpoint
        await exportTempReportPdfMutation.mutateAsync(currentReport);
      }
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('Error al exportar el PDF. Por favor intente nuevamente.');
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
        <TabsContent value="results" className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
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

              {/* Resumen de estadísticas */}
              <ComplianceSummary statistics={currentReport.statistics} />

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
              ) : savedReports && savedReports.reports && savedReports.reports.length > 0 ? (
                <div className="space-y-4">
                  {savedReports.reports.map((report: any) => (
                    <div
                      key={report.reportId}
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
                            setCurrentReport(report);
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
                              id: report.reportId,
                              reportName: report.reportName,
                            })
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}

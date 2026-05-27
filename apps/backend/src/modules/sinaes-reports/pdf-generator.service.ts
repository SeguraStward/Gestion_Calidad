import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { ComplianceReportDto, DimensionComplianceDto, ComponentComplianceDto, CriterionComplianceDto } from './dtos/compliance-report.dto';
import {
  CareerInventoryDto,
  DimensionInventoryDto,
  DocumentsByCareerReportDto,
} from './dtos/documents-by-career.dto';

/** Escapes a string for safe inclusion in HTML. */
function escapeHtml(s: unknown): string {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  /**
   * Genera un PDF a partir de un reporte de cumplimiento
   */
  async generateCompliancePdf(
    report: ComplianceReportDto,
  ): Promise<Buffer> {
    this.logger.log(`Generando PDF para reporte: ${report.reportName}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    try {
      const page = await browser.newPage();

      // Configurar el tamaño de la página
      await page.setViewport({ width: 1200, height: 800 });

      // Generar el HTML del reporte
      const html = this.generateReportHtml(report);

      // Cargar el HTML en la página
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Generar el PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 9px; padding: 5px 15mm; width: 100%; text-align: center; color: #666;">
            <span>Reporte de Cumplimiento SINAES - ${report.reportName}</span>
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 9px; padding: 5px 15mm; width: 100%; text-align: center; color: #666;">
            <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
            <span style="margin-left: 20px;">Generado el ${new Date(report.generatedAt).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}</span>
          </div>
        `,
      });

      this.logger.log('PDF generado exitosamente');
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Error generando PDF', error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  /**
   * Genera el HTML completo del reporte
   */
  private generateReportHtml(report: ComplianceReportDto): string {
    const { statistics, dimensions, filters } = report;
    const reportName = report.reportName || 'Reporte de Cumplimiento SINAES';
    const generatedBy = report.generatedBy || 'Sistema';
    const generatedAt = report.generatedAt || new Date();

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportName}</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  <!-- Header con logo UNA -->
  <div class="header">
    <div class="logo-container">
      <h1>Universidad Nacional</h1>
      <h2>Sistema de Gestión de Calidad</h2>
    </div>
    <div class="report-title">
      <h3>${reportName}</h3>
      ${report.description ? `<p class="description">${report.description}</p>` : ''}
    </div>
  </div>

  <!-- Información del reporte -->
  <div class="report-info">
    <div class="info-row">
      <span class="label">Generado por:</span>
      <span class="value">${generatedBy}</span>
    </div>
    <div class="info-row">
      <span class="label">Fecha de generación:</span>
      <span class="value">${new Date(generatedAt).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}</span>
    </div>
    ${this.generateFiltersHtml(filters || {})}
  </div>

  <!-- Resumen de estadísticas -->
  ${statistics ? `
  <div class="statistics-section">
    <h4>Resumen General</h4>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Dimensiones</div>
        <div class="stat-value">${statistics.totalDimensions}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Componentes</div>
        <div class="stat-value">${statistics.totalComponents}</div>
      </div>` : ''}
      <div class="stat-card">
        <div class="stat-label">Total Criterios</div>
        <div class="stat-value">${statistics.totalCriteria}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Evidencias</div>
        <div class="stat-value">${statistics.totalEvidences}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Evidencias con Documentos</div>
        <div class="stat-value success">${statistics.evidencesWithDocuments}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Evidencias Faltantes</div>
        <div class="stat-value ${statistics.evidencesMissing > 0 ? 'danger' : 'success'}">${statistics.evidencesMissing}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Documentos</div>
        <div class="stat-value">${statistics.totalDocuments}</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">Cumplimiento General</div>
        <div class="stat-value">${statistics.overallCompliance.toFixed(1)}%</div>
        <div class="stat-status ${this.getStatusClass(statistics.overallStatus)}">${this.getStatusLabel(statistics.overallStatus)}</div>
      </div>
    </div>
  </div>

  <!-- Detalles por dimensión -->
  <div class="dimensions-section">
    <h4>Detalle por Dimensión</h4>
    ${dimensions.map(dim => this.generateDimensionHtml(dim)).join('')}
  </div>
</body>
</html>
    `;
  }

  /**
   * Genera HTML para filtros aplicados
   */
  private generateFiltersHtml(filters: ComplianceReportDto['filters']): string {
    const appliedFilters: string[] = [];

    if (filters.dimensionId) {
      appliedFilters.push(`<div class="info-row">
        <span class="label">Dimensión:</span>
        <span class="value">${filters.dimensionId}</span>
      </div>`);
    }

    if (filters.componentId) {
      appliedFilters.push(`<div class="info-row">
        <span class="label">Componente:</span>
        <span class="value">${filters.componentId}</span>
      </div>`);
    }

    if (filters.criterionId) {
      appliedFilters.push(`<div class="info-row">
        <span class="label">Criterio:</span>
        <span class="value">${filters.criterionId}</span>
      </div>`);
    }

    if (filters.careerId) {
      appliedFilters.push(`<div class="info-row">
        <span class="label">Carrera:</span>
        <span class="value">${filters.careerId}</span>
      </div>`);
    }

    if (filters.dateFrom) {
      appliedFilters.push(`<div class="info-row">
        <span class="label">Desde:</span>
        <span class="value">${new Date(filters.dateFrom).toLocaleDateString('es-CR')}</span>
      </div>`);
    }

    if (filters.dateTo) {
      appliedFilters.push(`<div class="info-row">
        <span class="label">Hasta:</span>
        <span class="value">${new Date(filters.dateTo).toLocaleDateString('es-CR')}</span>
      </div>`);
    }

    return appliedFilters.length > 0
      ? `<div class="filters-section">
          <h5>Filtros Aplicados:</h5>
          ${appliedFilters.join('')}
         </div>`
      : '';
  }

  /**
   * Genera HTML para una dimensión
   */
  private generateDimensionHtml(dimension: DimensionComplianceDto): string {
    return `
      <div class="dimension-block">
        <div class="dimension-header">
          <h5>${dimension.name}</h5>
          <div class="dimension-stats">
            <span class="compliance-badge ${this.getStatusClass(dimension.complianceStatus)}">
              ${dimension.compliancePercentage.toFixed(1)}% - ${this.getStatusLabel(dimension.complianceStatus)}
            </span>
          </div>
        </div>
        <div class="dimension-summary">
          <span>Total Evidencias: <strong>${dimension.totalEvidences}</strong></span>
          <span>Con Documentos: <strong class="success">${dimension.evidencesWithDocuments}</strong></span>
          <span>Sin Documentos: <strong class="${(dimension.totalEvidences - dimension.evidencesWithDocuments) > 0 ? 'danger' : 'success'}">${dimension.totalEvidences - dimension.evidencesWithDocuments}</strong></span>
          <span>Total Documentos: <strong>${dimension.totalDocuments}</strong></span>
        </div>
        
        ${dimension.components.map(comp => this.generateComponentHtml(comp)).join('')}
      </div>
    `;
  }

  /**
   * Genera HTML para un componente
   */
  private generateComponentHtml(component: ComponentComplianceDto): string {
    return `
      <div class="component-block">
        <div class="component-header">
          <h6>${component.name}</h6>
          <span class="compliance-mini ${this.getStatusClass(component.complianceStatus)}">
            ${component.compliancePercentage.toFixed(1)}%
          </span>
        </div>
        
        <table class="criteria-table">
          <thead>
            <tr>
              <th>Criterio</th>
              <th>Estado</th>
              <th>Evidencias</th>
              <th>Con Docs</th>
              <th>Sin Docs</th>
              <th>Total Docs</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${component.criteria.map(crit => this.generateCriterionRow(crit)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Genera fila de tabla para un criterio
   */
  private generateCriterionRow(criterion: CriterionComplianceDto): string {
    return `
      <tr>
        <td>${criterion.name}</td>
        <td>
          <span class="status-badge ${this.getCriterionStatusClass(criterion.complianceStatus)}">
            ${this.getCriterionStatusLabel(criterion.complianceStatus)}
          </span>
        </td>
        <td class="text-center">${criterion.totalEvidences}</td>
        <td class="text-center success">${criterion.evidencesWithDocuments}</td>
        <td class="text-center ${(criterion.totalEvidences - criterion.evidencesWithDocuments) > 0 ? 'danger' : 'success'}">${criterion.totalEvidences - criterion.evidencesWithDocuments}</td>
        <td class="text-center">${criterion.totalDocuments}</td>
        <td class="text-center">
          <strong class="${this.getPercentageClass(criterion.compliancePercentage)}">
            ${criterion.compliancePercentage.toFixed(1)}%
          </strong>
        </td>
      </tr>
    `;
  }

  /**
   * Obtiene las clases CSS según el estado de cumplimiento
   */
  private getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      EXCELLENT: 'status-excellent',
      GOOD: 'status-good',
      FAIR: 'status-fair',
      POOR: 'status-poor',
    };
    return statusMap[status] || '';
  }

  /**
   * Obtiene la etiqueta en español según el estado
   */
  private getStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
      EXCELLENT: 'Excelente',
      GOOD: 'Bueno',
      FAIR: 'Regular',
      POOR: 'Deficiente',
    };
    return labelMap[status] || status;
  }

  /**
   * Obtiene clase CSS para estado de criterio
   */
  private getCriterionStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      COMPLETE: 'criterion-complete',
      PARTIAL: 'criterion-partial',
      MISSING: 'criterion-missing',
    };
    return statusMap[status] || '';
  }

  /**
   * Obtiene etiqueta para estado de criterio
   */
  private getCriterionStatusLabel(status: string): string {
    const labelMap: Record<string, string> = {
      COMPLETE: 'Completo',
      PARTIAL: 'Parcial',
      MISSING: 'Faltante',
    };
    return labelMap[status] || status;
  }

  /**
   * Obtiene clase según porcentaje
   */
  private getPercentageClass(percentage: number): string {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'fair';
    return 'poor';
  }

  /**
   * Estilos CSS para el PDF
   */
  private getStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #333;
      }

      .header {
        background: linear-gradient(135deg, #003b71 0%, #005a9c 100%);
        color: white;
        padding: 20px;
        margin-bottom: 30px;
        border-radius: 8px;
      }

      .logo-container h1 {
        font-size: 24pt;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .logo-container h2 {
        font-size: 14pt;
        font-weight: normal;
        opacity: 0.9;
      }

      .report-title {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
      }

      .report-title h3 {
        font-size: 18pt;
        margin-bottom: 5px;
      }

      .description {
        font-size: 10pt;
        opacity: 0.9;
      }

      .report-info {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 20px;
      }

      .info-row {
        display: flex;
        margin-bottom: 8px;
      }

      .info-row .label {
        font-weight: bold;
        width: 180px;
        color: #666;
      }

      .info-row .value {
        color: #333;
      }

      .filters-section {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #dee2e6;
      }

      .filters-section h5 {
        font-size: 11pt;
        margin-bottom: 10px;
        color: #495057;
      }

      .statistics-section {
        margin-bottom: 30px;
      }

      .statistics-section h4 {
        font-size: 14pt;
        color: #003b71;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid #003b71;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-bottom: 20px;
      }

      .stat-card {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        padding: 12px;
        text-align: center;
      }

      .stat-card.highlight {
        background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
        border: 2px solid #003b71;
      }

      .stat-label {
        font-size: 9pt;
        color: #666;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 20pt;
        font-weight: bold;
        color: #003b71;
      }

      .stat-value.success {
        color: #28a745;
      }

      .stat-value.danger {
        color: #dc3545;
      }

      .stat-status {
        font-size: 10pt;
        margin-top: 5px;
        padding: 3px 8px;
        border-radius: 4px;
        display: inline-block;
      }

      .dimensions-section h4 {
        font-size: 14pt;
        color: #003b71;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid #003b71;
      }

      .dimension-block {
        margin-bottom: 25px;
        page-break-inside: avoid;
      }

      .dimension-header {
        background: #003b71;
        color: white;
        padding: 12px 15px;
        border-radius: 6px 6px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .dimension-header h5 {
        font-size: 13pt;
        font-weight: bold;
      }

      .dimension-summary {
        background: #e3f2fd;
        padding: 10px 15px;
        display: flex;
        justify-content: space-around;
        border-left: 1px solid #dee2e6;
        border-right: 1px solid #dee2e6;
        font-size: 9pt;
      }

      .component-block {
        margin: 15px 0;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        overflow: hidden;
        page-break-inside: avoid;
      }

      .component-header {
        background: #f8f9fa;
        padding: 10px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #dee2e6;
      }

      .component-header h6 {
        font-size: 11pt;
        color: #495057;
      }

      .criteria-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 9pt;
      }

      .criteria-table thead {
        background: #f1f3f5;
      }

      .criteria-table th {
        padding: 8px;
        text-align: left;
        font-weight: bold;
        color: #495057;
        border-bottom: 2px solid #dee2e6;
      }

      .criteria-table td {
        padding: 8px;
        border-bottom: 1px solid #f1f3f5;
      }

      .criteria-table tbody tr:hover {
        background: #f8f9fa;
      }

      .text-center {
        text-align: center;
      }

      .success {
        color: #28a745;
        font-weight: 600;
      }

      .danger {
        color: #dc3545;
        font-weight: 600;
      }

      .excellent {
        color: #28a745;
      }

      .good {
        color: #17a2b8;
      }

      .fair {
        color: #ffc107;
      }

      .poor {
        color: #dc3545;
      }

      .compliance-badge {
        padding: 5px 12px;
        border-radius: 4px;
        font-size: 10pt;
        font-weight: bold;
        color: white;
      }

      .compliance-mini {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 9pt;
        font-weight: bold;
        color: white;
      }

      .status-excellent {
        background-color: #28a745;
      }

      .status-good {
        background-color: #17a2b8;
      }

      .status-fair {
        background-color: #ffc107;
        color: #333;
      }

      .status-poor {
        background-color: #dc3545;
      }

      .status-badge {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 8pt;
        font-weight: bold;
        color: white;
      }

      .criterion-complete {
        background-color: #28a745;
      }

      .criterion-partial {
        background-color: #ffc107;
        color: #333;
      }

      .criterion-missing {
        background-color: #dc3545;
      }
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  INVENTARIO POR CARRERA
  //  PDF distinto — sólo conteos y brechas, sin métricas de cumplimiento.
  // ─────────────────────────────────────────────────────────────────────────

  async generateInventoryPdf(report: DocumentsByCareerReportDto): Promise<Buffer> {
    this.logger.log(`Generando PDF de inventario por carrera (${report.careers.length} carreras)`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 800 });
      await page.setContent(this.generateInventoryHtml(report), { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 9px; padding: 5px 15mm; width: 100%; text-align: center; color: #666;">
            <span>Inventario de Documentos Probatorios por Carrera — SINAES</span>
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 9px; padding: 5px 15mm; width: 100%; text-align: center; color: #666;">
            <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
            <span style="margin-left: 20px;">Generado el ${new Date(report.generatedAt).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}</span>
          </div>
        `,
      });

      this.logger.log('PDF de inventario generado');
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private generateInventoryHtml(report: DocumentsByCareerReportDto): string {
    // Defensive defaults — the frontend now sends an unwrapped payload, but
    // missing summaries/careers should still render a valid PDF instead of
    // throwing inside `.map()` and surfacing as a 500.
    const summary = report.summary || {
      totalCareers: 0,
      totalDocuments: 0,
      careersWithDocuments: 0,
      careersWithoutDocuments: 0,
      totalEvidences: 0,
    };
    const careers = report.careers || [];
    const generatedAt = report.generatedAt || new Date();

    const summaryRows = [
      ['Carreras incluidas', summary.totalCareers ?? 0],
      ['Documentos asociados', summary.totalDocuments ?? 0],
      ['Carreras con documentos', summary.careersWithDocuments ?? 0],
      ['Carreras sin documentos', summary.careersWithoutDocuments ?? 0],
      ['Evidencias en alcance', summary.totalEvidences ?? 0],
    ]
      .map(
        ([k, v]) => `
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #ddd;">${escapeHtml(k)}</td>
            <td style="padding: 6px 10px; border: 1px solid #ddd; text-align: right; font-weight: 600;">${v}</td>
          </tr>
        `,
      )
      .join('');

    const careersHtml = careers.map((c) => this.renderCareerInventory(c)).join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Inventario por Carrera</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, Helvetica, sans-serif; color: #222; font-size: 11px; line-height: 1.4; }
          h1 { font-size: 18px; margin: 0 0 4px 0; }
          h2 { font-size: 13px; margin: 12px 0 6px 0; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
          h3 { font-size: 12px; margin: 10px 0 4px 0; }
          .meta { color: #555; font-size: 10px; margin-bottom: 16px; }
          table.summary { border-collapse: collapse; width: 60%; margin-bottom: 16px; }
          .career { break-inside: avoid; page-break-inside: avoid; margin: 18px 0; padding: 10px 12px; border: 1px solid #ddd; border-radius: 4px; }
          .career-header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 8px; }
          .career-code { font-family: monospace; color: #1d4ed8; font-size: 10px; margin-right: 8px; }
          .career-name { font-weight: 600; font-size: 13px; }
          .career-meta { font-size: 10px; color: #555; }
          .badge { display: inline-block; padding: 1px 6px; border-radius: 8px; background: #eef; color: #333; font-size: 10px; margin-left: 6px; }
          ul.tree { list-style: none; padding-left: 14px; margin: 4px 0; }
          ul.tree li { margin: 2px 0; }
          .dim-code { color: #1d4ed8; font-family: monospace; }
          .comp-code { color: #6d28d9; font-family: monospace; }
          .crit-code { color: #555; font-family: monospace; }
          .std-code { color: #b45309; font-family: monospace; }
          .ev-code { color: #15803d; font-family: monospace; }
          .doc-row { color: #444; font-size: 10px; }
          .doc-code { font-family: monospace; }
          .gaps-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10px; }
          .gaps-table th, .gaps-table td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; }
          .gaps-table th { background: #fafafa; font-weight: 600; }
          .empty { color: #777; font-style: italic; }
        </style>
      </head>
      <body>
        <h1>Inventario de Documentos Probatorios por Carrera</h1>
        <p class="meta">Generado el ${new Date(generatedAt).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}</p>

        <h2>Resumen</h2>
        <table class="summary">${summaryRows}</table>

        <h2>Detalle por Carrera</h2>
        ${careersHtml || '<p class="empty">No hay carreras en el alcance del reporte.</p>'}
      </body>
      </html>
    `;
  }

  private renderCareerInventory(c: CareerInventoryDto): string {
    const dims = c.dimensions || [];
    const gaps = c.gaps || [];
    const treeHtml = dims.length
      ? dims.map((d) => this.renderDimensionForPdf(d)).join('')
      : '<p class="empty">Sin dimensiones en el alcance.</p>';

    const gapsHtml = gaps.length
      ? `
        <table class="gaps-table">
          <thead>
            <tr>
              <th>Dimensión</th>
              <th>Componente</th>
              <th>Criterio</th>
              <th>Estándar</th>
              <th>Evidencia</th>
            </tr>
          </thead>
          <tbody>
            ${gaps
              .map(
                (g) => `
                  <tr>
                    <td><span class="dim-code">${escapeHtml(g.dimensionCode)}</span> ${escapeHtml(g.dimensionName)}</td>
                    <td><span class="comp-code">${escapeHtml(g.componentCode)}</span> ${escapeHtml(g.componentName)}</td>
                    <td><span class="crit-code">${escapeHtml(g.criterionCode)}</span> ${escapeHtml(g.criterionName)}</td>
                    <td>${g.standardCode ? `<span class="std-code">${escapeHtml(g.standardCode)}</span> ${escapeHtml(g.standardName)}` : '—'}</td>
                    <td><span class="ev-code">${escapeHtml(g.evidenceCode)}</span> ${escapeHtml(g.evidenceName)}</td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>
      `
      : '<p class="empty">Esta carrera tiene documentos en todas las evidencias del alcance.</p>';

    return `
      <div class="career">
        <div class="career-header">
          <div>
            <span class="career-code">${escapeHtml(c.code)}</span>
            <span class="career-name">${escapeHtml(c.name)}</span>
          </div>
          <div class="career-meta">
            ${c.totalDocuments ?? 0} documento(s) · ${c.evidencesCovered ?? 0} evidencia(s) cubierta(s) · ${c.evidencesUncovered ?? 0} sin documentos
          </div>
        </div>

        <h3>Documentos por ubicación en la jerarquía</h3>
        ${treeHtml}

        <h3>Ubicaciones sin documentos para esta carrera (${gaps.length})</h3>
        ${gapsHtml}
      </div>
    `;
  }

  private renderDimensionForPdf(d: DimensionInventoryDto): string {
    const components = d.components || [];
    return `
      <ul class="tree">
        <li>
          <span class="dim-code">${escapeHtml(d.code)}</span>
          <strong>${escapeHtml(d.name)}</strong>
          <span class="badge">${d.documentCount ?? 0} doc(s)</span>
          ${
            components.length
              ? `<ul class="tree">${components
                  .map((comp) => {
                    const criteria = comp.criteria || [];
                    return `
                      <li>
                        <span class="comp-code">${escapeHtml(comp.code)}</span> ${escapeHtml(comp.name)}
                        <span class="badge">${comp.documentCount ?? 0}</span>
                        ${
                          criteria.length
                            ? `<ul class="tree">${criteria
                                .map(
                                  (crit) => `
                                    <li>
                                      <span class="crit-code">${escapeHtml(crit.code)}</span> ${escapeHtml(crit.name)}
                                      <span class="badge">${crit.documentCount ?? 0}</span>
                                      ${this.renderLeafEvidencesForPdf(crit)}
                                    </li>
                                  `,
                                )
                                .join('')}</ul>`
                            : ''
                        }
                      </li>
                    `;
                  })
                  .join('')}</ul>`
              : ''
          }
        </li>
      </ul>
    `;
  }

  private renderLeafEvidencesForPdf(
    crit: { directEvidences?: any[]; standards?: any[] },
  ): string {
    const directs = (crit.directEvidences || [])
      .map(
        (ev) => `
          <li>
            <span class="ev-code">${escapeHtml(ev.code)}</span> ${escapeHtml(ev.name)}
            <span class="badge">${ev.documentCount ?? 0}</span>
            ${this.renderDocsForPdf(ev.documents || [])}
          </li>
        `,
      )
      .join('');

    const stds = (crit.standards || [])
      .map(
        (std) => `
          <li>
            <span class="std-code">${escapeHtml(std.code)}</span> ${escapeHtml(std.name)}
            <span class="badge">${std.documentCount ?? 0}</span>
            <ul class="tree">
              ${(std.evidences || [])
                .map(
                  (ev: any) => `
                    <li>
                      <span class="ev-code">${escapeHtml(ev.code)}</span> ${escapeHtml(ev.name)}
                      <span class="badge">${ev.documentCount ?? 0}</span>
                      ${this.renderDocsForPdf(ev.documents || [])}
                    </li>
                  `,
                )
                .join('')}
            </ul>
          </li>
        `,
      )
      .join('');

    return `<ul class="tree">${directs}${stds}</ul>`;
  }

  private renderDocsForPdf(docs: { code: string; name: string }[]): string {
    if (!docs?.length) return '';
    return `<ul class="tree">${docs
      .map(
        (d) => `<li class="doc-row"><span class="doc-code">${escapeHtml(d.code)}</span> — ${escapeHtml(d.name)}</li>`,
      )
      .join('')}</ul>`;
  }
}

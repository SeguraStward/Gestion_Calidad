import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import {
  ComplianceReportDto,
  DimensionComplianceDto,
  ComponentComplianceDto,
  CriterionComplianceDto,
} from './dtos/compliance-report.dto';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  /**
   * Genera un PDF a partir de un reporte de cumplimiento
   */
  async generateCompliancePdf(report: ComplianceReportDto): Promise<Buffer> {
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
  ${
    statistics
      ? `
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
      </div>`
      : ''
  }
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
    ${dimensions.map((dim) => this.generateDimensionHtml(dim)).join('')}
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
          <span>Sin Documentos: <strong class="${dimension.totalEvidences - dimension.evidencesWithDocuments > 0 ? 'danger' : 'success'}">${dimension.totalEvidences - dimension.evidencesWithDocuments}</strong></span>
          <span>Total Documentos: <strong>${dimension.totalDocuments}</strong></span>
        </div>
        
        ${dimension.components.map((comp) => this.generateComponentHtml(comp)).join('')}
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
            ${component.criteria.map((crit) => this.generateCriterionRow(crit)).join('')}
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
        <td class="text-center ${criterion.totalEvidences - criterion.evidencesWithDocuments > 0 ? 'danger' : 'success'}">${criterion.totalEvidences - criterion.evidencesWithDocuments}</td>
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
}

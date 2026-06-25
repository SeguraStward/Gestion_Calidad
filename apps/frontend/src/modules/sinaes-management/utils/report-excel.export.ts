/**
 * Generación de archivos Excel (.xlsx) para los reportes SINAES, en el cliente.
 *
 * Se hace en el frontend a propósito: la página ya tiene el JSON completo del
 * reporte en memoria (no requiere otra ida al backend) y el monorepo ya trae
 * la dependencia `xlsx`. El PDF (puppeteer) se mantiene en el backend; esto es
 * el formato editable que SINAES suele pedir.
 */
import * as XLSX from 'xlsx';
import type { ComplianceReport } from '../types/sinaes-reports.types';
import type { DocumentsByCareerReport } from '../types/documents-by-career.types';

/** Marca "Completo"/"Faltante" legible a partir del flag de documentos. */
const yesNo = (has: boolean) => (has ? 'Completo' : 'Faltante');

/** Fecha legible es-CR; tolera string|Date|undefined. */
function fmtDate(value?: string | Date): string {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('es-CR');
}

/** Sufijo de fecha para los nombres de archivo: AAAA-MM-DD. */
function fileDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Ajusta el ancho de columnas de una hoja al contenido más largo (con tope),
 * para que no salga todo apretado. `rows` es array-de-objetos o array-de-arrays.
 */
function autoFitColumns(worksheet: XLSX.WorkSheet, rows: unknown[][]): void {
  const widths: number[] = [];
  for (const row of rows) {
    row.forEach((cell, i) => {
      const len = cell == null ? 0 : String(cell).length;
      widths[i] = Math.min(60, Math.max(widths[i] ?? 10, len + 2));
    });
  }
  worksheet['!cols'] = widths.map((w) => ({ wch: w }));
}

/** Crea una hoja desde filas (array-de-arrays), con auto-ancho. */
function sheetFromRows(rows: unknown[][]): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  autoFitColumns(ws, rows);
  return ws;
}

/**
 * Exporta un reporte de cumplimiento a Excel con tres hojas:
 *  - Resumen: metadatos + estadísticas globales.
 *  - Detalle: una fila por evidencia con su ruta jerárquica completa.
 *  - Faltantes: solo las evidencias sin documentos.
 */
export function exportComplianceToExcel(report: ComplianceReport): void {
  const wb = XLSX.utils.book_new();
  const s = report.statistics;

  // --- Hoja Resumen ---
  const resumen: unknown[][] = [
    ['Reporte de Cumplimiento SINAES'],
    [],
    ['Nombre', report.reportName ?? ''],
    ['Descripción', report.description ?? ''],
    ['Generado por', report.generatedBy ?? ''],
    ['Fecha de generación', fmtDate(report.generatedAt)],
    ['Carrera (filtro)', report.career ? `${report.career.code} - ${report.career.name}` : 'Todas'],
    [],
    ['Estadísticas'],
    ['Cumplimiento general (%)', s?.overallCompliance ?? 0],
    ['Estado general', s?.overallStatus ?? ''],
    ['Total dimensiones', s?.totalDimensions ?? 0],
    ['Total componentes', s?.totalComponents ?? 0],
    ['Total criterios', s?.totalCriteria ?? 0],
    ['Total evidencias', s?.totalEvidences ?? 0],
    ['Evidencias con documentos', s?.evidencesWithDocuments ?? 0],
    ['Evidencias faltantes', s?.evidencesMissing ?? 0],
    ['Total documentos', s?.totalDocuments ?? 0],
  ];
  XLSX.utils.book_append_sheet(wb, sheetFromRows(resumen), 'Resumen');

  // --- Hoja Detalle (una fila por evidencia) ---
  const detalleHeader = [
    'Dim. código', 'Dimensión',
    'Comp. código', 'Componente',
    'Crit. código', 'Criterio',
    'Evid. código', 'Evidencia',
    'Estado', '# Documentos', 'Códigos de documentos',
  ];
  const detalle: unknown[][] = [detalleHeader];
  for (const dim of report.dimensions ?? []) {
    for (const comp of dim.components) {
      for (const crit of comp.criteria) {
        for (const ev of crit.evidences) {
          detalle.push([
            dim.code, dim.name,
            comp.code, comp.name,
            crit.code, crit.name,
            ev.code, ev.name,
            yesNo(ev.hasDocuments), ev.documentCount, ev.documentCodes.join(', '),
          ]);
        }
      }
    }
  }
  XLSX.utils.book_append_sheet(wb, sheetFromRows(detalle), 'Detalle');

  // --- Hoja Faltantes ---
  const faltantesHeader = [
    'Dim. código', 'Dimensión',
    'Comp. código', 'Componente',
    'Crit. código', 'Criterio',
    'Evid. código', 'Evidencia',
  ];
  const faltantes: unknown[][] = [faltantesHeader];
  for (const m of report.missingEvidences ?? []) {
    faltantes.push([
      m.dimensionCode, m.dimensionName,
      m.componentCode, m.componentName,
      m.criterionCode, m.criterionName,
      m.evidenceCode, m.evidenceName,
    ]);
  }
  XLSX.utils.book_append_sheet(wb, sheetFromRows(faltantes), 'Faltantes');

  const safeName = (report.reportName || 'Reporte_Cumplimiento').replace(/\s+/g, '_');
  XLSX.writeFile(wb, `Cumplimiento_SINAES_${safeName}_${fileDate()}.xlsx`);
}

/**
 * Exporta el inventario por carrera a Excel con tres hojas:
 *  - Resumen: totales del reporte.
 *  - Detalle: una fila por (carrera × evidencia) con su ubicación y documentos.
 *  - Brechas: evidencias sin documentos por carrera.
 */
export function exportInventoryToExcel(report: DocumentsByCareerReport): void {
  const wb = XLSX.utils.book_new();
  const sum = report.summary;

  // --- Hoja Resumen ---
  const resumen: unknown[][] = [
    ['Inventario de Documentos por Carrera — SINAES'],
    [],
    ['Generado por', report.generatedBy ?? ''],
    ['Fecha de generación', fmtDate(report.generatedAt)],
    [],
    ['Totales'],
    ['Carreras', sum.totalCareers],
    ['Documentos asociados', sum.totalDocuments],
    ['Carreras con documentos', sum.careersWithDocuments],
    ['Carreras sin documentos', sum.careersWithoutDocuments],
    ['Total evidencias (alcance)', sum.totalEvidences],
  ];
  XLSX.utils.book_append_sheet(wb, sheetFromRows(resumen), 'Resumen');

  // --- Hoja Detalle (una fila por evidencia con documentos, por carrera) ---
  const detalleHeader = [
    'Carrera código', 'Carrera',
    'Dim. código', 'Dimensión',
    'Comp. código', 'Componente',
    'Crit. código', 'Criterio',
    'Est. código', 'Estándar',
    'Evid. código', 'Evidencia',
    '# Documentos', 'Códigos de documentos',
  ];
  const detalle: unknown[][] = [detalleHeader];
  for (const career of report.careers) {
    for (const dim of career.dimensions) {
      for (const comp of dim.components) {
        for (const crit of comp.criteria) {
          // Evidencias directas del criterio (sin estándar).
          for (const ev of crit.directEvidences) {
            detalle.push([
              career.code, career.name,
              dim.code, dim.name,
              comp.code, comp.name,
              crit.code, crit.name,
              '', '',
              ev.code, ev.name,
              ev.documentCount, ev.documents.map((d) => d.code).join(', '),
            ]);
          }
          // Evidencias bajo estándares.
          for (const std of crit.standards) {
            for (const ev of std.evidences) {
              detalle.push([
                career.code, career.name,
                dim.code, dim.name,
                comp.code, comp.name,
                crit.code, crit.name,
                std.code, std.name,
                ev.code, ev.name,
                ev.documentCount, ev.documents.map((d) => d.code).join(', '),
              ]);
            }
          }
        }
      }
    }
  }
  XLSX.utils.book_append_sheet(wb, sheetFromRows(detalle), 'Detalle');

  // --- Hoja Brechas (evidencias sin documentos por carrera) ---
  const brechasHeader = [
    'Carrera código', 'Carrera',
    'Dim. código', 'Dimensión',
    'Comp. código', 'Componente',
    'Crit. código', 'Criterio',
    'Est. código', 'Estándar',
    'Evid. código', 'Evidencia',
  ];
  const brechas: unknown[][] = [brechasHeader];
  for (const career of report.careers) {
    for (const gap of career.gaps) {
      brechas.push([
        career.code, career.name,
        gap.dimensionCode, gap.dimensionName,
        gap.componentCode, gap.componentName,
        gap.criterionCode, gap.criterionName,
        gap.standardCode ?? '', gap.standardName ?? '',
        gap.evidenceCode, gap.evidenceName,
      ]);
    }
  }
  XLSX.utils.book_append_sheet(wb, sheetFromRows(brechas), 'Brechas');

  XLSX.writeFile(wb, `Inventario_Documentos_por_Carrera_${fileDate()}.xlsx`);
}

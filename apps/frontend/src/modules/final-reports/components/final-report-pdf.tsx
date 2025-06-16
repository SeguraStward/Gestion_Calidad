import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { FullFinalReport, FinalReportEvaluationFE } from '../types/final-reports.types';
 
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 35,
    paddingTop: 25,
    paddingBottom: 50, // Espacio para el footer
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Alinea el logo textual y el bloque de título
    marginBottom: 20,
    width: '100%',
  },
  // --- Estilos para el Logo Textual ---
  logoTextContainer: {
    width: 120,
    marginRight: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoTextUNA: {
    fontFamily: 'Times-Roman',
    fontSize: 48,
    color: '#C00000',
    lineHeight: 0.9,
    marginBottom: 2,
  },
  logoTextSubLine: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: '#C00000',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  logoTextCostaRica: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: '#C00000',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  logoHorizontalLine: {
    height: 2,
    width: '100%',
    backgroundColor: '#C00000',
    marginBottom: 3,
    marginTop: 1,
  },
  logoHorizontalLineSmall: {
    height: 1,
    width: '100%',
    backgroundColor: '#C00000',
    marginBottom: 2,
    marginTop: 1,
  },
  // --- Fin Estilos Logo Textual ---
  titleBlock: {
    flexGrow: 1,
    textAlign: 'center',
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  subTitle: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 8,
    marginTop: 12,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: '#B0B0B0',
  },
  subSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
    marginTop: 8,
  },
  labelText: {
    fontSize: 9,
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#D1D1D1',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#E0E0E0',
    borderBottomWidth: 0.5,
  },
  tableColHeader: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderRightColor: '#E0E0E0',
    borderRightWidth: 0.5,
    flexGrow: 1,
  },
  tableCol: {
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderRightColor: '#E0E0E0',
    borderRightWidth: 0.5,
    flexGrow: 1,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2C2C2C',
    textAlign: 'left',
  },
  tableCell: {
    fontSize: 9,
    color: '#404040',
    textAlign: 'left',
    lineHeight: 1.3,
  },
  tableCellCentered: {
    fontSize: 9,
    color: '#404040',
    textAlign: 'center',
  },
  infoTableLabelCol: { width: '30%' },
  infoTableValueCol: { width: '70%', borderRightWidth: 0 },
  statsTableMetricCol: { width: '50%' },
  statsTableCountCol: { width: '25%' },
  statsTablePercentCol: { width: '25%', borderRightWidth: 0 },
  evalGroupTable: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#C0C0C0',
    marginBottom: 15,
  },
  evalGroupHeaderRow: {
    backgroundColor: '#EAEAEA',
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#B0B0B0',
  },
  evalGroupHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#202020',
    textAlign: 'center',
  },
  evalQuestionRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  evalAnswerRow: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  evalQuestionTextCell: {
    fontSize: 9,
    color: '#333333',
    fontWeight: 'bold',
    flex: 1,
  },
  evalAnswerTextCell: {
    fontSize: 9,
    color: '#454545',
    paddingLeft: 10,
    flex: 1,
  },
  evalListItem: {
    fontSize: 9,
    marginLeft: 0,
    marginBottom: 2,
    color: '#454545',
  },
  noDataText: {
    fontSize: 9,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
    border: '0.5px solid #E0E0E0',
    marginTop: 5,
  },
   
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    textAlign: 'center',
    flexDirection: 'column', // Para apilar los textos en el footer
    alignItems: 'center',   // Centrar los textos dentro del footer
  },
  footerText: {
    fontSize: 8,
    color: '#555555',
    marginBottom: 2, // Pequeño espacio entre líneas del footer
  },
});

// --- Funciones para formatear datos ---
interface FinalReportPDFDocumentProps {
  report: FullFinalReport;
}

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateString;
  }
};

const getYearFromDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).getFullYear().toString();
    } catch (e) {
      return 'N/A';
    }
}

const getOptionLabel = (options: { value: string; label: string }[] | undefined, value: string): string => {
  return options?.find(opt => opt.value === value)?.label || value;
};

const calculatePercentage = (value: number | undefined | null, total: number | undefined | null): string => {
  if (typeof value !== 'number' || typeof total !== 'number' || total === 0) {
    return 'N/A';
  }
  return ((value / total) * 100).toFixed(1) + '%';
};


export const FinalReportPDFDocument: React.FC<FinalReportPDFDocumentProps> = ({ report }) => {
  const stats = report.statistics;
  const studentInfo = report.studentInformation;
  const evaluations = report.evaluation || [];

  const groupedEvaluations = evaluations.reduce((acc, question) => {
    const groupName = question.questionGroup || 'Evaluación General';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(question);
    return acc;
  }, {} as Record<string, FinalReportEvaluationFE[]>);

  const campusName = report.academicLoad?.campus?.name || 'Campus [No especificado]';
  const cycleName = report.academicLoad?.academicCycle?.name || '[No especificado]';
  const reportYear = getYearFromDate(report.academicLoad?.academicCycle?.startDate || report.createdAt);


  return (
    <Document title={`Informe Final - ${report.academicLoad?.nrc || 'N/A'}`} author="Universidad Nacional de Costa Rica">
      <Page size="A4" style={styles.page}>
        {/* Header: Logo y Bloque de Título - Solo en la primera página */}
        <View style={styles.headerContainer}>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoTextUNA}>UNA</Text>
            <View style={styles.logoHorizontalLine} />
            <Text style={styles.logoTextSubLine}>UNIVERSIDAD</Text>
            <Text style={styles.logoTextSubLine}>NACIONAL</Text>
            <View style={styles.logoHorizontalLineSmall} />
            <Text style={styles.logoTextCostaRica}>COSTA RICA</Text>
            <View style={styles.logoHorizontalLine} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.mainTitle}>Informe Final de Curso</Text>
            <Text style={styles.subTitle}>Campus: {campusName}</Text>
            <Text style={styles.subTitle}>Ciclo: {cycleName}</Text>
            <Text style={styles.subTitle}>Año: {reportYear}</Text>
          </View>
        </View>

        {/* Sección 1: Información del Curso y Profesor */}
        <Text style={styles.sectionTitle}>1. Información del Curso y Profesor</Text>
        <View style={styles.table}>
          {[
            { label: 'NRC', value: report.academicLoad?.nrc || 'N/A' },
            { label: 'Curso', value: report.academicLoad?.course?.name || 'N/A' },
            { label: 'Código Curso', value: report.academicLoad?.course?.code || 'N/A' },
            { label: 'Ciclo Académico', value: report.academicLoad?.academicCycle?.name || 'N/A' },
            { label: 'Profesor', value: report.professor?.fullName || report.academicLoad?.professor?.fullName || 'N/A' },
          ].map((item, index, arr) => (
            <View style={[styles.tableRow, index === arr.length - 1 ? { borderBottomWidth: 0 } : {}]} key={item.label} wrap={false}>
              <View style={[styles.tableCol, styles.infoTableLabelCol]}><Text style={styles.labelText}>{item.label}</Text></View>
              <View style={[styles.tableCol, styles.infoTableValueCol]}><Text style={styles.tableCell}>{item.value}</Text></View>
            </View>
          ))}
        </View>

        {/* Sección 2: Estadísticas */}
        <Text style={styles.sectionTitle}>2. Estadísticas del Curso</Text>
        {stats ? (
          <View style={styles.table}>
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableColHeader, styles.statsTableMetricCol]}><Text style={styles.tableCellHeader}>Métrica</Text></View>
              <View style={[styles.tableColHeader, styles.statsTableCountCol]}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>Cantidad</Text></View>
              <View style={[styles.tableColHeader, styles.statsTablePercentCol, { borderRightWidth: 0 }]}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>Porcentaje</Text></View>
            </View>
            {[
              { label: 'Total Estudiantes Inscritos', value: stats.totalStudents, percentage: '-' },
              { label: 'Estudiantes Aprobados', value: stats.passed, percentage: calculatePercentage(stats.passed, stats.totalStudents) },
              { label: 'Estudiantes Reprobados', value: stats.failed, percentage: calculatePercentage(stats.failed, stats.totalStudents) },
              { label: 'Estudiantes Desertores (Retirados)', value: stats.dropouts, percentage: calculatePercentage(stats.dropouts, stats.totalStudents) },
            ].map((item, index, arr) => (
              <View style={[styles.tableRow, index === arr.length - 1 ? { borderBottomWidth: 0 } : {}]} key={item.label} wrap={false}>
                <View style={[styles.tableCol, styles.statsTableMetricCol]}><Text style={styles.tableCell}>{item.label}</Text></View>
                <View style={[styles.tableCol, styles.statsTableCountCol]}><Text style={styles.tableCellCentered}>{item.value ?? 'N/A'}</Text></View>
                <View style={[styles.tableCol, styles.statsTablePercentCol, { borderRightWidth: 0 }]}><Text style={styles.tableCellCentered}>{item.percentage}</Text></View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>No hay datos estadísticos disponibles para este informe.</Text>
        )}

        {/* Sección 3: Información de Estudiantes */}
        <Text style={styles.sectionTitle}>3. Información de Estudiantes</Text>
        <Text style={styles.subSectionTitle}>3.1 Adecuaciones Curriculares</Text>
        {(studentInfo?.adjustments && studentInfo.adjustments.length > 0) ? (
          <View style={styles.table}>
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableColHeader, { width: '20%' }]}><Text style={styles.tableCellHeader}>Cédula</Text></View>
              <View style={[styles.tableColHeader, { width: '30%' }]}><Text style={styles.tableCellHeader}>Nombre</Text></View>
              <View style={[styles.tableColHeader, { width: '15%' }]}><Text style={styles.tableCellHeader}>Apoyo</Text></View>
              <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>Nota</Text></View>
              <View style={[styles.tableColHeader, { width: '25%', borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>Observación</Text></View>
            </View>
            {studentInfo.adjustments.map((student, index, arr) => (
              <View style={[styles.tableRow, index === arr.length - 1 ? { borderBottomWidth: 0 } : {}]} key={`adj-${student.idNumber}-${index}`} wrap={false}>
                <View style={[styles.tableCol, { width: '20%' }]}><Text style={styles.tableCell}>{student.idNumber}</Text></View>
                <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCell}>{student.name}</Text></View>
                <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{student.support}</Text></View>
                <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellCentered}>{student.grade}</Text></View>
                <View style={[styles.tableCol, { width: '25%', borderRightWidth: 0 }]}><Text style={styles.tableCell}>{student.observation}</Text></View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>No se registraron adecuaciones curriculares.</Text>
        )}

        <Text style={styles.subSectionTitle}>3.2 Estudiantes en Salvaguarda</Text>
        {(studentInfo?.safeguards && studentInfo.safeguards.length > 0) ? (
          <View style={styles.table}>
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableColHeader, { width: '25%' }]}><Text style={styles.tableCellHeader}>Cédula</Text></View>
              <View style={[styles.tableColHeader, { width: '40%' }]}><Text style={styles.tableCellHeader}>Nombre</Text></View>
              <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>Nota</Text></View>
              <View style={[styles.tableColHeader, { width: '25%', borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>Observación</Text></View>
            </View>
            {studentInfo.safeguards.map((student, index, arr) => (
              <View style={[styles.tableRow, index === arr.length - 1 ? { borderBottomWidth: 0 } : {}]} key={`saf-${student.idNumber}-${index}`} wrap={false}>
                <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{student.idNumber}</Text></View>
                <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>{student.name}</Text></View>
                <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellCentered}>{student.grade}</Text></View>
                <View style={[styles.tableCol, { width: '25%', borderRightWidth: 0 }]}><Text style={styles.tableCell}>{student.observation}</Text></View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>No se registraron estudiantes en salvaguarda.</Text>
        )}
        
        {/* Sección 4: Evaluación - Comienza en una nueva página */}
        <View break>
          <Text style={styles.sectionTitle}>4. Evaluación y Percepción del Curso</Text>
          {Object.entries(groupedEvaluations).length > 0 ? (
            Object.entries(groupedEvaluations).map(([groupName, questions], groupIndex) => (
              <View style={styles.evalGroupTable} key={groupName} wrap={false}>
                <View style={styles.evalGroupHeaderRow} fixed>
                  <Text style={styles.evalGroupHeaderText}>{groupName.replace(/_/g, ' ')}</Text>
                </View>
                {questions.map((q, qIndex, arr) => (
                  <React.Fragment key={`${groupName}-${q.questionId}-${qIndex}`}>
                    <View style={styles.evalQuestionRow} wrap={false}>
                      <Text style={styles.evalQuestionTextCell}>{q.question}</Text>
                    </View>
                    <View style={[styles.evalAnswerRow, (qIndex === arr.length - 1) ? { borderBottomWidth: 0 } : {}]} wrap={false}>
                      <View style={styles.evalAnswerTextCell}>
                        {q.responseType === 'TEXT' && <Text>{q.response || q.otherResponse || 'N/R'}</Text>}
                        {q.responseType === 'SELECCION_UNICA' && (
                          <Text>
                            {getOptionLabel(q.options, q.response || '') || 'N/R'}
                          </Text>
                        )}
                        {q.responseType === 'SELECCION_MULTIPLE' && (
                          (q.multipleResponse && q.multipleResponse.length > 0) ? (
                            q.multipleResponse.map((respValue, rIndex) => (
                              <Text key={rIndex} style={styles.evalListItem}>
                                • {getOptionLabel(q.options, respValue)}
                              </Text>
                            ))
                          ) : ( q.otherResponse ? <Text>{q.otherResponse}</Text> : <Text>N/R</Text> )
                        )}
                        {q.questionId === 'otras_herramientas' && q.response && q.responseType !== 'TEXT' && (
                           <Text>{q.response}</Text>
                        )}
                        {(!q.response && !q.otherResponse && (!q.multipleResponse || q.multipleResponse.length === 0) && !(q.questionId === 'otras_herramientas' && q.response)) && <Text>N/R</Text>}
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No hay datos de evaluación disponibles.</Text>
          )}
        </View>

         
        <View style={styles.footerContainer} fixed>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => {
              if (pageNumber === totalPages) {
                return `Informe creado por la Universidad nacional de Costa rica.`;
              }
              return ''; // No mostrar en otras páginas
            }}
          />
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => {
              if (pageNumber === totalPages) {
                return `Fecha de Creación del Informe: ${formatDate(report.createdAt)}`;
              }
              return '';  
            }}
          />
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  );
};
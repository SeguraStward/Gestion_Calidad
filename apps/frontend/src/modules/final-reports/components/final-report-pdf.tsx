import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import React from 'react'
import type { FinalReportEvaluationFE, FullFinalReport } from '../types/final-reports.types'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 35,
    fontFamily: 'Helvetica'
  },
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%'
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 95,
    alignItems: 'flex-start'
  },
  logoImage: {
    width: 95,
    height: 80,
    objectFit: 'contain',
    objectPosition: 'center'
  },
  titleBlock: {
    width: '100%',
    textAlign: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  mainTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 2,
    textAlign: 'center',
    width: '100%'
  },
  subTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 3,
    textAlign: 'center',
    width: '100%'
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    marginTop: 16,
    paddingBottom: 5,
    textAlign: 'center',
    width: '100%'
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 1.3
  },
  labelText: {
    fontSize: 9,
    color: '#1A1A1A',
    fontWeight: 'bold'
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 12
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#000000',
    borderBottomWidth: 1
  },
  tableColHeader: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightColor: '#000000',
    borderRightWidth: 1,
    flexGrow: 1
  },
  tableCol: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightColor: '#000000',
    borderRightWidth: 1,
    flexGrow: 1
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center'
  },
  tableCell: {
    fontSize: 8,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 1.3
  },
  tableCellCentered: {
    fontSize: 8,
    color: '#333333',
    textAlign: 'center'
  },
  infoTableLabelCol: { width: '30%' },
  infoTableValueCol: { width: '70%', borderRightWidth: 0 },
  evalGroupTable: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 15
  },
  evalGroupHeaderRow: {
    backgroundColor: '#E8E8E8',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  evalGroupHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center'
  },
  studentSectionHeaderRow: {
    backgroundColor: '#E8E8E8',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  studentSectionHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center'
  },
  evalQuestionRow: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  evalAnswerRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#000000'
  },
  evalQuestionTextCell: {
    fontSize: 9,
    color: '#000000',
    fontWeight: 'bold',
    flex: 1
  },
  evalAnswerTextCell: {
    fontSize: 8,
    color: '#333333',
    paddingLeft: 8,
    flex: 1
  },
  evalListItem: {
    fontSize: 9,
    marginLeft: 0,
    marginBottom: 2,
    color: '#454545'
  },
  noDataText: {
    fontSize: 9,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
    border: '1px solid #000000',
    backgroundColor: '#F8F8F8',
    marginTop: 5
  },

  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    textAlign: 'center',
    alignItems: 'center'
  },
  footerText: {
    fontSize: 8,
    color: '#888888'
  },
  creationDateContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  creationDateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  creationDateLabel: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#000000',
    borderRightWidth: 0,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000'
  },
  creationDateValue: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#000000',
    fontSize: 10,
    color: '#333333'
  }
})

// --- Funciones para formatear datos ---
interface FinalReportPDFDocumentProps {
  report: FullFinalReport
}

const getLogoUrl = (): string => {
  // Opción 1: En el navegador, usar la URL actual (100% confiable)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/assets/images/una-logo.png`
  }

  // Opción 2: En el servidor, usar VERCEL_URL (Vercel automáticamente la provee)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/assets/images/una-logo.png`
  }

  // Opción 3: Fallback para desarrollo local
  return 'http://localhost:3001/assets/images/una-logo.png'
}

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  } catch (e) {
    return dateString
  }
}

const getYearFromDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).getFullYear().toString()
  } catch (e) {
    return 'N/A'
  }
}

const getOptionLabel = (options: { value: string; label: string }[] | undefined, value: string): string => {
  return options?.find((opt) => opt.value === value)?.label || value
}

const calculatePercentage = (value: number | undefined | null, total: number | undefined | null): string => {
  if (typeof value !== 'number' || typeof total !== 'number' || total === 0) {
    return 'N/A'
  }
  return ((value / total) * 100).toFixed(1) + '%'
}

const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const FinalReportPDFDocument: React.FC<FinalReportPDFDocumentProps> = ({ report }) => {
  const stats = report.statistics
  const studentInfo = report.studentInformation
  const evaluations = report.evaluation || []

  const groupedEvaluations = evaluations.reduce(
    (acc, question) => {
      const groupName = question.questionGroup || 'Evaluación General'
      if (!acc[groupName]) {
        acc[groupName] = []
      }
      acc[groupName].push(question)
      return acc
    },
    {} as Record<string, FinalReportEvaluationFE[]>
  )

  const campusName = report.academicLoad?.campus?.name || 'Campus [No especificado]'
  const cycleName = report.academicLoad?.academicCycle?.name || '[No especificado]'
  const reportYear = getYearFromDate(report.academicLoad?.academicCycle?.startDate || report.createdAt)

  // URL del logo de la UNA
  const logoUrl = getLogoUrl()

  // Función para renderizar el logo si está disponible
  const renderLogo = () => {
    return <Image style={styles.logoImage} src={logoUrl} />
  }

  return (
    <Document title={`Informe Final - ${report.academicLoad?.nrc || 'N/A'}`} author="Universidad Nacional de Costa Rica">
      <Page size="A4" style={styles.page}>
        {/* Header: Logo y Bloque de Título - Solo en la primera página */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>{renderLogo()}</View>
          <View style={styles.titleBlock}>
            <Text style={styles.mainTitle}>INFORME FINAL DE CURSO</Text>
            <Text style={styles.subTitle}>Campus: {campusName}</Text>
            <Text style={styles.subTitle}>Ciclo: {cycleName}</Text>
            <Text style={styles.subTitle}>Año: {reportYear}</Text>
          </View>
        </View>

        {/* Sección: Información del Curso */}
        <Text style={styles.sectionTitle}>Información del Curso y Profesor</Text>
        <View style={styles.table}>
          {[
            { label: 'Curso', value: report.academicLoad?.course?.name || 'N/A' },
            { label: 'Código', value: report.academicLoad?.course?.code || 'N/A' },
            { label: 'NRC', value: report.academicLoad?.nrc || 'N/A' },
            { label: 'Profesor', value: report.professor?.fullName || report.academicLoad?.professor?.fullName || 'N/A' }
          ].map((item, index, arr) => (
            <View
              style={[styles.tableRow, index === arr.length - 1 ? { borderBottomWidth: 0 } : {}]}
              key={item.label}
              wrap={false}
            >
              <View style={[styles.tableColHeader, { width: '30%' }]}>
                <Text style={styles.tableCellHeader}>{item.label}</Text>
              </View>
              <View style={[styles.tableCol, { width: '70%', borderRightWidth: 0 }]}>
                <Text style={styles.tableCell}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sección: Estadísticas */}
        <Text style={styles.sectionTitle}>Estadísticas del Curso</Text>
        {stats ? (
          <View style={styles.table}>
            {[
              { label: 'Total Estudiantes Inscritos', value: stats.totalStudents },
              {
                label: 'Estudiantes Aprobados',
                value: `${stats.passed} (${calculatePercentage(stats.passed, stats.totalStudents)})`
              },
              {
                label: 'Estudiantes Reprobados',
                value: `${stats.failed} (${calculatePercentage(stats.failed, stats.totalStudents)})`
              },
              {
                label: 'Estudiantes Desertores (Retirados)',
                value: `${stats.dropouts} (${calculatePercentage(stats.dropouts, stats.totalStudents)})`
              }
            ].map((item, index, arr) => (
              <View
                style={[styles.tableRow, index === arr.length - 1 ? { borderBottomWidth: 0 } : {}]}
                key={item.label}
                wrap={false}
              >
                <View style={[styles.tableColHeader, { width: '60%' }]}>
                  <Text style={styles.tableCellHeader}>{item.label}</Text>
                </View>
                <View style={[styles.tableCol, { width: '40%', borderRightWidth: 0 }]}>
                  <Text style={styles.tableCell}>{item.value ?? 'N/A'}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>No hay datos estadísticos disponibles para este informe.</Text>
        )}

        {/* Sección: Información de Estudiantes */}
        <Text style={styles.sectionTitle}>Información Específica sobre Estudiantes</Text>
        {studentInfo?.adjustments && studentInfo.adjustments.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.studentSectionHeaderRow}>
              <Text style={styles.studentSectionHeaderText}>
                Ajustes Metodológicos y de Evaluación (estudiantes que requirieron algún tipo de adecuación o apoyo pedagógico)
              </Text>
            </View>
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableColHeader, { width: '20%' }]}>
                <Text style={styles.tableCellHeader}>Cédula</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '30%' }]}>
                <Text style={styles.tableCellHeader}>Nombre</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '15%' }]}>
                <Text style={styles.tableCellHeader}>Apoyo</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '10%' }]}>
                <Text style={styles.tableCellHeader}>Nota</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '25%', borderRightWidth: 0 }]}>
                <Text style={styles.tableCellHeader}>Observación</Text>
              </View>
            </View>
            {studentInfo.adjustments.map((student, index, arr) => (
              <View
                style={[styles.tableRow, index === arr.length - 1 ? { borderBottomWidth: 0 } : {}]}
                key={`adj-${student.idNumber}-${index}`}
                wrap={false}
              >
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>{student.idNumber}</Text>
                </View>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text style={styles.tableCell}>{student.name}</Text>
                </View>
                <View style={[styles.tableCol, { width: '15%' }]}>
                  <Text style={styles.tableCell}>{student.support}</Text>
                </View>
                <View style={[styles.tableCol, { width: '10%' }]}>
                  <Text style={styles.tableCellCentered}>{student.grade}</Text>
                </View>
                <View style={[styles.tableCol, { width: '25%', borderRightWidth: 0 }]}>
                  <Text style={styles.tableCell}>{student.observation}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.studentSectionHeaderRow}>
              <Text style={styles.studentSectionHeaderText}>
                Ajustes Metodológicos y de Evaluación (estudiantes que requirieron algún tipo de adecuación o apoyo pedagógico)
              </Text>
            </View>
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.tableCol, { borderRightWidth: 0 }]}>
                <Text style={styles.noDataText}>No se registraron adecuaciones curriculares.</Text>
              </View>
            </View>
          </View>
        )}

        {studentInfo?.safeguards && studentInfo.safeguards.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.studentSectionHeaderRow}>
              <Text style={styles.studentSectionHeaderText}>
                Plan para Poblaciones Indígenas (grupos de interés institucional, estudiantes provenientes de territorios
                indígenas)
              </Text>
            </View>
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableColHeader, { width: '25%' }]}>
                <Text style={styles.tableCellHeader}>Cédula</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '40%' }]}>
                <Text style={styles.tableCellHeader}>Nombre</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '10%' }]}>
                <Text style={styles.tableCellHeader}>Nota</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '25%', borderRightWidth: 0 }]}>
                <Text style={styles.tableCellHeader}>Observación</Text>
              </View>
            </View>
            {studentInfo.safeguards.map((student, index, arr) => (
              <View
                style={[styles.tableRow, index === arr.length - 1 ? { borderBottomWidth: 0 } : {}]}
                key={`saf-${student.idNumber}-${index}`}
                wrap={false}
              >
                <View style={[styles.tableCol, { width: '25%' }]}>
                  <Text style={styles.tableCell}>{student.idNumber}</Text>
                </View>
                <View style={[styles.tableCol, { width: '40%' }]}>
                  <Text style={styles.tableCell}>{student.name}</Text>
                </View>
                <View style={[styles.tableCol, { width: '10%' }]}>
                  <Text style={styles.tableCellCentered}>{student.grade}</Text>
                </View>
                <View style={[styles.tableCol, { width: '25%', borderRightWidth: 0 }]}>
                  <Text style={styles.tableCell}>{student.observation}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.studentSectionHeaderRow}>
              <Text style={styles.studentSectionHeaderText}>
                Plan para Poblaciones Indígenas (grupos de interés institucional, estudiantes provenientes de territorios
                indígenas)
              </Text>
            </View>
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.tableCol, { borderRightWidth: 0 }]}>
                <Text style={styles.noDataText}>No se registraron estudiantes en salvaguarda.</Text>
              </View>
            </View>
          </View>
        )}

        {/* Sección 4: Evaluación - Comienza en una nueva página */}
        <View break>
          <Text style={styles.sectionTitle}>Evaluación y Percepción del Curso</Text>
          {Object.entries(groupedEvaluations).length > 0 ? (
            Object.entries(groupedEvaluations).map(([groupName, questions], groupIndex) => (
              <View style={styles.evalGroupTable} key={groupName} wrap={false}>
                <View style={styles.evalGroupHeaderRow} fixed>
                  <Text style={styles.evalGroupHeaderText}>{groupName.replace(/_/g, ' ')}</Text>
                </View>
                {questions.map((q, qIndex, arr) => (
                  <React.Fragment key={`${groupName}-${q.questionId}-${qIndex}`}>
                    <View style={styles.evalQuestionRow} wrap={false}>
                      <Text style={styles.evalQuestionTextCell}>
                        {qIndex + 1}. {q.question}
                      </Text>
                    </View>
                    <View style={[styles.evalAnswerRow, qIndex === arr.length - 1 ? { borderBottomWidth: 0 } : {}]} wrap={false}>
                      <View style={styles.evalAnswerTextCell}>
                        {q.responseType === 'TEXT' && (
                          <Text>{capitalizeFirstLetter(q.response || q.otherResponse || 'N/R')}</Text>
                        )}
                        {q.responseType === 'SELECCION_UNICA' && (
                          <Text>{getOptionLabel(q.options, q.response || '') || 'N/R'}</Text>
                        )}
                        {q.responseType === 'SELECCION_MULTIPLE' &&
                          (q.multipleResponse && q.multipleResponse.length > 0 ? (
                            q.multipleResponse.map((respValue, rIndex) => (
                              <Text key={rIndex} style={styles.evalListItem}>
                                • {getOptionLabel(q.options, respValue)}
                              </Text>
                            ))
                          ) : q.otherResponse ? (
                            <Text>{q.otherResponse}</Text>
                          ) : (
                            <Text>N/R</Text>
                          ))}
                        {q.questionId === 'otras_herramientas' && q.response && q.responseType !== 'TEXT' && (
                          <Text>{capitalizeFirstLetter(q.response)}</Text>
                        )}
                        {!q.response &&
                          !q.otherResponse &&
                          (!q.multipleResponse || q.multipleResponse.length === 0) &&
                          !(q.questionId === 'otras_herramientas' && q.response) && <Text>N/R</Text>}
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

        {/* Sección de Fecha de Creación */}
        <View style={styles.creationDateContainer}>
          <View style={styles.creationDateRow}>
            <Text style={styles.creationDateLabel}>Fecha de Creación:</Text>
            <Text style={styles.creationDateValue}>{formatDate(report.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.footerContainer} fixed>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

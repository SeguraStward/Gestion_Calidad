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

// Helper function to convert boolean string values to Yes/No in Spanish
const formatBooleanResponse = (response: string | undefined): string => {
  if (!response) return 'N/R'

  const lowerResponse = response.toLowerCase().trim()

  // Handle boolean values
  if (lowerResponse === 'true' || lowerResponse === 'yes' || lowerResponse === 'sí' || lowerResponse === 'si') {
    return 'Sí'
  }
  if (lowerResponse === 'false' || lowerResponse === 'no') {
    return 'No'
  }

  // Return original value if not a boolean
  return capitalizeFirstLetter(response)
}

export const FinalReportPDFDocument: React.FC<FinalReportPDFDocumentProps> = ({ report }) => {
  const stats = report.statistics
  const studentInfo = report.studentInformation
  const evaluations = report.evaluation || []

  console.log('📊 PDF - Total evaluations:', evaluations.length)
  console.log('📊 PDF - Evaluations detail:', evaluations.map(e => ({
    id: e.questionId,
    type: e.responseType,
    group: e.questionGroup,
    step: e.stepNumber,
    hasResponse: !!e.response,
    hasMultipleResponse: !!(e.multipleResponse && e.multipleResponse.length > 0)
  })))

  // Step 5: Questions with stepNumber === 5
  const step5Evaluations = evaluations.filter(e => e.stepNumber === 5)

  // Step 6: Questions with stepNumber === 6 (tools/herramientas)
  const step6Evaluations = evaluations.filter(e => e.stepNumber === 6)

  // Step 7: Questions with stepNumber === 7 (perception/quality)
  const step7Evaluations = evaluations.filter(e => e.stepNumber === 7)

  console.log('📊 PDF - Step 5 (Evaluation):', step5Evaluations.length)
  console.log('📊 PDF - Step 6 (Tools):', step6Evaluations.length)
  console.log('📊 PDF - Step 7 (Quality):', step7Evaluations.length)

  // Group step 7 evaluations by question group
  const groupedStep7Evaluations = step7Evaluations.reduce(
    (acc, question) => {
      const groupName = question.questionGroup || 'Percepción General'
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

        {/* Sección 4: Evaluación General del Curso (Paso 5) */}
        <View break>
          <Text style={styles.sectionTitle}>Evaluación General del Curso</Text>
          {step5Evaluations.length > 0 ? (
            <View style={styles.evalGroupTable} wrap={false}>
              <View style={styles.evalGroupHeaderRow} fixed>
                <Text style={styles.evalGroupHeaderText}>Análisis y Reflexión del Profesor</Text>
              </View>
              {step5Evaluations.map((q, qIndex, arr) => (
                <React.Fragment key={`step5-${q.questionId}-${qIndex}`}>
                  <View style={styles.evalQuestionRow} wrap={false}>
                    <Text style={styles.evalQuestionTextCell}>
                      {qIndex + 1}. {q.question}
                    </Text>
                  </View>
                  <View style={[styles.evalAnswerRow, qIndex === arr.length - 1 ? { borderBottomWidth: 0 } : {}]} wrap={false}>
                    <View style={styles.evalAnswerTextCell}>
                      {/* Handle MULTISELECT and SELECCION_MULTIPLE (multiple choice questions) */}
                      {(q.responseType === 'SELECCION_MULTIPLE' || q.responseType === 'MULTISELECT') && q.multipleResponse && q.multipleResponse.length > 0 ? (
                        (() => {
                          console.log('🔍 PDF Step 5 - Processing multipleResponse:', {
                            questionId: q.questionId,
                            multipleResponse: q.multipleResponse,
                            hasOptions: !!q.options,
                            optionsCount: q.options?.length || 0
                          })
                          return q.multipleResponse.map((value, tIndex) => {
                            let displayText = value

                            // Try multiple strategies to find the matching option (backwards compatibility)
                            if (q.options && q.options.length > 0) {
                              // 1. Try exact match by value
                              let option = q.options.find(opt => opt.value === value)

                              // 2. Try case-insensitive match by value
                              if (!option) {
                                option = q.options.find(opt =>
                                  opt.value?.toLowerCase() === value?.toLowerCase()
                                )
                              }

                              // 3. Try to find by label (partial match for backwards compatibility)
                              if (!option) {
                                option = q.options.find(opt =>
                                  opt.label?.toLowerCase().includes(value?.toLowerCase()) ||
                                  value?.toLowerCase().includes(opt.value?.toLowerCase())
                                )
                              }

                              if (option) {
                                displayText = option.label
                                console.log(`  - Step 5: Converted "${value}" → "${displayText}"`)
                              } else {
                                console.log(`  - Step 5: No match found for "${value}", using as-is`)
                              }
                            }

                            return (
                              <Text key={tIndex} style={styles.evalListItem}>
                                • {displayText}
                              </Text>
                            )
                          })
                        })()
                      ) : q.responseType === 'SELECT' && q.response ? (
                        (() => {
                          // Handle SELECT questions - convert value to label
                          let displayText = q.response

                          if (q.options && q.options.length > 0) {
                            const option = q.options.find(opt => opt.value === q.response)
                            if (option) {
                              displayText = option.label
                            }
                          }

                          // Format boolean responses (true/false → Sí/No)
                          displayText = formatBooleanResponse(displayText)

                          return <Text>{displayText}</Text>
                        })()
                      ) : (
                        <Text>{formatBooleanResponse(q.response || q.otherResponse || 'N/R')}</Text>
                      )}
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>No hay datos de evaluación general disponibles.</Text>
          )}
        </View>

        {/* Sección 5: Herramientas Tecnológicas Utilizadas (Paso 6) */}
        {step6Evaluations.length > 0 && (
          <View break>
            <Text style={styles.sectionTitle}>Herramientas Tecnológicas Utilizadas</Text>
            <View style={styles.evalGroupTable} wrap={false}>
              <View style={styles.evalGroupHeaderRow} fixed>
                <Text style={styles.evalGroupHeaderText}>Recursos y Metodologías Aplicadas</Text>
              </View>
              {step6Evaluations.map((q, qIndex, arr) => (
                <React.Fragment key={`step6-${q.questionId}-${qIndex}`}>
                  <View style={styles.evalQuestionRow} wrap={false}>
                    <Text style={styles.evalQuestionTextCell}>
                      {q.question}
                    </Text>
                  </View>
                  <View style={[styles.evalAnswerRow, qIndex === arr.length - 1 ? { borderBottomWidth: 0 } : {}]} wrap={false}>
                    <View style={styles.evalAnswerTextCell}>
                      {/* For multiple selection (tools list) */}
                      {q.responseType === 'SELECCION_MULTIPLE' && q.multipleResponse && q.multipleResponse.length > 0 ? (
                        (() => {
                          console.log('🔍 PDF - Processing multipleResponse:', {
                            questionId: q.questionId,
                            multipleResponse: q.multipleResponse,
                            hasOptions: !!q.options,
                            optionsCount: q.options?.length || 0
                          })
                          return q.multipleResponse.map((toolLabel, tIndex) => {
                            // multipleResponse now contains labels directly (since we save labels instead of values)
                            // But for backwards compatibility, try to find the option if it looks like a value
                            let displayText = toolLabel

                            // Try multiple strategies to find the matching option (backwards compatibility)
                            if (q.options && q.options.length > 0) {
                              // 1. Try exact match by value
                              let option = q.options.find(opt => opt.value === toolLabel)

                              // 2. Try case-insensitive match by value
                              if (!option) {
                                option = q.options.find(opt =>
                                  opt.value?.toLowerCase() === toolLabel?.toLowerCase()
                                )
                              }

                              // 3. Try to find by label (partial match for backwards compatibility)
                              if (!option) {
                                option = q.options.find(opt =>
                                  opt.label?.toLowerCase().includes(toolLabel?.toLowerCase()) ||
                                  toolLabel?.toLowerCase().includes(opt.value?.toLowerCase())
                                )
                              }

                              if (option) {
                                displayText = option.label
                                console.log(`  - Converted "${toolLabel}" → "${displayText}"`)
                              } else {
                                console.log(`  - No match found for "${toolLabel}", using as-is`)
                              }
                            }

                            return (
                              <Text key={tIndex} style={styles.evalListItem}>
                                • {displayText}
                              </Text>
                            )
                          })
                        })()
                      ) : q.responseType === 'TEXT' ? (
                        <Text>{formatBooleanResponse(q.response || 'N/R')}</Text>
                      ) : (
                        <Text>N/R</Text>
                      )}
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Sección 6: Percepción de Calidad del Curso (Paso 7) */}
        <View break>
          <Text style={styles.sectionTitle}>Percepción de Calidad del Curso</Text>
          {Object.entries(groupedStep7Evaluations).length > 0 ? (
            Object.entries(groupedStep7Evaluations).map(([groupName, questions], groupIndex) => (
              <View style={styles.evalGroupTable} key={groupName} wrap={false}>
                <View style={styles.evalGroupHeaderRow} fixed>
                  <Text style={styles.evalGroupHeaderText}>{groupName.replace(/_/g, ' ')}</Text>
                </View>
                {questions.map((q, qIndex, arr) => (
                  <React.Fragment key={`step7-${groupName}-${q.questionId}-${qIndex}`}>
                    <View style={styles.evalQuestionRow} wrap={false}>
                      <Text style={styles.evalQuestionTextCell}>
                        {qIndex + 1}. {q.question}
                      </Text>
                    </View>
                    <View style={[styles.evalAnswerRow, qIndex === arr.length - 1 ? { borderBottomWidth: 0 } : {}]} wrap={false}>
                      <View style={styles.evalAnswerTextCell}>
                        {/* Handle MULTISELECT questions with bullets */}
                        {q.responseType === 'MULTISELECT' || (q.responseType as string) === 'SELECCION_MULTIPLE' ? (
                          q.multipleResponse && q.multipleResponse.length > 0 ? (
                            <View>
                              {q.multipleResponse.map((item, idx) => {
                                // Try to convert value to label if options are available (backwards compatibility)
                                let displayItem = item
                                if (q.options && q.options.length > 0) {
                                  const option = q.options.find(opt => opt.value === item)
                                  if (option) {
                                    displayItem = option.label
                                  }
                                }
                                return (
                                  <Text key={idx} style={{ marginBottom: idx < q.multipleResponse!.length - 1 ? 2 : 0 }}>
                                    • {displayItem}
                                  </Text>
                                )
                              })}
                            </View>
                          ) : (
                            <Text>N/R</Text>
                          )
                        ) : (
                          /* For SELECT and other question types */
                          (() => {
                            let displayText = q.response || 'N/R'

                            // Try to convert value to label if options are available
                            if (q.responseType === 'SELECT' && q.options && q.options.length > 0 && q.response) {
                              const option = q.options.find(opt => opt.value === q.response)
                              if (option) {
                                displayText = option.label
                              }
                            }

                            // Format boolean responses (true/false → Sí/No)
                            displayText = formatBooleanResponse(displayText)

                            return <Text>{displayText}</Text>
                          })()
                        )}
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No hay datos de percepción de calidad disponibles.</Text>
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

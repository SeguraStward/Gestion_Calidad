'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'

// Import service and hooks
import { useFinalReport, useUpdateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import type {
  FullFinalReport,
  UpdateFinalReportDto,
  FinalReportEvaluationFE
} from '@/modules/final-reports/types/final-reports.types'

// Import Step components and their data types/schemas
import { Step1Form, Step1FormData, step1Schema } from '@/modules/final-reports/components/form-step1'
import { Step2Form, Step2FormData, step2Schema } from '@/modules/final-reports/components/form-step2'
import { Step3Form, Step3FormData, step3Schema } from '@/modules/final-reports/components/form-step3' // Added Step3
import { Step4Form, Step4FormData, step4Schema } from '@/modules/final-reports/components/form-step4'
import { Step5EditForm, Step5FormData, step5Schema } from '@/modules/final-reports/components/form-step5-edit'
import { Step6EditForm, Step6FormData, step6Schema } from '@/modules/final-reports/components/form-step6-edit'
import { Step7EditForm, Step7FormData, step7Schema } from '@/modules/final-reports/components/form-step7-edit'

// Import mock data for form questions
import {
  preguntasPaso5Mock,
  preguntasPaso6PageMock,
  preguntasPaso7PageMock,
  TipoInforme
} from '@/modules/final-reports/mocks/questions'

const TOTAL_STEPS = 7 // Updated to 7
// Define step labels for the edit page
const STEP_LABELS_EDIT = ['Información', 'Estadísticas', 'Salvaguarda', 'Ajustes', 'Evaluación', 'Herramientas', 'Calidad']

// Data transformation functions
function transformReportToStep1Data(report: FullFinalReport): Step1FormData | null {
  if (!report?.academicLoad) return null
  return {
    academicLoadId: report.academicLoadId,
    nrc: report.academicLoad.nrc,
    courseName: report.academicLoad.course?.name || '',
    groupNumber: report.academicLoad.group?.number || '',
    professorName: report.academicLoad.professor?.fullName || report.professor?.fullName || '',
    courseCode: report.academicLoad.course?.code || '',
    groupLevel: report.academicLoad.course?.level ? String(report.academicLoad.course.level) : '',
    enrolledCapacity: report.academicLoad.enrolledCapacity // This is the source
  }
}

// MODIFIED: transformReportToStep2Data to accept enrolledCapacity from Step 1
function transformReportToStep2Data(report: FullFinalReport, enrolledFromStep1?: number | null): Step2FormData | null {
  // Statistics might not exist, but we still want to populate totalEnrolled from Step 1
  const stats = report?.statistics
  return {
    totalEnrolled: enrolledFromStep1 ?? undefined, // Use enrolled capacity from Step 1 data
    totalWithdrawn: stats?.dropouts ?? 0,
    totalPassed: stats?.passed ?? 0,
    totalFailed: stats?.failed ?? 0
  }
}

// Added transformation for Step 3
function transformReportToStep3Data(report: FullFinalReport): Step3FormData | null {
  const safeguards = report.studentInformation?.safeguards
  return {
    salvaguardaEstudiantes: safeguards
      ? safeguards.map((s) => ({
          cedula: s.idNumber,
          nombre: s.name,
          nota: parseFloat(s.grade) || 0,
          observacion: s.observation || ''
        }))
      : []
  }
}

function transformReportToStep4Data(report: FullFinalReport): Step4FormData | null {
  if (!report?.studentInformation?.adjustments) {
    return { ajustesEstudiantes: [] } // Return empty array if no adjustments
  }
  return {
    ajustesEstudiantes: report.studentInformation.adjustments.map((a) => ({
      id: a.idNumber,
      cedula: a.idNumber,
      nombre: a.name,
      apoyo: a.support,
      nota: parseFloat(a.grade) || 0,
      observacion: a.observation || ''
    }))
  }
}

function transformReportToStep5Data(report: FullFinalReport): Step5FormData | null {
  if (!report?.evaluation) return { respuestas: preguntasPaso5Mock.map((p) => ({ idPregunta: p.idPregunta, respuesta: '' })) }
  const step5Respuestas = preguntasPaso5Mock.map((p) => {
    const existingResponse = report.evaluation.find((e) => e.questionId === p.idPregunta)
    return {
      idPregunta: p.idPregunta,
      respuesta: existingResponse?.response || ''
    }
  })
  return { respuestas: step5Respuestas }
}

function transformReportToStep6Data(report: FullFinalReport): Step6FormData | null {
  const defaultData = {
    respuestasMultiples: [{ idPregunta: 'herramientas_utilizadas', respuestasSeleccionadas: [] }],
    otrasHerramientas: ''
  }
  if (!report?.evaluation) return defaultData

  const toolsQuestion = report.evaluation.find((e) => e.questionId === 'herramientas_utilizadas')
  const otrasHerramientasResponse = report.evaluation.find((e) => e.questionId === 'otras_herramientas')?.response || ''

  return {
    respuestasMultiples: [
      {
        idPregunta: 'herramientas_utilizadas',
        respuestasSeleccionadas: toolsQuestion?.multipleResponse || []
      }
    ],
    otrasHerramientas: otrasHerramientasResponse
  }
}

function transformReportToStep7Data(report: FullFinalReport): Step7FormData | null {
  if (!report?.evaluation)
    return { respuestasRadio: preguntasPaso7PageMock.map((p) => ({ idPregunta: p.idPregunta, respuesta: '' })) }
  const percepcionResponses = preguntasPaso7PageMock.map((p) => {
    const existingResponse = report.evaluation.find((e) => e.questionId === p.idPregunta)
    return {
      idPregunta: p.idPregunta,
      respuesta: existingResponse?.response || ''
    }
  })
  return { respuestasRadio: percepcionResponses }
}

export default function EditFinalReportPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string
  const initialLoadCompletedRef = useRef(false)

  const [currentStep, setCurrentStep] = useState(1)
  const [tipoInforme, setTipoInforme] = useState<TipoInforme>('INFORME_FINAL_V1')

  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null)
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null) // Added state for Step 3
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null)
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null)
  const [step6Data, setStep6Data] = useState<Step6FormData | null>(null)
  const [step7Data, setStep7Data] = useState<Step7FormData | null>(null)

  const formStep1Methods = useForm<Step1FormData>({ resolver: zodResolver(step1Schema) })
  const formStep2Methods = useForm<Step2FormData>({ resolver: zodResolver(step2Schema) })
  const formStep3Methods = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: { salvaguardaEstudiantes: [] }
  }) // Added form methods for Step 3
  const formStep4Methods = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: { ajustesEstudiantes: [] }
  })
  const formStep5Methods = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: { respuestas: preguntasPaso5Mock.map((p) => ({ idPregunta: p.idPregunta, respuesta: '' })) }
  })
  const formStep6Methods = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      respuestasMultiples: [{ idPregunta: 'herramientas_utilizadas', respuestasSeleccionadas: [] }],
      otrasHerramientas: ''
    }
  })
  const formStep7Methods = useForm<Step7FormData>({
    resolver: step7Schema ? zodResolver(step7Schema) : undefined,
    defaultValues: { respuestasRadio: preguntasPaso7PageMock.map((p) => ({ idPregunta: p.idPregunta, respuesta: '' })) }
  })

  useEffect(() => {
    if (!step7Schema) {
      console.error('step7Schema is undefined when initializing formStep7Methods')
    }
  }, [])

  const {
    data: fetchedReport,
    isLoading: isLoadingReport,
    error: reportError
  } = useFinalReport(
    reportId,
    {
      include:
        'academicLoad,academicLoad.course,academicLoad.academicCycle,academicLoad.professor,academicLoad.group,professor,statistics,studentInformation,evaluation'
    },
    { enabled: !!reportId }
  )

  const updateReportMutation = useUpdateFinalReport()

  useEffect(() => {
    if (fetchedReport && !initialLoadCompletedRef.current) {
      console.log('[EditPage] Fetched Report Data:', fetchedReport)

      const step1TransformedData = transformReportToStep1Data(fetchedReport)
      // MODIFIED: Pass enrolledCapacity from step1TransformedData to transformReportToStep2Data
      const step2TransformedData = transformReportToStep2Data(fetchedReport, step1TransformedData?.enrolledCapacity)
      const step3TransformedData = transformReportToStep3Data(fetchedReport)
      const step4TransformedData = transformReportToStep4Data(fetchedReport)
      const step5TransformedData = transformReportToStep5Data(fetchedReport)
      const step6TransformedData = transformReportToStep6Data(fetchedReport)
      const step7TransformedData = transformReportToStep7Data(fetchedReport)

      setStep1Data(step1TransformedData)
      setStep2Data(step2TransformedData)
      setStep3Data(step3TransformedData)
      setStep4Data(step4TransformedData)
      setStep5Data(step5TransformedData)
      setStep6Data(step6TransformedData)
      setStep7Data(step7TransformedData)

      let reportVersionType: TipoInforme = 'INFORME_FINAL_V1'
      if (fetchedReport.version === 1) {
        reportVersionType = 'INFORME_FINAL_V1'
      } else if (fetchedReport.version === 2) {
        reportVersionType = 'INFORME_FINAL_V2'
      }
      setTipoInforme(reportVersionType)

      initialLoadCompletedRef.current = true
    }
  }, [fetchedReport])

  useEffect(() => {
    if (step1Data) {
      formStep1Methods.reset(step1Data)
    }
  }, [step1Data, formStep1Methods]) // Consider using formStep1Methods.reset if formStep1Methods is stable
  useEffect(() => {
    if (step2Data) {
      formStep2Methods.reset(step2Data)
    }
  }, [step2Data, formStep2Methods])
  useEffect(() => {
    if (step3Data) {
      formStep3Methods.reset(step3Data)
    }
  }, [step3Data, formStep3Methods])
  useEffect(() => {
    if (step4Data) {
      formStep4Methods.reset(step4Data)
    }
  }, [step4Data, formStep4Methods])
  useEffect(() => {
    if (step5Data) {
      formStep5Methods.reset(step5Data)
    }
  }, [step5Data, formStep5Methods])
  useEffect(() => {
    if (step6Data) {
      formStep6Methods.reset(step6Data)
    }
  }, [step6Data, formStep6Methods])
  useEffect(() => {
    if (step7Data) {
      formStep7Methods.reset(step7Data)
    }
  }, [step7Data, formStep7Methods])

  const handleUpdateStepData = (step: number, data: any) => {
    console.log(`[handleUpdateStepData] Step ${step} data received:`, data)
    try {
      switch (step) {
        case 1:
          const newStep1Data = data as Step1FormData
          setStep1Data(newStep1Data)
          // MODIFIED: Update step2Data.totalEnrolled when step1Data changes
          setStep2Data((prevStep2Data) => ({
            ...(prevStep2Data || { totalWithdrawn: 0, totalPassed: 0, totalFailed: 0 }), // Preserve other fields or provide defaults
            totalEnrolled: newStep1Data.enrolledCapacity ?? undefined
          }))
          break
        case 2:
          setStep2Data(data as Step2FormData)
          break
        case 3:
          setStep3Data(data as Step3FormData)
          break // Added case for Step 3
        case 4:
          setStep4Data(data as Step4FormData)
          break // Was 3
        case 5:
          setStep5Data(data as Step5FormData)
          break // Was 4
        case 6:
          setStep6Data(data as Step6FormData)
          break // Was 5
        case 7: // Was 6
          setStep7Data(data as Step7FormData)
          handleSubmitAllSteps()
          return
      }
      if (step < TOTAL_STEPS) {
        setCurrentStep(step + 1)
      }
    } catch (error) {
      console.error(`Error in handleUpdateStepData for step ${step}:`, error)
      toast.error(`Error procesando datos del paso ${step}`)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleSubmitAllSteps = async () => {
    if (!fetchedReport || !step1Data || !step2Data || !step3Data || !step4Data || !step5Data || !step6Data || !step7Data) {
      // Added !step3Data
      toast.error('Faltan datos de algunos pasos. Por favor complete el formulario.')
      return
    }
    try {
      const evaluationData: FinalReportEvaluationFE[] = [
        ...step5Data.respuestas.map((resp) => {
          const questionData = preguntasPaso5Mock.find((q) => q.idPregunta === resp.idPregunta)
          return {
            questionId: resp.idPregunta,
            response: resp.respuesta,
            responseType: 'TEXT',
            questionGroup: 'logros_dificultades',
            options: [],
            question: questionData?.pregunta || resp.idPregunta
          }
        }),
        {
          questionId: 'herramientas_utilizadas',
          multipleResponse: step6Data?.respuestasMultiples?.[0]?.respuestasSeleccionadas || [],
          responseType: 'SELECCION_MULTIPLE',
          questionGroup: 'herramientas',
          options:
            preguntasPaso6PageMock
              .find((p) => p.idPregunta === 'herramientas_utilizadas')
              ?.opciones?.map((opt) => ({ value: opt.value, label: opt.label, category: 'herramientas' })) || [],
          question:
            preguntasPaso6PageMock.find((p) => p.idPregunta === 'herramientas_utilizadas')?.pregunta || 'Herramientas utilizadas'
        },
        ...(step6Data?.otrasHerramientas
          ? [
              {
                questionId: 'otras_herramientas',
                response: step6Data.otrasHerramientas,
                responseType: 'TEXT',
                questionGroup: 'herramientas',
                options: [],
                question:
                  preguntasPaso6PageMock.find((p) => p.idPregunta === 'otras_herramientas')?.pregunta ||
                  'Otras herramientas utilizadas'
              }
            ]
          : []),
        ...step7Data.respuestasRadio.map((resp) => {
          const questionData = preguntasPaso7PageMock.find((q) => q.idPregunta === resp.idPregunta)
          return {
            questionId: resp.idPregunta,
            response: resp.respuesta,
            responseType: 'SELECCION_UNICA',
            questionGroup: questionData?.grupo || 'percepcion',
            options:
              questionData?.opciones?.map((opt) => ({
                value: opt.value,
                label: opt.label,
                category: questionData?.grupo || 'percepcion'
              })) || [],
            question: questionData?.pregunta || resp.idPregunta
          }
        })
      ]

      const updatePayload: UpdateFinalReportDto = {
        statistics: {
          totalStudents: step2Data.totalEnrolled ?? 0,
          passed: step2Data.totalPassed ?? 0,
          failed: step2Data.totalFailed ?? 0,
          dropouts: step2Data.totalWithdrawn ?? 0
        },
        studentInformation: {
          adjustments: step4Data.ajustesEstudiantes.map((a) => ({
            idNumber: a.cedula,
            name: a.nombre,
            support: a.apoyo,
            grade: String(a.nota),
            observation: a.observacion || ''
          })),
          safeguards: step3Data.salvaguardaEstudiantes.map((s) => ({
            // Updated to use step3Data
            idNumber: s.cedula,
            name: s.nombre,
            grade: String(s.nota),
            observation: s.observacion || ''
          }))
        },
        evaluation: evaluationData
      }
      console.log('Updating report with payload:', updatePayload)
      await updateReportMutation.mutateAsync({ id: reportId, data: updatePayload })
      toast.success('Informe actualizado exitosamente')
      router.push('/final-reports')
    } catch (error: any) {
      console.error('Error updating report:', error)
      toast.error(`Error al actualizar: ${error.message || 'Error desconocido'}`)
    }
  }

  // Render current step
  const renderCurrentStepForm = () => {
    // Renamed from renderCurrentStep to avoid conflict
    if (isLoadingReport) {
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Cargando datos del informe...</p>
        </div>
      )
    }

    if (reportError) {
      return (
        <Card className="p-6 text-center">
          <p className="text-destructive">Error al cargar el informe: {reportError.message}</p>
          <Button onClick={() => router.push('/final-reports')} className="mt-4">
            Volver a la lista
          </Button>
        </Card>
      )
    }

    if (!fetchedReport && !isLoadingReport) {
      return (
        <Card className="p-6 text-center">
          <p>No se encontró el informe o no se pudo cargar.</p>
          <Button onClick={() => router.push('/final-reports')} className="mt-4">
            Volver a la lista
          </Button>
        </Card>
      )
    }

    switch (currentStep) {
      case 1:
        return (
          <Step1Form
            formMethods={formStep1Methods}
            onSaveAndNext={(data) => handleUpdateStepData(1, data)}
            isEditing={true}
            totalSteps={TOTAL_STEPS}
            initialData={step1Data}
            onCancel={() => router.push('/final-reports')} // Added onCancel for consistency
          />
        )
      case 2:
        return (
          <Step2Form
            formMethods={formStep2Methods}
            onSaveAndNext={(data) => handleUpdateStepData(2, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
            initialData={step2Data}
            isEditing={true}
          />
        )
      case 3:
        return (
          <Step3Form
            formMethods={formStep3Methods}
            onSaveAndNext={(data) => handleUpdateStepData(3, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
            initialData={step3Data}
            isEditing={true}
            tipoInforme={tipoInforme}
          />
        )
      case 4:
        return (
          <Step4Form
            formMethods={formStep4Methods}
            onSaveAndNext={(data) => handleUpdateStepData(4, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
            initialData={step4Data}
            isEditing={true}
          />
        )
      case 5:
        return (
          <Step5EditForm
            formMethods={formStep5Methods}
            onSaveAndNext={(data) => handleUpdateStepData(5, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
            initialData={step5Data}
            isEditing={true}
          />
        )
      case 6:
        return (
          <Step6EditForm
            formMethods={formStep6Methods}
            onSaveAndNext={(data) => handleUpdateStepData(6, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
            initialData={step6Data}
            isEditing={true}
          />
        )
      case 7:
        return (
          <Step7EditForm
            formMethods={formStep7Methods}
            onSaveAndNext={(data) => handleUpdateStepData(7, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
            initialData={step7Data}
            isEditing={true}
            tipoInforme={tipoInforme}
          />
        )
      default:
        return <div>Paso desconocido</div>
    }
  }

  return (
    <div className="container mx-auto py-10 md:py-16 max-w-7xl min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="w-full mb-6 md:mb-8">
        <Button variant="outline" onClick={() => router.push('/final-reports')} className="mb-4 text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la Lista de Informes
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Editar Informe Final del Curso</h1>
        <p className="text-muted-foreground text-sm">
          Modifique los datos del informe final del curso. NRC: {step1Data?.nrc || 'Cargando...'}
        </p>
      </div>

      {/* Indicador de Pasos */}
      <div className="mb-8 w-full">
        <div className="flex justify-between items-center px-1 md:px-4">
          {STEP_LABELS_EDIT.map((label, index) => {
            const stepNumber = index + 1
            const isCompleted = currentStep > stepNumber
            const isCurrent = currentStep === stepNumber
            return (
              <div key={stepNumber} className="flex items-center flex-1">
                <div
                  className={`h-14 md:h-16 rounded-full flex items-center justify-center px-3 py-1 md:px-4 md:py-2 text-xs font-medium transition-all duration-300 text-center leading-tight min-w-[100px] md:min-w-[120px] max-w-[130px] md:max-w-[140px] mx-1 ${isCompleted ? 'bg-primary text-primary-foreground shadow-md' : ''} ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-lg font-semibold' : ''} ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground border border-muted-foreground/30' : ''}`}
                >
                  {isCompleted ? (
                    <div className="flex items-center gap-1">
                      {' '}
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />{' '}
                      <span className="truncate">{label}</span>{' '}
                    </div>
                  ) : (
                    <span className="truncate">{label}</span>
                  )}
                </div>
                {index < STEP_LABELS_EDIT.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 md:mx-2 rounded-full min-w-[10px] md:min-w-[20px] ${currentStep > stepNumber ? 'bg-primary' : 'bg-muted'}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
      <Card className="shadow-sm border-border/40 w-full">
        <CardContent className="p-0">{renderCurrentStepForm()}</CardContent>
      </Card>
    </div>
  )
}

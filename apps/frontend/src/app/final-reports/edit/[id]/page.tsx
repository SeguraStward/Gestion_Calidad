'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@una-gc/ui/components/card'

import { useFinalReport, useUpdateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import type {
  FullFinalReport,
  UpdateFinalReportDto,
  FinalReportEvaluationFE,
  ReportType // Changed from TipoInforme
} from '@/modules/final-reports/types/final-reports.types'

import { Step1Form, Step1FormData, step1Schema } from '@/modules/final-reports/components/form-step1'
import { Step2Form, Step2FormData, step2Schema } from '@/modules/final-reports/components/form-step2'
import { Step3Form, Step3FormData, step3Schema } from '@/modules/final-reports/components/form-step3'
import { Step4Form, Step4FormData, step4Schema } from '@/modules/final-reports/components/form-step4'
import { Step5EditForm, Step5FormData, step5Schema } from '@/modules/final-reports/components/form-step5-edit'
import { Step6EditForm, Step6FormData, step6Schema } from '@/modules/final-reports/components/form-step6-edit'
import { Step7EditForm, Step7FormData, step7Schema } from '@/modules/final-reports/components/form-step7-edit'
import { ReportPageHeader } from '@/modules/final-reports/components/report-page-header'

// Import translated mock data names
import {
  step5QuestionsMock, // Was preguntasPaso5Mock
  step6QuestionsPageMock, // Was preguntasPaso6PageMock
  step7QuestionsPageMock // Was preguntasPaso7PageMock
} from '@/modules/final-reports/mocks/questions'

const TOTAL_STEPS = 7
// User-facing labels remain in Spanish
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
    enrolledCapacity: report.academicLoad.enrolledCapacity
  }
}

function transformReportToStep2Data(report: FullFinalReport, enrolledFromStep1?: number | null): Step2FormData | null {
  const stats = report?.statistics
  return {
    totalEnrolled: enrolledFromStep1 ?? undefined,
    totalWithdrawn: stats?.dropouts ?? 0,
    totalPassed: stats?.passed ?? 0,
    totalFailed: stats?.failed ?? 0
  }
}

function transformReportToStep3Data(report: FullFinalReport): Step3FormData | null {
  const safeguards = report.studentInformation?.safeguards
  return {
    // User-facing form data keys remain in Spanish if Step3Form expects them
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
  if (!report?.studentInformation?.adjustments) return { ajustesEstudiantes: [] }
  return {
    // User-facing form data keys remain in Spanish if Step4Form expects them
    ajustesEstudiantes: report.studentInformation.adjustments.map((a) => ({
      id: a.idNumber, // Assuming Step4Form uses 'id' internally for rows
      cedula: a.idNumber,
      nombre: a.name,
      apoyo: a.support,
      nota: parseFloat(a.grade) || 0,
      observacion: a.observation || ''
    }))
  }
}

function transformReportToStep5Data(report: FullFinalReport): Step5FormData | null {
  // Use translated mock name and property 'questionId'
  if (!report?.evaluation) return { respuestas: step5QuestionsMock.map((p) => ({ idPregunta: p.questionId, respuesta: '' })) }
  const step5Responses = step5QuestionsMock.map((p) => {
    const existingResponse = report.evaluation.find((e) => e.questionId === p.questionId)
    // Form data keys remain as expected by Step5EditForm
    return { idPregunta: p.questionId, respuesta: existingResponse?.response || '' }
  })
  return { respuestas: step5Responses }
}

function transformReportToStep6Data(report: FullFinalReport): Step6FormData | null {
  const defaultData = {
    // Form data keys remain as expected by Step6EditForm
    respuestasMultiples: [{ idPregunta: 'herramientas_tec', respuestasSeleccionadas: [] }],
    otrasHerramientas: ''
  }
  if (!report?.evaluation) return defaultData

  // Assuming 'herramientas_tec' is the questionId for the main tool selection in your evaluation data
  const toolsQuestion = report.evaluation.find((e) => e.questionId === 'herramientas_tec')
  const otherToolsResponse = report.evaluation.find((e) => e.questionId === 'otras_herramientas_utilizadas')?.response || ''

  return {
    respuestasMultiples: [
      {
        idPregunta: 'herramientas_tec',
        respuestasSeleccionadas: toolsQuestion?.multipleResponse || []
      }
    ],
    otrasHerramientas: otherToolsResponse
  }
}

function transformReportToStep7Data(report: FullFinalReport, currentReportType: ReportType): Step7FormData | null {
  // Use translated mock name and property 'appliesTo' and 'questionId'
  const filteredQuestions = step7QuestionsPageMock.filter((q) => {
    if (Array.isArray(q.appliesTo)) {
      // Changed from aplicaPara
      return q.appliesTo.includes(currentReportType) || q.appliesTo.includes('TODOS')
    }
    return false
  })

  const step7Responses = filteredQuestions.map((p) => {
    const existingResponse = report.evaluation?.find((e) => e.questionId === p.questionId) // Changed from idPregunta
    // Form data keys remain as expected by Step7EditForm
    return {
      idPregunta: p.questionId, // Changed from idPregunta
      respuesta: existingResponse?.response || ''
    }
  })
  return { respuestasRadio: step7Responses }
}

export default function EditFinalReportPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string
  const initialLoadCompletedRef = useRef(false)

  const [currentStep, setCurrentStep] = useState(1)
  const [reportType, setReportType] = useState<ReportType>('INFORME_FINAL_V1') // Was tipoInforme

  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null)
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null)
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null)
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null)
  const [step6Data, setStep6Data] = useState<Step6FormData | null>(null)
  const [step7Data, setStep7Data] = useState<Step7FormData | null>(null)

  const formStep1Methods = useForm<Step1FormData>({ resolver: zodResolver(step1Schema) })
  const formStep2Methods = useForm<Step2FormData>({ resolver: zodResolver(step2Schema) })
  const formStep3Methods = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: { salvaguardaEstudiantes: [] }
  })
  const formStep4Methods = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: { ajustesEstudiantes: [] }
  })
  const formStep5Methods = useForm<Step5FormData>({ resolver: zodResolver(step5Schema) })
  const formStep6Methods = useForm<Step6FormData>({ resolver: zodResolver(step6Schema) })
  const formStep7Methods = useForm<Step7FormData>({ resolver: step7Schema ? zodResolver(step7Schema) : undefined })

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
      let currentReportVersionType: ReportType = 'INFORME_FINAL_V1' // Was reportVersionType
      if (fetchedReport.version === 1) currentReportVersionType = 'INFORME_FINAL_V1'
      else if (fetchedReport.version === 2) currentReportVersionType = 'INFORME_FINAL_V2'
      setReportType(currentReportVersionType) // Was setTipoInforme

      const s1Data = transformReportToStep1Data(fetchedReport)
      setStep1Data(s1Data)
      setStep2Data(transformReportToStep2Data(fetchedReport, s1Data?.enrolledCapacity))
      setStep3Data(transformReportToStep3Data(fetchedReport))
      setStep4Data(transformReportToStep4Data(fetchedReport))
      setStep5Data(transformReportToStep5Data(fetchedReport))
      setStep6Data(transformReportToStep6Data(fetchedReport))
      setStep7Data(transformReportToStep7Data(fetchedReport, currentReportVersionType)) // Pass reportType here

      initialLoadCompletedRef.current = true
    }
  }, [fetchedReport])

  useEffect(() => {
    if (step1Data) formStep1Methods.reset(step1Data)
  }, [step1Data, formStep1Methods])
  useEffect(() => {
    if (step2Data) formStep2Methods.reset(step2Data)
  }, [step2Data, formStep2Methods])
  useEffect(() => {
    if (step3Data) formStep3Methods.reset(step3Data)
  }, [step3Data, formStep3Methods])
  useEffect(() => {
    if (step4Data) formStep4Methods.reset(step4Data)
  }, [step4Data, formStep4Methods])
  useEffect(() => {
    if (step5Data) formStep5Methods.reset(step5Data)
  }, [step5Data, formStep5Methods])
  useEffect(() => {
    if (step6Data) formStep6Methods.reset(step6Data)
  }, [step6Data, formStep6Methods])
  useEffect(() => {
    if (step7Data) formStep7Methods.reset(step7Data)
  }, [step7Data, formStep7Methods])

  const handleUpdateStepData = (step: number, data: any) => {
    switch (step) {
      case 1:
        const newStep1Data = data as Step1FormData
        setStep1Data(newStep1Data)
        setStep2Data((prev) => ({
          ...(prev || { totalWithdrawn: 0, totalPassed: 0, totalFailed: 0 }),
          totalEnrolled: newStep1Data.enrolledCapacity ?? undefined
        }))
        break
      case 2:
        setStep2Data(data as Step2FormData)
        break
      case 3:
        setStep3Data(data as Step3FormData)
        break
      case 4:
        setStep4Data(data as Step4FormData)
        break
      case 5:
        setStep5Data(data as Step5FormData)
        break
      case 6:
        setStep6Data(data as Step6FormData)
        break
      case 7:
        setStep7Data(data as Step7FormData)
        handleSubmitAllSteps()
        return
    }
    if (step < TOTAL_STEPS) setCurrentStep(step + 1)
  }

  const handlePreviousStep = () => setCurrentStep((prev) => Math.max(1, prev - 1))

  const handleSubmitAllSteps = async () => {
    if (!fetchedReport || !step1Data || !step2Data || !step3Data || !step4Data || !step5Data || !step6Data || !step7Data) {
      toast.error('Faltan datos de algunos pasos. Por favor complete el formulario.')
      return
    }
    try {
      const evaluationData: FinalReportEvaluationFE[] = [
        // Use translated mock name and property 'questionId', 'question'
        ...step5Data.respuestas.map((resp) => {
          const questionDetails = step5QuestionsMock.find((q) => q.questionId === resp.idPregunta)
          return {
            questionId: resp.idPregunta,
            response: resp.respuesta,
            responseType: 'TEXT' as const,
            questionGroup: 'evaluacion_general_curso', // Default group for step 5
            options: [],
            question: questionDetails?.question || resp.idPregunta // Use translated 'question'
          }
        }),
        {
          questionId: 'herramientas_tec', // Assuming this ID is consistent
          multipleResponse: step6Data?.respuestasMultiples?.[0]?.respuestasSeleccionadas || [],
          responseType: 'SELECCION_MULTIPLE' as const,
          questionGroup: 'herramientas',
          // Use translated mock name and property 'questionId', 'options', 'question'
          options:
            step6QuestionsPageMock
              .find((p) => p.questionId === 'herramientas_tec' || p.questionId === 'herramientas_utilizadas') // Match against possible IDs
              ?.options?.map((opt) => ({ value: opt.value, label: opt.label, category: opt.category })) || [],
          question:
            step6QuestionsPageMock.find((p) => p.questionId === 'herramientas_tec' || p.questionId === 'herramientas_utilizadas')
              ?.question || 'Herramientas tecnológicas'
        },
        ...(step6Data?.otrasHerramientas
          ? ([
              {
                questionId: 'otras_herramientas_utilizadas',
                response: step6Data.otrasHerramientas,
                responseType: 'TEXT' as const,
                questionGroup: 'herramientas',
                options: [],
                question:
                  step6QuestionsPageMock.find((q) => q.questionId === 'otras_herramientas')?.question ||
                  'Otras herramientas utilizadas'
              }
            ] as FinalReportEvaluationFE[])
          : []),
        // Use translated mock name and property 'questionId', 'group', 'options', 'question'
        ...step7Data.respuestasRadio.map((resp) => {
          const questionDetails = step7QuestionsPageMock.find((q) => q.questionId === resp.idPregunta)
          return {
            questionId: resp.idPregunta,
            response: resp.respuesta,
            responseType: 'SELECCION_UNICA' as const,
            questionGroup: questionDetails?.group || 'percepcion', // Use translated 'group'
            options:
              questionDetails?.options?.map((opt) => ({
                value: opt.value,
                label: opt.label,
                category: questionDetails?.group || 'percepcion'
              })) || [],
            question: questionDetails?.question || resp.idPregunta // Use translated 'question'
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
          adjustments: step4Data.ajustesEstudiantes.map((formAdjustment) => ({
            idNumber: formAdjustment.cedula,
            name: formAdjustment.nombre,
            support: formAdjustment.apoyo,
            grade: String(formAdjustment.nota),
            observation: formAdjustment.observacion || ''
          })),
          safeguards: step3Data.salvaguardaEstudiantes.map((formSafeguard) => ({
            idNumber: formSafeguard.cedula,
            name: formSafeguard.nombre,
            grade: String(formSafeguard.nota),
            observation: formSafeguard.observacion || ''
          }))
        },
        evaluation: evaluationData,
        version: reportType === 'INFORME_FINAL_V1' ? 1 : 2 // Use translated reportType
      }
      await updateReportMutation.mutateAsync({ id: reportId, data: updatePayload })
      router.push('/final-reports')
    } catch (error: any) {
      console.error('Error updating report:', error)
      toast.error(`Error al actualizar: ${error.message || 'Error desconocido'}`)
    }
  }

  const renderCurrentStepForm = () => {
    if (isLoadingReport) {
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Cargando datos del informe...</p>
        </div>
      )
    }
    if (reportError)
      return (
        <Card className="p-6 text-center">
          <p className="text-destructive">Error: {reportError.message}</p>
        </Card>
      )
    if (!fetchedReport && !isLoadingReport)
      return (
        <Card className="p-6 text-center">
          <p>No se encontró el informe.</p>
        </Card>
      )

    switch (currentStep) {
      case 1:
        return (
          <Step1Form
            formMethods={formStep1Methods}
            onSaveAndNext={(data) => handleUpdateStepData(1, data)}
            isEditing={true}
            totalSteps={TOTAL_STEPS}
            initialData={step1Data}
            onCancel={() => router.push('/final-reports')}
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
            reportType={reportType} // Changed from tipoInforme to reportType
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
            reportType={reportType} // Changed from tipoInforme to reportType (assuming Step7EditForm also uses reportType)
          />
        )
      default:
        return <div>Paso desconocido</div> // User-facing
    }
  }

  return (
    <div className="container mx-auto flex flex-col h-screen max-h-screen overflow-hidden">
      <ReportPageHeader
        pageTitle="Editar Informe Final del Curso" // User-facing
        stepLabels={STEP_LABELS_EDIT} // User-facing
        currentStep={currentStep}
        backButton={{ href: '/final-reports', text: 'Volver a la Lista de Informes' }} // User-facing
        isLoading={isLoadingReport}
        nrc={step1Data?.nrc}
      />
      <main className="flex-grow flex flex-col items-center overflow-hidden pt-2 pb-6 md:pt-4">
        <Card className="shadow-lg border-border/50 w-full max-w-5xl flex flex-col flex-grow overflow-hidden rounded-lg">
          <CardContent className="flex-grow overflow-y-auto p-0">{renderCurrentStepForm()}</CardContent>
        </Card>
      </main>
    </div>
  )
}

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react' // CheckCircle, ArrowLeft are in ReportPageHeader
import { Card, CardContent } from '@una-gc/ui/components/card'
// Button is now part of ReportPageHeader or step forms

// Import service and hooks
import { useFinalReport, useUpdateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import type {
  FullFinalReport,
  UpdateFinalReportDto,
  FinalReportEvaluationFE,
  TipoInforme // Make sure TipoInforme is imported
} from '@/modules/final-reports/types/final-reports.types'

// Import Step components and their data types/schemas
import { Step1Form, Step1FormData, step1Schema } from '@/modules/final-reports/components/form-step1'
import { Step2Form, Step2FormData, step2Schema } from '@/modules/final-reports/components/form-step2'
import { Step3Form, Step3FormData, step3Schema } from '@/modules/final-reports/components/form-step3'
import { Step4Form, Step4FormData, step4Schema } from '@/modules/final-reports/components/form-step4'
import { Step5EditForm, Step5FormData, step5Schema } from '@/modules/final-reports/components/form-step5-edit'
import { Step6EditForm, Step6FormData, step6Schema } from '@/modules/final-reports/components/form-step6-edit'
import { Step7EditForm, Step7FormData, step7Schema } from '@/modules/final-reports/components/form-step7-edit'
import { ReportPageHeader } from '@/modules/final-reports/components/report-page-header' // Import the new header

// Import mock data for form questions (ensure paths are correct if mocks are used by transform functions)
import {
  preguntasPaso5Mock,
  preguntasPaso6PageMock, // Check if this is 'herramientas_utilizadas' or 'herramientas_tec'
  preguntasPaso7PageMock
  // TipoInforme is already imported from types
} from '@/modules/final-reports/mocks/questions'

const TOTAL_STEPS = 7
const STEP_LABELS_EDIT = ['Información', 'Estadísticas', 'Salvaguarda', 'Ajustes', 'Evaluación', 'Herramientas', 'Calidad']

// Data transformation functions (ensure they use correct mock IDs if applicable)
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
    ajustesEstudiantes: report.studentInformation.adjustments.map((a) => ({
      id: a.idNumber,
      cedula: a.idNumber,
      nombre: a.name,
      apoyo: a.support,
      nota: parseFloat(a.grade) || 0,
      observacion: a.observacion || ''
    }))
  }
}

function transformReportToStep5Data(report: FullFinalReport): Step5FormData | null {
  if (!report?.evaluation) return { respuestas: preguntasPaso5Mock.map((p) => ({ idPregunta: p.idPregunta, respuesta: '' })) }
  const step5Respuestas = preguntasPaso5Mock.map((p) => {
    const existingResponse = report.evaluation.find((e) => e.questionId === p.idPregunta)
    return { idPregunta: p.idPregunta, respuesta: existingResponse?.response || '' }
  })
  return { respuestas: step5Respuestas }
}

function transformReportToStep6Data(report: FullFinalReport): Step6FormData | null {
  // Assuming 'herramientas_tec' is the ID used in Step6EditForm and its mock/schema
  const defaultData = {
    respuestasMultiples: [{ idPregunta: 'herramientas_tec', respuestasSeleccionadas: [] }],
    otrasHerramientas: ''
  }
  if (!report?.evaluation) return defaultData

  const toolsQuestion = report.evaluation.find((e) => e.questionId === 'herramientas_tec') // Use 'herramientas_tec'
  const otrasHerramientasResponse =
    report.evaluation.find((e) => e.questionId === 'otras_herramientas_utilizadas')?.response || '' // or a specific ID for "other tools"

  return {
    respuestasMultiples: [
      {
        idPregunta: 'herramientas_tec', // Use 'herramientas_tec'
        respuestasSeleccionadas: toolsQuestion?.multipleResponse || []
      }
    ],
    otrasHerramientas: otrasHerramientasResponse
  }
}

function transformReportToStep7Data(report: FullFinalReport, tipoInformeActual: TipoInforme): Step7FormData | null {
  const filteredQuestions = preguntasPaso7PageMock.filter((q) => {
    if (Array.isArray(q.aplicaPara)) {
      return q.aplicaPara.includes(tipoInformeActual) || q.aplicaPara.includes('TODOS')
    }
    return false
  })

  const step7Respuestas = filteredQuestions.map((p) => {
    const existingResponse = report.evaluation?.find((e) => e.questionId === p.idPregunta)
    return {
      idPregunta: p.idPregunta,
      respuesta: existingResponse?.response || ''
    }
  })
  return { respuestasRadio: step7Respuestas }
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
  const formStep5Methods = useForm<Step5FormData>({ resolver: zodResolver(step5Schema) }) // Default values handled by useEffect/initialData
  const formStep6Methods = useForm<Step6FormData>({ resolver: zodResolver(step6Schema) }) // Default values handled by useEffect/initialData
  const formStep7Methods = useForm<Step7FormData>({ resolver: step7Schema ? zodResolver(step7Schema) : undefined }) // Default values handled by useEffect/initialData

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
      let reportVersionType: TipoInforme = 'INFORME_FINAL_V1'
      if (fetchedReport.version === 1) reportVersionType = 'INFORME_FINAL_V1'
      else if (fetchedReport.version === 2) reportVersionType = 'INFORME_FINAL_V2'
      setTipoInforme(reportVersionType)

      const s1Data = transformReportToStep1Data(fetchedReport)
      setStep1Data(s1Data)
      setStep2Data(transformReportToStep2Data(fetchedReport, s1Data?.enrolledCapacity))
      setStep3Data(transformReportToStep3Data(fetchedReport))
      setStep4Data(transformReportToStep4Data(fetchedReport))
      setStep5Data(transformReportToStep5Data(fetchedReport))
      setStep6Data(transformReportToStep6Data(fetchedReport))
      setStep7Data(transformReportToStep7Data(fetchedReport, reportVersionType)) // Pass tipoInforme here

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
        handleSubmitAllSteps() // Call submit on final step
        return // Return early as handleSubmitAllSteps might navigate
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
        ...step5Data.respuestas.map((resp) => {
          const pO = preguntasPaso5Mock.find((q) => q.idPregunta === resp.idPregunta)
          return {
            questionId: resp.idPregunta,
            response: resp.respuesta,
            responseType: 'TEXT',
            questionGroup: pO?.grupo_pregunta || 'logros_dificultades',
            options: [],
            question: pO?.pregunta || resp.idPregunta
          }
        }),
        {
          questionId: 'herramientas_tec', // Match ID used in Step6EditForm
          multipleResponse: step6Data?.respuestasMultiples?.[0]?.respuestasSeleccionadas || [],
          responseType: 'SELECCION_MULTIPLE',
          questionGroup: 'herramientas',
          options:
            preguntasPaso6PageMock
              .find((p) => p.idPregunta === 'herramientas_tec')
              ?.opciones?.map((opt) => ({ value: opt.value, label: opt.label, category: opt.category })) || [],
          question:
            preguntasPaso6PageMock.find((p) => p.idPregunta === 'herramientas_tec')?.pregunta || 'Herramientas tecnológicas'
        },
        ...(step6Data?.otrasHerramientas
          ? [
              {
                questionId: 'otras_herramientas_utilizadas',
                response: step6Data.otrasHerramientas,
                responseType: 'TEXT',
                questionGroup: 'herramientas',
                options: [],
                question: 'Otras herramientas utilizadas'
              }
            ]
          : []),
        ...step7Data.respuestasRadio.map((resp) => {
          const pO = preguntasPaso7PageMock.find((q) => q.idPregunta === resp.idPregunta)
          return {
            questionId: resp.idPregunta,
            response: resp.respuesta,
            responseType: 'SELECCION_UNICA',
            questionGroup: pO?.grupo || 'percepcion',
            options:
              pO?.opciones?.map((opt) => ({ value: opt.value, label: opt.label, category: pO?.grupo || 'percepcion' })) || [],
            question: pO?.pregunta || resp.idPregunta
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
            idNumber: s.cedula,
            name: s.nombre,
            grade: String(s.nota),
            observation: s.observacion || ''
          }))
        },
        evaluation: evaluationData,
        version: tipoInforme === 'INFORME_FINAL_V1' ? 1 : 2
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
    <div className="container mx-auto flex flex-col h-screen max-h-screen overflow-hidden">
      {' '}
      {/* Full screen, no body scroll */}
      <ReportPageHeader
        pageTitle="Editar Informe Final del Curso"
        stepLabels={STEP_LABELS_EDIT}
        currentStep={currentStep}
        backButton={{ href: '/final-reports', text: 'Volver a la Lista de Informes' }}
        isLoading={isLoadingReport}
        nrc={step1Data?.nrc}
      />
      <main className="flex-grow flex flex-col items-center overflow-hidden pt-2 pb-6 md:pt-4">
        <Card className="shadow-lg border-border/50 w-full max-w-5xl flex flex-col flex-grow overflow-hidden rounded-lg">
          <CardContent className="flex-grow overflow-y-auto p-0">
            {' '}
            {/* Scrollable area, no padding here */}
            {renderCurrentStepForm()}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

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

const MAIN_TOOLS_QUESTION_ID = 'herramientas_utilizadas' // ID Canónico para la pregunta de herramientas
const OTHER_TOOLS_QUESTION_ID = 'otras_herramientas_utilizadas' // ID para el campo de texto de otras herramientas

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
    respuestasMultiples: [{ idPregunta: MAIN_TOOLS_QUESTION_ID, respuestasSeleccionadas: [] }],
    otrasHerramientas: ''
  }
  if (!report?.evaluation) return defaultData

  const toolsQuestionEvaluation = report.evaluation.find((e) => e.questionId === MAIN_TOOLS_QUESTION_ID) // Usar constante
  const otherToolsResponse = report.evaluation.find((e) => e.questionId === OTHER_TOOLS_QUESTION_ID)?.response || '' // Usar constante

  return {
    respuestasMultiples: [
      {
        idPregunta: MAIN_TOOLS_QUESTION_ID, // Usar constante
        respuestasSeleccionadas: toolsQuestionEvaluation?.multipleResponse || []
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
  const [reportType, setReportType] = useState<ReportType>('INFORME_FINAL_V1')

  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null)
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null)
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null)
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null)
  const [step6Data, setStep6Data] = useState<Step6FormData | null>(null)
  // step7Data sigue siendo útil para inicializar el formulario y si el usuario navega hacia atrás/adelante
  const [step7Data, setStep7Data] = useState<Step7FormData | null>(null)

  const { data: fetchedReport, isLoading: isLoadingReport } = useGetFinalReportById(reportId, {
    enabled: !!reportId && !initialLoadCompletedRef.current
  })

  const { mutateAsync: updateReportMutation } = useUpdateFinalReport(reportId)

  // Definiciones de useForm para cada paso (incluyendo el resolver)
  const formStep1Methods = useForm<Step1FormData>({ resolver: zodResolver(step1Schema) })
  const formStep2Methods = useForm<Step2FormData>({ resolver: zodResolver(step2Schema) })
  const formStep3Methods = useForm<Step3FormData>({ resolver: zodResolver(step3Schema) })
  const formStep4Methods = useForm<Step4FormData>({ resolver: zodResolver(step4Schema) })
  const formStep5Methods = useForm<Step5FormData>({ resolver: zodResolver(step5Schema) })
  const formStep6Methods = useForm<Step6FormData>({ resolver: zodResolver(step6Schema) })
  const formStep7Methods = useForm<Step7FormData>({ resolver: step7Schema ? zodResolver(step7Schema) : undefined }) // Asegúrate que step7Schema esté definido

  // useEffect para cargar datos iniciales y resetear formularios (importante que esté bien)
  useEffect(() => {
    if (fetchedReport && !initialLoadCompletedRef.current && reportType) {
      console.log('[EditFinalReportPage] Fetched report, processing initial data...', fetchedReport)
      const initialStep1 = transformReportToStep1Data(fetchedReport)
      if (initialStep1) {
        setStep1Data(initialStep1)
        formStep1Methods.reset(initialStep1)
      }

      const initialStep2 = transformReportToStep2Data(fetchedReport)
      if (initialStep2) {
        setStep2Data(initialStep2)
        formStep2Methods.reset(initialStep2)
      }

      const initialStep3 = transformReportToStep3Data(fetchedReport, reportType)
      if (initialStep3) {
        setStep3Data(initialStep3)
        formStep3Methods.reset(initialStep3)
      }

      const initialStep4 = transformReportToStep4Data(fetchedReport, reportType)
      if (initialStep4) {
        setStep4Data(initialStep4)
        formStep4Methods.reset(initialStep4)
      }

      const initialStep5 = transformReportToStep5Data(fetchedReport)
      if (initialStep5) {
        setStep5Data(initialStep5)
        formStep5Methods.reset(initialStep5)
      }

      const initialStep6 = transformReportToStep6Data(fetchedReport)
      if (initialStep6) {
        setStep6Data(initialStep6)
        formStep6Methods.reset(initialStep6)
      }

      const initialStep7 = transformReportToStep7Data(fetchedReport, reportType)
      if (initialStep7) {
        setStep7Data(initialStep7)
        formStep7Methods.reset(initialStep7)
        console.log('[EditFinalReportPage] Initial Step 7 Data set and form reset:', initialStep7)
      }
      initialLoadCompletedRef.current = true
    }
  }, [
    fetchedReport,
    reportType,
    formStep1Methods,
    formStep2Methods,
    formStep3Methods,
    formStep4Methods,
    formStep5Methods,
    formStep6Methods,
    formStep7Methods
  ])

  // useEffects para resetear formularios individuales si su estado cambia (ej. por navegación)
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
    if (step7Data) {
      console.log('[EditFinalReportPage] step7Data changed, resetting formStep7Methods with:', step7Data)
      formStep7Methods.reset(step7Data)
    }
  }, [step7Data, formStep7Methods])

  // MODIFICADO: handleUpdateStepData solo actualiza el estado y avanza. NO guarda todo.
  const handleUpdateStepData = (step: number, data: any) => {
    console.log(`[handleUpdateStepData] Step: ${step}, Data:`, data)
    switch (step) {
      case 1:
        setStep1Data(data)
        break
      case 2:
        setStep2Data(data)
        break
      case 3:
        setStep3Data(data)
        break
      case 4:
        setStep4Data(data)
        break
      case 5:
        setStep5Data(data)
        break
      case 6:
        setStep6Data(data)
        break
      case 7:
        // Para el paso 7, solo actualizamos el estado. El guardado se hace por onFinalSubmit.
        setStep7Data(data as Step7FormData)
        console.log('[handleUpdateStepData - Case 7] Step 7 data updated in state:', data)
        // NO llamamos a handleSubmitAllSteps aquí.
        // El botón "Guardar y Finalizar" del Paso 7 lo hará.
        return // No avanzar automáticamente desde el paso 7 con este manejador.
    }
    if (step < TOTAL_STEPS) {
      setCurrentStep(step + 1)
    }
  }

  const handlePreviousStep = () => {
    // Opcional: Guardar datos del paso actual antes de retroceder
    // if (currentStep === 7) {
    //   const currentStep7FormData = formStep7Methods.getValues();
    //   setStep7Data(currentStep7FormData);
    // }
    // ... (lógica similar para otros pasos si se desea guardar al retroceder)
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  // handleSubmitAllSteps se llama SOLO al final (desde el Paso 7)
  const handleSubmitAllSteps = async () => {
    console.log('[handleSubmitAllSteps] INVOCADA.')

    const currentStep7ValuesFromForm = formStep7Methods.getValues()
    console.log(
      '[handleSubmitAllSteps] Valores actuales del form Paso 7 (getValues):',
      JSON.stringify(currentStep7ValuesFromForm, null, 2)
    )

    try {
      if (step7Schema) {
        step7Schema.parse(currentStep7ValuesFromForm) // Validar datos del Paso 7
      }
      console.log('[handleSubmitAllSteps] Validación de datos del Paso 7 (getValues) exitosa.')
    } catch (validationError) {
      console.error('[handleSubmitAllSteps] Error de validación en datos del Paso 7 (getValues):', validationError)
      toast.error('Hay errores de validación en el Paso 7. Por favor, revise las respuestas.')
      return
    }

    if (
      !fetchedReport ||
      !step1Data ||
      !step2Data ||
      !step3Data ||
      !step4Data ||
      !step5Data ||
      !step6Data ||
      !currentStep7ValuesFromForm
    ) {
      toast.error('Faltan datos de algunos pasos. Por favor complete el formulario.')
      console.error('Datos faltantes para handleSubmitAllSteps:', {
        /* ... */
      })
      return
    }

    try {
      const evaluationData: FinalReportEvaluationFE[] = [
        ...(step5Data?.respuestas.map((resp) => ({
          questionId: resp.idPregunta,
          response: resp.respuesta,
          responseType: 'TEXTO_LIBRE',
          questionGroup: step5QuestionsMock.find((q) => q.questionId === resp.idPregunta)?.group || 'evaluacion_general_curso',
          question: step5QuestionsMock.find((q) => q.questionId === resp.idPregunta)?.question || resp.idPregunta,
          options: [],
          multipleResponse: []
        })) || []),
        ...(step6Data?.respuestasMultiples.flatMap((rm) =>
          rm.respuestasSeleccionadas.map((sel) => ({
            questionId: rm.idPregunta,
            response: sel, // Cada selección es una "respuesta" individual en el modelo de backend
            responseType: 'SELECCION_MULTIPLE',
            questionGroup: step6QuestionsPageMock.find((q) => q.questionId === rm.idPregunta)?.group || 'herramientas',
            question: step6QuestionsPageMock.find((q) => q.questionId === rm.idPregunta)?.question || rm.idPregunta,
            options: step6QuestionsPageMock.find((q) => q.questionId === rm.idPregunta)?.options || [],
            multipleResponse: rm.respuestasSeleccionadas // Opcional, si el backend lo usa
          }))
        ) || []),
        ...(step6Data?.otrasHerramientas && step6Data.otrasHerramientas.trim() !== ''
          ? [
              {
                questionId: 'otras_herramientas_descritas', // ID específico para el texto libre de otras herramientas
                response: step6Data.otrasHerramientas,
                responseType: 'TEXTO_LIBRE',
                questionGroup: 'herramientas',
                question: 'Descripción de otras herramientas utilizadas',
                options: [],
                multipleResponse: []
              }
            ]
          : []),
        ...currentStep7ValuesFromForm.respuestasRadio.map((resp) => {
          const questionDetails = step7QuestionsPageMock.find((q) => q.questionId === resp.idPregunta)
          let responseToSend: string | undefined = undefined
          if (questionDetails) {
            if (resp.respuesta && resp.respuesta.trim() !== '') {
              const selectedOption = questionDetails.options.find((opt) => opt.value === resp.respuesta)
              if (selectedOption) {
                responseToSend = selectedOption.label
              } else {
                console.error(`[Step 7] Opción no encontrada para qId: "${resp.idPregunta}", respVal: "${resp.respuesta}"`)
              }
            }
          } else {
            console.error(`[Step 7] Detalles no encontrados para qId: "${resp.idPregunta}"`)
          }
          console.log(`[Step 7 Map] qId: ${resp.idPregunta}, respForm: ${resp.respuesta}, respToSend: ${responseToSend}`)
          return {
            questionId: resp.idPregunta,
            response: responseToSend,
            responseType: 'SELECCION_UNICA',
            questionGroup: questionDetails?.group || 'percepcion_general',
            options:
              questionDetails?.options?.map((opt) => ({
                value: opt.value,
                label: opt.label,
                category: questionDetails?.group
              })) || [],
            question: questionDetails?.question || resp.idPregunta,
            multipleResponse: []
          }
        })
      ].map((item) => ({
        ...item,
        response: item.response, // Asegurar que response esté definido
        multipleResponse: item.multipleResponse || [],
        options: item.options || [],
        questionGroup: item.questionGroup || 'general' // Default group
      })) as FinalReportEvaluationFE[]

      const updatePayload: UpdateFinalReportDto = {
        statistics: {
          totalStudents: step2Data.totalEnrolled ?? 0,
          passed: step2Data.totalPassed ?? 0,
          failed: step2Data.totalFailed ?? 0,
          dropouts: step2Data.totalWithdrawn ?? 0
        },
        studentInformation: {
          adjustments: step4Data.ajustesEstudiantes.map((adj) => ({ ...adj, grade: String(adj.nota) })),
          safeguards: step3Data.salvaguardaEstudiantes.map((sg) => ({ ...sg, grade: String(sg.nota) }))
        },
        evaluation: evaluationData,
        version: reportType === 'INFORME_FINAL_V1' ? 1 : 2
      }

      console.log('[handleSubmitAllSteps] Payload FINAL para UpdateFinalReportDto:', JSON.stringify(updatePayload, null, 2))
      await updateReportMutation.mutateAsync({ id: reportId, data: updatePayload })
      router.push('/final-reports')
    } catch (error: any) {
      console.error('Error en handleSubmitAllSteps:', error)
      toast.error(`Error al actualizar el informe: ${error.message || 'Error desconocido'}`)
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
            // onSaveAndNext ya no es necesario si el único submit es el final.
            // Podrías quitarlo o dejarlo para actualizar el estado local si el usuario navega hacia atrás.
            onSaveAndNext={(dataFromStep7Form) => {
              console.log('[EditFinalReportPage - Step7 onSaveAndNext (local state update only)] Data:', dataFromStep7Form)
              setStep7Data(dataFromStep7Form)
              // NO AVANZA NI GUARDA TODO AQUÍ
            }}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
            initialData={step7Data}
            isEditing={true}
            reportType={reportType}
            onFinalSubmit={handleSubmitAllSteps} // Prop para el guardado final
          />
        )
      default:
        return <div>Paso desconocido</div>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-10 lg:py-12 max-w-5xl">
      {/* ... (Header de la página) ... */}
      <div className="bg-card shadow-xl rounded-lg">
        {/* ... (Stepper) ... */}
        <div className="p-6 md:p-8 min-h-[500px] flex flex-col">{renderCurrentStepForm()}</div>
      </div>
    </div>
  )
}

'use client'

import { useRouter, useParams } from 'next/navigation'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@una-gc/ui/components/button'
import { Card } from '@una-gc/ui/components/card' // Added Card import
import { Loader2, FileText, AlertTriangle, CheckCircle, Save } from 'lucide-react'

// Schemas, Types, and Components for each step
import { Step1FormData, step1Schema, Step1Form, transformReportToStep1Data } from '@/modules/final-reports/components/form-step1'
import { Step2FormData, step2Schema, Step2Form, transformReportToStep2Data } from '@/modules/final-reports/components/form-step2'
import { Step3FormData, step3Schema, Step3Form, transformReportToStep3Data } from '@/modules/final-reports/components/form-step3'
import { Step4FormData, step4Schema, Step4Form, transformReportToStep4Data } from '@/modules/final-reports/components/form-step4'
import {
  Step5FormData,
  step5Schema,
  Step5EditForm,
  transformReportToStep5Data
} from '@/modules/final-reports/components/form-step5-edit'
import {
  Step6FormData,
  step6Schema,
  Step6EditForm,
  transformReportToStep6Data,
  OTHER_TOOLS_QUESTION_ID
} from '@/modules/final-reports/components/form-step6-edit'
import { Step7FormData, step7Schema, Step7EditForm } from '@/modules/final-reports/components/form-step7-edit'

// Mocks and services
// MODIFIED IMPORTS FOR MOCKS:
import { step5QuestionsMock, step6QuestionsPageMock, step7QuestionsPageMock } from '@/modules/final-reports/mocks/questions'

// Service hooks
import { useFinalReport, useUpdateFinalReport } from '@/modules/final-reports/service/final-reports.service' // Corrected: useGetFinalReportById to useFinalReport
import {
  FullFinalReport,
  UpdateFinalReportDto,
  FinalReportEvaluationFE,
  ReportType
} from '@/modules/final-reports/types/final-reports.types' // Ensure ReportType is imported here if used by transform functions in this file

const TOTAL_STEPS = 7

const steps = [
  { id: 1, name: 'Información del Curso' },
  { id: 2, name: 'Estadísticas Estudiantiles' },
  { id: 3, name: 'Salvaguardas' },
  { id: 4, name: 'Ajustes Razonables' },
  { id: 5, name: 'Evaluación General' },
  { id: 6, name: 'Herramientas Tecnológicas' },
  { id: 7, name: 'Percepción y Desempeño' }
]

// Helper function to transform report data for Step 7 (ensure it's defined or imported)
// (La función transformReportToStep7Data que me mostraste antes iría aquí o importada)
// ... (tu función transformReportToStep7Data)
function transformReportToStep7Data(report: FullFinalReport, currentReportType: ReportType): Step7FormData | null {
  console.log(`[transformReportToStep7Data] Iniciando transformación para reportType: ${currentReportType}`)
  const filteredQuestions = step7QuestionsPageMock.filter((q) => {
    if (Array.isArray(q.appliesTo)) {
      return q.appliesTo.includes(currentReportType) || q.appliesTo.includes('TODOS')
    }
    return false
  })
  console.log(`[transformReportToStep7Data] ${filteredQuestions.length} preguntas filtradas para el tipo de informe.`)

  const step7Responses = filteredQuestions.map((p, index) => {
    const existingEvaluation = report.evaluation?.find((e) => e.questionId === p.questionId)
    let formResponseValue = ''

    console.log(
      `[transformReportToStep7Data] Procesando pregunta visible #${index + 1}: ID="${p.questionId}", Pregunta="${p.question}"`
    )

    if (existingEvaluation) {
      console.log(
        `[transformReportToStep7Data]   Encontrada evaluación existente para ID="${p.questionId}": Response Label="${existingEvaluation.response}"`
      )
      const questionDetails = step7QuestionsPageMock.find((mockQuestion) => mockQuestion.questionId === p.questionId)
      if (questionDetails && questionDetails.options) {
        const matchedOption = questionDetails.options.find((opt) => opt.label === existingEvaluation.response)
        if (matchedOption) {
          formResponseValue = matchedOption.value
          console.log(
            `[transformReportToStep7Data]     Coincidencia de opción encontrada: Label="${matchedOption.label}" -> Value="${formResponseValue}"`
          )
        } else {
          console.warn(
            `[transformReportToStep7Data]     ¡ADVERTENCIA! No se encontró opción coincidente para Label="${existingEvaluation.response}" en pregunta ID="${p.questionId}". Se usará valor vacío.`
          )
        }
      } else {
        console.warn(
          `[transformReportToStep7Data]     ¡ADVERTENCIA! No se encontraron detalles de pregunta o opciones en mock para ID="${p.questionId}".`
        )
      }
    } else {
      console.log(
        `[transformReportToStep7Data]   No se encontró evaluación existente para ID="${p.questionId}". Se usará valor vacío.`
      )
    }

    return {
      idPregunta: p.questionId,
      respuesta: formResponseValue
    }
  })
  console.log('[transformReportToStep7Data] Datos transformados finales para Step 7 form:', { respuestasRadio: step7Responses })
  return { respuestasRadio: step7Responses }
}

export default function EditFinalReportPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string
  const initialLoadCompletedRef = useRef(false)

  const [currentStep, setCurrentStep] = useState(1)
  const [reportType, setReportType] = useState<ReportType>('INFORME_FINAL_V1') // Default or load from report

  // State for each step's data
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null)
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null)
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null)
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null)
  const [step6Data, setStep6Data] = useState<Step6FormData | null>(null)
  const [step7Data, setStep7Data] = useState<Step7FormData | null>(null)

  const {
    data: fetchedReport,
    isLoading: isLoadingReport, // This isLoading is for useFinalReport (fetch)
    error: reportError
  } = useFinalReport(reportId, undefined, {
    enabled: !!reportId && !initialLoadCompletedRef.current,
    retry: 1
  })

  // MODIFIED: Call useUpdateFinalReport and derive loading state from status
  const updateMutation = useUpdateFinalReport()
  const { mutateAsync: updateReportMutation } = updateMutation // Destructure only mutateAsync
  const isUpdatingReport = updateMutation.status === 'pending' // Derive loading state from status, changed 'loading' to 'pending'

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

      const initialStep2 = transformReportToStep2Data(fetchedReport, initialStep1?.enrolledCapacity) // Pasar enrolledCapacity
      if (initialStep2) {
        setStep2Data(initialStep2)
        formStep2Methods.reset(initialStep2)
      }

      const initialStep3 = transformReportToStep3Data(fetchedReport) // No necesita reportType
      if (initialStep3) {
        setStep3Data(initialStep3)
        formStep3Methods.reset(initialStep3)
      }

      const initialStep4 = transformReportToStep4Data(fetchedReport) // No necesita reportType
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

      // ESTA LLAMADA AHORA DEBERÍA PROPORCIONAR VALORES NUMÉRICOS
      const initialStep7 = transformReportToStep7Data(fetchedReport, reportType)
      if (initialStep7) {
        setStep7Data(initialStep7)
        formStep7Methods.reset(initialStep7)
        console.log('[EditFinalReportPage] Initial Step 7 Data set and form reset (should have numeric values):', initialStep7)
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
      '[handleSubmitAllSteps] Valores actuales del form Paso 7 (getValues) - ESTOS DEBEN SER VALORES NUMÉRICOS:',
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
      !currentStep7ValuesFromForm ||
      currentStep7ValuesFromForm.respuestasRadio.some((r) => !r.idPregunta) // Chequeo adicional
    ) {
      toast.error('Faltan datos de algunos pasos o hay IDs de pregunta faltantes en el paso 7. Por favor complete el formulario.')
      console.error('Datos faltantes para handleSubmitAllSteps:', {
        fetchedReport: !!fetchedReport,
        step1Data: !!step1Data,
        step2Data: !!step2Data,
        step3Data: !!step3Data,
        step4Data: !!step4Data,
        step5Data: !!step5Data,
        step6Data: !!step6Data,
        currentStep7ValuesFromForm
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
            response: sel,
            responseType: 'SELECCION_MULTIPLE',
            questionGroup: step6QuestionsPageMock.find((q) => q.questionId === rm.idPregunta)?.group || 'herramientas',
            question: step6QuestionsPageMock.find((q) => q.questionId === rm.idPregunta)?.question || rm.idPregunta,
            options: step6QuestionsPageMock.find((q) => q.questionId === rm.idPregunta)?.options || [],
            multipleResponse: rm.respuestasSeleccionadas
          }))
        ) || []),
        ...(step6Data?.otrasHerramientas && step6Data.otrasHerramientas.trim() !== ''
          ? [
              {
                questionId: OTHER_TOOLS_QUESTION_ID,
                response: step6Data.otrasHerramientas,
                responseType: 'TEXTO_LIBRE',
                questionGroup: 'herramientas',
                question:
                  step6QuestionsPageMock.find((q) => q.questionId === OTHER_TOOLS_QUESTION_ID)?.question ||
                  'Descripción de otras herramientas utilizadas',
                options: [],
                multipleResponse: []
              }
            ]
          : []),

        // PASO 7: currentStep7ValuesFromForm.respuestasRadio.respuesta YA DEBERÍA SER EL VALOR NUMÉRICO
        ...currentStep7ValuesFromForm.respuestasRadio.map((resp) => {
          const questionDetails = step7QuestionsPageMock.find((q) => q.questionId === resp.idPregunta)
          let responseLabelToSend: string | undefined = undefined

          if (questionDetails) {
            if (resp.respuesta && resp.respuesta.trim() !== '') {
              // resp.respuesta es el valor numérico "1", "2", etc.
              const selectedOption = questionDetails.options.find((opt) => opt.value === resp.respuesta)
              if (selectedOption) {
                responseLabelToSend = selectedOption.label // Convertir el valor numérico a etiqueta para el backend
              } else {
                console.error(
                  `[handleSubmitAllSteps - Step 7] Opción no encontrada para questionId: "${resp.idPregunta}" con el VALOR de respuesta: "${resp.respuesta}". Esto no debería ocurrir si el formulario se inicializó correctamente.`
                )
                // Podrías decidir enviar resp.respuesta directamente si es un valor numérico válido y el backend lo puede manejar,
                // o enviar undefined si se prefiere no enviar nada si la etiqueta no se encuentra.
                // responseLabelToSend = resp.respuesta; // O undefined
              }
            }
          } else {
            console.error(
              `[handleSubmitAllSteps - Step 7] No se encontraron detalles para questionId: "${resp.idPregunta}" en step7QuestionsPageMock.`
            )
          }

          console.log(
            `[handleSubmitAllSteps - Step 7 Map] qId: ${resp.idPregunta}, respForm (valor numérico): ${resp.respuesta}, respLabelToSend: ${responseLabelToSend}`
          )

          return {
            questionId: resp.idPregunta,
            response: responseLabelToSend, // Enviar la etiqueta al backend
            responseType: 'SELECCION_UNICA' as const,
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
          adjustments: step4Data.ajustesEstudiantes.map((adj) => ({
            idNumber: adj.cedula,
            name: adj.nombre,
            support: adj.apoyo,
            grade: String(adj.nota),
            observation: adj.observacion || '' // Ensure observation is always a string
            // id: adj.id,
          })),
          safeguards: step3Data.salvaguardaEstudiantes.map((sg) => ({
            idNumber: sg.cedula,
            name: sg.nombre,
            grade: String(sg.nota),
            observation: sg.observacion || '' // Ensure observation is always a string
            // id: sg.id,
          }))
        },
        evaluation: evaluationData,
        version: reportType === 'INFORME_FINAL_V1' ? 1 : 2
      }

      console.log('[handleSubmitAllSteps] Payload FINAL para UpdateFinalReportDto:', JSON.stringify(updatePayload, null, 2))
      // Corrected: Call updateReportMutation directly
      await updateReportMutation({ id: reportId, data: updatePayload })
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

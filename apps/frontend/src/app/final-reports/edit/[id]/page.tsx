'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Loader2 } from 'lucide-react'

import { ReportPageHeader } from '@/modules/final-reports/components/report-page-header'

import { Step1Form, Step1FormData, step1Schema, transformReportToStep1Data } from '@/modules/final-reports/components/form-step1'
import { Step2Form, Step2FormData, step2Schema, transformReportToStep2Data } from '@/modules/final-reports/components/form-step2'
import { Step3Form, Step3FormData, step3Schema, transformReportToStep3Data } from '@/modules/final-reports/components/form-step3'
import { Step4Form, Step4FormData, step4Schema, transformReportToStep4Data } from '@/modules/final-reports/components/form-step4'
import {
  Step5EditForm,
  Step5FormData,
  step5Schema,
  transformReportToStep5Data
} from '@/modules/final-reports/components/form-step5-edit'
import {
  OTHER_TOOLS_QUESTION_ID,
  Step6EditForm,
  Step6FormData,
  step6Schema,
  transformReportToStep6Data
} from '@/modules/final-reports/components/form-step6-edit'
import { Step7EditForm, Step7FormData, step7Schema } from '@/modules/final-reports/components/form-step7-edit'

import { step5QuestionsMock, step6QuestionsPageMock, step7QuestionsPageMock } from '@/modules/final-reports/mocks/questions'

import { useFinalReport, useUpdateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import {
  FinalReportEvaluationFE,
  FullFinalReport,
  ReportType,
  UpdateFinalReportDto
} from '@/modules/final-reports/types/final-reports.types'

const TOTAL_STEPS = 7

const STEP_LABELS_SPANISH = ['Información', 'Estadísticas', 'Salvaguarda', 'Ajustes', 'Evaluación', 'Herramientas', 'Calidad']

function transformReportToStep7Data(report: FullFinalReport, currentReportType: ReportType): Step7FormData | null {
  const filteredQuestions = step7QuestionsPageMock.filter((q) => {
    if (Array.isArray(q.appliesTo)) {
      return q.appliesTo.includes(currentReportType) || q.appliesTo.includes('TODOS')
    }
    return false
  })

  const step7Responses = filteredQuestions.map((p) => {
    const existingEvaluation = report.evaluation?.find((e) => e.questionId === p.questionId)
    let formResponseValue = ''

    if (existingEvaluation) {
      const questionDetails = step7QuestionsPageMock.find((mockQuestion) => mockQuestion.questionId === p.questionId)

      // Check if it's a MULTISELECT question
      const isMultiSelect = existingEvaluation.responseType === 'MULTISELECT' ||
        (existingEvaluation.responseType as string) === 'SELECCION_MULTIPLE'

      if (isMultiSelect && existingEvaluation.multipleResponse && existingEvaluation.multipleResponse.length > 0) {
        // For MULTISELECT questions, convert stored labels back to values
        const values = existingEvaluation.multipleResponse.map(label => {
          const option = questionDetails?.options?.find(opt => opt.label === label)
          return option ? option.value : label
        })
        formResponseValue = values.join(',')
      } else if (questionDetails && questionDetails.options) {
        // For SELECT questions, find the value from the label
        const matchedOption = questionDetails.options.find((opt) => opt.label === existingEvaluation.response)
        if (matchedOption) {
          formResponseValue = matchedOption.value
        }
      } else {
        // For TEXT and other types
        formResponseValue = existingEvaluation.response || ''
      }
    }

    return {
      idPregunta: p.questionId,
      respuesta: formResponseValue
    }
  })
  return { respuestasRadio: step7Responses }
}

function EditFinalReportContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const reportId = params.id as string

  // Determine where to redirect based on returnTo parameter
  const returnTo = searchParams.get('returnTo')
  const backUrl = returnTo === 'admin' ? '/admin/final-reports' : '/final-reports'

  console.log('🔍 EditFinalReportContent - returnTo:', returnTo, 'backUrl:', backUrl)

  const queryClient = useQueryClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [reportType] = useState<ReportType>('TODOS') // Changed to match creation page

  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null)
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null)
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null)
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null)
  const [step6Data, setStep6Data] = useState<Step6FormData | null>(null)
  const [step7Data, setStep7Data] = useState<Step7FormData | null>(null)

  const {
    data: fetchedReport,
    isLoading: isLoadingReport,
    error: reportError
  } = useFinalReport(
    reportId,
    { include: 'academicLoad,academicLoad.course,academicLoad.group,academicLoad.professor' },
    {
      enabled: !!reportId,
      retry: 1
    }
  )
  const updateReportHook = useUpdateFinalReport()
  const { mutateAsync: updateReportMutation } = updateReportHook
  const isUpdatingReport = updateReportHook.status === 'pending'

  const formStep1Methods = useForm<Step1FormData>({ resolver: zodResolver(step1Schema) })
  const formStep2Methods = useForm<Step2FormData>({ resolver: zodResolver(step2Schema) })
  const formStep3Methods = useForm<Step3FormData>({ resolver: zodResolver(step3Schema) })
  const formStep4Methods = useForm<Step4FormData>({ resolver: zodResolver(step4Schema) })
  const formStep5Methods = useForm<Step5FormData>({ resolver: zodResolver(step5Schema) })
  const formStep6Methods = useForm<Step6FormData>({ resolver: zodResolver(step6Schema) })
  const formStep7Methods = step7Schema ? useForm<Step7FormData>({ resolver: zodResolver(step7Schema) }) : useForm<Step7FormData>()

  useEffect(() => {
    if (fetchedReport && reportType) {
      const initialStep1 = transformReportToStep1Data(fetchedReport)
      if (initialStep1) {
        setStep1Data(initialStep1)
        formStep1Methods.reset(initialStep1)
      }

      const initialStep2 = transformReportToStep2Data(fetchedReport, initialStep1?.enrolledCapacity)
      if (initialStep2) {
        setStep2Data(initialStep2)
        formStep2Methods.reset(initialStep2)
      }

      const initialStep3 = transformReportToStep3Data(fetchedReport)
      if (initialStep3) {
        setStep3Data(initialStep3)
        formStep3Methods.reset(initialStep3)
      }

      const initialStep4 = transformReportToStep4Data(fetchedReport)
      if (initialStep4) {
        setStep4Data(initialStep4)
        formStep4Methods.reset(initialStep4)
      }

      // Para el paso 5, necesitamos cargar las preguntas primero
      // Por ahora usamos un array vacío como placeholder ya que las preguntas
      // se cargarán dinámicamente en el componente Step5EditForm
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
      }
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
      formStep7Methods.reset(step7Data)
    }
  }, [step7Data, formStep7Methods])

  const handleUpdateStepData = (step: number, data: any) => {
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
        setStep7Data(data as Step7FormData)
        return
    }
    if (step < TOTAL_STEPS) {
      setCurrentStep(step + 1)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleSubmitAllSteps = async () => {
    const currentStep7ValuesFromForm = formStep7Methods.getValues()

    try {
      if (step7Schema) {
        step7Schema.parse(currentStep7ValuesFromForm)
      }
    } catch (validationError) {
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
      currentStep7ValuesFromForm.respuestasRadio.some((r) => !r.idPregunta)
    ) {
      toast.error('Faltan datos de algunos pasos o hay IDs de pregunta faltantes en el paso 7.')

      return
    }

    try {
      // Build evaluation data preserving all question information from the original report
      const evaluationData: FinalReportEvaluationFE[] = []

      // Step 5 questions
      if (step5Data?.respuestas && fetchedReport?.evaluation) {
        step5Data.respuestas.forEach((resp) => {
          const originalQuestion = fetchedReport.evaluation?.find(e => e.questionId === resp.idPregunta)
          if (originalQuestion) {
            // Determine the value to save based on question type
            let responseToSave: string | undefined = undefined
            let multipleResponseToSave: string[] = []

            // Check if it's a multiple selection question
            const isMultiSelect = originalQuestion.responseType === 'MULTISELECT' ||
              (originalQuestion.responseType as string) === 'SELECCION_MULTIPLE'

            if (isMultiSelect && resp.respuesta && resp.respuesta.trim() !== '') {
              // For MULTISELECT questions, split comma-separated values and convert to labels
              const selectedValues = resp.respuesta.split(',').map(v => v.trim()).filter(v => v)

              multipleResponseToSave = selectedValues.map(value => {
                const option = originalQuestion.options?.find(opt => opt.value === value)
                const label = option?.label || value
                console.log(`  - Edit Step 5 MULTISELECT: Converting "${value}" → "${label}"`)
                return label
              })

              console.log('💾 Edit - Saving Step 5 Multiple Selection:', {
                questionId: originalQuestion.questionId,
                selectedValues,
                convertedToLabels: multipleResponseToSave
              })
            } else if (resp.respuesta && resp.respuesta.trim() !== '' && originalQuestion.options && originalQuestion.options.length > 0) {
              // For SELECT questions with options, convert value back to label for storage
              const selectedOption = originalQuestion.options.find((opt) => opt.value === resp.respuesta)
              if (selectedOption) {
                responseToSave = selectedOption.label
              } else {
                // If option not found, keep the original value (backwards compatibility)
                responseToSave = resp.respuesta
              }
            } else {
              // For TEXT and other types
              responseToSave = resp.respuesta
            }

            evaluationData.push({
              ...originalQuestion,
              response: responseToSave,
              multipleResponse: multipleResponseToSave.length > 0 ? multipleResponseToSave : (originalQuestion.multipleResponse || [])
            })
          }
        })
      }

      // Step 6 questions (herramientas)
      if (step6Data && fetchedReport?.evaluation) {
        // Main tools question (multiselect)
        const mainToolsData = step6Data.respuestasMultiples?.[0]
        if (mainToolsData?.respuestasSeleccionadas) {
          const mainToolsQuestion = fetchedReport.evaluation?.find(
            e => e.questionId === mainToolsData.idPregunta
          )
          if (mainToolsQuestion) {
            // Convert values back to labels before saving
            const multipleResponseLabels = (mainToolsData.respuestasSeleccionadas || []).map(value => {
              const option = mainToolsQuestion.options?.find(opt => opt.value === value)
              return option?.label || value // Use label if found, otherwise fallback to value
            })

            console.log('💾 Edit - Saving Step 6:', {
              questionId: mainToolsQuestion.questionId,
              selectedValues: mainToolsData.respuestasSeleccionadas,
              convertedToLabels: multipleResponseLabels
            })

            evaluationData.push({
              ...mainToolsQuestion,
              response: undefined,
              multipleResponse: multipleResponseLabels // ✅ Save labels instead of values
            })
          }
        }

        // Other tools question (text)
        if (step6Data.otrasHerramientas && step6Data.otrasHerramientas.trim() !== '') {
          const otherToolsQuestion = fetchedReport.evaluation?.find(
            e => e.questionId === OTHER_TOOLS_QUESTION_ID
          )
          if (otherToolsQuestion) {
            evaluationData.push({
              ...otherToolsQuestion,
              response: step6Data.otrasHerramientas,
              multipleResponse: []
            })
          }
        }
      }

      // Step 7 questions
      if (currentStep7ValuesFromForm?.respuestasRadio && fetchedReport?.evaluation) {
        currentStep7ValuesFromForm.respuestasRadio.forEach((resp) => {
          const originalQuestion = fetchedReport.evaluation?.find(e => e.questionId === resp.idPregunta)
          if (originalQuestion) {
            // Determine the value to save based on question type
            let responseLabelToSend: string | undefined = undefined

            if (resp.respuesta && resp.respuesta.trim() !== '') {
              // For SELECT questions with options, convert value back to label for storage
              if (originalQuestion.options && originalQuestion.options.length > 0) {
                const selectedOption = originalQuestion.options.find((opt) => opt.value === resp.respuesta)
                if (selectedOption) {
                  responseLabelToSend = selectedOption.label
                } else {
                  // Fallback: if option not found, use the value directly (backwards compatibility)
                  responseLabelToSend = resp.respuesta
                }
              } else {
                // For TEXT, NUMBER, BOOLEAN questions (no options), use the value directly
                responseLabelToSend = resp.respuesta
              }
            }

            evaluationData.push({
              ...originalQuestion,
              response: responseLabelToSend,
              multipleResponse: []
            })
          }
        })
      }

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
            grade: String(adj.nota), // Asegurar que sea string si el backend lo espera así
            observation: adj.observacion || ''
            // id: adj.id, // Descomentar si necesitas enviar el ID del ajuste
          })),
          safeguards: step3Data.salvaguardaEstudiantes.map((sg) => ({
            idNumber: sg.cedula,
            name: sg.nombre,
            grade: String(sg.nota), // Asegurar que sea string
            observation: sg.observacion || ''
            // id: sg.id, // Descomentar si necesitas enviar el ID de la salvaguarda
          }))
        },
        evaluation: evaluationData
      }

      await updateReportMutation({ id: reportId, data: updatePayload })

      await queryClient.invalidateQueries({ queryKey: ['finalReports', reportId] })
      toast.success('Informe actualizado exitosamente!') // Mover toast aquí para mejor flujo

      router.push(backUrl)
    } catch (error: any) {
      toast.error(`Error al actualizar el informe: ${error.message || 'Error desconocido'}`)
    }
  }

  const renderCurrentStepForm = () => {
    // <<--- MODIFICADO: Simplificada la condición, si no hay fetchedReport después de cargar, no se encontró.
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
        // Este Card es para el error, está bien aquí
        <Card className="p-6 text-center border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error al Cargar el Informe</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{reportError.message}</p>
            <Button onClick={() => router.push(backUrl)} className="mt-4">
              Volver a Informes
            </Button>
          </CardContent>
        </Card>
      )
    }
    if (!fetchedReport) {
      return (
        // Este Card es para "no encontrado", está bien aquí
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>Informe No Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se encontró el informe o el ID es inválido.</p>
            <Button onClick={() => router.push(backUrl)} className="mt-4">
              Volver a Informes
            </Button>
          </CardContent>
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
            onCancel={() => router.push(backUrl)}
          // onPrevious no se usa en el primer paso de edición si no hay a dónde ir antes
          />
        )
      case 2:
        return (
          <Step2Form
            formMethods={formStep2Methods}
            onSaveAndNext={(data) => handleUpdateStepData(2, data)}
            onPrevious={(data) => {
              setStep2Data(data) // Guardar datos del paso actual antes de retroceder
              handlePreviousStep()
            }}
            totalSteps={TOTAL_STEPS}
            initialData={step2Data}
            isEditing={true}
            enrolledCapacity={step1Data?.enrolledCapacity}
          />
        )
      case 3:
        return (
          <Step3Form
            formMethods={formStep3Methods}
            onSaveAndNext={(data) => handleUpdateStepData(3, data)}
            onPrevious={(data) => {
              setStep3Data(data)
              handlePreviousStep()
            }}
            totalSteps={TOTAL_STEPS}
            initialData={step3Data}
            isEditing={true}
            reportType={reportType}
          />
        )
      case 4:
        return (
          <Step4Form
            formMethods={formStep4Methods}
            onSaveAndNext={(data) => handleUpdateStepData(4, data)}
            onPrevious={(data) => {
              setStep4Data(data)
              handlePreviousStep()
            }}
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
            onPrevious={(data) => {
              setStep5Data(data)
              handlePreviousStep()
            }}
            totalSteps={TOTAL_STEPS}
            initialData={step5Data}
            isEditing={true}
            report={fetchedReport}
            reportType={'TODOS'}
          />
        )
      case 6:
        return (
          <Step6EditForm
            formMethods={formStep6Methods}
            onSaveAndNext={(data) => handleUpdateStepData(6, data)}
            onPrevious={(data) => {
              setStep6Data(data)
              handlePreviousStep()
            }}
            totalSteps={TOTAL_STEPS}
            initialData={step6Data}
            isEditing={true}
          />
        )
      case 7:
        return (
          <Step7EditForm
            formMethods={formStep7Methods}
            onSaveAndNext={(dataFromStep7Form) => {
              setStep7Data(dataFromStep7Form)
            }}
            onPrevious={(data) => {
              setStep7Data(data)
              handlePreviousStep()
            }}
            totalSteps={TOTAL_STEPS}
            initialData={step7Data}
            isEditing={true}
            reportType={reportType}
            onFinalSubmit={handleSubmitAllSteps}
            report={fetchedReport}
          />
        )
      default:
        return <div>Paso desconocido</div>
    }
  }

  // <<--- MODIFICADO: Estructura del return principal para que coincida con new/page.tsx
  return (
    <div className="container mx-auto flex flex-col h-screen max-h-screen overflow-hidden">
      <ReportPageHeader
        pageTitle="Editar Informe Final"
        pageDescription={
          fetchedReport?.academicLoad?.course?.name
            ? `${fetchedReport.academicLoad.course.name} - NRC: ${fetchedReport.academicLoad.nrc}`
            : 'Cargando detalles del curso...'
        }
        stepLabels={STEP_LABELS_SPANISH}
        currentStep={currentStep}
        backButton={{ href: backUrl, text: 'Volver a lista de informes' }}
      // nrc={step1Data?.nrc || fetchedReport?.academicLoad?.nrc} // Opcional, si quieres mostrar NRC
      />
      <main className="flex-grow flex flex-col items-center overflow-hidden pt-2 pb-6 md:pt-4">
        <Card className="shadow-lg border-border/50 w-full max-w-5xl flex flex-col flex-grow overflow-hidden rounded-lg">
          <CardContent className="flex-grow overflow-y-auto p-0">
            <div className="p-4 md:p-6 lg:p-8 relative h-full">
              {isUpdatingReport && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex justify-center items-center z-50 rounded-lg">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="ml-3 text-lg">Guardando informe...</p>
                </div>
              )}
              <div className={`${isUpdatingReport ? 'opacity-50 pointer-events-none' : ''} flex-l`}>
                {' '}
                {renderCurrentStepForm()}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function EditFinalReportPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <EditFinalReportContent />
    </Suspense>
  )
}

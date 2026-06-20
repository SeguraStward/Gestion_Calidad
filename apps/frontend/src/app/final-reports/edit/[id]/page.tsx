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
  Step5Form,
  Step5FormData,
  step5Schema,
  transformReportToStep5Data
} from '@/modules/final-reports/components/form-step5'
import {
  OTHER_TOOLS_QUESTION_ID,
  Step6Form,
  Step6FormData,
  step6Schema,
  transformReportToStep6Data
} from '@/modules/final-reports/components/form-step6'
import { Step7Form, Step7FormData, step7Schema, transformReportToStep7Data } from '@/modules/final-reports/components/form-step7'

import { step6QuestionsPageMock } from '@/modules/final-reports/mocks/questions'

import { useFinalReport, useUpdateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import { useQuestionsByStep } from '@/modules/final-reports/services/questions.service'
import {
  FinalReportEvaluationFE,
  FullFinalReport,
  ReportType,
  UpdateFinalReportDto
} from '@/modules/final-reports/types/final-reports.types'

const TOTAL_STEPS = 7

const STEP_LABELS_SPANISH = ['Información', 'Estadísticas', 'Salvaguarda', 'Ajustes', 'Evaluación', 'Herramientas', 'Calidad']

function EditFinalReportContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const reportId = params.id as string

  // Determine where to redirect based on returnTo parameter
  const returnTo = searchParams.get('returnTo')
  const backUrl = returnTo === 'admin' ? '/admin/final-reports' : '/final-reports'

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

  // Admin-managed questions for steps 5 & 7 (same source as the creation flow).
  // Needed so questions left blank at creation can be answered while editing.
  const { data: step5QuestionsDB } = useQuestionsByStep(5, reportType)
  const { data: step7QuestionsDB } = useQuestionsByStep(7, reportType)

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

      // Step 5 pre-fill. The shared Step5Form renders the full question catalog
      // and aligns these answers by questionId, so blank questions also appear.
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

      const initialStep7 = transformReportToStep7Data(fetchedReport)
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

  // Header step navigation (parity with the "new report" flow). When editing,
  // every step has data loaded from the report, so all are reachable.
  const completedSteps = [
    !!step1Data,
    !!step2Data,
    !!step3Data,
    !!step4Data,
    !!step5Data,
    !!step6Data,
    !!step7Data
  ]

  const handleGoToStep = (step: number) => {
    if (step <= currentStep || completedSteps[step - 1]) {
      setCurrentStep(step)
    }
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

      // Step 5 questions. Build each entry from the original report when present,
      // otherwise from the admin-managed DB catalog — so a question left blank at
      // creation can be answered while editing (before, those answers were
      // silently dropped). Only answered questions are saved.
      if (step5Data?.respuestas) {
        step5Data.respuestas
          .filter((resp) => resp.respuesta && resp.respuesta.trim() !== '')
          .forEach((resp) => {
            const original = fetchedReport?.evaluation?.find((e) => e.questionId === resp.idPregunta)
            const dbQ = step5QuestionsDB?.find((q) => q.id === resp.idPregunta)
            const options = original?.options ?? dbQ?.options ?? []
            const responseType = (original?.responseType ?? dbQ?.responseType ?? 'TEXT') as any
            const isMultiSelect = responseType === 'MULTISELECT' || responseType === 'SELECCION_MULTIPLE'

            let response: string | undefined = undefined
            let multipleResponse: string[] = []
            if (isMultiSelect) {
              const values = resp.respuesta.split(',').map((v) => v.trim()).filter(Boolean)
              multipleResponse = values.map((v) => options.find((o) => o.value === v)?.label || v)
            } else if (options.length > 0) {
              response = options.find((o) => o.value === resp.respuesta)?.label || resp.respuesta
            } else {
              response = resp.respuesta
            }

            evaluationData.push({
              ...(original ?? {}),
              questionId: resp.idPregunta,
              question: original?.question ?? dbQ?.question ?? resp.idPregunta,
              questionGroup: original?.questionGroup ?? (dbQ as any)?.group?.name ?? 'evaluacion_general_curso',
              responseType,
              stepNumber: 5,
              options: options.map((o) => ({ value: o.value, label: o.label, category: (o as any).category })),
              response,
              multipleResponse,
              otherResponse: undefined
            } as FinalReportEvaluationFE)
          })
      }

      // Step 6 questions (herramientas). Build the entries even when the
      // original report didn't have them yet — otherwise tools the professor
      // adds/types while editing would be silently dropped (the previous code
      // required the question to already exist in the report). Metadata comes
      // from the step-6 catalog when the original entry is missing.
      if (step6Data) {
        // Main tools question (multiselect)
        const mainToolsData = step6Data.respuestasMultiples?.[0]
        if (mainToolsData?.respuestasSeleccionadas) {
          const original = fetchedReport?.evaluation?.find((e) => e.questionId === mainToolsData.idPregunta)
          const mock = step6QuestionsPageMock.find((q) => q.questionId === mainToolsData.idPregunta)
          const optionList = original?.options ?? mock?.options ?? []
          const multipleResponseLabels = (mainToolsData.respuestasSeleccionadas || []).map((value) => {
            const option = optionList.find((opt) => opt.value === value)
            return option?.label || value // label if found, else fall back to value
          })

          evaluationData.push({
            ...(original ?? {}),
            questionId: mainToolsData.idPregunta,
            question: original?.question ?? mock?.question ?? 'Herramientas utilizadas',
            questionGroup: original?.questionGroup ?? (mock as any)?.group ?? 'herramientas',
            responseType: original?.responseType ?? ('SELECCION_MULTIPLE' as any),
            stepNumber: 6,
            options: optionList.map((op) => ({ value: op.value, label: op.label, category: (op as any).category })),
            response: undefined,
            multipleResponse: multipleResponseLabels,
            otherResponse: undefined
          } as FinalReportEvaluationFE)
        }

        // Other tools question (free text)
        if (step6Data.otrasHerramientas && step6Data.otrasHerramientas.trim() !== '') {
          const original = fetchedReport?.evaluation?.find((e) => e.questionId === OTHER_TOOLS_QUESTION_ID)
          const mock = step6QuestionsPageMock.find((q) => q.questionId === OTHER_TOOLS_QUESTION_ID)

          evaluationData.push({
            ...(original ?? {}),
            questionId: OTHER_TOOLS_QUESTION_ID,
            question: original?.question ?? mock?.question ?? 'Otras herramientas utilizadas (opcional)',
            questionGroup: original?.questionGroup ?? (mock as any)?.group ?? 'herramientas',
            responseType: 'TEXT' as any,
            stepNumber: 6,
            options: [],
            response: step6Data.otrasHerramientas,
            multipleResponse: [],
            otherResponse: undefined
          } as FinalReportEvaluationFE)
        }
      }

      // Step 7 questions. Same approach as step 5 — fall back to the DB catalog
      // so newly answered questions are saved instead of dropped.
      if (currentStep7ValuesFromForm?.respuestasRadio) {
        currentStep7ValuesFromForm.respuestasRadio
          .filter((resp) => resp.respuesta && resp.respuesta.trim() !== '')
          .forEach((resp) => {
            const original = fetchedReport?.evaluation?.find((e) => e.questionId === resp.idPregunta)
            const dbQ = step7QuestionsDB?.find((q) => q.id === resp.idPregunta)
            const options = original?.options ?? dbQ?.options ?? []
            const responseType = (original?.responseType ?? dbQ?.responseType ?? 'SELECT') as any
            const isMultiSelect = responseType === 'MULTISELECT' || responseType === 'SELECCION_MULTIPLE'

            let response: string | undefined = undefined
            let multipleResponse: string[] = []
            if (isMultiSelect) {
              const values = resp.respuesta.split(',').map((v) => v.trim()).filter(Boolean)
              multipleResponse = values.map((v) => options.find((o) => o.value === v)?.label || v)
            } else if (options.length > 0) {
              response = options.find((o) => o.value === resp.respuesta)?.label || resp.respuesta
            } else {
              response = resp.respuesta
            }

            evaluationData.push({
              ...(original ?? {}),
              questionId: resp.idPregunta,
              question: original?.question ?? dbQ?.question ?? resp.idPregunta,
              questionGroup: original?.questionGroup ?? (dbQ as any)?.group?.name ?? 'percepcion_calidad',
              responseType,
              stepNumber: 7,
              options: options.map((o) => ({ value: o.value, label: o.label, category: (o as any).category })),
              response,
              multipleResponse,
              otherResponse: undefined
            } as FinalReportEvaluationFE)
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
          <Step5Form
            formMethods={formStep5Methods}
            onSaveAndNext={(data) => handleUpdateStepData(5, data)}
            onPrevious={(data) => {
              setStep5Data(data)
              handlePreviousStep()
            }}
            totalSteps={TOTAL_STEPS}
            initialData={step5Data}
            isEditing={true}
            reportType={'TODOS'}
          />
        )
      case 6:
        return (
          <Step6Form
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
          <Step7Form
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
        nrc={step1Data?.nrc ?? fetchedReport?.academicLoad?.nrc ?? null}
        onGoToStep={handleGoToStep}
        completedSteps={completedSteps}
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

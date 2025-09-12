'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

// Import step components and their schemas/types
import { Step1Form, Step1FormData, step1Schema } from '@/modules/final-reports/components/form-step1'
import { Step2Form, Step2FormData, step2Schema } from '@/modules/final-reports/components/form-step2'
import { Step3Form, Step3FormData, step3Schema } from '@/modules/final-reports/components/form-step3'
import { Step4Form, Step4FormData, step4Schema } from '@/modules/final-reports/components/form-step4'
import { Step5Form, Step5FormData, step5Schema } from '@/modules/final-reports/components/form-step5'
import { Step6Form, Step6FormData, step6Schema } from '@/modules/final-reports/components/form-step6'
// Assuming step7QuestionsFormMock (from form-step7.tsx) is now also translated
// and its items use 'questionId', 'question', 'questionGroup', 'responseTypeFE', 'options'
import { Step7Form, Step7FormData, step7Schema } from '@/modules/final-reports/components/form-step7'
import { ReportPageHeader } from '@/modules/final-reports/components/report-page-header'

// Import service hook and DTO type
import { useSessionStore } from '@/modules/auth/sessionStore'
import { useCreateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import type { CreateFinalReportDto, FinalReportEvaluationFE, ReportType } from '@/modules/final-reports/types/final-reports.types' // Renamed TipoInforme, Added FinalReportEvaluationFE

// Import translated mock data
import { MAIN_TOOLS_QUESTION_ID, OTHER_TOOLS_QUESTION_ID } from '@/modules/final-reports/mocks/constants' // Import constants for question IDs
import {
  step5QuestionsMock,
  step6QuestionsPageMock,
  Step7Question,
  step7QuestionsPageMock
} from '@/modules/final-reports/mocks/questions' // Renamed mocks, Import step7QuestionsPageMock and Step7Question

const TOTAL_STEPS = 7
// User-facing labels remain in Spanish
const STEP_LABELS_SPANISH = ['Información', 'Estadísticas', 'Salvaguarda', 'Ajustes', 'Evaluación', 'Herramientas', 'Calidad']

export default function NewFinalReportPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // State for each step's data
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null)
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null)
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null)
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null)
  const [step6Data, setStep6Data] = useState<Step6FormData | null>(null)
  const [step7Data, setStep7Data] = useState<Step7FormData | null>(null)
  const [reportType] = useState<ReportType>('TODOS')

  const createFinalReportMutation = useCreateFinalReport()
  const currentProfessorId = useSessionStore((state) => state.user?.id)

  // Calculate completed steps
  const completedSteps = [
    !!step1Data,
    !!step2Data,
    !!step3Data,
    !!step4Data,
    !!step5Data,
    !!step6Data,
    !!step7Data
  ]

  // Handle navigation to specific step
  const handleGoToStep = (step: number) => {
    // Allow navigation to completed steps or current step
    if (step <= currentStep || completedSteps[step - 1]) {
      setCurrentStep(step)
    }
  }

  const formStep1Methods = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: { enrolledCapacity: undefined }
  })
  const formStep2Methods = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: { totalEnrolled: undefined, totalWithdrawn: 0, totalPassed: 0, totalFailed: 0 }
  })
  const formStep3Methods = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: { salvaguardaEstudiantes: [] }
  })
  const formStep4Methods = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: { ajustesEstudiantes: [] }
  })
  const formStep5Methods = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: { respuestas: [] }
  })
  const formStep6Methods = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      respuestasMultiples: [{ idPregunta: MAIN_TOOLS_QUESTION_ID, respuestasSeleccionadas: [] }],
      otrasHerramientas: ''
    }
  })
  const formStep7Methods = useForm<Step7FormData>({
    resolver: zodResolver(step7Schema),
    defaultValues: { respuestasRadio: [] } // Add defaultValues for Step 7
  })

  // useEffects to reset form methods when their corresponding stepXData changes
  // These ensure that if the parent state changes, the form instance is updated.
  // This is particularly useful if data is loaded asynchronously or modified externally to the form component itself.

  useEffect(() => {
    if (step1Data) formStep1Methods.reset(step1Data)
  }, [step1Data, formStep1Methods])

  useEffect(() => {
    if (step2Data) {
      formStep2Methods.reset(step2Data)
    } else if (step1Data?.enrolledCapacity !== undefined) {
      // This handles the initial default for step 2 based on step 1
      formStep2Methods.reset({
        totalEnrolled: step1Data.enrolledCapacity,
        totalWithdrawn: 0,
        totalPassed: 0,
        totalFailed: 0
      })
    } else {
      // Fallback to static defaults if no step2Data and no step1Data.enrolledCapacity
      formStep2Methods.reset({ totalEnrolled: undefined, totalWithdrawn: 0, totalPassed: 0, totalFailed: 0 })
    }
  }, [step1Data?.enrolledCapacity, step2Data, formStep2Methods])

  useEffect(() => {
    if (step3Data) {
      formStep3Methods.reset(step3Data)
    } else {
      formStep3Methods.reset({ salvaguardaEstudiantes: [] })
    }
  }, [step3Data, formStep3Methods])

  useEffect(() => {
    if (step4Data) {
      formStep4Methods.reset(step4Data)
    } else {
      formStep4Methods.reset({ ajustesEstudiantes: [] })
    }
  }, [step4Data, formStep4Methods])

  useEffect(() => {
    if (step5Data) {
      formStep5Methods.reset(step5Data)
    } else {
      formStep5Methods.reset({
        respuestas: step5QuestionsMock.map((p) => ({ idPregunta: p.questionId, respuesta: '' }))
      })
    }
  }, [step5Data, formStep5Methods])

  useEffect(() => {
    if (step6Data) {
      // Add useEffect for step6Data
      formStep6Methods.reset(step6Data)
    } else {
      formStep6Methods.reset({
        respuestasMultiples: [{ idPregunta: MAIN_TOOLS_QUESTION_ID, respuestasSeleccionadas: [] }],
        otrasHerramientas: ''
      })
    }
  }, [step6Data, formStep6Methods])

  useEffect(() => {
    if (step7Data) {
      // Add if (step7Data) condition
      formStep7Methods.reset(step7Data)
    } else {
      formStep7Methods.reset({
        respuestasRadio: step7QuestionsPageMock
          .filter((p: Step7Question) => {
            if (p.appliesTo && !(p.appliesTo.includes(reportType) || p.appliesTo.includes('TODOS'))) {
              return false
            }
            return true
          })
          .map((p: Step7Question) => ({ idPregunta: p.questionId, respuesta: '' }))
      })
    }
  }, [reportType, step7Data, formStep7Methods]) // Add step7Data to dependencies

  const handleSaveStep1Data = (data: Step1FormData) => {
    setStep1Data(data)
    setStep2Data((prevStep2Data) => {
      const newTotalEnrolled = data.enrolledCapacity ?? undefined
      if (prevStep2Data === null) {
        return {
          totalEnrolled: newTotalEnrolled,
          totalWithdrawn: 0,
          totalPassed: 0,
          totalFailed: 0
        }
      }
      return {
        ...prevStep2Data,
        totalEnrolled: newTotalEnrolled
      }
    })
    setCurrentStep(2)
  }

  const handleSaveStep2Data = (data: Step2FormData) => {
    setStep2Data(data)
    setCurrentStep(3)
  }
  const handleSaveStep3Data = (data: Step3FormData) => {
    setStep3Data(data)
    setCurrentStep(4)
  }
  const handleSaveStep4Data = (data: Step4FormData) => {
    setStep4Data(data)
    setCurrentStep(5)
  }
  const handleSaveStep5Data = (data: Step5FormData) => {
    setStep5Data(data)
    setCurrentStep(6)
  }
  const handleSaveStep6Data = (data: Step6FormData) => {
    setStep6Data(data)
    setCurrentStep(7)
  }
  const handleSaveStep7Data = async (currentStep7DataFromForm: Step7FormData) => {
    // Parameter is currentStep7DataFromForm
    setStep7Data(currentStep7DataFromForm) // Save step 7 data to state

    if (!step1Data || !step2Data || !step3Data || !step4Data || !step5Data || !step6Data || !currentStep7DataFromForm) {
      toast.error('Faltan datos de pasos anteriores. Por favor, revise el formulario.')
      return
    }
    const professorIdToUse = currentProfessorId
    if (!professorIdToUse) {
      toast.error('ID del profesor no disponible. No se puede crear el informe.')
      return
    }
    if (!step1Data.academicLoadId) {
      toast.error('ID de la carga académica no disponible. Verifique el Paso 1.')
      return
    }

    const finalReportPayload: CreateFinalReportDto = {
      professorId: professorIdToUse,
      academicLoadId: step1Data.academicLoadId,
      version: reportType === 'INFORME_FINAL_V1' ? 1 : 2,
      statistics: {
        totalStudents: step2Data.totalEnrolled ?? 0,
        passed: step2Data.totalPassed ?? 0,
        failed: step2Data.totalFailed ?? 0,
        dropouts: step2Data.totalWithdrawn ?? 0
      },
      studentInformation: {
        safeguards: step3Data.salvaguardaEstudiantes.map((s) => ({
          idNumber: s.cedula,
          name: s.nombre,
          grade: String(s.nota),
          observation: s.observacion || ''
        })),
        adjustments: step4Data.ajustesEstudiantes.map((a) => ({
          idNumber: a.cedula,
          name: a.nombre,
          support: a.apoyo,
          grade: String(a.nota),
          observation: a.observacion || ''
        }))
      },
      evaluation: [
        ...step5Data.respuestas.map((r) => {
          const questionDetails = step5QuestionsMock.find((p) => p.questionId === r.idPregunta)
          return {
            questionId: r.idPregunta,
            question: questionDetails?.question || r.idPregunta,
            questionGroup: questionDetails?.group || 'evaluacion_general_curso',
            responseType: questionDetails?.responseType || ('TEXT' as const),
            response: r.respuesta || undefined,
            multipleResponse: [],
            options: questionDetails?.options?.map((op) => ({ value: op.value, label: op.label, category: op.category })) || [],
            otherResponse: undefined
          }
        }),
        ...step6Data.respuestasMultiples.map((r) => {
          const questionDetails = step6QuestionsPageMock.find((p) => p.questionId === r.idPregunta)
          return {
            questionId: r.idPregunta,
            question: questionDetails?.question || r.idPregunta,
            questionGroup: questionDetails?.group || 'herramientas',
            responseType: 'SELECCION_MULTIPLE' as const,
            response: 'undefined',
            multipleResponse: r.respuestasSeleccionadas || [],
            options: questionDetails?.options?.map((op) => ({ value: op.value, label: op.label, category: op.category })) || [],
            otherResponse: undefined
          }
        }),
        ...(step6Data.otrasHerramientas && step6Data.otrasHerramientas.trim() !== ''
          ? [
            {
              questionId: OTHER_TOOLS_QUESTION_ID,
              question:
                step6QuestionsPageMock.find((q) => q.questionId === OTHER_TOOLS_QUESTION_ID)?.question ||
                'Otras herramientas utilizadas (opcional)',
              questionGroup:
                step6QuestionsPageMock.find((q) => q.questionId === OTHER_TOOLS_QUESTION_ID)?.group || 'herramientas',
              responseType: 'TEXT' as const,
              response: step6Data.otrasHerramientas,
              multipleResponse: [],
              options: [],
              otherResponse: undefined
            }
          ]
          : []),
        ...currentStep7DataFromForm.respuestasRadio.map((r) => {
          const questionDetails = step7QuestionsPageMock.find((p) => p.questionId === r.idPregunta)
          const resolvedResponseType = questionDetails?.responseType || ('SELECCION_UNICA' as const)

          const selectedOption = questionDetails?.options.find((opt) => opt.value === r.respuesta)
          const responseValueToSend = selectedOption?.label || r.respuesta

          return {
            questionId: r.idPregunta,
            question: questionDetails?.question || r.idPregunta,
            questionGroup: questionDetails?.group || 'percepcion_calidad',
            responseType: resolvedResponseType,
            response: resolvedResponseType === 'SELECCION_MULTIPLE' ? undefined : responseValueToSend,
            multipleResponse: resolvedResponseType === 'SELECCION_MULTIPLE' ? (r.respuesta ? [responseValueToSend] : []) : [],
            options: [],
            otherResponse: undefined
          }
        })
      ].map((item) => ({
        ...item,
        response: item.response === undefined ? undefined : item.response,
        multipleResponse: item.multipleResponse || [],
        options: [],
        questionGroup: item.questionGroup || 'general',
        otherResponse: item.otherResponse === undefined ? undefined : item.otherResponse
      })) as unknown as FinalReportEvaluationFE[]
    }
    try {
      await createFinalReportMutation.mutateAsync(finalReportPayload)
      router.push('/final-reports') // Navigate on success
    } catch (error) {
      toast.error('Error al crear el informe. Intente nuevamente.')
    }
  }

  const saveDataForCurrentStepBeforeNavigatingBack = (step: number, data: any) => {
    switch (step) {
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
        break
      default:
    }
  }

  const handlePreviousStep = (currentStepData?: any) => {
    if (currentStepData && currentStep > 1) {
      // Solo guardar si hay datos y no estamos en el primer paso
      saveDataForCurrentStepBeforeNavigatingBack(currentStep, currentStepData)
    }
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const renderCurrentStepForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Form
            formMethods={formStep1Methods}
            onSaveAndNext={handleSaveStep1Data}
            totalSteps={TOTAL_STEPS}
            onCancel={() => router.push('/final-reports')}
            initialData={step1Data}
            isEditing={false}
          />
        )
      case 2:
        return (
          <Step2Form
            formMethods={formStep2Methods}
            onSaveAndNext={handleSaveStep2Data}
            onPrevious={(data) => handlePreviousStep(data)}
            totalSteps={TOTAL_STEPS}
            initialData={step2Data}
            isEditing={false}
            enrolledCapacity={step1Data?.enrolledCapacity}
          />
        )
      case 3:
        return (
          <Step3Form
            formMethods={formStep3Methods}
            onSaveAndNext={handleSaveStep3Data}
            onPrevious={(data) => handlePreviousStep(data)}
            totalSteps={TOTAL_STEPS}
            reportType={reportType}
            initialData={step3Data}
            isEditing={false}
          />
        )
      case 4:
        return (
          <Step4Form
            formMethods={formStep4Methods}
            onSaveAndNext={handleSaveStep4Data}
            onPrevious={(data) => handlePreviousStep(data)}
            totalSteps={TOTAL_STEPS}
            initialData={step4Data}
            isEditing={false}
          />
        )
      case 5:
        return (
          <Step5Form
            formMethods={formStep5Methods}
            onSaveAndNext={handleSaveStep5Data}
            onPrevious={(data) => handlePreviousStep(data)}
            totalSteps={TOTAL_STEPS}
            reportType={reportType}
            initialData={step5Data}
            isEditing={false}
          />
        )
      case 6:
        return (
          <Step6Form
            formMethods={formStep6Methods}
            onSaveAndNext={handleSaveStep6Data}
            onPrevious={(data) => handlePreviousStep(data)}
            totalSteps={TOTAL_STEPS}
            initialData={step6Data}
            isEditing={false}
          />
        )
      case 7:
        return (
          <Step7Form
            formMethods={formStep7Methods}
            onSaveAndNext={handleSaveStep7Data}
            onPrevious={(data) => handlePreviousStep(data)}
            totalSteps={TOTAL_STEPS}
            reportType={reportType}
            isSubmitting={createFinalReportMutation.isPending}
            initialData={step7Data}
            isEditing={false}
          />
        )
      default:
        return <div>Paso desconocido</div>
    }
  }

  return (
    <div className="container mx-auto flex flex-col h-screen max-h-screen overflow-hidden">
      <ReportPageHeader
        pageTitle="Nuevo Informe Final"
        pageDescription="Complete todos los pasos para crear el informe final del curso"
        stepLabels={STEP_LABELS_SPANISH}
        currentStep={currentStep}
        backButton={{ href: '/final-reports', text: 'Volver a la Lista de Informes' }}
        nrc={step1Data?.nrc ?? null}
        onGoToStep={handleGoToStep}
        completedSteps={completedSteps}
      />
      <main className="flex-grow flex flex-col items-center overflow-hidden pt-2 pb-6 md:pt-4">
        <Card className="shadow-lg border-border/50 w-full max-w-5xl flex flex-col flex-grow overflow-hidden rounded-lg">
          <CardContent className="flex-grow overflow-y-auto p-0">
            <div className="p-4 md:p-6 lg:p-8 relative h-full">
              {createFinalReportMutation.isPending && (
                <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex justify-center items-center z-50 rounded-lg">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="ml-3 text-lg">Creando informe...</p>
                </div>
              )}
              <div className={`${createFinalReportMutation.isPending ? 'opacity-50 pointer-events-none' : ''} flex-l`}>
                {renderCurrentStepForm()}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

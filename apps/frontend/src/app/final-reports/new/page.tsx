'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Import step components and their schemas/types
import { Step1Form, step1Schema, Step1FormData } from '@/modules/final-reports/components/form-step1'
import { Step2Form, step2Schema, Step2FormData } from '@/modules/final-reports/components/form-step2'
import { Step3Form, step3Schema, Step3FormData } from '@/modules/final-reports/components/form-step3'
import { Step4Form, step4Schema, Step4FormData } from '@/modules/final-reports/components/form-step4'
import { Step5Form, step5Schema, Step5FormData } from '@/modules/final-reports/components/form-step5'
import { Step6Form, step6Schema, Step6FormData } from '@/modules/final-reports/components/form-step6'
// Assuming step7QuestionsFormMock (from form-step7.tsx) is now also translated
// and its items use 'questionId', 'question', 'questionGroup', 'responseTypeFE', 'options'
import { Step7Form, step7Schema, Step7FormData } from '@/modules/final-reports/components/form-step7'
import { ReportPageHeader } from '@/modules/final-reports/components/report-page-header'

// Import service hook and DTO type
import { useCreateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import type { CreateFinalReportDto, ReportType, FinalReportEvaluationFE } from '@/modules/final-reports/types/final-reports.types' // Renamed TipoInforme, Added FinalReportEvaluationFE
import useDevStore from '@/store/devStore'

// Import translated mock data
import {
  step5QuestionsMock,
  step6QuestionsPageMock,
  step7QuestionsPageMock,
  Step7Question
} from '@/modules/final-reports/mocks/questions' // Renamed mocks, Import step7QuestionsPageMock and Step7Question

const TOTAL_STEPS = 7
// User-facing labels remain in Spanish
const STEP_LABELS_SPANISH = ['Información', 'Estadísticas', 'Salvaguarda', 'Ajustes', 'Evaluación', 'Herramientas', 'Calidad']

const MAIN_TOOLS_QUESTION_ID = 'herramientas_utilizadas' // ID Canónico para la pregunta de herramientas
const OTHER_TOOLS_QUESTION_ID = 'otras_herramientas_utilizadas' // ID para el campo de texto de otras herramientas

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
  const [reportType, setReportType] = useState<ReportType>('INFORME_FINAL_V1')

  const createFinalReportMutation = useCreateFinalReport()
  const currentProfessorId = useDevStore((state) => state.mockProfessorId)

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
            response: undefined,
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
          // Changed currentStep7Data to currentStep7DataFromForm
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
            options: questionDetails?.options?.map((op) => ({ value: op.value, label: op.label, category: op.category })) || [],
            otherResponse: undefined
          }
        })
      ].map((item) => ({
        ...item,
        response: item.response === undefined ? undefined : item.response,
        multipleResponse: item.multipleResponse || [],
        options: item.options || [],
        questionGroup: item.questionGroup || 'general',
        // Now item.otherResponse will exist, even if undefined
        otherResponse: item.otherResponse === undefined ? undefined : item.otherResponse
      })) as FinalReportEvaluationFE[]
    }
    console.log('Final Report Payload to Send:', JSON.stringify(finalReportPayload, null, 2))
    try {
      await createFinalReportMutation.mutateAsync(finalReportPayload)
      router.push('/final-reports') // Navigate on success
    } catch (error) {
      // User-facing error message
      console.error('Explicit error trying to create report in page.tsx:', error)
      toast.error('Error al crear el informe. Intente nuevamente.')
    }
  }

  const saveDataForCurrentStepBeforeNavigatingBack = (step: number, data: any) => {
    // Guardado "parcial" sin validación estricta al retroceder.
    // Es importante que 'data' aquí sea el objeto de datos del formulario,
    // que debería ser serializable.
    console.log(`[NewPage] Saving data for step ${step} before navigating back.`)
    // Para evitar errores de JSON.stringify con estructuras circulares en el log:
    // console.log(`[NewPage] Data:`, JSON.stringify(data, null, 2)); // Omitir si causa problemas
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
        console.warn(`[NewPage] Attempted to save data for unknown step: ${step}`)
    }
  }

  const handlePreviousStep = (currentStepData?: any) => {
    if (currentStepData && currentStep > 1) {
      // Solo guardar si hay datos y no estamos en el primer paso
      saveDataForCurrentStepBeforeNavigatingBack(currentStep, currentStepData)
    }
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  return (
    <div className="container mx-auto flex flex-col h-screen max-h-screen overflow-hidden">
      <ReportPageHeader
        pageTitle="Nuevo Informe Final"
        pageDescription="Complete todos los pasos para crear el informe final del curso"
        stepLabels={STEP_LABELS_SPANISH}
        currentStep={currentStep}
        // ADDED: backButton prop to navigate to the reports list
        backButton={{ href: '/final-reports', text: 'Volver a la Lista de Informes' }}
        // You can also pass the nrc if available and desired, like in the edit page
        // nrc={step1Data?.nrc} // Uncomment and ensure step1Data is available if you want to show NRC
      />
      <main className="flex-grow flex flex-col items-center overflow-hidden pt-2 pb-6 md:pt-4">
        <Card className="shadow-lg border-border/50 w-full max-w-5xl flex flex-col flex-grow overflow-hidden rounded-lg">
          <CardContent className="flex-grow overflow-y-auto p-0">
            {currentStep === 1 && (
              <Step1Form
                formMethods={formStep1Methods}
                onSaveAndNext={handleSaveStep1Data}
                totalSteps={TOTAL_STEPS}
                onCancel={() => router.push('/final-reports')} // This onCancel is specific to Step1Form
                initialData={step1Data}
                isEditing={false}
              />
            )}
            {currentStep === 2 && (
              <Step2Form
                formMethods={formStep2Methods}
                onSaveAndNext={handleSaveStep2Data}
                onPrevious={(data) => handlePreviousStep(data)} // PASAR DATOS
                totalSteps={TOTAL_STEPS}
                initialData={step2Data}
                isEditing={false}
              />
            )}
            {currentStep === 3 && (
              <Step3Form
                formMethods={formStep3Methods}
                onSaveAndNext={handleSaveStep3Data}
                onPrevious={(data) => handlePreviousStep(data)} // PASAR DATOS
                totalSteps={TOTAL_STEPS}
                reportType={reportType}
                initialData={step3Data}
                isEditing={false}
              />
            )}
            {currentStep === 4 && (
              <Step4Form
                formMethods={formStep4Methods}
                onSaveAndNext={handleSaveStep4Data}
                onPrevious={(data) => handlePreviousStep(data)} // PASAR DATOS
                totalSteps={TOTAL_STEPS}
                initialData={step4Data}
                isEditing={false}
              />
            )}
            {currentStep === 5 && (
              <Step5Form
                formMethods={formStep5Methods}
                onSaveAndNext={handleSaveStep5Data}
                onPrevious={(data) => handlePreviousStep(data)} // PASAR DATOS
                totalSteps={TOTAL_STEPS}
                initialData={step5Data}
                isEditing={false} // Asegúrate que isEditing se pasa
              />
            )}
            {currentStep === 6 && (
              <Step6Form
                formMethods={formStep6Methods}
                onSaveAndNext={handleSaveStep6Data}
                onPrevious={(data) => handlePreviousStep(data)} // PASAR DATOS
                totalSteps={TOTAL_STEPS}
                initialData={step6Data}
                isEditing={false} // Asegúrate que isEditing se pasa
              />
            )}
            {currentStep === 7 && (
              <Step7Form
                formMethods={formStep7Methods}
                onSaveAndNext={handleSaveStep7Data}
                onPrevious={(data) => handlePreviousStep(data)} // PASAR DATOS
                totalSteps={TOTAL_STEPS}
                reportType={reportType}
                isSubmitting={createFinalReportMutation.isPending}
                initialData={step7Data}
                isEditing={false} // Asegúrate que isEditing se pasa
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

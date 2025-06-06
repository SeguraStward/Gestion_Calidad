'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  const [reportType, setReportType] = useState<ReportType>('INFORME_FINAL_V1') // Was tipoInforme

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
    defaultValues: { respuestas: step5QuestionsMock.map((p) => ({ idPregunta: p.questionId, respuesta: '' })) }
  })
  const formStep6Methods = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      respuestasMultiples: [{ idPregunta: 'herramientas_tec', respuestasSeleccionadas: [] }], // Assuming 'herramientas_tec' is the ID for the main tool question
      otrasHerramientas: ''
    }
  })
  const formStep7Methods = useForm<Step7FormData>({
    resolver: zodResolver(step7Schema),
    defaultValues: {
      respuestasRadio: step7QuestionsPageMock // Use centralized mock
        .filter((p: Step7Question) => {
          // Filter using the 'group' and 'appliesTo' from Step7Question
          if (p.appliesTo && !(p.appliesTo.includes(reportType) || p.appliesTo.includes('TODOS'))) {
            return false
          }
          // Example of filtering by a specific group name (user-facing, so keep Spanish if it's a direct match)
          // This specific group filter might be too restrictive if 'appliesTo' is sufficient
          // Consider if this specific group check is still needed or if appliesTo covers it.
          // if (
          //   p.group === '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
          // ) {
          //   return reportType === 'INFORME_FINAL_V1';
          // }
          return true
        })
        .map((p: Step7Question) => ({ idPregunta: p.questionId, respuesta: '' })) // Use p.questionId
    }
  })

  useEffect(() => {
    formStep7Methods.reset({
      respuestasRadio: step7QuestionsPageMock // Use centralized mock
        .filter((p: Step7Question) => {
          if (p.appliesTo && !(p.appliesTo.includes(reportType) || p.appliesTo.includes('TODOS'))) {
            return false
          }
          // Similar to defaultValues, consider if this specific group check is still needed.
          // if (
          //   p.group === '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
          // ) {
          //   return reportType === 'INFORME_FINAL_V1';
          // }
          return true
        })
        .map((p: Step7Question) => ({ idPregunta: p.questionId, respuesta: '' })) // Use p.questionId
    })
  }, [reportType, formStep7Methods])

  const step2InitialData = useMemo(() => {
    return {
      totalEnrolled: step1Data?.enrolledCapacity ?? undefined,
      totalWithdrawn: 0,
      totalPassed: 0,
      totalFailed: 0
    }
  }, [step1Data?.enrolledCapacity])

  const handleSaveStep1Data = (data: Step1FormData) => {
    setStep1Data(data)
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
    setStep6Data(data) // Save step 6 data
    setCurrentStep(7)
  }

  const handleSaveStep7Data = async (currentStep7Data: Step7FormData) => {
    if (!step1Data || !step2Data || !step3Data || !step4Data || !step5Data || !step6Data) {
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
            questionGroup: 'evaluacion_general_curso', // Default group for step 5
            responseType: 'TEXT' as const,
            response: r.respuesta || undefined
          }
        }),
        ...step6Data.respuestasMultiples.map((r) => {
          // Assuming r.idPregunta is 'herramientas_tec' or similar for the main tool selection
          const questionDetails = step6QuestionsPageMock.find(
            (p) => p.questionId === r.idPregunta || p.questionId === 'herramientas_utilizadas'
          )
          return {
            questionId: r.idPregunta,
            question: questionDetails?.question || r.idPregunta,
            questionGroup: questionDetails?.questionGroup || 'herramientas',
            responseType: 'SELECCION_MULTIPLE' as const,
            multipleResponse: r.respuestasSeleccionadas,
            options: questionDetails?.options?.map((op) => ({ value: op.value, label: op.label, category: op.category })) || []
          }
        }),
        ...(step6Data.otrasHerramientas
          ? [
              {
                questionId: 'otras_herramientas_utilizadas', // Specific ID for this text field
                question:
                  step6QuestionsPageMock.find((q) => q.questionId === 'otras_herramientas')?.question ||
                  'Otras herramientas utilizadas (opcional)',
                questionGroup: 'herramientas',
                responseType: 'TEXT' as const,
                response: step6Data.otrasHerramientas
              }
            ]
          : []),
        ...currentStep7Data.respuestasRadio.map((r) => {
          // Now step7QuestionsPageMock items are Step7Question
          const questionDetails = step7QuestionsPageMock.find((p) => p.questionId === r.idPregunta)

          // Use questionDetails.responseType which is already one of the FE literal types
          const resolvedResponseType = questionDetails?.responseType || 'SELECCION_UNICA'

          return {
            questionId: r.idPregunta,
            question: questionDetails?.question || r.idPregunta,
            questionGroup: questionDetails?.group || 'percepcion_calidad', // Use questionDetails.group
            responseType: resolvedResponseType, // Already a literal type
            response: r.respuesta || undefined,
            options: questionDetails?.options?.map((op) => ({ value: op.value, label: op.label, category: op.category })) || []
          } as FinalReportEvaluationFE // Add type assertion
        })
      ]
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

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  return (
    <div className="container mx-auto flex flex-col h-screen max-h-screen overflow-hidden">
      <ReportPageHeader
        pageTitle="Nuevo Informe Final" // User-facing
        pageDescription="Complete todos los pasos para crear el informe final del curso" // User-facing
        stepLabels={STEP_LABELS_SPANISH} // User-facing
        currentStep={currentStep}
      />
      <main className="flex-grow flex flex-col items-center overflow-hidden pt-2 pb-6 md:pt-4">
        <Card className="shadow-lg border-border/50 w-full max-w-5xl flex flex-col flex-grow overflow-hidden rounded-lg">
          <CardContent className="flex-grow overflow-y-auto p-0">
            {currentStep === 1 && (
              <Step1Form
                formMethods={formStep1Methods}
                onSaveAndNext={handleSaveStep1Data}
                totalSteps={TOTAL_STEPS}
                onCancel={() => router.push('/final-reports')}
              />
            )}
            {currentStep === 2 && (
              <Step2Form
                formMethods={formStep2Methods}
                onSaveAndNext={handleSaveStep2Data}
                onPrevious={handlePreviousStep}
                totalSteps={TOTAL_STEPS}
                initialData={step2InitialData}
                isEditing={false} // For new reports, it's not editing existing data
              />
            )}
            {currentStep === 3 && (
              <Step3Form
                formMethods={formStep3Methods}
                onSaveAndNext={handleSaveStep3Data}
                onPrevious={handlePreviousStep}
                totalSteps={TOTAL_STEPS}
                reportType={reportType} // Pass translated reportType
              />
            )}
            {currentStep === 4 && (
              <Step4Form
                formMethods={formStep4Methods}
                onSaveAndNext={handleSaveStep4Data}
                onPrevious={handlePreviousStep}
                totalSteps={TOTAL_STEPS}
              />
            )}
            {currentStep === 5 && (
              <Step5Form
                formMethods={formStep5Methods}
                onSaveAndNext={handleSaveStep5Data}
                onPrevious={handlePreviousStep}
                totalSteps={TOTAL_STEPS}
              />
            )}
            {currentStep === 6 && (
              <Step6Form
                formMethods={formStep6Methods}
                onSaveAndNext={handleSaveStep6Data}
                onPrevious={handlePreviousStep}
                totalSteps={TOTAL_STEPS}
              />
            )}
            {currentStep === 7 && (
              <Step7Form
                formMethods={formStep7Methods}
                onSaveAndNext={handleSaveStep7Data}
                onPrevious={handlePreviousStep}
                totalSteps={TOTAL_STEPS}
                reportType={reportType} // Pass translated reportType
                isSubmitting={createFinalReportMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

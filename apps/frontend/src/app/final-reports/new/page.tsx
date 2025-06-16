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
import { Step7Form, step7Schema, Step7FormData } from '@/modules/final-reports/components/form-step7'
import { ReportPageHeader } from '@/modules/final-reports/components/report-page-header'

// Import service hook and DTO type
import { useCreateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import type { CreateFinalReportDto, ReportType, FinalReportEvaluationFE } from '@/modules/final-reports/types/final-reports.types'
import useDevStore from '@/store/devStore'

const TOTAL_STEPS = 7
const STEP_LABELS_SPANISH = ['Información', 'Estadísticas', 'Salvaguarda', 'Ajustes', 'Evaluación', 'Herramientas', 'Calidad']

const MAIN_TOOLS_QUESTION_ID = 'herramientas_utilizadas'
const OTHER_TOOLS_QUESTION_ID = 'otras_herramientas_utilizadas'

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
  const [reportType] = useState<ReportType>('INFORME_FINAL_V1')

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
    defaultValues: { respuestasRadio: [] }
  })

  useEffect(() => {
    if (step1Data) formStep1Methods.reset(step1Data)
  }, [step1Data, formStep1Methods])

  useEffect(() => {
    if (step2Data) {
      formStep2Methods.reset(step2Data)
    } else if (step1Data?.enrolledCapacity !== undefined) {
      formStep2Methods.reset({
        totalEnrolled: step1Data.enrolledCapacity,
        totalWithdrawn: 0,
        totalPassed: 0,
        totalFailed: 0
      })
    } else {
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
        respuestas: []
      })
    }
  }, [step5Data, formStep5Methods])

  useEffect(() => {
    if (step6Data) {
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
      formStep7Methods.reset(step7Data)
    } else {
      formStep7Methods.reset({
        respuestasRadio: []
      })
    }
  }, [reportType, step7Data, formStep7Methods])

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
    setStep7Data(currentStep7DataFromForm)

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
      evaluation: [] as FinalReportEvaluationFE[]
    }
    console.log('Final Report Payload to Send:', JSON.stringify(finalReportPayload, null, 2))
    try {
      await createFinalReportMutation.mutateAsync(finalReportPayload)
      router.push('/final-reports')
    } catch (error) {
      console.error('Explicit error trying to create report in page.tsx:', error)
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
        console.warn(`[NewPage] Attempted to save data for unknown step: ${step}`)
    }
  }

  const handlePreviousStep = (currentStepData?: any) => {
    if (currentStepData && currentStep > 1) {
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
        backButton={{ href: '/final-reports', text: 'Volver a la Lista de Informes' }}
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
                initialData={step1Data}
                isEditing={false}
              />
            )}
            {currentStep === 2 && (
              <Step2Form
                formMethods={formStep2Methods}
                onSaveAndNext={handleSaveStep2Data}
                onPrevious={(data) => handlePreviousStep(data)}
                totalSteps={TOTAL_STEPS}
                initialData={step2Data}
                isEditing={false}
              />
            )}
            {currentStep === 3 && (
              <Step3Form
                formMethods={formStep3Methods}
                onSaveAndNext={handleSaveStep3Data}
                onPrevious={(data) => handlePreviousStep(data)}
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
                onPrevious={(data) => handlePreviousStep(data)}
                totalSteps={TOTAL_STEPS}
                initialData={step4Data}
                isEditing={false}
              />
            )}
            {currentStep === 5 && (
              <Step5Form
                formMethods={formStep5Methods}
                onSaveAndNext={handleSaveStep5Data}
                onPrevious={(data) => handlePreviousStep(data)}
                totalSteps={TOTAL_STEPS}
                initialData={step5Data}
                isEditing={false}
              />
            )}
            {currentStep === 6 && (
              <Step6Form
                formMethods={formStep6Methods}
                onSaveAndNext={handleSaveStep6Data}
                onPrevious={(data) => handlePreviousStep(data)}
                totalSteps={TOTAL_STEPS}
                initialData={step6Data}
                isEditing={false}
              />
            )}
            {currentStep === 7 && (
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

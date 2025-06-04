'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// Button, CheckCircle, ArrowLeft are now part of ReportPageHeader or not directly used here
import { Card, CardContent } from '@una-gc/ui/components/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Importar los componentes de los pasos y sus esquemas/tipos
import { Step1Form, step1Schema, Step1FormData } from '@/modules/final-reports/components/form-step1'
import { Step2Form, step2Schema, Step2FormData } from '@/modules/final-reports/components/form-step2'
import { Step3Form, step3Schema, Step3FormData } from '@/modules/final-reports/components/form-step3'
import { Step4Form, step4Schema, Step4FormData } from '@/modules/final-reports/components/form-step4'
import { Step5Form, step5Schema, Step5FormData } from '@/modules/final-reports/components/form-step5' // Add Step5Form to this import
// Ensure you import the correct mock data for Step 5
import { preguntasPaso5Mock } from '@/modules/final-reports/mocks/questions'
import { Step6Form, step6Schema, Step6FormData } from '@/modules/final-reports/components/form-step6' // Add Step6Form to this import
import { Step7Form, step7Schema, Step7FormData, preguntasPaso7FormMock } from '@/modules/final-reports/components/form-step7'
import { ReportPageHeader } from '@/modules/final-reports/components/report-page-header' // Import the new header

// Importar el hook de creación y el tipo DTO
import { useCreateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import type { CreateFinalReportDto, TipoInforme } from '@/modules/final-reports/types/final-reports.types' // Added TipoInforme
import useDevStore from '@/store/devStore'

const TOTAL_STEPS = 7
const STEP_LABELS = ['Información', 'Estadísticas', 'Salvaguarda', 'Ajustes', 'Evaluación', 'Herramientas', 'Calidad']
// const TIPO_INFORME_ACTUAL = 'INFORME_FINAL_V1' // This will be managed by tipoInforme state

export default function NewFinalReportPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Estados para almacenar los datos de cada paso
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null)
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null)
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null)
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null)
  const [step6Data, setStep6Data] = useState<Step6FormData | null>(null)
  const [tipoInforme, setTipoInforme] = useState<TipoInforme>('INFORME_FINAL_V1')

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
    defaultValues: { respuestas: preguntasPaso5Mock.map((p) => ({ idPregunta: p.idPregunta, respuesta: '' })) }
  })
  const formStep6Methods = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      respuestasMultiples: [{ idPregunta: 'herramientas_tec', respuestasSeleccionadas: [] }],
      otrasHerramientas: ''
    }
  })
  const formStep7Methods = useForm<Step7FormData>({
    resolver: zodResolver(step7Schema),
    defaultValues: {
      respuestasRadio: preguntasPaso7FormMock
        .filter((p) => {
          if (
            p.grupo_pregunta === '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
          ) {
            return tipoInforme === 'INFORME_FINAL_V1' // Use state here
          }
          return true
        })
        .map((p) => ({ idPregunta: p.idPregunta, respuesta: '' }))
    }
  })

  // Update default values for step 7 when tipoInforme changes
  useEffect(() => {
    formStep7Methods.reset({
      respuestasRadio: preguntasPaso7FormMock
        .filter((p) => {
          if (
            p.grupo_pregunta === '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
          ) {
            return tipoInforme === 'INFORME_FINAL_V1'
          }
          return true
        })
        .map((p) => ({ idPregunta: p.idPregunta, respuesta: '' }))
    })
  }, [tipoInforme, formStep7Methods])

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
    setStep6Data(data)
    setCurrentStep(7)
  }

  const handleSaveStep7Data = async (step7CurrentData: Step7FormData) => {
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
      version: tipoInforme === 'INFORME_FINAL_V1' ? 1 : 2, // Assuming version mapping
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
          const pO = preguntasPaso5FormMock.find((p) => p.idPregunta === r.idPregunta)
          return {
            questionId: r.idPregunta,
            question: pO?.pregunta || '',
            questionGroup: pO?.grupo_pregunta || '',
            responseType: pO?.tipo_respuesta || 'TEXTO_LARGO',
            response: r.respuesta || undefined,
            multipleResponse: [],
            options: []
          }
        }),
        ...step6Data.respuestasMultiples.map((r) => {
          const pO = preguntasPaso6FormMock.find((p) => p.idPregunta === r.idPregunta)
          return {
            questionId: r.idPregunta,
            question: pO?.pregunta || '',
            questionGroup: pO?.grupo_pregunta || '',
            responseType: 'SELECCION_MULTIPLE',
            multipleResponse: r.respuestasSeleccionadas,
            options: pO?.opciones.map((op) => ({ value: op.value, label: op.label, category: op.category })) || [],
            response: undefined,
            otherResponse:
              step6Data.otrasHerramientas && r.idPregunta === 'herramientas_tec' ? step6Data.otrasHerramientas : undefined
          }
        }),
        ...(step6Data.otrasHerramientas
          ? [
              {
                // Ensure this is only added if not already part of the above
                questionId: 'otras_herramientas_utilizadas',
                question: 'Otras herramientas o metodologías utilizadas',
                questionGroup: 'Recursos Adicionales',
                responseType: 'TEXTO_ADICIONAL',
                response: step6Data.otrasHerramientas,
                multipleResponse: [],
                options: []
              }
            ]
          : []),
        ...step7CurrentData.respuestasRadio.map((r) => {
          const pO = preguntasPaso7FormMock.find((p) => p.idPregunta === r.idPregunta)
          return {
            questionId: r.idPregunta,
            question: pO?.pregunta || '',
            questionGroup: pO?.grupo_pregunta || '',
            responseType: pO?.tipo_respuesta || 'SELECCION_UNICA',
            response: r.respuesta || undefined,
            multipleResponse: [],
            options: pO?.opciones.map((op) => ({ value: op.value, label: op.label, category: 'General' })) || []
          }
        })
      ]
    }
    console.log('Payload del Informe Final a Enviar:', JSON.stringify(finalReportPayload, null, 2))
    try {
      await createFinalReportMutation.mutateAsync(finalReportPayload)
      router.push('/final-reports')
    } catch (error) {
      console.error('Error explícito al intentar crear el informe en page.tsx:', error)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  return (
    <div className="container mx-auto flex flex-col h-screen max-h-screen overflow-hidden">
      {' '}
      {/* Full screen, no body scroll */}
      <ReportPageHeader
        pageTitle="Nuevo Informe Final"
        pageDescription="Complete todos los pasos para crear el informe final del curso"
        stepLabels={STEP_LABELS}
        currentStep={currentStep}
      />
      {/* py-4 or similar can be added to main if more space is desired below header and above card */}
      <main className="flex-grow flex flex-col items-center overflow-hidden pt-2 pb-6 md:pt-4">
        <Card className="shadow-lg border-border/50 w-full max-w-5xl flex flex-col flex-grow overflow-hidden rounded-lg">
          <CardContent className="flex-grow overflow-y-auto p-0">
            {' '}
            {/* Scrollable area, no padding here */}
            {/* Step forms will render here and should have their own internal padding */}
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
                isEditing={false}
              />
            )}
            {currentStep === 3 && (
              <Step3Form
                formMethods={formStep3Methods}
                onSaveAndNext={handleSaveStep3Data}
                onPrevious={handlePreviousStep}
                totalSteps={TOTAL_STEPS}
                tipoInforme={tipoInforme}
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
                tipoInforme={tipoInforme}
                isSubmitting={createFinalReportMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

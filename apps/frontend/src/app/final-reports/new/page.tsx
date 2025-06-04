'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react' // Added useMemo
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

// Importar los componentes de los pasos y sus esquemas/tipos
import { Step1Form, step1Schema, Step1FormData } from '@/modules/final-reports/components/form-step1'
import { Step2Form, step2Schema, Step2FormData } from '@/modules/final-reports/components/form-step2'
import { Step3Form, step3Schema, Step3FormData } from '@/modules/final-reports/components/form-step3'
import { Step4Form, step4Schema, Step4FormData } from '@/modules/final-reports/components/form-step4'
import { Step5Form, step5Schema, Step5FormData, preguntasPaso5FormMock } from '@/modules/final-reports/components/form-step5'
import { Step6Form, step6Schema, Step6FormData, preguntasPaso6FormMock } from '@/modules/final-reports/components/form-step6'
import { Step7Form, step7Schema, Step7FormData, preguntasPaso7FormMock } from '@/modules/final-reports/components/form-step7'

// Importar el hook de creación y el tipo DTO
import { useCreateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import type { CreateFinalReportDto } from '@/modules/final-reports/types/final-reports.types'
import useDevStore from '@/store/devStore' // Para obtener el professorId (placeholder)

const TOTAL_STEPS = 7
const STEP_LABELS = ['Información ', 'Estadísticas', 'Salvaguarda', 'Ajustes', 'Evaluación', 'Herramientas', 'Calidad']
const TIPO_INFORME_ACTUAL = 'INFORME_FINAL_V1' // O obtener dinámicamente

export default function NewFinalReportPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Estados para almacenar los datos de cada paso
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null) // Re-added or uncommented
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null)
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null)
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null)
  const [step6Data, setStep6Data] = useState<Step6FormData | null>(null)
  // No es necesario step7Data en el estado si se envía directamente
  const [tipoInforme, setTipoInforme] = useState<TipoInforme>('INFORME_FINAL_V1') // Default or from Step 1

  // Hook para la mutación de creación
  const createFinalReportMutation = useCreateFinalReport()
  const currentProfessorId = useDevStore((state) => state.mockProfessorId) // Placeholder

  // Métodos de formulario para cada paso
  const formStep1Methods = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      nrc: '',
      courseName: '',
      groupNumber: '',
      professorName: '',
      courseCode: '',
      groupLevel: '',
      enrolledCapacity: undefined // <--- USANDO enrolledCapacity
    }
  })

  // Inicializa formStep2Methods sin un totalEnrolled específico, o con undefined
  // ya que se establecerá dinámicamente.
  const formStep2Methods = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      // totalEnrolled: 0, // <--- ELIMINAR O CAMBIAR A UNDEFINED
      totalEnrolled: undefined,
      totalWithdrawn: 0, // Puedes mantener estos si quieres que empiecen en 0
      totalPassed: 0,
      totalFailed: 0
    }
  })

  const formStep3Methods = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      salvaguardaEstudiantes: []
    },
    values: step3Data ?? undefined
  })

  const formStep4Methods = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      ajustesEstudiantes: []
    },
    values: step4Data ?? undefined
  })

  const formStep5Methods = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      respuestas: preguntasPaso5FormMock.map((p) => ({
        idPregunta: p.idPregunta,
        respuesta: ''
      }))
    },
    values: step5Data ?? undefined
  })

  const formStep6Methods = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      respuestasMultiples: [
        // Initialize with one entry for the tools question
        {
          idPregunta: 'herramientas_tec', // Matches the idPregunta in preguntasPaso6FormMock
          respuestasSeleccionadas: []
        }
      ],
      otrasHerramientas: ''
    }
    // Removed: values: step6Data ?? undefined // The component's useEffect now handles initialization via reset
  })

  const formStep7Methods = useForm<Step7FormData>({
    resolver: zodResolver(step7Schema),
    defaultValues: {
      respuestasRadio: preguntasPaso7FormMock
        .filter((p) => {
          if (
            p.grupo_pregunta === '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
          ) {
            return TIPO_INFORME_ACTUAL === 'INFORME_FINAL_V1'
          }
          return true
        })
        .map((p) => ({
          idPregunta: p.idPregunta,
          respuesta: ''
        }))
    }
    // values: step7Data ?? undefined // <--- ELIMINAR ESTA LÍNEA
  })

  // Memoize initialData for Step2Form
  const step2InitialData = useMemo(() => {
    return {
      totalEnrolled: step1Data?.enrolledCapacity ?? undefined,
      totalWithdrawn: 0, // Or load from a persisted state if available
      totalPassed: 0, // Or load from a persisted state if available
      totalFailed: 0 // Or load from a persisted state if available
    }
  }, [step1Data?.enrolledCapacity]) // Dependency: only re-create if enrolledCapacity changes

  // Handlers para cada paso
  const handleSaveStep1Data = (data: Step1FormData) => {
    console.log('Step 1 Data Saved (page.tsx):', data)
    setStep1Data(data)
    // El useEffect de abajo se encargará de actualizar formStep2Methods
    setCurrentStep(2)
  }

  const handleSaveStep2Data = (data: Step2FormData) => {
    setStep2Data(data) // This will now work
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

    // !!! IMPORTANTE: Obtener el ID del profesor real desde la sesión/autenticación !!!
    // El currentProfessorId de useDevStore es un placeholder.
    const professorIdToUse = currentProfessorId // Reemplazar con la lógica real
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
          const preguntaOriginal = preguntasPaso5FormMock.find((p) => p.idPregunta === r.idPregunta)
          return {
            questionId: r.idPregunta,
            question: preguntaOriginal?.pregunta || 'Pregunta no encontrada',
            questionGroup: preguntaOriginal?.grupo_pregunta || 'General',
            responseType: preguntaOriginal?.tipo_respuesta || 'TEXTO_LARGO',
            response: r.respuesta || undefined, // <--- CORRECCIÓN AQUÍ (si r.respuesta puede ser null o string vacío)
            multipleResponse: [],
            options: [],
            otherResponse: undefined
          }
        }),
        ...step6Data.respuestasMultiples.map((r) => {
          const preguntaOriginal = preguntasPaso6FormMock.find((p) => p.idPregunta === r.idPregunta)
          return {
            questionId: r.idPregunta,
            question: preguntaOriginal?.pregunta || 'Pregunta no encontrada',
            questionGroup: preguntaOriginal?.grupo_pregunta || 'General',
            responseType: 'SELECCION_MULTIPLE',
            multipleResponse: r.respuestasSeleccionadas,
            options: preguntaOriginal?.opciones.map((op) => ({ value: op.value, label: op.label, category: op.category })) || [],
            response: undefined, // <--- CORRECCIÓN AQUÍ
            otherResponse: undefined
          }
        }),
        ...(step6Data.otrasHerramientas
          ? [
              {
                questionId: 'otras_herramientas_utilizadas',
                question: 'Otras herramientas o metodologías utilizadas no listadas anteriormente:',
                questionGroup: 'Recursos Adicionales',
                responseType: 'TEXTO_ADICIONAL',
                response: step6Data.otrasHerramientas, // Esto es string, compatible con string | undefined
                multipleResponse: [],
                options: [],
                otherResponse: step6Data.otrasHerramientas // Esto es string, compatible con string | undefined
              }
            ]
          : []),
        ...step7CurrentData.respuestasRadio.map((r) => {
          const preguntaOriginal = preguntasPaso7FormMock.find((p) => p.idPregunta === r.idPregunta)
          return {
            questionId: r.idPregunta,
            question: preguntaOriginal?.pregunta || 'Pregunta no encontrada',
            questionGroup: preguntaOriginal?.grupo_pregunta || 'General',
            responseType: preguntaOriginal?.tipo_respuesta || 'SELECCION_UNICA',
            response: r.respuesta || undefined,
            multipleResponse: [],
            options:
              preguntaOriginal?.opciones.map((op) => ({
                value: op.value,
                label: op.label,
                category: 'General' // <--- CORREGIDO: Asignar directamente 'General'
              })) || [],
            otherResponse: undefined
          }
        })
      ]
    }

    console.log('Payload del Informe Final a Enviar:', JSON.stringify(finalReportPayload, null, 2)) // Log para depuración

    try {
      const createdReport = await createFinalReportMutation.mutateAsync(finalReportPayload)
      // El hook genérico ya maneja el toast de éxito y la invalidación de queries.
      // `createdReport` es el informe devuelto por el backend.
      console.log('Informe creado exitosamente:', createdReport)
      router.push('/final-reports') // Redirigir a la lista de informes
    } catch (error) {
      // El hook genérico ya maneja el toast de error.
      console.error('Error explícito al intentar crear el informe en page.tsx:', error)
      // Puedes añadir lógica adicional aquí si es necesario.
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }
  const totalEnrolledFromStep1 = step1Data?.enrolledCapacity

  return (
    <div className="container mx-auto py-16 max-w-7xl min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
      <div className="w-full mb-8 text-left">
        <h1 className="text-2xl font-bold">Nuevo Informe Final</h1>
        <p className="text-muted-foreground text-sm">Complete todos los pasos para crear el informe final del curso</p>
      </div>

      {/* Indicador de Pasos */}
      <div className="mb-8 w-full">
        <div className="flex justify-between items-center px-4">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = index + 1
            const isCompleted = currentStep > stepNumber
            const isCurrent = currentStep === stepNumber
            return (
              <div key={stepNumber} className="flex items-center flex-1">
                <div
                  className={`h-16 rounded-full flex items-center justify-center px-4 py-2 text-xs font-medium transition-all duration-300 text-center leading-tight min-w-[120px] max-w-[140px] mx-1 ${isCompleted ? 'bg-primary text-primary-foreground shadow-md' : ''} ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-lg font-semibold' : ''} ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground border border-muted-foreground/30' : ''}`}
                >
                  {isCompleted ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </div>
                  ) : (
                    <span className="truncate">{label}</span>
                  )}
                </div>
                {index < STEP_LABELS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full min-w-[20px] ${currentStep > stepNumber ? 'bg-primary' : 'bg-muted'}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Card className="shadow-sm border-border/40 w-full">
        <CardContent className="p-0">
          {currentStep === 1 && (
            <Step1Form
              formMethods={formStep1Methods}
              onSaveAndNext={handleSaveStep1Data}
              totalSteps={TOTAL_STEPS}
              onCancel={() => router.push('/final-reports')} // Añadir esta prop
            />
          )}
          {currentStep === 2 && (
            <Step2Form
              formMethods={formStep2Methods}
              onSaveAndNext={handleSaveStep2Data}
              onPrevious={handlePreviousStep}
              totalSteps={TOTAL_STEPS}
              initialData={step2InitialData} // Pass the memoized object
              isEditing={false}
            />
          )}
          {currentStep === 3 && (
            <Step3Form
              formMethods={formStep3Methods}
              onSaveAndNext={handleSaveStep3Data}
              onPrevious={handlePreviousStep}
              totalSteps={TOTAL_STEPS}
              tipoInforme={TIPO_INFORME_ACTUAL}
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
              tipoInforme={TIPO_INFORME_ACTUAL}
              isSubmitting={createFinalReportMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

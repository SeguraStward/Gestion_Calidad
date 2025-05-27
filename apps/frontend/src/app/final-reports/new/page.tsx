'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Progress } from '@una-gc/ui/components/progress'
import { CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

// Importar los componentes de los pasos y sus esquemas/tipos
import { Step1Form, step1Schema, Step1FormData } from '@/modules/final-reports/components/form-step1'
import { Step2Form, step2Schema, Step2FormData } from '@/modules/final-reports/components/form-step2'
import { Step3Form, step3Schema, Step3FormData } from '@/modules/final-reports/components/form-step3'
import { Step4Form, step4Schema, Step4FormData } from '@/modules/final-reports/components/form-step4'
import { Step5Form, step5Schema, Step5FormData } from '@/modules/final-reports/components/form-step5'
import { Step6Form, step6Schema, Step6FormData } from '@/modules/final-reports/components/form-step6'
import { Step7Form, step7Schema, Step7FormData } from '@/modules/final-reports/components/form-step7'

const TOTAL_STEPS = 7

const STEP_LABELS = ['Información ', 'Estadísticas', 'Salvaguarda', 'Ajustes', 'Evaluación', 'Herramientas', 'Calidad']

// Mock de preguntas para el Paso 5
const preguntasPaso5Mock = [
  {
    idPregunta: 'p1',
    pregunta: '¿Cuáles fueron las principales fortalezas observadas en el desarrollo del curso?',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Desempeño General'
  },
  {
    idPregunta: 'p2',
    pregunta: '¿Cuáles fueron las principales debilidades o áreas de mejora identificadas?',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Desempeño General'
  },
  {
    idPregunta: 'p3',
    pregunta: '¿Se cumplieron los objetivos de aprendizaje propuestos? Justifique.',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Objetivos de Aprendizaje'
  },
  {
    idPregunta: 'p4',
    pregunta: '¿Qué estrategias metodológicas resultaron más efectivas?',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Metodología'
  },
  {
    idPregunta: 'p5',
    pregunta: '¿Qué ajustes se realizaron durante el curso y cuál fue su impacto?',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Metodología'
  },
  {
    idPregunta: 'p6',
    pregunta: '¿Cómo fue la participación y el compromiso de los estudiantes?',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Participación Estudiantil'
  },
  {
    idPregunta: 'p7',
    pregunta: 'Sugerencias para futuras iteraciones de este curso.',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Sugerencias'
  }
]

// Mock de preguntas para el Paso 6
const preguntasPaso6PageMock = [
  {
    idPregunta: 'herramientas_tec',
    pregunta: '¿Qué herramientas tecnológicas utilizó principalmente durante el curso?'
  }
]

// Mock de preguntas para el Paso 7
const preguntasPaso7PageMock = [
  {
    idPregunta: 'transicion_p1',
    grupo_pregunta: '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
  },
  {
    idPregunta: 'transicion_p2',
    grupo_pregunta: '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
  },
  {
    idPregunta: 'desempeno_p1',
    grupo_pregunta: '¿Cómo percibe el desempeño de los estudiantes con respecto a los siguientes aspectos?'
  },
  {
    idPregunta: 'desempeno_p2',
    grupo_pregunta: '¿Cómo percibe el desempeño de los estudiantes con respecto a los siguientes aspectos?'
  }
]

const TIPO_INFORME_ACTUAL = 'INFORME_FINAL_V1'

export default function NewFinalReportPage() {
  const [currentStep, setCurrentStep] = useState(1)

  // Estados para cada paso
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null)
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null)
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null)
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null)
  const [step6Data, setStep6Data] = useState<Step6FormData | null>(null)
  const [step7Data, setStep7Data] = useState<Step7FormData | null>(null)

  // Form methods para cada paso
  const formStep1Methods = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      nrc: '',
      curso: '',
      profesor: '',
      grupo: '',
      campus: '',
      fecha: '',
      cupoMatricula: 0
    },
    values: step1Data ?? undefined
  })

  const formStep2Methods = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      totalMatriculados: 0,
      totalRetirados: 0,
      totalAprobados: 0,
      totalReprobados: 0
    },
    values: step2Data ?? undefined
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
      respuestas: preguntasPaso5Mock.map((p) => ({
        idPregunta: p.idPregunta,
        respuesta: ''
      }))
    },
    values: step5Data ?? undefined
  })

  const formStep6Methods = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      respuestasMultiples: preguntasPaso6PageMock.map((p) => ({
        idPregunta: p.idPregunta,
        respuestasSeleccionadas: []
      })),
      otrasHerramientas: ''
    },
    values: step6Data ?? undefined
  })

  const formStep7Methods = useForm<Step7FormData>({
    resolver: zodResolver(step7Schema),
    defaultValues: {
      respuestasRadio: preguntasPaso7PageMock
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
    },
    values: step7Data ?? undefined
  })

  // Handlers para cada paso
  const handleSaveStep1Data = (data: Step1FormData) => {
    setStep1Data(data)
    if (data.cupoMatricula !== undefined) {
      setStep2Data((prev) => ({
        ...(prev || {
          totalMatriculados: 0,
          totalRetirados: 0,
          totalAprobados: 0,
          totalReprobados: 0
        }),
        totalMatriculados: data.cupoMatricula as number
      }))
    }
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

  const handleSaveStep7Data = (data: Step7FormData) => {
    console.log('Paso 7 Data Guardada:', data)
    setStep7Data(data)

    // Aquí enviarías todos los datos al backend
    console.log('TODOS LOS DATOS DEL INFORME:', {
      step1: step1Data,
      step2: step2Data,
      step3: step3Data,
      step4: step4Data,
      step5: step5Data,
      step6: step6Data,
      step7: data
    })

    toast.success('Informe Final completado y guardado (simulado).')
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  return (
    <div className="container mx-auto py-4 max-w-7xl min-h-screen">
      {/* Header más compacto */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nuevo Informe Final</h1>
        <p className="text-muted-foreground text-sm">Complete todos los pasos para crear el informe final del curso</p>
      </div>

      {/* Steps horizontales - COMPACTOS CON LABELS DENTRO */}
      <div className="mb-6">
        <div className="flex justify-between items-center px-4">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = index + 1
            const isCompleted = currentStep > stepNumber
            const isCurrent = currentStep === stepNumber
            const isUpcoming = currentStep < stepNumber

            return (
              <div key={stepNumber} className="flex items-center flex-1">
                {/* Círculo del paso con label dentro */}
                <div
                  className={`
                  h-16 rounded-full flex items-center justify-center px-4 py-2 text-xs font-medium transition-all duration-300 text-center leading-tight min-w-[120px] max-w-[140px] mx-1
                  ${isCompleted ? 'bg-primary text-primary-foreground shadow-md' : ''}
                  ${isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-lg font-semibold' : ''}
                  ${isUpcoming ? 'bg-muted text-muted-foreground border border-muted-foreground/30' : ''}
                `}
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

                {/* Línea conectora */}
                {index < STEP_LABELS.length - 1 && (
                  <div
                    className={`
                    flex-1 h-0.5 mx-2 rounded-full min-w-[20px]
                    ${currentStep > stepNumber ? 'bg-primary' : 'bg-muted'}
                  `}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Card del contenido del step - SIN PADDING EXTRA */}
      <Card className="shadow-sm border-border/40 flex-1">
        <CardContent className="p-0 h-full">
          {currentStep === 1 && (
            <Step1Form formMethods={formStep1Methods} onSaveAndNext={handleSaveStep1Data} totalSteps={TOTAL_STEPS} />
          )}
          {currentStep === 2 && (
            <Step2Form
              formMethods={formStep2Methods}
              onSaveAndNext={handleSaveStep2Data}
              onPrevious={handlePreviousStep}
              totalSteps={TOTAL_STEPS}
            />
          )}
          {currentStep === 3 && (
            <Step3Form
              formMethods={formStep3Methods}
              onSaveAndNext={handleSaveStep3Data}
              onPrevious={handlePreviousStep}
              totalSteps={TOTAL_STEPS}
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
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

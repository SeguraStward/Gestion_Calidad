'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@una-gc/ui/components/button'
import { Card } from '@una-gc/ui/components/card'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'

// Importar los componentes de CREACIÓN para los pasos 1-4
import { Step1Form, Step1FormData, step1Schema } from '@/modules/final-reports/components/form-step1'
import { Step2Form, Step2FormData, step2Schema } from '@/modules/final-reports/components/form-step2'
import { Step3Form, Step3FormData, step3Schema } from '@/modules/final-reports/components/form-step3'
import { Step4Form, Step4FormData, step4Schema } from '@/modules/final-reports/components/form-step4'

// Importar los esquemas y tipos de datos para los pasos 5-7 (los componentes de edición se crearán)
import { Step5FormData, step5Schema } from '@/modules/final-reports/components/form-step5' // Schema y Data Type
import { Step6FormData, step6Schema } from '@/modules/final-reports/components/form-step6' // Schema y Data Type
import { Step7FormData, step7Schema } from '@/modules/final-reports/components/form-step7' // Schema y Data Type

// Importaremos los componentes de EDICIÓN para los pasos 5, 6 y 7 a medida que los creemos
import { Step5EditForm } from '@/modules/final-reports/components/form-step5-edit'
import { Step6EditForm } from '@/modules/final-reports/components/form-step6-edit'
import { Step7EditForm } from '@/modules/final-reports/components/form-step7-edit'

const TOTAL_STEPS = 7

// Mocks de preguntas (idealmente vendrían de una fuente compartida o API)
// Estos mocks deben ser consistentes con los que usarán los componentes form-stepX-edit.tsx
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
const preguntasPaso6PageMock = [{ idPregunta: 'herramientas_tec' }]
const preguntasPaso7PageMock = [
  { idPregunta: 'transicion_p1' },
  { idPregunta: 'transicion_p2' },
  { idPregunta: 'desempeno_p1' },
  { idPregunta: 'desempeno_p2' }
]

// Simulación de datos de un informe existente
const mockExistingReportData = {
  reportId: 'informe-123',
  tipoInformeActual: 'INFORME_FINAL_V1',
  step1Data: {
    selectedCourseLoadId: 'cl1',
    nrc: '10234',
    nombreProfesor: 'Dr. Alan Turing',
    nombreAsignatura: 'Introducción a la Computación',
    codigoAsignatura: 'CS101',
    ciclo: '2024-01',
    grupoNumero: 'G1',
    nivelGrupo: 'Nivel I',
    cupoMatricula: 30
  },
  step2Data: { totalMatriculados: 30, totalRetirados: 2, totalAprobados: 25, totalReprobados: 3 },
  step3Data: {
    salvaguardaEstudiantes: [
      { id: 's1', cedula: '111', nombre: 'Estudiante Salvaguarda Uno', nota: 85, observacion: 'Buen progreso' }
    ]
  },
  step4Data: {
    ajustesEstudiantes: [
      {
        id: 'a1',
        cedula: '222',
        nombre: 'Estudiante Ajuste Uno',
        apoyo: 'Tutoría extra',
        nota: 70,
        observacion: 'Mejoró con apoyo'
      }
    ]
  },
  step5Data: {
    respuestas: preguntasPaso5Mock.map((p) => {
      // Asegurar que todas las preguntas tengan una entrada
      if (p.idPregunta === 'p1') return { idPregunta: 'p1', respuesta: 'La claridad del profesor fue una gran fortaleza.' }
      if (p.idPregunta === 'p2') return { idPregunta: 'p2', respuesta: 'Algunos temas necesitaron más ejemplos prácticos.' }
      return { idPregunta: p.idPregunta, respuesta: '' } // Respuesta vacía para las no mockeadas explícitamente
    })
  },
  step6Data: {
    respuestasMultiples: [{ idPregunta: 'herramientas_tec', respuestasSeleccionadas: ['moodle', 'teams'] }],
    otrasHerramientas: 'Se usó un foro externo para discusiones.'
  },
  step7Data: {
    respuestasRadio: [
      { idPregunta: 'transicion_p1', respuesta: 'bueno' },
      { idPregunta: 'desempeno_p1', respuesta: 'alto' }
    ]
  }
}

export default function EditFinalReportPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string // Cambiado de params.reportId a params.id para coincidir con el nombre de la carpeta [id]

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null)
  const [step2Data, setStep2Data] = useState<Step2FormData | null>(null)
  const [step3Data, setStep3Data] = useState<Step3FormData | null>(null)
  const [step4Data, setStep4Data] = useState<Step4FormData | null>(null)
  const [step5Data, setStep5Data] = useState<Step5FormData | null>(null)
  const [step6Data, setStep6Data] = useState<Step6FormData | null>(null)
  const [step7Data, setStep7Data] = useState<Step7FormData | null>(null)
  const [tipoInforme, setTipoInforme] = useState<string>(mockExistingReportData.tipoInformeActual) // Para el paso 7

  useEffect(() => {
    setIsLoading(true)
    console.log(`Cargando datos para el informe: ${reportId}`)
    // Simulación de carga de datos
    setStep1Data(mockExistingReportData.step1Data)
    setStep2Data(mockExistingReportData.step2Data)
    setStep3Data(mockExistingReportData.step3Data)
    setStep4Data(mockExistingReportData.step4Data)
    setStep5Data(mockExistingReportData.step5Data)
    setStep6Data(mockExistingReportData.step6Data)
    setStep7Data(mockExistingReportData.step7Data)
    setTipoInforme(mockExistingReportData.tipoInformeActual)
    setIsLoading(false)
  }, [reportId])

  const allStepsData: { [key: number]: any } = {
    1: step1Data,
    2: step2Data,
    3: step3Data,
    4: step4Data,
    5: step5Data,
    6: step6Data,
    7: step7Data
  }

  const formStep1Methods = useForm<Step1FormData>({ resolver: zodResolver(step1Schema), values: step1Data || undefined })
  const formStep2Methods = useForm<Step2FormData>({ resolver: zodResolver(step2Schema), values: step2Data || undefined })
  const formStep3Methods = useForm<Step3FormData>({ resolver: zodResolver(step3Schema), values: step3Data || undefined })
  const formStep4Methods = useForm<Step4FormData>({ resolver: zodResolver(step4Schema), values: step4Data || undefined })
  const formStep5Methods = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    values: step5Data || { respuestas: preguntasPaso5Mock.map((p) => ({ idPregunta: p.idPregunta, respuesta: '' })) }
  })
  const formStep6Methods = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    values: step6Data || {
      respuestasMultiples: preguntasPaso6PageMock.map((p) => ({ idPregunta: p.idPregunta, respuestasSeleccionadas: [] })),
      otrasHerramientas: ''
    }
  })
  const formStep7Methods = useForm<Step7FormData>({
    resolver: zodResolver(step7Schema),
    values: step7Data || {
      respuestasRadio: preguntasPaso7PageMock
        .filter((p) => {
          if (
            p.grupo_pregunta === '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
          ) {
            return tipoInforme === 'INFORME_FINAL_V1'
          }
          return true
        })
        .map((p) => ({ idPregunta: p.idPregunta, respuesta: '' }))
    }
  })

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
    else formStep5Methods.reset({ respuestas: preguntasPaso5Mock.map((p) => ({ idPregunta: p.idPregunta, respuesta: '' })) })
  }, [step5Data, formStep5Methods])
  useEffect(() => {
    if (step6Data) formStep6Methods.reset(step6Data)
    else
      formStep6Methods.reset({
        respuestasMultiples: preguntasPaso6PageMock.map((p) => ({ idPregunta: p.idPregunta, respuestasSeleccionadas: [] })),
        otrasHerramientas: ''
      })
  }, [step6Data, formStep6Methods])
  useEffect(() => {
    if (step7Data) formStep7Methods.reset(step7Data)
    else
      formStep7Methods.reset({
        respuestasRadio: preguntasPaso7PageMock
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
  }, [step7Data, formStep7Methods, tipoInforme])

  const handleUpdateStepData = (step: number, data: any) => {
    switch (step) {
      case 1:
        setStep1Data(data as Step1FormData)
        break
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
    }
    if (step < TOTAL_STEPS) {
      setCurrentStep(step + 1)
    } else {
      console.log('TODOS LOS DATOS DEL INFORME ACTUALIZADOS:', {
        step1: step1Data,
        step2: step2Data,
        step3: step3Data,
        step4: step4Data,
        step5: step5Data,
        step6: step6Data,
        step7: data
      })
      toast.success('Informe Final actualizado exitosamente (simulado).')
      router.push('/final-reports')
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const renderStepContent = () => {
    if (isLoading) {
      return <div className="p-6 text-center">Cargando datos del informe...</div>
    }
    switch (currentStep) {
      case 1:
        return (
          <Step1Form // Usando el componente de creación
            formMethods={formStep1Methods}
            onSaveAndNext={(data) => handleUpdateStepData(1, data)}
            totalSteps={TOTAL_STEPS}
            // El Step1Form original no tiene `reportId`, el botón de cancelar es un Link a /final-reports/new
            // Para edición, podríamos querer un botón "Cancelar Edición" que lleve a /final-reports
            // Esto requeriría una pequeña adaptación en Step1Form o manejarlo aquí.
            // Por ahora, el botón "Cancelar" de Step1Form llevará a la página de nuevo informe.
          />
        )
      case 2:
        return (
          <Step2Form // Usando el componente de creación
            formMethods={formStep2Methods}
            onSaveAndNext={(data) => handleUpdateStepData(2, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
          />
        )
      case 3:
        return (
          <Step3Form // Usando el componente de creación
            formMethods={formStep3Methods}
            onSaveAndNext={(data) => handleUpdateStepData(3, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
            // Step3Form usa `tipoInforme` para el título, debemos pasarlo
            tipoInforme={tipoInforme}
          />
        )
      case 4:
        return (
          <Step4Form // Usando el componente de creación
            formMethods={formStep4Methods}
            onSaveAndNext={(data) => handleUpdateStepData(4, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
          />
        )
      case 5:
        return (
          <Step5EditForm
            formMethods={formStep5Methods}
            onSaveAndNext={(data) => handleUpdateStepData(5, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
          />
        )
      case 6:
        return (
          <Step6EditForm
            formMethods={formStep6Methods}
            onSaveAndNext={(data) => handleUpdateStepData(6, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
          />
        )
      case 7:
        return (
          <Step7EditForm
            formMethods={formStep7Methods}
            onSaveAndNext={(data) => handleUpdateStepData(7, data)}
            onPrevious={handlePreviousStep}
            totalSteps={TOTAL_STEPS}
            tipoInforme={tipoInforme}
          />
        )
      default:
        return <div className="p-6 text-center">Paso no encontrado.</div>
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Editar Informe Final ({reportId})</h1>
      <Card className="w-full max-w-2xl mx-auto">{renderStepContent()}</Card>
      {!isLoading && (
        <div className="mt-6 flex justify-center">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => {
            const isStepCompletedOrCurrent = step <= currentStep
            const canNavigateTo = step === currentStep || (step < currentStep && allStepsData[step])
            return (
              <button
                key={step}
                onClick={() => {
                  if (canNavigateTo && step !== currentStep) {
                    setCurrentStep(step)
                  }
                }}
                className={`h-2 w-10 mx-1 rounded-full transition-colors duration-300 ease-in-out ${isStepCompletedOrCurrent ? 'bg-primary hover:bg-primary/80' : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'} ${canNavigateTo && step !== currentStep ? 'cursor-pointer' : 'cursor-default'}`}
                title={`Paso ${step}`}
                disabled={!canNavigateTo || step === currentStep}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

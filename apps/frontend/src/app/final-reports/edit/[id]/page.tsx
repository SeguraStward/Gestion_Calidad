'use client'

import { useRouter, useParams } from 'next/navigation'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Loader2 } from 'lucide-react'
 
import { ReportPageHeader } from '@/modules/final-reports/components/report-page-header'  
 
import { Step1FormData, step1Schema, Step1Form, transformReportToStep1Data } from '@/modules/final-reports/components/form-step1'
import { Step2FormData, step2Schema, Step2Form, transformReportToStep2Data } from '@/modules/final-reports/components/form-step2'
import { Step3FormData, step3Schema, Step3Form, transformReportToStep3Data } from '@/modules/final-reports/components/form-step3'
import { Step4FormData, step4Schema, Step4Form, transformReportToStep4Data } from '@/modules/final-reports/components/form-step4'
import {
  Step5FormData,
  step5Schema,
  Step5EditForm,
  transformReportToStep5Data
} from '@/modules/final-reports/components/form-step5-edit'
import {
  Step6FormData,
  step6Schema,
  Step6EditForm,
  transformReportToStep6Data,
  OTHER_TOOLS_QUESTION_ID
} from '@/modules/final-reports/components/form-step6-edit'
import { Step7FormData, step7Schema, Step7EditForm } from '@/modules/final-reports/components/form-step7-edit'
 
import { step5QuestionsMock, step6QuestionsPageMock, step7QuestionsPageMock } from '@/modules/final-reports/mocks/questions'
 
import { useFinalReport, useUpdateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import {
  FullFinalReport,
  UpdateFinalReportDto,
  FinalReportEvaluationFE,
  ReportType
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

  const step7Responses = filteredQuestions.map((p, index) => {
    const existingEvaluation = report.evaluation?.find((e) => e.questionId === p.questionId)
    let formResponseValue = ''

    if (existingEvaluation) {
      const questionDetails = step7QuestionsPageMock.find((mockQuestion) => mockQuestion.questionId === p.questionId)
      if (questionDetails && questionDetails.options) {
        const matchedOption = questionDetails.options.find((opt) => opt.label === existingEvaluation.response)
        if (matchedOption) {
          formResponseValue = matchedOption.value
        }
      }
    }

    return {
      idPregunta: p.questionId,
      respuesta: formResponseValue
    }
  })
  return { respuestasRadio: step7Responses }
}

export default function EditFinalReportPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string

  const queryClient = useQueryClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [reportType, setReportType] = useState<ReportType>('INFORME_FINAL_V1')

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
  const formStep7Methods = useForm<Step7FormData>({ resolver: step7Schema ? zodResolver(step7Schema) : undefined })

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
      const evaluationData: FinalReportEvaluationFE[] = [
        ...(step5Data?.respuestas.map((resp) => ({
          questionId: resp.idPregunta,
          response: resp.respuesta,
          responseType: 'TEXT',
          questionGroup: step5QuestionsMock.find((q) => q.questionId === resp.idPregunta)?.group || 'evaluacion_general_curso',
          question: step5QuestionsMock.find((q) => q.questionId === resp.idPregunta)?.question || resp.idPregunta,
          options: [],
          multipleResponse: [],
          otherResponse: undefined
        })) || []),
        ...(step6Data?.respuestasMultiples?.[0]?.respuestasSeleccionadas?.length
          ? [
              {
                questionId: step6Data.respuestasMultiples[0].idPregunta,
                question:
                  step6QuestionsPageMock.find((q) => q.questionId === step6Data.respuestasMultiples[0]?.idPregunta)?.question ||
                  step6Data.respuestasMultiples[0].idPregunta,
                questionGroup:
                  step6QuestionsPageMock.find((q) => q.questionId === step6Data.respuestasMultiples[0]?.idPregunta)?.group ||
                  'herramientas',
                responseType: 'SELECCION_MULTIPLE' as const,
                response: null,
                multipleResponse: step6Data.respuestasMultiples[0].respuestasSeleccionadas,
                options: [],
                otherResponse: undefined
              }
            ]
          : []),
        ...(step6Data?.otrasHerramientas && step6Data.otrasHerramientas.trim() !== ''
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
        ...currentStep7ValuesFromForm.respuestasRadio.map((resp) => {
          const questionDetails = step7QuestionsPageMock.find((q) => q.questionId === resp.idPregunta)
          let responseLabelToSend: string | undefined = undefined

          if (questionDetails) {
            if (resp.respuesta && resp.respuesta.trim() !== '') {
              const selectedOption = questionDetails.options.find((opt) => opt.value === resp.respuesta)
              if (selectedOption) {
                responseLabelToSend = selectedOption.label
              }
            }
          }
          return {
            questionId: resp.idPregunta,
            response: responseLabelToSend,
            responseType: 'SELECCION_UNICA' as const,
            questionGroup: questionDetails?.group || 'percepcion_general',
            options:
              questionDetails?.options?.map((opt) => ({
                value: opt.value,
                label: opt.label,
                category: questionDetails?.group
              })) || [],
            question: questionDetails?.question || resp.idPregunta,
            multipleResponse: [],
            otherResponse: undefined
          }
        })
      ].map((item) => ({
        ...item,
        response: item.response === undefined ? undefined : item.response,
        multipleResponse: item.multipleResponse || [],
        options: item.options || [],
        questionGroup: item.questionGroup || 'general',
        otherResponse: item.otherResponse === undefined ? undefined : item.otherResponse
      })) as FinalReportEvaluationFE[]

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

      router.push('/final-reports')
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
            <Button onClick={() => router.push('/final-reports')} className="mt-4">
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
            <Button onClick={() => router.push('/final-reports')} className="mt-4">
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
            onCancel={() => router.push('/final-reports')}
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
              // En edición, el "SaveAndNext" del último paso usualmente es el submit final
              // o no hace nada si el submit es un botón separado.
              // Si tienes un botón "Guardar" en el Step7EditForm que llama a esto,
              // y otro "Finalizar Edición" que llama a onFinalSubmit, está bien.
            }}
            onPrevious={(data) => {
              setStep7Data(data)
              handlePreviousStep()
            }}
            totalSteps={TOTAL_STEPS}
            initialData={step7Data}
            isEditing={true}
            reportType={reportType}
            onFinalSubmit={handleSubmitAllSteps} // Este es el que realmente guarda todo
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
        backButton={{ href: '/final-reports', text: 'Volver a Informes' }}
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

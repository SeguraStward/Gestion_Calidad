'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod' // Already in page
import * as z from 'zod' // Already in page
import { Button } from '@una-gc/ui/components/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@una-gc/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
// Import the translated mock name and its types (Step7Question, ReportType)
import { step7QuestionsPageMock, Step7Question, ReportType } from '@/modules/final-reports/mocks/questions' // Was preguntasPaso7PageMock, PreguntaPaso7, TipoInforme
import { Separator } from '@una-gc/ui/components/separator'
// useRouter, CheckCircle, ArrowLeft are not directly used in this component's JSX anymore
import { Activity } from 'lucide-react' // For consistency with form-step7

// Schema for a single radio response item (ensure this is identical to form-step7.tsx if it's not already)
const respuestaRadioStep7Schema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Debe seleccionar una opción.')
})

// Schema for the entire step 7 form data (ensure this is identical)
export const step7Schema = z.object({
  respuestasRadio: z.array(respuestaRadioStep7Schema)
})

export type Step7FormData = z.infer<typeof step7Schema>

interface Step7EditFormProps {
  formMethods: UseFormReturn<Step7FormData>
  onSaveAndNext: (data: Step7FormData) => void
  onPrevious?: () => void
  totalSteps: number // Retained for consistency if step number is shown in card title
  initialData?: Step7FormData | null
  isEditing?: boolean // Should be true for this form
  reportType: ReportType // Changed from tipoInforme to reportType
}

// Helper to group questions
// Use translated Step7Question and ReportType
const groupQuestions = (questions: Step7Question[], currentReportType: ReportType) => {
  const grupos: Record<string, Step7Question[]> = {}
  // Use translated 'appliesTo' property
  const filteredQuestions = questions.filter((q) => {
    if (Array.isArray(q.appliesTo)) {
      return q.appliesTo.includes(currentReportType) || q.appliesTo.includes('TODOS')
    }
    return false
  })

  filteredQuestions.forEach((p) => {
    // Use translated 'group' property
    const groupName = p.group || 'General'
    if (!grupos[groupName]) {
      grupos[groupName] = []
    }
    grupos[groupName].push(p)
  })
  return { gruposDePreguntas: grupos, todasLasPreguntasFiltradas: filteredQuestions }
}

// Re-introduce getOptionColors from form-step7.tsx
const getOptionColors = (value: string, isSelected: boolean) => {
  if (!isSelected) {
    return 'border-border/30 bg-transparent hover:border-border/50 hover:bg-muted/20 dark:hover:bg-muted/10'
  }
  const colorMap = {
    muy_bueno: 'border-emerald-500/80 bg-emerald-500/25 dark:border-emerald-600/80 dark:bg-emerald-600/30',
    bueno: 'border-green-500/80 bg-green-500/25 dark:border-green-600/80 dark:bg-green-600/30',
    muy_alto: 'border-emerald-500/80 bg-emerald-500/25 dark:border-emerald-600/80 dark:bg-emerald-600/30',
    alto: 'border-green-500/80 bg-green-500/25 dark:border-green-600/80 dark:bg-green-600/30',
    regular: 'border-amber-500/80 bg-amber-500/25 dark:border-amber-600/80 dark:bg-amber-600/30',
    medio: 'border-yellow-500/80 bg-yellow-500/25 dark:border-yellow-600/80 dark:bg-yellow-600/30',
    deficiente: 'border-red-500/80 bg-red-500/25 dark:border-red-600/80 dark:bg-red-600/30',
    bajo: 'border-orange-500/80 bg-orange-500/25 dark:border-orange-600/80 dark:bg-orange-600/30'
  }
  return (
    colorMap[value as keyof typeof colorMap] || 'border-blue-500/80 bg-blue-500/25 dark:border-blue-600/80 dark:bg-blue-600/30'
  )
}

export function Step7EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = true,
  reportType // Changed from tipoInforme to reportType
}: Step7EditFormProps) {
  const { control, handleSubmit, reset, watch, register } = formMethods

  const { gruposDePreguntas, todasLasPreguntasFiltradas } = useMemo(
    // Use translated mock name
    () => groupQuestions(step7QuestionsPageMock, reportType), // Use reportType
    [reportType] // Use reportType
  )

  useEffect(() => {
    // Consolidate initialization logic
    const currentAnswers = initialData?.respuestasRadio || []
    const initialFormValues = todasLasPreguntasFiltradas.map((p) => {
      // Use translated 'questionId' property
      const existing = currentAnswers.find((r) => r.idPregunta === p.questionId)
      return {
        idPregunta: p.questionId, // Use translated 'questionId'
        respuesta: existing?.respuesta || ''
      }
    })
    reset({ respuestasRadio: initialFormValues })
  }, [initialData, reset, todasLasPreguntasFiltradas, reportType]) // Use reportType

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={handleSubmit(onSaveAndNext)} className="space-y-6">
          <Card>
            <CardHeader className="py-4 px-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                {' '}
                {/* Consistent: text-lg */}
                <Activity className="w-5 h-5 text-foreground/70" />
                Paso {totalSteps > 0 ? `7 de ${totalSteps}: ` : ''}
                Percepción General y Desempeño (Editando)
              </CardTitle>
              <CardDescription className="text-sm pt-0.5">
                {' '}
                {/* Consistent: text-sm */}
                Modifique su percepción sobre los aspectos del curso y desempeño estudiantil. ({
                  todasLasPreguntasFiltradas.length
                }{' '}
                pregunta{todasLasPreguntasFiltradas.length !== 1 ? 's' : ''})
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
              {' '}
              {/* Adjusted space-y */}
              {todasLasPreguntasFiltradas.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay preguntas disponibles para este tipo de informe.</p> {/* Consistent: text-sm */}
                </div>
              ) : (
                Object.entries(gruposDePreguntas).map(([nombreGrupo, preguntasDelGrupo], grupoIndex, arr) => (
                  <div key={nombreGrupo}>
                    <div className="py-3 px-1">
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-foreground/90 leading-normal flex items-center gap-1.5">
                          {' '}
                          {/* Consistent: text-sm font-medium */}
                          <div className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full"></div>
                          {nombreGrupo}
                        </h3>
                      </div>
                      <div className="ml-3 space-y-4">
                        {' '}
                        {/* Adjusted space-y */}
                        {preguntasDelGrupo.map((pregunta) => {
                          // Use translated 'questionId' property
                          const overallIndex = todasLasPreguntasFiltradas.findIndex((p) => p.questionId === pregunta.questionId)
                          if (overallIndex === -1) return null

                          const currentValue = watch(`respuestasRadio.${overallIndex}.respuesta`)

                          return (
                            <FormField
                              // Use translated 'questionId' property
                              key={pregunta.questionId}
                              control={control}
                              name={`respuestasRadio.${overallIndex}.respuesta`}
                              render={({ field }) => (
                                <FormItem className="space-y-2">
                                  {' '}
                                  {/* Adjusted space-y */}
                                  <FormLabel className="text-sm font-medium text-foreground/85 leading-normal block">
                                    {' '}
                                    {/* Consistent: text-sm font-medium */}
                                    {/* Use translated 'question' property */}
                                    {pregunta.question}
                                  </FormLabel>
                                  <div className="ml-2">
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value || ''}
                                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5" /* Slightly increased gap */
                                      >
                                        {/* Use translated 'options' property */}
                                        {pregunta.options?.map((opcion) => {
                                          const isSelected = currentValue === opcion.value
                                          const colorClasses = getOptionColors(opcion.value, isSelected)
                                          return (
                                            <FormItem key={opcion.value} className="space-y-0">
                                              <div
                                                className={`flex items-center space-x-2 p-2.5 rounded-md border transition-all duration-200 cursor-pointer ${colorClasses}`} /* Adjusted padding and space */
                                              >
                                                <FormControl>
                                                  <RadioGroupItem
                                                    value={opcion.value}
                                                    id={`${field.name}-${overallIndex}-${opcion.value}`}
                                                    className="mt-0 w-4 h-4" /* Slightly larger radio item */
                                                  />
                                                </FormControl>
                                                <FormLabel
                                                  htmlFor={`${field.name}-${overallIndex}-${opcion.value}`}
                                                  className="text-sm font-normal cursor-pointer flex-1 leading-snug text-foreground/90" /* Consistent: text-sm, adjusted leading and color */
                                                >
                                                  {opcion.label}
                                                </FormLabel>
                                              </div>
                                            </FormItem>
                                          )
                                        })}
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage className="text-xs mt-1.5 text-destructive" /> {/* Consistent: text-xs */}
                                    <input
                                      type="hidden"
                                      {...register(`respuestasRadio.${overallIndex}.idPregunta`)}
                                      // Use translated 'questionId' property
                                      value={pregunta.questionId}
                                    />
                                  </div>
                                </FormItem>
                              )}
                            />
                          )
                        })}
                      </div>
                    </div>
                    {grupoIndex < arr.length - 1 && <Separator className="opacity-20 my-3" />} {/* Adjusted margin */}
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter className="flex justify-between py-4 px-6">
              {' '}
              {/* Adjusted padding */}
              {onPrevious && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrevious}
                  className="px-6 py-2 text-sm shadow-sm" /* Consistent: text-sm, adjusted padding */
                >
                  Anterior
                </Button>
              )}
              <Button type="submit" className="px-6 py-2 text-sm shadow-sm" /* Consistent: text-sm, adjusted padding */>
                {isEditing ? 'Guardar Cambios' : 'Siguiente'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormProvider>
  )
}

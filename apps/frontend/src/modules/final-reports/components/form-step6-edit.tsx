'use client'

import { UseFormReturn, FormProvider } from 'react-hook-form'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@una-gc/ui/components/card'
import { Step6FormData } from './form-step6'
import { useState, useEffect } from 'react'
import { preguntasPaso6FormMock } from './form-step6'

interface Step6EditFormProps {
  formMethods: UseFormReturn<Step6FormData>
  onSaveAndNext: (data: Step6FormData) => void
  onPrevious: () => void
  totalSteps: number
}

export function Step6EditForm({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step6EditFormProps) {
  const { control, setValue, getValues, watch } = formMethods

  // Solo mostramos el primer bloque de preguntas (puedes adaptar si tienes más)
  const pregunta = preguntasPaso6FormMock[0]
  const allOptions = pregunta.opciones

  // Estado local para selección en cada lista
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
  const [selectedUsed, setSelectedUsed] = useState<string[]>([])

  // Estado reactivo para las seleccionadas en el formulario
  const respuestasMultiples = watch('respuestasMultiples') || [{ idPregunta: pregunta.idPregunta, respuestasSeleccionadas: [] }]
  const usadas = respuestasMultiples[0]?.respuestasSeleccionadas || []

  // Calcula disponibles y usadas
  const disponibles = allOptions.filter((opt) => !usadas.includes(opt.value))
  const usadasOptions = allOptions.filter((opt) => usadas.includes(opt.value))

  // Mover a usadas
  const handleAdd = () => {
    const nuevasUsadas = Array.from(new Set([...usadas, ...selectedAvailable]))
    setValue('respuestasMultiples', [{ idPregunta: pregunta.idPregunta, respuestasSeleccionadas: nuevasUsadas }], {
      shouldDirty: true
    })
    setSelectedAvailable([])
  }

  // Mover a disponibles
  const handleRemove = () => {
    const nuevasUsadas = usadas.filter((val) => !selectedUsed.includes(val))
    setValue('respuestasMultiples', [{ idPregunta: pregunta.idPregunta, respuestasSeleccionadas: nuevasUsadas }], {
      shouldDirty: true
    })
    setSelectedUsed([])
  }

  // Sincroniza el estado local si cambia el formulario
  useEffect(() => {
    setSelectedAvailable([])
    setSelectedUsed([])
  }, [usadas.length])

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSaveAndNext)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Herramientas utilizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Lista de disponibles */}
                <div className="flex-1">
                  <FormLabel className="block mb-2 font-semibold">No usadas</FormLabel>
                  <div className="border rounded min-h-[200px] max-h-[300px] overflow-auto">
                    <ul>
                      {disponibles.map((opt) => (
                        <li key={opt.value} className="px-3 py-2 flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedAvailable.includes(opt.value)}
                            onChange={(e) => {
                              setSelectedAvailable((sel) =>
                                e.target.checked ? [...sel, opt.value] : sel.filter((v) => v !== opt.value)
                              )
                            }}
                            className="mr-2"
                          />
                          <span>{opt.label}</span>
                        </li>
                      ))}
                      {disponibles.length === 0 && (
                        <li className="px-3 py-2 text-muted-foreground text-sm">Sin herramientas disponibles</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Botones de mover */}
                <div className="flex flex-col justify-center items-center gap-2">
                  <Button type="button" onClick={handleAdd} disabled={selectedAvailable.length === 0}>
                    &gt;
                  </Button>
                  <Button type="button" onClick={handleRemove} disabled={selectedUsed.length === 0}>
                    &lt;
                  </Button>
                </div>

                {/* Lista de usadas */}
                <div className="flex-1">
                  <FormLabel className="block mb-2 font-semibold">Usadas</FormLabel>
                  <div className="border rounded min-h-[200px] max-h-[300px] overflow-auto">
                    <ul>
                      {usadasOptions.map((opt) => (
                        <li key={opt.value} className="px-3 py-2 flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedUsed.includes(opt.value)}
                            onChange={(e) => {
                              setSelectedUsed((sel) =>
                                e.target.checked ? [...sel, opt.value] : sel.filter((v) => v !== opt.value)
                              )
                            }}
                            className="mr-2"
                          />
                          <span>{opt.label}</span>
                        </li>
                      ))}
                      {usadasOptions.length === 0 && (
                        <li className="px-3 py-2 text-muted-foreground text-sm">Sin herramientas usadas</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              <FormMessage name="respuestasMultiples.0.respuestasSeleccionadas" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Anterior
              </Button>
              <Button type="submit">Siguiente Paso</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormProvider>
  )
}

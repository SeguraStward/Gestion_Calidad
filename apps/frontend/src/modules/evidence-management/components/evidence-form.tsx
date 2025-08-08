'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { SinaesSelector } from './sinaes-selector'
import { EvidenceType, EvidenceFormData, DocumentType } from '../types/evidence.types'
import { useCareers } from '../service/evidence.service'
import { documentTypeOptions, getNextCodeForType } from '../mocks/document-types'

// Schema de validación actualizado sin título, fechas, ni notas
const evidenceFormSchema = z.object({
  documentType: z.enum(['NORMATIVA', 'INFORME', 'ACTA', 'PLAN', 'CONVENIO', 'OTRO'] as const),
  documentCode: z.string().min(3, 'El código debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  file: z.any().optional(),
  keywords: z.string().optional().default(''),
  evidencePromptIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una evidencia sugerida'),
  careerIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una carrera'),
  year: z.number().optional(),
  month: z.number().optional(),
})

interface EvidenceFormProps {
  initialData?: EvidenceType
  onSubmit: (data: EvidenceFormData) => Promise<void>
  isSubmitting: boolean
}

export function EvidenceForm({ initialData, onSubmit, isSubmitting }: EvidenceFormProps) {
  const router = useRouter()
  const { data: careers, isLoading: careersLoading } = useCareers()
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [autoGenerateCode, setAutoGenerateCode] = useState(true)

  // Valores por defecto actualizados
  const form = useForm<z.infer<typeof evidenceFormSchema>>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues: {
      documentType: initialData?.documentType || 'OTRO',
      documentCode: initialData?.documentCode || '',
      description: initialData?.description || '',
      keywords: initialData?.keywords?.join(', ') || '',
      evidencePromptIds: initialData?.evidencePromptLinks?.map(link => link.evidencePromptId) || [],
      careerIds: initialData?.careerIds || [],
    }
  })

  // Actualizar código cuando cambia el tipo de documento
  useEffect(() => {
    if (autoGenerateCode) {
      const docType = form.watch('documentType') as DocumentType
      const newCode = getNextCodeForType(docType)
      form.setValue('documentCode', newCode)
    }
  }, [form.watch('documentType'), autoGenerateCode, form])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    form.setValue('file', file)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const handleFormSubmit = async (data: z.infer<typeof evidenceFormSchema>) => {
    try {
      // Convert schema data to EvidenceFormData
      const formData: EvidenceFormData = {
        ...data,
        year: data.year ?? new Date().getFullYear(), // Provide a default value for year
        month: data.month ?? new Date().getMonth() + 1, // Provide a default value for month
      }
      await onSubmit(formData)
      router.push('/evidence-management')
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-auto pr-2">
          {/* Columna izquierda */}
          <div className="space-y-4">
            {/* Tipo de Documento */}
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Código del Documento */}
            <FormField
              control={form.control}
              name="documentCode"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Código del Documento</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="auto-code"
                        checked={autoGenerateCode}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            const docType = form.watch('documentType') as DocumentType
                            form.setValue('documentCode', getNextCodeForType(docType))
                          }
                          setAutoGenerateCode(!!checked)
                        }}
                      />
                      <label htmlFor="auto-code" className="text-xs text-muted-foreground">
                        Auto-generar
                      </label>
                    </div>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={autoGenerateCode}
                      placeholder="Ej: NORM-001"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descripción del documento..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Palabras clave</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: plan, estrategia, objetivos (separadas por comas)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Palabras clave para facilitar la búsqueda del documento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>Archivo</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition cursor-pointer">
                      <Input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {initialData
                            ? `Archivo actual: ${initialData.fileName}`
                            : "Haga clic para seleccionar un archivo o arrastre y suelte aquí"}
                        </p>
                        {form.watch('file') && (
                          <p className="text-sm font-medium mt-2">
                            Nuevo archivo seleccionado: {(form.watch('file') as File).name}
                          </p>
                        )}
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="evidencePromptIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidencias SINAES Cubiertas</FormLabel>
                  <FormControl>
                    <SinaesSelector
                      selectedPrompts={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Seleccione las evidencias específicas que este documento cumple.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="careerIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carreras relacionadas</FormLabel>
                  <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                    {careersLoading ? (
                      <p className="text-sm text-muted-foreground">Cargando carreras...</p>
                    ) : (
                      <div className="space-y-2">
                        {careers?.map(career => {
                          const currentValue = field.value || []
                          return (
                            <div key={career.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`career-${career.id}`}
                                checked={currentValue.includes(career.id)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...currentValue, career.id]
                                    : currentValue.filter(id => id !== career.id)
                                  field.onChange(updatedValue)
                                }}
                              />
                              <label
                                htmlFor={`career-${career.id}`}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {career.name} ({career.code}) - {career.degree}
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-between space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/evidence-management')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              initialData ? 'Actualizar evidencia' : 'Guardar evidencia'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
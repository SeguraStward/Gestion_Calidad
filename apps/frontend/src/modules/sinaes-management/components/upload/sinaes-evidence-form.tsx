'use client'

import React, { useState, useEffect } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { SinaesEvidenceSelector } from './sinaes-evidence-selector'
import { useCareers } from '../../../evidence-management/service/evidence.service'
import { useProofDocumentTypes } from '../../services/proof-document-types.service'
import type { EvidenceFormData, DocumentType } from '../../../evidence-management/types/evidence.types'
import type { ProofDocumentType } from '../../types/proof-document-types.types'

// Función para generar códigos automáticos
const getNextCodeForType = (docType: DocumentType): string => {
  const prefixes: Record<DocumentType, string> = {
    'NORMATIVA': 'NORM',
    'INFORME': 'INF',
    'ACTA': 'ACTA',
    'PLAN': 'PLAN',
    'CONVENIO': 'CONV',
    'OTRO': 'DOC'
  }

  const prefix = prefixes[docType]
  const timestamp = Date.now().toString().slice(-4)
  return `${prefix}-${timestamp}`
}

// Schema de validación
const evidenceFormSchema = z.object({
  documentTypeId: z.string().min(1, 'Debe seleccionar un tipo de documento'),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  file: z.any().optional(),
  evidencePromptIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una evidencia sugerida'),
  careerIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una carrera'),
  year: z.number().optional(),
  month: z.number().optional(),
})

interface SinaesEvidenceFormProps {
  onSubmit: (data: EvidenceFormData) => Promise<void>
  isSubmitting: boolean
  onCancel?: () => void
}

export function SinaesEvidenceForm({ onSubmit, isSubmitting, onCancel }: SinaesEvidenceFormProps) {
  const { data: careers, isLoading: careersLoading } = useCareers()
  const { data: documentTypesResponse, isLoading: documentTypesLoading } = useProofDocumentTypes()
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [autoGenerateCode, setAutoGenerateCode] = useState(true)

  // Extraer los tipos de documentos de la respuesta paginada
  const documentTypes: ProofDocumentType[] = documentTypesResponse?.data || []

  const form = useForm<z.infer<typeof evidenceFormSchema>>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues: {
      documentType: 'OTRO',
      documentCode: '',
      description: '',
      keywords: '',
      evidencePromptIds: [],
      careerIds: [],
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
      const formData: EvidenceFormData = {
        ...data,
        year: data.year ?? new Date().getFullYear(),
        month: data.month ?? new Date().getMonth() + 1,
      }
      await onSubmit(formData)
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
    }
  }

  return (
    <div className="h-full overflow-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="h-full flex flex-col">
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda - Información del documento */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información del Documento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                              {documentTypesLoading ? (
                                <SelectItem value="" disabled>
                                  Cargando tipos de documentos...
                                </SelectItem>
                              ) : documentTypes.length === 0 ? (
                                <SelectItem value="" disabled>
                                  No hay tipos de documentos disponibles
                                </SelectItem>
                              ) : (
                                documentTypes.map((docType) => (
                                  <SelectItem key={docType.id} value={docType.id}>
                                    <div className="flex flex-col">
                                      <span>{docType.name}</span>
                                      {docType.description && (
                                        <span className="text-xs text-muted-foreground">
                                          {docType.description}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              )}
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
                                  Haga clic para seleccionar un archivo o arrastre y suelte aquí
                                </p>
                                {form.watch('file') && (
                                  <p className="text-sm font-medium mt-2">
                                    Archivo seleccionado: {(form.watch('file') as File).name}
                                  </p>
                                )}
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Columna derecha - Evidencias y carreras */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evidencias SINAES y Carreras</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="evidencePromptIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evidencias SINAES Cubiertas</FormLabel>
                          <FormControl>
                            <SinaesEvidenceSelector
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
                          <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex justify-between space-x-2 p-6 border-t bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
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
                  Guardando...
                </>
              ) : (
                'Guardar evidencia'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
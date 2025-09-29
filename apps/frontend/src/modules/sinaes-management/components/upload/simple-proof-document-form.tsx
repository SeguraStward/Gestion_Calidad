'use client'

import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Upload, FileText, Users, Tags } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Input } from '@una-gc/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { useProofDocumentTypes } from '../../services/proof-document-types.service'
import { SinaesEvidenceSelector } from './sinaes-evidence-selector'
import { useQuery } from '@tanstack/react-query'
import { careerService } from '../../../academic-management/academic-maintenance/services/career.service'
import type { ProofDocumentType } from '../../types/proof-document-types.types'
import { proofDocumentService } from '../../services/integrated-proof-documents.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'

// Schema simplificado del formulario
const proofDocumentSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  documentTypeId: z.string().min(1, 'Debe seleccionar un tipo de documento'),
  evidenceIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una evidencia'),
  careerIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una carrera'),
  file: z.any().refine((file) => file instanceof File, 'Debe seleccionar un archivo')
})

type FormData = z.infer<typeof proofDocumentSchema>

interface SimpleProofDocumentFormProps {
  onSubmit: (data: FormData) => Promise<void>
  isSubmitting: boolean
}

export function SimpleProofDocumentForm({ onSubmit, isSubmitting }: SimpleProofDocumentFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Store de navegación SINAES
  const { selectedDimension, selectedComponent, selectedCriterion, selectedStandard } = useSinaesNavigation()

  // Servicios de datos
  const { data: documentTypesResponse, isLoading: documentTypesLoading } = useProofDocumentTypes()
  const { data: careersResponse, isLoading: careersLoading } = useQuery({
    queryKey: ['careers'],
    queryFn: () => careerService.list()
  })

  // Extraer datos de las respuestas
  const documentTypes: ProofDocumentType[] = documentTypesResponse?.data || []
  const careers = careersResponse?.data || []

  const form = useForm<FormData>({
    resolver: zodResolver(proofDocumentSchema),
    defaultValues: {
      name: '',
      documentTypeId: '',
      evidenceIds: [],
      careerIds: [],
      file: undefined
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      form.setValue('file', file)
    }
  }

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data)
  }

  if (documentTypesLoading || careersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Cargando formulario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Documento Probatorio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-6">
                  {/* Nombre del Documento */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Documento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Convenio con Universidad X" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tipo de Documento */}
                  <FormField
                    control={form.control}
                    name="documentTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Tags className="h-4 w-4" />
                          Tipo de Documento
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo de documento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {documentTypes.map((docType) => (
                              <SelectItem key={docType.id} value={docType.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{docType.name}</span>
                                  {docType.description && (
                                    <span className="text-xs text-muted-foreground">
                                      {docType.description}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Archivo */}
                  <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Archivo
                        </FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Input
                              type="file"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                              className="hidden"
                              id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                              {selectedFile ? (
                                <div className="space-y-2">
                                  <FileText className="h-8 w-8 mx-auto text-green-500" />
                                  <p className="text-sm font-medium">{selectedFile.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                  <p className="text-sm">Haga clic para seleccionar un archivo</p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF, DOC, XLS, PPT (máx. 10MB)
                                  </p>
                                </div>
                              )}
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                  {/* Evidencia SINAES */}
                  <FormField
                    control={form.control}
                    name="evidenceIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Evidencias SINAES</FormLabel>
                        <FormControl>
                          <SinaesEvidenceSelector
                            selectedEvidences={field.value || []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Carreras */}
                  <FormField
                    control={form.control}
                    name="careerIds"
                    render={() => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Carreras Afectadas
                        </FormLabel>
                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                          {careers.map((career: any) => (
                            <FormField
                              key={career.id}
                              control={form.control}
                              name="careerIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={career.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(career.id)}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || []
                                          return checked
                                            ? field.onChange([...currentValue, career.id])
                                            : field.onChange(
                                              currentValue?.filter(
                                                (value) => value !== career.id
                                              )
                                            )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {career.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Botones - Span completo */}
              <div className="flex justify-end space-x-2 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Limpiar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Documento
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
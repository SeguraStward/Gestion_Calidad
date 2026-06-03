'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
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
import { useListCareersFlat } from '@/modules/academic-management/academic-maintenance/hooks/useCareer'
import type { ProofDocumentType } from '../../types/proof-document-types.types'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'

// Schema simplificado del formulario
const proofDocumentSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  documentTypeId: z.string().min(1, 'Debe seleccionar un tipo de documento'),
  evidenceIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una evidencia'),
  careerIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una carrera'),
  files: z
    .array(z.any())
    .min(1, 'Debe seleccionar al menos un archivo')
    .refine((arr) => arr.every((f) => f instanceof File), 'Todos los elementos deben ser archivos')
})

type FormData = z.infer<typeof proofDocumentSchema>

interface SimpleProofDocumentFormProps {
  onSubmit: (data: FormData) => Promise<void>
  isSubmitting: boolean
  uploadProgress?: number
  /** Evidence to pre-select on first mount (deep-link from inventory). */
  prefillEvidenceId?: string
  /** Career to pre-select on first mount. */
  prefillCareerId?: string
}

export function SimpleProofDocumentForm({
  onSubmit,
  isSubmitting,
  uploadProgress,
  prefillEvidenceId,
  prefillCareerId,
}: SimpleProofDocumentFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  // Guards against re-applying the prefill on every render. We only want it
  // to fire ONCE per (evidenceId, careerId) combination — if the user clears
  // the form manually, they shouldn't fight a useEffect that keeps re-setting.
  const prefillAppliedRef = useRef<string | null>(null)

  // Store de navegación SINAES
  const { selectedDimension, selectedComponent, selectedCriterion, selectedStandard } = useSinaesNavigation()

  // Servicios de datos
  const { data: documentTypesResponse, isLoading: documentTypesLoading } = useProofDocumentTypes()
  const { data: allCareers = [], isLoading: careersLoading } = useListCareersFlat()

  // Filter to active careers only (the flat hook returns all statuses).
  const activeCareers = useMemo(
    () => allCareers.filter((c: any) => !c.status || c.status === 'ACTIVE'),
    [allCareers],
  )

  // Extraer datos de las respuestas
  const documentTypes: ProofDocumentType[] = documentTypesResponse?.data || []
  const careers = activeCareers

  const form = useForm<FormData>({
    resolver: zodResolver(proofDocumentSchema),
    defaultValues: {
      name: '',
      documentTypeId: '',
      evidenceIds: [],
      careerIds: [],
      files: []
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? [])
    if (incoming.length === 0) return
    // Append to the existing selection so the user can pick files in batches
    // without losing previous choices. Duplicates are filtered by name+size.
    // NOTE: compute the next list here (event handler) and call both setters
    // directly. Calling form.setValue() INSIDE a setState updater runs it
    // during React's render phase, which triggers the "Cannot update a
    // component while rendering a different component" warning.
    const merged = [...selectedFiles]
    for (const f of incoming) {
      if (!merged.some((m) => m.name === f.name && m.size === f.size)) {
        merged.push(f)
      }
    }
    setSelectedFiles(merged)
    form.setValue('files', merged, { shouldValidate: true })
    // Reset the input so picking the same file again works.
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    const next = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(next)
    form.setValue('files', next, { shouldValidate: true })
  }

  // Pre-fill evidence + career when the user lands here via the inventory
  // tab's "Subir aquí" deep link. The careers query must have resolved before
  // we set the career value so the checkbox renders checked.
  useEffect(() => {
    if (!prefillEvidenceId && !prefillCareerId) return
    if (careersLoading) return
    const key = `${prefillEvidenceId ?? ''}|${prefillCareerId ?? ''}`
    if (prefillAppliedRef.current === key) return

    if (prefillEvidenceId) {
      form.setValue('evidenceIds', [prefillEvidenceId], { shouldValidate: true })
    }
    if (prefillCareerId) {
      // Only set it if the career is actually in the active list — otherwise
      // we'd set a phantom value that the UI cannot toggle off.
      if (careers.some((c: any) => c.id === prefillCareerId)) {
        form.setValue('careerIds', [prefillCareerId], { shouldValidate: true })
      }
    }

    prefillAppliedRef.current = key
    toast.info('Datos pre-seleccionados desde el reporte de inventario', {
      description:
        'Se cargó la evidencia y la carrera. Completá nombre, tipo y archivo(s) para finalizar la subida.',
      duration: 6000,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillEvidenceId, prefillCareerId, careersLoading, careers.length])

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

                  {/* Archivos (uno o varios — todos se suben a la misma carpeta) */}
                  <FormField
                    control={form.control}
                    name="files"
                    render={() => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Archivos
                          </span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {selectedFiles.length} seleccionado{selectedFiles.length === 1 ? '' : 's'}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3">
                            <Input
                              type="file"
                              multiple
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                              className="hidden"
                              id="file-upload"
                            />
                            <label
                              htmlFor="file-upload"
                              className="block cursor-pointer text-center py-4"
                            >
                              <Upload className="h-8 w-8 mx-auto text-gray-400" />
                              <p className="text-sm mt-2">
                                Haga clic para seleccionar uno o varios archivos
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PDF, DOC, XLS, PPT (máx. 10MB c/u). Todos los archivos seleccionados se subirán juntos en la misma carpeta del documento.
                              </p>
                            </label>

                            {selectedFiles.length > 0 && (
                              <ul className="space-y-1 max-h-40 overflow-y-auto text-sm">
                                {selectedFiles.map((file, idx) => (
                                  <li
                                    key={`${file.name}-${file.size}-${idx}`}
                                    className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-muted/50"
                                  >
                                    <span className="flex items-center gap-2 truncate">
                                      <FileText className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                      <span className="truncate">{file.name}</span>
                                      <span className="text-xs text-muted-foreground flex-shrink-0">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(idx)}
                                      className="text-xs text-destructive hover:underline flex-shrink-0"
                                      aria-label={`Quitar ${file.name}`}
                                    >
                                      Quitar
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Carreras Afectadas
                          </span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {(field.value?.length ?? 0)} / {careers.length} seleccionadas ·
                            {' '}{careers.length} activas en el sistema
                          </span>
                        </FormLabel>
                        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                          {careers.length === 0 && (
                            <p className="text-xs text-muted-foreground italic py-2">
                              No hay carreras activas disponibles.
                            </p>
                          )}
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

              {/* Progreso de subida */}
              {isSubmitting && uploadProgress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subiendo archivo...</span>
                    <span className="font-medium">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Botones - Span completo */}
              <div className="flex justify-end space-x-2 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
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
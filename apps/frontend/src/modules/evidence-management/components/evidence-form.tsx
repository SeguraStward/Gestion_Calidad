'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, Loader2, Upload } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Calendar } from '@una-gc/ui/components/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@una-gc/ui/components/popover'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { cn } from '@una-gc/ui/lib/utils'
import { SinaesSelector } from './sinaes-selector'
import { EvidenceType, EvidenceFormData } from '../types/evidence.types'
import { useCareers } from '../service/evidence.service'

// Schema de validación
const evidenceFormSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().default(''),
  file: z.any().optional(),
  year: z.number().int().min(2000, 'El año debe ser 2000 o posterior'),
  month: z.number().int().min(1).max(12).optional(),
  keywords: z.string().default(''),
  criteriaIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un criterio'),
  careerIds: z.array(z.string()).min(1, 'Debe seleccionar al menos una carrera'),
  notes: z.string().default('')
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
  
  // Preparar datos iniciales si estamos editando
  const defaultValues: Partial<EvidenceFormData> = initialData
    ? {
        title: initialData.title,
        description: initialData.description || '',
        year: initialData.year,
        month: initialData.month,
        keywords: initialData.keywords.join(', '),
        criteriaIds: initialData.criteria.map(c => c.criterionId),
        careerIds: initialData.careerIds,
        notes: initialData.criteria[0]?.notes || ''
      }
    : {
        title: '',
        description: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        keywords: '',
        criteriaIds: [],
        careerIds: [],
        notes: ''
      }
  
  const form = useForm<EvidenceFormData>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues
  })
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    form.setValue('file', file)
    
    // Crear preview para ciertos tipos de archivo
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
  
  const handleFormSubmit = async (data: EvidenceFormData) => {
    try {
      await onSubmit(data)
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del documento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Plan Estratégico 2024" {...field} />
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Año" 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                        value={field.value?.toString() || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mes</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={value => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar mes" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <SelectItem key={month} value={month.toString()}>
                            {format(new Date(2000, month - 1, 1), 'MMMM', { locale: es })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
              name="criteriaIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Criterios SINAES</FormLabel>
                  <FormControl>
                    <SinaesSelector 
                      selectedCriteria={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Seleccione los criterios SINAES a los que se relaciona esta evidencia
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
                        {careers?.map(career => (
                          <div key={career.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`career-${career.id}`}
                              checked={field.value.includes(career.id)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, career.id]
                                  : field.value.filter(id => id !== career.id)
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
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas adicionales</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre esta evidencia..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Información adicional relevante sobre esta evidencia
                  </FormDescription>
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
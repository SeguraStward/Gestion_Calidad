'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@una-gc/ui/components'
import {
  useCreateProofDocumentType,
  useUpdateProofDocumentType
} from '../../services/proof-document-types.service'

const formSchema = z.object({
  code: z.string()
    .min(1, 'El código es requerido')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El código solo puede contener letras mayúsculas, números y guiones'),
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  prefix: z.string()
    .min(1, 'El prefijo es requerido')
    .max(10, 'El prefijo no puede exceder 10 caracteres')
    .regex(/^[A-Z]+$/, 'El prefijo solo puede contener letras mayúsculas'),
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')
})

type ProofDocumentTypeFormData = z.infer<typeof formSchema>

interface ProofDocumentTypeFormProps {
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export const ProofDocumentTypeForm = ({
  initialData,
  onSuccess,
  onCancel
}: ProofDocumentTypeFormProps) => {
  const isEditing = !!initialData

  const form = useForm<ProofDocumentTypeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: initialData?.code ?? '',
      name: initialData?.name ?? '',
      prefix: initialData?.prefix ?? '',
      description: initialData?.description ?? '',
      status: initialData?.status ?? 'ACTIVE'
    }
  })

  // Auto-generate prefix from name
  const watchName = form.watch('name')
  const watchPrefix = form.watch('prefix')

  // Auto-fill prefix when name changes (only if prefix is empty and not editing)
  useEffect(() => {
    if (!isEditing && watchName && !watchPrefix) {
      const generatedPrefix = watchName
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .substring(0, 5)

      if (generatedPrefix) {
        form.setValue('prefix', generatedPrefix)
      }
    }
  }, [watchName, watchPrefix, isEditing, form])

  // Auto-transform code to uppercase
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    form.setValue('code', value)
  }

  // Auto-transform prefix to uppercase
  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
    form.setValue('prefix', value)
  }

  const createMutation = useCreateProofDocumentType()
  const updateMutation = useUpdateProofDocumentType()

  const onSubmit = async (data: ProofDocumentTypeFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data
        })
      } else {
        await createMutation.mutateAsync(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Error saving proof document type:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Código */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: CONV-01"
                    value={field.value}
                    onChange={handleCodeChange}
                    disabled={isLoading}
                    maxLength={20}
                  />
                </FormControl>
                <FormDescription>
                  Código único del tipo de documento (mayúsculas, números y guiones)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Convenio"
                    {...field}
                    disabled={isLoading}
                    maxLength={100}
                  />
                </FormControl>
                <FormDescription>
                  Nombre descriptivo del tipo de documento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prefijo */}
          <FormField
            control={form.control}
            name="prefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prefijo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: CONV"
                    value={field.value}
                    onChange={handlePrefixChange}
                    disabled={isLoading}
                    maxLength={10}
                  />
                </FormControl>
                <FormDescription>
                  Prefijo para generar códigos de documentos (solo letras mayúsculas)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descripción */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción opcional del tipo de documento"
                    {...field}
                    disabled={isLoading}
                    rows={3}
                    maxLength={500}
                  />
                </FormControl>
                <FormDescription>
                  Descripción opcional (máximo 500 caracteres)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estado */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Estado del tipo de documento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import type { ExternalProvider, CreateExternalProviderDto } from '../services/external-providers.service'

interface ExternalProviderFormProps {
  provider?: ExternalProvider | null
  annualAllocationId?: string
  onSubmit: (data: CreateExternalProviderDto) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export default function ExternalProviderForm({
  provider,
  annualAllocationId,
  onSubmit,
  onCancel,
  loading
}: ExternalProviderFormProps) {
  const form = useForm<CreateExternalProviderDto>({
    defaultValues: {
      name: provider?.name || '',
      description: provider?.description || '',
      providerType: provider?.providerType || 'UNIVERSITY',
      contactEmail: provider?.contactEmail || '',
      contactPhone: provider?.contactPhone || '',
      contactPerson: provider?.contactPerson || '',
      annualAllocationId: provider?.annualAllocationId || annualAllocationId || '',
      providedJourneyTime: provider?.providedJourneyTime || 0,
      isFixedTime: provider?.isFixedTime || false,
      startDate: provider?.startDate ? new Date(provider.startDate).toISOString().split('T')[0] : '',
      endDate: provider?.endDate ? new Date(provider.endDate).toISOString().split('T')[0] : ''
    }
  })

  // Update form when provider changes
  useEffect(() => {
    if (provider) {
      form.reset({
        name: provider.name,
        description: provider.description || '',
        providerType: provider.providerType,
        contactEmail: provider.contactEmail || '',
        contactPhone: provider.contactPhone || '',
        contactPerson: provider.contactPerson || '',
        annualAllocationId: provider.annualAllocationId,
        providedJourneyTime: provider.providedJourneyTime,
        isFixedTime: provider.isFixedTime || false,
        startDate: provider.startDate ? new Date(provider.startDate).toISOString().split('T')[0] : '',
        endDate: provider.endDate ? new Date(provider.endDate).toISOString().split('T')[0] : ''
      })
    }
  }, [provider, form])

  const handleSubmit = async (data: CreateExternalProviderDto) => {
    try {
      console.log('📋 Form - Raw data from form:', data)
      console.log('📋 Form - providedJourneyTime:', data.providedJourneyTime, typeof data.providedJourneyTime)

      // Asegurar que providedJourneyTime sea un número
      const sanitizedData = {
        ...data,
        providedJourneyTime:
          typeof data.providedJourneyTime === 'number'
            ? data.providedJourneyTime
            : parseFloat(String(data.providedJourneyTime || 0))
      }

      console.log('📋 Form - Sanitized data:', sanitizedData)

      await onSubmit(sanitizedData)
      if (!provider) {
        form.reset()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'El nombre es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Proveedor *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Universidad de Costa Rica" {...field} />
              </FormControl>
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
                <Textarea placeholder="Descripción del proveedor o convenio..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo de Proveedor */}
        <FormField
          control={form.control}
          name="providerType"
          rules={{ required: 'El tipo es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Proveedor *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="UNIVERSITY">Universidad</SelectItem>
                  <SelectItem value="AGREEMENT">Convenio</SelectItem>
                  <SelectItem value="EXCHANGE">Intercambio</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Horas Provistas */}
        <FormField
          control={form.control}
          name="providedJourneyTime"
          rules={{
            required: 'Las horas provistas son obligatorias',
            min: { value: 0, message: 'Debe ser mayor o igual a 0' }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horas de Jornada Provistas *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="120"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>Cantidad de horas que este proveedor aporta</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Información de Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Persona de Contacto</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de Contacto</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contacto@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono de Contacto</FormLabel>
              <FormControl>
                <Input placeholder="+506 8888-8888" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Fin</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tiempo Fijo Checkbox */}
        <FormField
          control={form.control}
          name="isFixedTime"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input type="checkbox" checked={field.value} onChange={field.onChange} className="mt-1" />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>¿Tiempo fijo?</FormLabel>
                <FormDescription>Marcar si las horas provistas son fijas y no variables</FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Hidden Annual Allocation ID */}
        <input type="hidden" {...form.register('annualAllocationId')} />

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : provider ? 'Actualizar' : 'Crear Proveedor'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

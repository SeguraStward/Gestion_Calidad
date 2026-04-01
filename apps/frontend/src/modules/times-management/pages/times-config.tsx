'use client'

import { useEffect } from 'react'
import { Settings } from 'lucide-react'
import { toast } from 'sonner'

import { Breadcrumbs } from '../components/Breadcrumbs'
import JourneyConfigDisplay, { type JourneyConfig } from '../components/JourneyConfigDisplay'
import { useJourneyTimeConfigStore } from '../store/useJourneyTimeConfigStore'

export default function TimesConfigPage() {
  const { activeConfig, loading, fetchActive, create: createConfig } = useJourneyTimeConfigStore()

  useEffect(() => {
    fetchActive()
  }, [fetchActive])

  const transformedConfig: JourneyConfig | null = activeConfig
    ? { ...activeConfig, status: activeConfig.status as 'ACTIVE' | 'INACTIVE' | 'DRAFT' | undefined }
    : null

  const handleUploadConfig = async (newConfig: JourneyConfig) => {
    try {
      const effectiveYear =
        typeof newConfig.effectiveYear === 'string' ? parseInt(newConfig.effectiveYear, 10) : newConfig.effectiveYear

      await createConfig({
        quarterTimeMinHours: newConfig.quarterTimeMinHours,
        quarterTimeMaxHours: newConfig.quarterTimeMaxHours,
        quarterTimeValue: newConfig.quarterTimeValue,
        halfTimeMinHours: newConfig.halfTimeMinHours,
        halfTimeMaxHours: newConfig.halfTimeMaxHours,
        halfTimeValue: newConfig.halfTimeValue,
        threeQuarterMinHours: newConfig.threeQuarterMinHours,
        threeQuarterMaxHours: newConfig.threeQuarterMaxHours,
        threeQuarterTimeValue: newConfig.threeQuarterTimeValue,
        fullTimeMinHours: newConfig.fullTimeMinHours,
        fullTimeValue: newConfig.fullTimeValue,
        maxDailyHours: newConfig.maxDailyHours,
        effectiveYear,
        status: 'ACTIVE'
      })
      toast.success('Configuracion guardada correctamente')
    } catch (error) {
      console.error('Error uploading config:', error)
      toast.error('Error al guardar la configuracion')
    }
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Tiempos de Jornada', href: '/times-management' },
          { label: 'Configuracion' }
        ]}
      />

      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuracion de Jornada</h1>
          <p className="text-muted-foreground">
            Parametros de conversion de horas a fracciones de jornada. Se revisa una vez al ano.
          </p>
        </div>
      </div>

      <JourneyConfigDisplay
        config={transformedConfig}
        loading={loading}
        onUploadConfig={handleUploadConfig}
        canEdit={true}
      />
    </div>
  )
}

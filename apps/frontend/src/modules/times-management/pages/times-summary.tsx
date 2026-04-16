'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  GraduationCap,
  RefreshCw,
  Wallet,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'

import { Breadcrumbs } from '../components/Breadcrumbs'
import { EmptyState } from '../components/EmptyState'
import { StatsCard } from '../components/StatsCard'
import { useAnnualAllocationsStore } from '../store/useAnnualAllocationsStore'

interface CampusSummaryRow {
  campusId: string
  campusName: string
  curricularMesh: string
  academicCycle: string
  allocated: number
  additional: number
  professorConsumed: number
  projectsConsumed: number
  totalConsumed: number
  available: number
  status: string
}

interface AnnualSummaryData {
  year: number
  found: boolean
  message?: string
  totalJourneyTime: number
  totalAllocatedToCampus: number
  totalAdditional?: number
  totalFromExternalProviders: number
  totalConsumed?: number
  totalAvailable: number
  status?: string
  campusSummary: CampusSummaryRow[]
  externalProviders: Array<{
    id: string
    name: string
    providerType: string
    providedJourneyTime: number
    status: string
  }>
  summary?: {
    totalCampus: number
    totalExternalProviders: number
    utilizationRate: number
  }
}

const currentYear = new Date().getFullYear()

function formatHours(value: number) {
  return `${new Intl.NumberFormat('es-CR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value)}h`
}

export default function TimesSummaryPage() {
  const { yearSummary, loading, error, fetchYearSummary, clearError } = useAnnualAllocationsStore()

  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [expandedCampusId, setExpandedCampusId] = useState<string | null>(null)

  const summary = yearSummary as AnnualSummaryData | null

  const availableYears = useMemo(() => {
    return Array.from({ length: 9 }, (_, index) => currentYear + 2 - index)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadSummary = async () => {
      clearError()
      setRequestError(null)

      await fetchYearSummary(selectedYear)

      if (!isMounted) return

      const latestState = useAnnualAllocationsStore.getState()
      if (!latestState.yearSummary) {
        setRequestError(latestState.error || `No se pudo cargar el resumen anual del año ${selectedYear}.`)
      }
    }

    loadSummary()
    setExpandedCampusId(null)

    return () => {
      isMounted = false
    }
  }, [selectedYear, reloadVersion, fetchYearSummary, clearError])

  const campusRows = summary?.campusSummary || []

  const campusGroups = useMemo(() => {
    const map = new Map<string, {
      campusId: string
      campusName: string
      allocated: number
      additional: number
      professorConsumed: number
      projectsConsumed: number
      totalConsumed: number
      available: number
      status: string
      rows: CampusSummaryRow[]
    }>()

    campusRows.forEach((row) => {
      const key = row.campusId || row.campusName
      const existing = map.get(key)
      if (existing) {
        existing.allocated += row.allocated || 0
        existing.additional += row.additional || 0
        existing.professorConsumed += row.professorConsumed || 0
        existing.projectsConsumed += row.projectsConsumed || 0
        existing.totalConsumed += row.totalConsumed || 0
        existing.available += row.available || 0
        existing.rows.push(row)
      } else {
        map.set(key, {
          campusId: key,
          campusName: row.campusName,
          allocated: row.allocated || 0,
          additional: row.additional || 0,
          professorConsumed: row.professorConsumed || 0,
          projectsConsumed: row.projectsConsumed || 0,
          totalConsumed: row.totalConsumed || 0,
          available: row.available || 0,
          status: row.status,
          rows: [row]
        })
      }
    })

    return Array.from(map.values())
  }, [campusRows])

  const docenciaRequerida = useMemo(
    () => campusRows.reduce((sum, campus) => sum + (campus.professorConsumed || 0), 0),
    [campusRows]
  )

  const proyectosGestion = useMemo(
    () => campusRows.reduce((sum, campus) => sum + (campus.projectsConsumed || 0), 0),
    [campusRows]
  )

  const jornadasDisponibles = useMemo(() => {
    if (!summary) return 0
    return (summary.totalJourneyTime || 0) + (summary.totalFromExternalProviders || 0) + (summary.totalAdditional || 0)
  }, [summary])

  const saldo = useMemo(() => {
    return jornadasDisponibles - docenciaRequerida - proyectosGestion
  }, [jornadasDisponibles, docenciaRequerida, proyectosGestion])

  const hasLoadError = Boolean(requestError || error)
  const saldoTrend = saldo > 0 ? 'up' : saldo < 0 ? 'down' : 'neutral'
  const saldoCardClass =
    saldo > 0
      ? 'min-h-[160px] border-2 border-green-500 bg-green-100 text-green-950'
      : saldo < 0
        ? 'min-h-[160px] border-2 border-red-500 bg-red-100 text-red-950'
        : 'min-h-[160px] border-2 border-slate-400 bg-slate-100 text-slate-900'

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Tiempos de Jornada', href: '/times-management' }, { label: 'Resumen Anual' }]} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Resumen Anual de Jornadas</h1>
              <p className="text-muted-foreground">
                Balance anual de disponibilidad, docencia, proyectos y saldo final por campus.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[180px]">
            <label className="mb-1 block text-sm font-medium">Año</label>
            <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona año" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={() => setReloadVersion((value) => value + 1)} className="sm:mt-6">
            <RefreshCw className="mr-2 h-4 w-4" />
            Recargar
          </Button>
        </div>
      </div>

      {hasLoadError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">No fue posible cargar el resumen</p>
                <p className="text-sm text-red-700">{requestError || error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-red-200 bg-white text-red-700 hover:bg-red-100"
              onClick={() => {
                clearError()
                setRequestError(null)
                setReloadVersion((value) => value + 1)
              }}
            >
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Cargando resumen anual...</span>
        </div>
      ) : hasLoadError ? null : summary && !summary.found ? (
        <EmptyState
          icon={<CalendarRange className="h-14 w-14" />}
          title={`Sin datos para ${selectedYear}`}
          description={summary.message || 'No existe un resumen anual disponible para el año seleccionado.'}
        />
      ) : summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Jornadas disponibles"
              value={formatHours(jornadasDisponibles)}
              description={`Base: ${formatHours(summary.totalJourneyTime)} | Externos: ${formatHours(
                summary.totalFromExternalProviders || 0
              )}`}
              icon={<Wallet className="h-5 w-5" />}
              trend="neutral"
              trendValue={`${summary.summary?.totalCampus || campusRows.length} campus considerados`}
              className="min-h-[160px] border-2 border-slate-400 bg-slate-100 text-slate-900"
            />

            <StatsCard
              title="Docencia requerida"
              value={formatHours(docenciaRequerida)}
              description="Consumo activo de asignaciones docentes"
              icon={<GraduationCap className="h-5 w-5" />}
              trend="neutral"
              trendValue={`${campusRows.length} filas en el desglose`}
              className="min-h-[160px] border-2 border-blue-500 bg-blue-100 text-blue-950"
            />

            <StatsCard
              title="Proyectos y gestion"
              value={formatHours(proyectosGestion)}
              description="Tiempo consumido por proyectos institucionales"
              icon={<BriefcaseBusiness className="h-5 w-5" />}
              trend="neutral"
              trendValue={`${summary.summary?.totalExternalProviders || 0} proveedores externos`}
              className="min-h-[160px] border-2 border-amber-500 bg-amber-100 text-amber-950"
            />

            <StatsCard
              title="Saldo"
              value={formatHours(saldo)}
              description={`Utilizacion: ${new Intl.NumberFormat('es-CR', {
                maximumFractionDigits: 1
              }).format(summary.summary?.utilizationRate || 0)}%`}
              icon={<Activity className="h-5 w-5" />}
              trend={saldoTrend}
              trendValue={saldo > 0 ? 'Saldo positivo' : saldo < 0 ? 'Saldo deficitario' : 'Sin variacion'}
              className={saldoCardClass}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Desglose por campus</CardTitle>
              <CardDescription>Distribucion anual de jornadas por sede, malla y ciclo academico.</CardDescription>
            </CardHeader>
            <CardContent>
              {campusGroups.length === 0 ? (
                <EmptyState
                  icon={<Building2 className="h-12 w-12" />}
                  title="Sin detalle por campus"
                  description="El resumen anual no incluye filas de campus para el año seleccionado."
                />
              ) : (
                <div className="overflow-x-auto">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Haz clic sobre un campus para ver el desglose por carrera y ciclo academico.
                  </p>
                  <table className="w-full min-w-[980px] border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left">
                        <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campus</th>
                        <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Asignado</th>
                        <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Adicional</th>
                        <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Docencia</th>
                        <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proyectos</th>
                        <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Consumido</th>
                        <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Disponible</th>
                        <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campusGroups.map((group) => {
                        const isExpanded = expandedCampusId === group.campusId
                        return (
                          <Fragment key={group.campusId}>
                            <tr
                              className={`cursor-pointer border-b transition-colors hover:bg-muted/40 ${isExpanded ? 'bg-muted/30' : ''}`}
                              onClick={() => setExpandedCampusId(isExpanded ? null : group.campusId)}
                            >
                              <td className="px-3 py-3 text-sm font-medium">
                                <span className="mr-2 inline-block w-3 text-muted-foreground">{isExpanded ? '▼' : '▶'}</span>
                                {group.campusName}
                              </td>
                              <td className="px-3 py-3 text-sm">{formatHours(group.allocated)}</td>
                              <td className="px-3 py-3 text-sm">{formatHours(group.additional)}</td>
                              <td className="px-3 py-3 text-sm text-blue-700">{formatHours(group.professorConsumed)}</td>
                              <td className="px-3 py-3 text-sm text-amber-700">{formatHours(group.projectsConsumed)}</td>
                              <td className="px-3 py-3 text-sm font-medium">{formatHours(group.totalConsumed)}</td>
                              <td className="px-3 py-3 text-sm font-semibold">{formatHours(group.available)}</td>
                              <td className="px-3 py-3 text-sm">
                                <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                  {group.status}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="border-b bg-muted/10">
                                <td colSpan={8} className="px-6 py-3">
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Desglose por carrera / ciclo
                                  </p>
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr className="border-b text-left text-xs text-muted-foreground">
                                        <th className="px-2 py-2 font-semibold">Carrera / Malla</th>
                                        <th className="px-2 py-2 font-semibold">Ciclo</th>
                                        <th className="px-2 py-2 font-semibold">Asignado</th>
                                        <th className="px-2 py-2 font-semibold">Docencia</th>
                                        <th className="px-2 py-2 font-semibold">Proyectos</th>
                                        <th className="px-2 py-2 font-semibold">Disponible</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {group.rows.map((row) => (
                                        <tr
                                          key={`${row.campusId}-${row.curricularMesh}-${row.academicCycle}`}
                                          className="border-b last:border-b-0"
                                        >
                                          <td className="px-2 py-2 text-sm">{row.curricularMesh || 'Sin malla'}</td>
                                          <td className="px-2 py-2 text-sm text-muted-foreground">{row.academicCycle}</td>
                                          <td className="px-2 py-2 text-sm">{formatHours(row.allocated || 0)}</td>
                                          <td className="px-2 py-2 text-sm text-blue-700">{formatHours(row.professorConsumed || 0)}</td>
                                          <td className="px-2 py-2 text-sm text-amber-700">{formatHours(row.projectsConsumed || 0)}</td>
                                          <td className="px-2 py-2 text-sm font-semibold">{formatHours(row.available || 0)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components'
import { useEffect, useState } from 'react'
import TimesTable from '../components/TimesTable'
import { TimesService } from '../services/times.service'

// 🧩 Tipo para la configuración
type JourneyConfig = {
  quarterTimeMinHours: number
  quarterTimeMaxHours: number
  quarterTimeValue: number
  halfTimeMinHours: number
  halfTimeMaxHours: number
  halfTimeValue: number
  fullTimeMinHours: number
  fullTimeValue: number
  threeQuarterMinHours?: number
  threeQuarterMaxHours?: number
  threeQuarterTimeValue?: number
  maxDailyHours?: number
  effectiveYear?: number | string
  status?: string
}

// 🧠 Función de cálculo tolerante
function calculateJourneyType(hours: number, cfg: JourneyConfig) {
  if (!cfg) return null
  if (hours >= cfg.quarterTimeMinHours && hours <= cfg.quarterTimeMaxHours)
    return { type: '¼ Tiempo', value: cfg.quarterTimeValue }
  if (hours >= cfg.halfTimeMinHours && hours <= cfg.halfTimeMaxHours) return { type: '½ Tiempo', value: cfg.halfTimeValue }
  if (
    cfg.threeQuarterMinHours != null &&
    cfg.threeQuarterMaxHours != null &&
    cfg.threeQuarterTimeValue != null &&
    hours >= cfg.threeQuarterMinHours &&
    hours <= cfg.threeQuarterMaxHours
  )
    return { type: '¾ Tiempo', value: cfg.threeQuarterTimeValue }
  if (hours >= cfg.fullTimeMinHours) return { type: 'Tiempo Completo', value: cfg.fullTimeValue }
  return { type: 'No definido', value: 0 }
}

export default function TimesAdminPage() {
  const [campusData, setCampusData] = useState<any[]>([])
  const [config, setConfig] = useState<any>(null)
  const [hours, setHours] = useState('')
  const [result, setResult] = useState<any>(null)

  // Mock para asignaciones de profesores
  const [profName, setProfName] = useState('')
  const [profHours, setProfHours] = useState('')
  const [profAssignments, setProfAssignments] = useState<any[]>([])
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const [filteredAssignments, setFilteredAssignments] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const [loading, setLoading] = useState({ campus: false, config: false })
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // if (!isClient) return
    // --- Cargar datos de campus ---
    setLoading((s) => ({ ...s, campus: true }))
    TimesService.getCampusAllocations()
      .then((res) => setCampusData(Array.isArray(res) ? res : res.data || []))
      .catch(() => setFetchError('No se pudieron cargar las asignaciones.'))
      .finally(() => setLoading((s) => ({ ...s, campus: false })))

    // --- Cargar configuración activa ---
    setLoading((s) => ({ ...s, config: true }))
    const stored = localStorage.getItem('tempConfig')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConfig(parsed)
        setLoading((s) => ({ ...s, config: false }))
        return // 👈 usa config del localStorage
      } catch (e) {
        console.error('Error al leer tempConfig', e)
      }
    }

    TimesService.getActiveConfig()
      .then((res) => setConfig(res?.data || res))
      .catch(() => setFetchError('No se pudo cargar la configuración activa.'))
      .finally(() => setLoading((s) => ({ ...s, config: false })))
  }, [])

  useEffect(() => {
    setFilteredAssignments(profAssignments)
  }, [profAssignments])

  const handleCalc = () => {
    if (!hours || !config) return
    const h = Number(hours)
    if (isNaN(h) || h <= 0) return setResult({ type: 'Error', value: 0, message: 'Debe ingresar un número válido de horas.' })
    if (h > 12) return setResult({ type: 'Error', value: 0, message: 'El valor excede el máximo de 12 horas permitidas.' })
    const res = calculateJourneyType(h, config)
    setResult(res)
  }

  const handleAssign = () => {
    const h = Number(profHours)
    if (!profName.trim()) return setMessage({ type: 'error', text: 'Debe ingresar el nombre del profesor.' })
    if (isNaN(h) || h <= 0) return setMessage({ type: 'error', text: 'Debe ingresar una cantidad válida de horas.' })
    const maxDaily = (config as JourneyConfig)?.maxDailyHours ?? 12
    if (h > maxDaily) return setMessage({ type: 'error', text: `No más de ${maxDaily} horas por asignación.` })

    setProfAssignments((prev) => {
      const existing = prev.find((p) => p.name === profName)
      const current = existing?.hours ?? 0
      if (current + h > maxDaily) {
        setMessage({ type: 'error', text: `Asignación excede el máximo de ${maxDaily} horas para ${profName}.` })
        return prev
      }
      const total = current + h
      const calc = calculateJourneyType(total, config)
      setMessage({ type: 'ok', text: `Horas asignadas correctamente a ${profName}.` })
      return existing
        ? prev.map((p) => (p.name === profName ? { ...p, hours: total, type: calc?.type } : p))
        : [...prev, { name: profName, hours: h, type: calculateJourneyType(h, config)?.type }]
    })
    setProfName('')
    setProfHours('')
  }

  const totalAssigned = profAssignments.reduce((acc, cur) => acc + Number(cur.hours), 0)

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredAssignments(profAssignments)
      setSearchResults([])
      return
    }
    const results = profAssignments.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredAssignments(results)
    setSearchResults(results)
  }

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Cargando módulo...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8 overflow-y-auto max-h-screen">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Tiempos de Jornada</h1>
        <p className="text-muted-foreground">
          Módulo administrativo para visualizar, calcular y gestionar configuraciones de jornada académica.
        </p>
      </div>

      <Tabs defaultValue="allocations" className="w-full">
        <TabsList className="flex w-full justify-center overflow-x-auto gap-3">
          <TabsTrigger value="allocations">Asignaciones</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="calculation">Cálculo</TabsTrigger>
          <TabsTrigger value="professor">Profesores</TabsTrigger>
        </TabsList>

        {/* TAB 1: ASIGNACIONES */}
        <TabsContent value="allocations" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asignaciones por Campus</CardTitle>
              <CardDescription>Visualización general de las cargas horarias por sede.</CardDescription>
            </CardHeader>
            <CardContent>
              {fetchError && <p className="text-red-600 text-sm mb-2">{fetchError}</p>}
              {loading.campus ? (
                <p className="text-sm text-gray-500">Cargando asignaciones…</p>
              ) : (
                <TimesTable data={campusData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: CONFIGURACIÓN */}
        <TabsContent value="config" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Activa</CardTitle>
              <CardDescription>Parámetros que definen el rango de horas por tipo de jornada.</CardDescription>
            </CardHeader>

            <CardContent>
              {loading.config ? (
                <p className="text-sm text-gray-500">Cargando configuración...</p>
              ) : (
                <>
                  {/* Grid principal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">¼ Tiempo</p>
                      <p className="font-semibold">
                        {config?.quarterTimeMinHours ?? '-'} - {config?.quarterTimeMaxHours ?? '-'} horas
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">½ Tiempo</p>
                      <p className="font-semibold">
                        {config?.halfTimeMinHours ?? '-'} - {config?.halfTimeMaxHours ?? '-'} horas
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">¾ Tiempo</p>
                      <p className="font-semibold">
                        {config?.threeQuarterMinHours ?? '-'} - {config?.threeQuarterMaxHours ?? '-'} horas
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo Completo</p>
                      <p className="font-semibold">Desde {config?.fullTimeMinHours ?? '-'} horas</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Año de vigencia</p>
                      <p className="font-semibold">{config?.effectiveYear ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <p className="font-semibold">{config?.status ?? '-'}</p>
                    </div>
                  </div>

                  {/* Bloque uploader */}
                  <div className="mt-8 border-t pt-4">
                    <h3 className="font-semibold mb-2">Actualizar configuración (solo administrador)</h3>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          try {
                            const newConfig = JSON.parse(ev.target?.result as string)
                            setConfig(newConfig)
                            localStorage.setItem('tempConfig', JSON.stringify(newConfig))
                            alert('Configuración cargada temporalmente (persistirá hasta reemplazar o limpiar).')
                          } catch {
                            alert('Archivo JSON inválido.')
                          }
                        }
                        reader.readAsText(file)
                      }}
                      className="block mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">Solo visible para administradores.</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CÁLCULO */}
        <TabsContent value="calculation" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calcular Equivalencia</CardTitle>
              <CardDescription>Permite estimar a qué tipo de jornada corresponde un número de horas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Horas..."
                  className="border px-2 py-1 rounded w-32"
                />
                <button
                  onClick={handleCalc}
                  className="bg-blue-500 text-white px-4 py-1 rounded shadow hover:bg-blue-600 transition-colors"
                >
                  Calcular
                </button>
              </div>
              {result && (
                <div className={`mt-4 p-3 border rounded ${result.type === 'Error' ? 'bg-red-100 text-red-700' : 'bg-green-50'}`}>
                  {result.type === 'Error' ? (
                    <p>{result.message}</p>
                  ) : (
                    <p>
                      El valor ingresado corresponde a: <b>{result.type}</b> ({result.value})
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: PROFESORES */}
        <TabsContent value="professor" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asignar Tiempo a Profesor</CardTitle>
              <CardDescription>
                Simula la distribución de horas académicas entre profesores (solo frontend por ahora).
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* BUSCAR PROFESOR */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 transition"
              >
                {showSearch ? 'Cerrar búsqueda' : 'Buscar profesor'}
              </button>

              {showSearch && (
                <div className="border rounded p-3 bg-gray-50">
                  <p className="font-medium mb-2">Buscar profesor registrado</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre o cédula..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border px-2 py-1 rounded flex-1"
                    />
                    <button
                      onClick={handleSearch}
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Buscar
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-3 border-t pt-2">
                      <p className="text-sm text-gray-600 mb-1">Resultados:</p>
                      {searchResults.map((r, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setProfName(r.name)
                            setShowSearch(false)
                          }}
                          className="cursor-pointer hover:bg-blue-50 p-1 rounded"
                        >
                          {r.name} — {r.cedula}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FORMULARIO DE ASIGNACIÓN */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  placeholder="Nombre del profesor"
                  className="border px-2 py-1 rounded w-48"
                />
                <input
                  type="number"
                  value={profHours}
                  onChange={(e) => setProfHours(e.target.value)}
                  placeholder="Horas"
                  className="border px-2 py-1 rounded w-32"
                />
                <button
                  onClick={handleAssign}
                  className="bg-blue-500 text-white px-4 py-1 rounded shadow hover:bg-blue-600 transition-colors"
                >
                  Asignar
                </button>
              </div>

              {/* MENSAJE DE ESTADO */}
              {message && (
                <div
                  className={`p-2 mb-4 rounded ${
                    message.type === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* TABLA */}
              {filteredAssignments.length === 0 ? (
                <p className="text-gray-500">No hay asignaciones que coincidan.</p>
              ) : (
                <table className="table-auto border-collapse border border-gray-400 w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2">Profesor</th>
                      <th className="border px-4 py-2">Horas</th>
                      <th className="border px-4 py-2">Equivalencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((a, idx) => (
                      <tr key={idx}>
                        <td className="border px-4 py-2">{a.name}</td>
                        <td className="border px-4 py-2">{a.hours}</td>
                        <td className="border px-4 py-2">{a.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* RESUMEN */}
              <div className="mt-4 p-3 border rounded bg-gray-50 flex justify-between">
                <p className="font-semibold">Total horas asignadas: {totalAssigned}</p>
                <p className="font-semibold">Total profesores: {profAssignments.length}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

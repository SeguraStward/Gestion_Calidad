'use client'
import { useEffect, useState } from 'react'
import TimesTable from '@/modules/times-management/components/TimesTable'
import { TimesService } from '@/modules/times-management/services/times.service'

export default function TimesManagementPage() {
  const [campusData, setCampusData] = useState<any[]>([])
  const [config, setConfig] = useState<any>(null)
  const [hours, setHours] = useState('')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch campus data
        const res = await TimesService.getCampusAllocations()
        console.log('👉 Backend response:', res)

        // Extra safety check to ensure we always have an array
        setCampusData(Array.isArray(res) ? res : [])

        // Fetch config
        const configData = await TimesService.getActiveConfig()
        setConfig(configData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setCampusData([])
      }
    }

    fetchData()
  }, [])
  const handleCalc = async () => {
    if (!hours) return
    const res = await TimesService.calculate(Number(hours))
    setResult(res)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Tiempos de Jornada</h1>

      <h2 className="text-xl font-semibold mb-2">Asignaciones por Campus</h2>
      <TimesTable data={campusData} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Configuración activa</h2>
        {config ? (
          <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(config, null, 2)}</pre>
        ) : (
          <p className="text-gray-500">No hay config activa</p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Calcular equivalencia</h2>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Horas..."
          className="border px-2 py-1 mr-2"
        />
        <button onClick={handleCalc} className="bg-blue-500 text-white px-3 py-1 rounded">
          Calcular
        </button>
        {result && (
          <p className="mt-2">
            Resultado: <b>{result.type}</b> ({result.value})
          </p>
        )}
      </div>
    </div>
  )
}

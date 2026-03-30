'use client'
import React from 'react'

export default function TimesTable({ data }: { data: any }) {
  const safeData = Array.isArray(data) ? data : (data?.data ?? [])

  if (!safeData || safeData.length === 0) {
    return <p className="text-gray-500">No hay asignaciones registradas.</p>
  }

  //  Detectar dinámicamente si los campos son anidados o simples
  return (
    <table className="table-auto border-collapse border border-gray-400 w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2">Campus</th>
          <th className="border px-4 py-2">Ciclo</th>
          <th className="border px-4 py-2">Horas Totales</th>
          <th className="border px-4 py-2">Profesores Asignados</th>
          <th className="border px-4 py-2">Estado</th>
        </tr>
      </thead>
      <tbody>
        {safeData.map((item: any, idx: number) => (
          <tr key={idx}>
            <td className="border px-4 py-2">{item.campus?.name || item.campusName || item.campus || '—'}</td>
            <td className="border px-4 py-2">{item.cycle || item.cycleName || '—'}</td>
            <td className="border px-4 py-2">{item.totalHours ?? item.allocatedTime ?? item.hours ?? '—'}</td>
            <td className="border px-4 py-2">{item.assignedProfessors ?? item.professorsCount ?? '—'}</td>
            <td className="border px-4 py-2">{item.status || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

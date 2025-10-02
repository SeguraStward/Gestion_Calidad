'use client'
import React from 'react'

export default function TimesTable({ data }: { data: any }) {
  // 👇 asegurar que sea array siempre
  const safeData = Array.isArray(data) ? data : (data?.data ?? [])

  if (!safeData || safeData.length === 0) {
    return <p className="text-gray-500">No hay asignaciones registradas.</p>
  }

  return (
    <table className="table-auto border-collapse border border-gray-400 w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2">Campus</th>
          <th className="border px-4 py-2">Ciclo</th>
          <th className="border px-4 py-2">Horas</th>
          <th className="border px-4 py-2">Estado</th>
        </tr>
      </thead>
      <tbody>
        {safeData.map((item: any, idx: number) => (
          <tr key={idx}>
            <td className="border px-4 py-2">{item.campus}</td>
            <td className="border px-4 py-2">{item.cycle}</td>
            <td className="border px-4 py-2">{item.allocatedTime}</td>
            <td className="border px-4 py-2">{item.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

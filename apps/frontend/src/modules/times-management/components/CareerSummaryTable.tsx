'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import type { CareerAnnualSummary, AnnualBalance } from '../services/times.service'

interface CareerSummaryTableProps {
  rows: CareerAnnualSummary[]
  balance: AnnualBalance | null
  year: number
}

function fmt(v: number) {
  return v === 0 ? '—' : v.toFixed(2) + 'j'
}

export default function CareerSummaryTable({ rows, balance, year }: CareerSummaryTableProps) {
  // Recopilar todos los nombres de ciclos únicos (orden estable por aparición)
  const cycleNames = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r.byCycle)))
  ).sort()

  // Agrupar por campus
  const byCampus = new Map<string, { campusName: string; rows: CareerAnnualSummary[] }>()
  for (const row of rows) {
    const key = row.campusId
    const existing = byCampus.get(key) ?? { campusName: row.campusName, rows: [] }
    existing.rows.push(row)
    byCampus.set(key, existing)
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <p className="font-medium">Sin asignaciones registradas para {year}</p>
          <p className="mt-1 text-sm">
            Registra profesores con cursos asignados para ver el resumen por carrera y ciclo.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabla por campus */}
      {Array.from(byCampus.entries()).map(([campusId, { campusName, rows: campusRows }]) => {
        const campusTotal = campusRows.reduce((s, r) => s + r.totalYear, 0)

        return (
          <Card key={campusId}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">{campusName}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left font-semibold">Carrera</th>
                    {cycleNames.map((c) => (
                      <th key={c} className="px-4 py-2 text-right font-semibold">{c}</th>
                    ))}
                    <th className="px-4 py-2 text-right font-semibold text-amber-700">Repitencia</th>
                    <th className="px-4 py-2 text-right font-semibold">Total año</th>
                  </tr>
                </thead>
                <tbody>
                  {campusRows.map((row) => (
                    <tr key={row.careerId} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{row.careerName}</td>
                      {cycleNames.map((c) => (
                        <td key={c} className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {fmt(row.byCycle[c] ?? 0)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right tabular-nums text-amber-700 font-medium">
                        {fmt(row.repitencia)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">
                        {fmt(row.totalYear)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-muted/40 font-semibold">
                    <td className="px-4 py-3">Total {campusName}</td>
                    {cycleNames.map((c) => (
                      <td key={c} className="px-4 py-3 text-right tabular-nums">
                        {fmt(campusRows.reduce((s, r) => s + (r.byCycle[c] ?? 0), 0))}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right tabular-nums text-amber-700">
                      {fmt(campusRows.reduce((s, r) => s + r.repitencia, 0))}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-primary">
                      {fmt(campusTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        )
      })}

      {/* Total Brunca + Balance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 border-blue-200 bg-blue-50/40">
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Total Brunca {year}</p>
            <p className="text-3xl font-bold tabular-nums">
              {fmt(rows.reduce((s, r) => s + r.totalYear, 0))}
            </p>
            <p className="text-xs text-muted-foreground">
              Solo docencia (cursos ordinarios + repitencia)
            </p>
          </CardContent>
        </Card>

        {balance && (
          <Card
            className={`border-2 ${
              balance.saldo >= 0
                ? 'border-green-400 bg-green-50/50'
                : 'border-red-400 bg-red-50/50'
            }`}
          >
            <CardContent className="p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Saldo de tiempos {year}
              </p>
              <p
                className={`text-3xl font-bold tabular-nums ${
                  balance.saldo >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {balance.saldo >= 0 ? '+' : ''}{fmt(balance.saldo)}
              </p>
              <div className="text-xs space-y-1 text-muted-foreground pt-1">
                <div className="flex justify-between">
                  <span>Disponibles (base + externos)</span>
                  <span className="font-medium tabular-nums">{fmt(balance.jornadasDisponibles)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Docencia</span>
                  <span className="font-medium tabular-nums text-blue-700">−{fmt(balance.jornadasDocencia)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Proyectos y gestión</span>
                  <span className="font-medium tabular-nums text-amber-700">−{fmt(balance.jornadasProyectos)}</span>
                </div>
              </div>
              {balance.saldo < 0 && (
                <p className="text-xs font-semibold text-red-700 pt-1">
                  Faltan {fmt(Math.abs(balance.saldo))} por gestionar
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

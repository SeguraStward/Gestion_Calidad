'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Badge } from '@una-gc/ui/components/badge'
import { Input } from '@una-gc/ui/components/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@una-gc/ui/components/table'
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  FileX,
  GraduationCap,
  Loader2,
  Search,
  Upload,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  useDocumentsByCareer,
  useExportInventoryPdf,
} from '../../services/sinaes-reports.service'
import { exportInventoryToExcel } from '../../utils/report-excel.export'
import type {
  CareerInventory,
  CriterionInventory,
  DimensionInventory,
  EvidenceInventory,
  StandardInventory,
} from '../../types/documents-by-career.types'

/**
 * Tab "Inventario por Carrera".
 *
 * No usa métricas de cumplimiento (% ni semáforos). Solo cuenta documentos
 * probatorios asociados a cada carrera y los ubica en la jerarquía SINAES.
 * El admin lo usa para responder "¿qué documentos tiene la carrera X y dónde
 * le faltan?".
 */
export function CareerInventoryTab() {
  // Filters are kept local — the report regenerates on demand via the hook.
  // For now we don't surface a multi-career picker; the report covers every
  // active career and the user can filter the table client-side via search.
  // Career-specific filtering can be reintroduced later if needed.
  const [search, setSearch] = useState('')
  const [expandedCareerId, setExpandedCareerId] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useDocumentsByCareer({})
  const exportPdf = useExportInventoryPdf()

  const handleExportPdf = async () => {
    if (!data) return
    try {
      await exportPdf.mutateAsync(data)
      toast.success('PDF generado')
    } catch (err: any) {
      toast.error('Error al exportar el PDF', {
        description: err?.message || 'Intenta de nuevo en unos segundos.',
      })
    }
  }

  const handleExportExcel = () => {
    if (!data) return
    try {
      exportInventoryToExcel(data)
      toast.success('Excel generado')
    } catch (err: any) {
      toast.error('Error al exportar el Excel', {
        description: err?.message || 'Intenta de nuevo en unos segundos.',
      })
    }
  }

  const filteredCareers = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = data?.careers ?? []
    if (!term) return list
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term),
    )
  }, [data, search])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando inventario por carrera...
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    // Surface the most specific message we can find. Backend Nest errors
    // arrive as { message } inside the axios response, not on Error.message.
    const anyErr = error as any
    const msg =
      anyErr?.response?.data?.message ||
      anyErr?.response?.data?.error ||
      anyErr?.message ||
      'Error desconocido'
    const status = anyErr?.response?.status
    return (
      <Card>
        <CardContent className="p-8 space-y-2 text-center">
          <p className="text-destructive font-medium">No se pudo cargar el inventario por carrera</p>
          <p className="text-sm text-muted-foreground">
            {status ? `(HTTP ${status}) ` : ''}{msg}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Defend against shapes that don't match the contract (server-side bug,
  // older deploys still up, etc). Avoids cryptic "cannot read summary" errors.
  if (!data || !data.summary || !Array.isArray(data.careers)) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          El servidor devolvió una respuesta inesperada. Revisa los logs del backend.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<GraduationCap className="h-5 w-5" />}
          label="Carreras"
          value={data.summary.totalCareers}
        />
        <SummaryCard
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          label="Documentos asociados"
          value={data.summary.totalDocuments}
        />
        <SummaryCard
          icon={<Users className="h-5 w-5 text-green-600" />}
          label="Carreras con documentos"
          value={data.summary.careersWithDocuments}
        />
        <SummaryCard
          icon={<FileX className="h-5 w-5 text-amber-600" />}
          label="Carreras sin documentos"
          value={data.summary.careersWithoutDocuments}
        />
      </div>

      {/* Search box */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
            <span>Carreras ({filteredCareers.length} de {data.careers.length})</span>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={data.careers.length === 0}
              >
                <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                Exportar Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={exportPdf.isPending || data.careers.length === 0}
              >
                {exportPdf.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1.5" />
                )}
                Exportar PDF
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Carrera</TableHead>
                <TableHead className="text-center">Documentos</TableHead>
                <TableHead className="text-center">Evidencias cubiertas</TableHead>
                <TableHead className="text-center">Evidencias sin docs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCareers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay carreras que coincidan con la búsqueda
                  </TableCell>
                </TableRow>
              )}
              {filteredCareers.map((career) => (
                <CareerRow
                  key={career.id}
                  career={career}
                  expanded={expandedCareerId === career.id}
                  onToggle={() =>
                    setExpandedCareerId((prev) => (prev === career.id ? null : career.id))
                  }
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="rounded-md bg-muted p-2">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value.toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CareerRow({
  career,
  expanded,
  onToggle,
}: {
  career: CareerInventory
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/40" onClick={onToggle}>
        <TableCell>
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell className="font-mono text-xs">{career.code}</TableCell>
        <TableCell className="font-medium">{career.name}</TableCell>
        <TableCell className="text-center">
          <Badge variant={career.totalDocuments > 0 ? 'default' : 'secondary'}>
            {career.totalDocuments}
          </Badge>
        </TableCell>
        <TableCell className="text-center text-green-700 dark:text-green-400 font-medium">
          {career.evidencesCovered}
        </TableCell>
        <TableCell className="text-center text-amber-700 dark:text-amber-400 font-medium">
          {career.evidencesUncovered}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-0">
            <CareerDetail career={career} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

function CareerDetail({ career }: { career: CareerInventory }) {
  return (
    <div className="p-4 space-y-4">
      {/* Hierarchy */}
      <section>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documentos por ubicación en la jerarquía
        </h4>
        {career.dimensions.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No hay dimensiones en el alcance de este reporte.
          </p>
        ) : (
          <div className="space-y-1">
            {career.dimensions.map((dim) => (
              <DimensionNode key={dim.id} dim={dim} />
            ))}
          </div>
        )}
      </section>

      {/* Gaps */}
      <section>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <FileX className="h-4 w-4 text-amber-600" />
          Ubicaciones sin documentos para esta carrera
          <Badge variant="outline" className="ml-1">
            {career.gaps.length}
          </Badge>
        </h4>
        {career.gaps.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Esta carrera tiene documentos en todas las evidencias del alcance.
          </p>
        ) : (
          <GapList careerId={career.id} careerCode={career.code} gaps={career.gaps} />
        )}
      </section>
    </div>
  )
}

function DimensionNode({ dim }: { dim: DimensionInventory }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left py-1 hover:bg-muted/40 rounded px-2 text-sm"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-mono text-xs text-blue-700 dark:text-blue-400">{dim.code}</span>
        <span className="font-medium">{dim.name}</span>
        <Badge variant="outline" className="ml-auto">
          {dim.documentCount} doc{dim.documentCount === 1 ? '' : 's'}
        </Badge>
      </button>
      {open && (
        <div className="pl-5 border-l ml-2 mt-1 space-y-1">
          {dim.components.map((comp) => (
            <ComponentNode key={comp.id} comp={comp} />
          ))}
          {dim.components.length === 0 && (
            <p className="text-xs text-muted-foreground italic pl-3">Sin componentes</p>
          )}
        </div>
      )}
    </div>
  )
}

function ComponentNode({ comp }: { comp: { id: string; code: string; name: string; documentCount: number; criteria: CriterionInventory[] } }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left py-1 hover:bg-muted/40 rounded px-2 text-sm"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-mono text-xs text-purple-700 dark:text-purple-400">{comp.code}</span>
        <span>{comp.name}</span>
        <Badge variant="outline" className="ml-auto">
          {comp.documentCount}
        </Badge>
      </button>
      {open && (
        <div className="pl-5 border-l ml-2 mt-1 space-y-1">
          {comp.criteria.map((crit) => (
            <CriterionNode key={crit.id} crit={crit} />
          ))}
        </div>
      )}
    </div>
  )
}

function CriterionNode({ crit }: { crit: CriterionInventory }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left py-1 hover:bg-muted/40 rounded px-2 text-sm"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-mono text-xs text-gray-600">{crit.code}</span>
        <span>{crit.name}</span>
        <Badge variant="outline" className="ml-auto">
          {crit.documentCount}
        </Badge>
      </button>
      {open && (
        <div className="pl-5 border-l ml-2 mt-1 space-y-1">
          {crit.directEvidences.map((ev) => (
            <EvidenceNode key={ev.id} ev={ev} />
          ))}
          {crit.standards.map((std) => (
            <StandardNode key={std.id} std={std} />
          ))}
        </div>
      )}
    </div>
  )
}

function StandardNode({ std }: { std: StandardInventory }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left py-1 hover:bg-muted/40 rounded px-2 text-sm"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-mono text-xs text-amber-700 dark:text-amber-400">{std.code}</span>
        <span>{std.name}</span>
        <Badge variant="outline" className="ml-auto">
          {std.documentCount}
        </Badge>
      </button>
      {open && (
        <div className="pl-5 border-l ml-2 mt-1 space-y-1">
          {std.evidences.map((ev) => (
            <EvidenceNode key={ev.id} ev={ev} />
          ))}
        </div>
      )}
    </div>
  )
}

function EvidenceNode({ ev }: { ev: EvidenceInventory }) {
  return (
    <div className="px-2 py-1">
      <div className="flex items-center gap-2 text-sm">
        <FileText className="h-3 w-3 text-green-600" />
        <span className="font-mono text-xs text-green-700 dark:text-green-400">{ev.code}</span>
        <span>{ev.name}</span>
        <Badge variant={ev.documentCount > 0 ? 'default' : 'secondary'} className="ml-auto">
          {ev.documentCount}
        </Badge>
      </div>
      {ev.documents.length > 0 && (
        <ul className="ml-7 mt-1 space-y-0.5 text-xs">
          {ev.documents.map((doc) => (
            <li key={doc.id} className="text-muted-foreground">
              <span className="font-mono text-foreground">{doc.code}</span>
              {' — '}
              {doc.fileUrl ? (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {doc.name}
                </a>
              ) : (
                <span>{doc.name}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function GapList({
  careerId,
  careerCode,
  gaps,
}: {
  careerId: string
  careerCode: string
  gaps: CareerInventory['gaps']
}) {
  const router = useRouter()
  // Group gaps by dimension → component → criterion so the user reads a tree
  // instead of a flat list of N rows.
  const grouped = useMemo(() => {
    const tree = new Map<string, Map<string, Map<string, typeof gaps>>>()
    for (const gap of gaps) {
      const dimKey = `${gap.dimensionCode}|${gap.dimensionName}`
      const compKey = `${gap.componentCode}|${gap.componentName}`
      const critKey = `${gap.criterionCode}|${gap.criterionName}`
      if (!tree.has(dimKey)) tree.set(dimKey, new Map())
      const dimMap = tree.get(dimKey)!
      if (!dimMap.has(compKey)) dimMap.set(compKey, new Map())
      const compMap = dimMap.get(compKey)!
      if (!compMap.has(critKey)) compMap.set(critKey, [])
      compMap.get(critKey)!.push(gap)
    }
    return tree
  }, [gaps])

  const goToUpload = (gap: CareerInventory['gaps'][number]) => {
    // Deep link to the upload tab with pre-selected evidence + career. The
    // upload form can read these query params and prefill its state.
    const params = new URLSearchParams({
      tab: 'upload',
      evidenceId: gap.evidenceId,
      careerId,
      careerCode,
    })
    router.push(`/sinaes-management?${params.toString()}`)
  }

  return (
    <div className="space-y-2 text-sm">
      {Array.from(grouped.entries()).map(([dimKey, components]) => {
        const [dimCode, dimName] = dimKey.split('|')
        return (
          <div key={dimKey} className="rounded border bg-background">
            <div className="px-3 py-1.5 border-b bg-muted/40 text-xs">
              <span className="font-mono text-blue-700 dark:text-blue-400">{dimCode}</span>{' '}
              <span className="font-medium">{dimName}</span>
            </div>
            <div className="p-2 space-y-2">
              {Array.from(components.entries()).map(([compKey, criteria]) => {
                const [compCode, compName] = compKey.split('|')
                return (
                  <div key={compKey} className="pl-2">
                    <div className="text-xs">
                      <span className="font-mono text-purple-700 dark:text-purple-400">{compCode}</span>{' '}
                      {compName}
                    </div>
                    {Array.from(criteria.entries()).map(([critKey, evList]) => {
                      const [critCode, critName] = critKey.split('|')
                      return (
                        <div key={critKey} className="pl-4 mt-1">
                          <div className="text-xs text-muted-foreground">
                            <span className="font-mono">{critCode}</span> {critName}
                          </div>
                          <ul className="pl-3 mt-1 space-y-1">
                            {evList.map((gap) => (
                              <li
                                key={gap.evidenceId}
                                className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-muted/40 text-xs"
                              >
                                <span className="flex items-center gap-2">
                                  {gap.standardCode && (
                                    <span className="font-mono text-amber-700 dark:text-amber-400">
                                      {gap.standardCode}
                                    </span>
                                  )}
                                  <span className="font-mono text-green-700 dark:text-green-400">
                                    {gap.evidenceCode}
                                  </span>
                                  <span>{gap.evidenceName}</span>
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => goToUpload(gap)}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Subir aquí
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

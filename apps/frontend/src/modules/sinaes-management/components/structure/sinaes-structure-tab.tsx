'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { ChevronRight, ChevronDown, Plus, PenLine, Trash2, Layers, Loader2, FileText, AlertTriangle } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Badge } from '@una-gc/ui/components/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@una-gc/ui/components/alert-dialog'
import { cn } from '@una-gc/ui/lib/utils'

import { useDimensions, useDeleteDimension } from '../../services/dimensions.service'
import { useComponents, useDeleteComponent } from '../../services/components.service'
import { useCriteria, useDeleteCriterion } from '../../services/criteria.service'
import { useStandards, useDeleteStandard } from '../../services/standards.service'
import { useQualityEvidences, useDeleteQualityEvidence } from '../../services/quality-evidences.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'

import { DimensionForm } from '../forms/dimension-form'
import { ComponentForm } from '../forms/component-form'
import { CriterionForm } from '../forms/criterion-form'
import { StandardForm } from '../forms/standard-form'
import { QualityEvidenceForm } from '../forms/quality-evidence-form'

import type { Dimension } from '../../types/dimensions.types'
import type { Component } from '../../types/components.types'
import type { Criterion } from '../../types/criteria.types'
import type { Standard } from '../../types/standards.types'
import type { QualityEvidence } from '../../types/quality-evidences.types'

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────

interface ConfirmDeleteProps {
  open: boolean
  entityName: string
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}

function ConfirmDelete({ open, entityName, onConfirm, onCancel, isPending }: ConfirmDeleteProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar elemento?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará <strong>{entityName}</strong>. Esta acción no se puede deshacer.
            Si el elemento tiene hijos asociados, la eliminación será rechazada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Delete Error Dialog (shared via context) ─────────────────────────────────
//
// The structure tab triggers many delete mutations from nested rows. Instead of
// each row owning its own toast/dialog state, a single dialog is mounted at the
// top of the tree and any row can report a delete error through this context.
// The hook generic.hooks.ts is configured with `silent: { remove: { error: true } }`
// for these entities, so this is the ONE place where delete errors surface.

interface DeleteError {
  /** The full backend message — already user-facing in Spanish (see backend FK config). */
  message: string
  /** What the user tried to delete (e.g. "la dimensión 'Docencia'"). */
  entityLabel: string
}

const DeleteErrorReporter = createContext<(err: DeleteError) => void>(() => {})

function useReportDeleteError() {
  return useContext(DeleteErrorReporter)
}

/** Extracts a user-facing message from an axios/Nest error. */
function extractDeleteErrorMessage(error: any, fallback: string): string {
  const data = error?.response?.data
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  if (Array.isArray(data?.message) && data.message.length) {
    const joined = data.message.filter((m: any) => typeof m === 'string').join(', ')
    if (joined.trim()) return joined
  }
  if (typeof error?.message === 'string' && error.message.trim()) return error.message
  return fallback
}

function DeleteErrorDialog({
  error,
  onClose,
}: {
  error: DeleteError | null
  onClose: () => void
}) {
  return (
    <AlertDialog open={!!error}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            No se pudo eliminar {error?.entityLabel}
          </AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">
            {error?.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Row base styles ──────────────────────────────────────────────────────────

const levelConfig = {
  dimension: {
    indent: 'pl-0',
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
    label: 'text-sm font-semibold',
    addLabel: 'Componente',
  },
  component: {
    indent: 'pl-6',
    bg: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-700',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300',
    label: 'text-sm font-medium',
    addLabel: 'Criterio',
  },
  criterion: {
    indent: 'pl-12',
    bg: 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700',
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300',
    label: 'text-sm',
    addLabel: 'Estándar / Evidencia',
  },
  standard: {
    indent: 'pl-20',
    bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-700',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300',
    label: 'text-xs font-medium',
    addLabel: 'Evidencia',
  },
  evidence: {
    indent: 'pl-28',
    bg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-700',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300',
    label: 'text-xs',
    addLabel: '',
  },
}

// ─── Evidence Row (leaf) ──────────────────────────────────────────────────────

interface EvidenceRowProps {
  evidence: QualityEvidence
  onEdit: (ev: QualityEvidence) => void
  onDelete: (ev: QualityEvidence) => void
}

function EvidenceRow({ evidence, onEdit, onDelete }: EvidenceRowProps) {
  const cfg = levelConfig.evidence
  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 border-b last:border-b-0', cfg.indent, cfg.bg)}>
      <FileText className="h-3.5 w-3.5 flex-shrink-0 text-green-600 dark:text-green-400" />
      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-mono flex-shrink-0', cfg.badge)}>
        {evidence.code}
      </Badge>
      <span className={cn('flex-1 truncate', cfg.label)}>{evidence.name}</span>
      {evidence.description && (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] hidden md:block">
          {evidence.description}
        </span>
      )}
      <div className="flex gap-1 flex-shrink-0">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(evidence)}>
          <PenLine className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete(evidence)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// ─── Standard Row ─────────────────────────────────────────────────────────────

interface StandardRowProps {
  standard: Standard
  onEdit: (s: Standard) => void
  onDelete: (s: Standard) => void
  onAddEvidence: (s: Standard) => void
}

function StandardRow({ standard, onEdit, onDelete, onAddEvidence }: StandardRowProps) {
  const [expanded, setExpanded] = useState(false)
  const cfg = levelConfig.standard
  const reportDeleteError = useReportDeleteError()

  const { data: evidencesData, isLoading } = useQualityEvidences(
    { standardId: standard.id },
    { enabled: expanded }
  )
  const evidences = evidencesData?.data ?? []

  const [deleteTarget, setDeleteTarget] = useState<QualityEvidence | null>(null)
  const [editEvidence, setEditEvidence] = useState<QualityEvidence | null>(null)
  const [showEvidenceForm, setShowEvidenceForm] = useState(false)
  const deleteEvidence = useDeleteQualityEvidence()
  const { selectStandard } = useSinaesNavigation()

  const handleAddEvidence = () => {
    selectStandard(standard)
    onAddEvidence(standard)
    setShowEvidenceForm(true)
  }

  return (
    <>
      {/* Standard row */}
      <div className={cn('flex items-center gap-2 px-3 py-2 border-b', cfg.indent, cfg.bg)}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-0.5 rounded hover:bg-black/5"
        >
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-mono flex-shrink-0', cfg.badge)}>
          {standard.code}
        </Badge>
        <span className={cn('flex-1 truncate', cfg.label)}>{standard.name}</span>
        {standard.description && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px] hidden md:block">
            {standard.description}
          </span>
        )}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost" size="sm" className="h-6 px-1.5 text-xs gap-1"
            onClick={handleAddEvidence}
          >
            <Plus className="h-3 w-3" />
            Evidencia
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(standard)}>
            <PenLine className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(standard)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Evidences */}
      {expanded && (
        <>
          {isLoading && (
            <div className={cn('flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground', levelConfig.evidence.indent)}>
              <Loader2 className="h-3 w-3 animate-spin" /> Cargando evidencias...
            </div>
          )}
          {evidences.map((ev) => (
            <EvidenceRow
              key={ev.id}
              evidence={ev}
              onEdit={(e) => { setEditEvidence(e); setShowEvidenceForm(true) }}
              onDelete={(e) => setDeleteTarget(e)}
            />
          ))}
          {!isLoading && evidences.length === 0 && (
            <div className={cn('px-3 py-2 text-xs text-muted-foreground italic', levelConfig.evidence.indent)}>
              Sin evidencias
            </div>
          )}
        </>
      )}

      {/* Edit evidence form */}
      <QualityEvidenceForm
        open={showEvidenceForm}
        onClose={() => { setShowEvidenceForm(false); setEditEvidence(null) }}
        evidence={editEvidence}
        onSuccess={() => { setShowEvidenceForm(false); setEditEvidence(null) }}
      />

      <ConfirmDelete
        open={!!deleteTarget}
        entityName={deleteTarget?.name ?? ''}
        isPending={deleteEvidence.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          const target = deleteTarget
          setDeleteTarget(null)
          try {
            await deleteEvidence.mutateAsync(target.id)
          } catch (e: any) {
            reportDeleteError({
              entityLabel: `la evidencia "${target.name}"`,
              message: extractDeleteErrorMessage(e, 'No se pudo eliminar la evidencia.'),
            })
          }
        }}
      />
    </>
  )
}

// ─── Criterion Row ────────────────────────────────────────────────────────────

interface CriterionRowProps {
  criterion: Criterion
  onEdit: (c: Criterion) => void
  onDelete: (c: Criterion) => void
}

function CriterionRow({ criterion, onEdit, onDelete }: CriterionRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [showStandardForm, setShowStandardForm] = useState(false)
  const [showEvidenceForm, setShowEvidenceForm] = useState(false)
  const [editStandard, setEditStandard] = useState<Standard | null>(null)
  const [deleteStandard, setDeleteStandard] = useState<Standard | null>(null)
  const cfg = levelConfig.criterion
  const reportDeleteError = useReportDeleteError()

  const { selectCriterion, selectStandard } = useSinaesNavigation()

  const { data: standardsData, isLoading: loadingStandards } = useStandards(
    { criterionId: criterion.id },
    { enabled: expanded }
  )
  const standards = standardsData?.data ?? []

  const { data: evidencesData, isLoading: loadingEvidences } = useQualityEvidences(
    { criterionId: criterion.id },
    { enabled: expanded && criterion.hasDirectEvidences === true }
  )
  const directEvidences = evidencesData?.data ?? []

  const [editEvidence, setEditEvidence] = useState<QualityEvidence | null>(null)
  const [showDirectEvidenceForm, setShowDirectEvidenceForm] = useState(false)
  const [deleteEvidence, setDeleteEvidenceTarget] = useState<QualityEvidence | null>(null)

  const deleteStandardMutation = useDeleteStandard()
  const deleteEvidenceMutation = useDeleteQualityEvidence()

  const handleAddStandardOrEvidence = () => {
    selectCriterion(criterion)
    if (criterion.hasDirectEvidences) {
      setShowDirectEvidenceForm(true)
    } else {
      setShowStandardForm(true)
    }
  }

  const handleAddEvidenceToStandard = (standard: Standard) => {
    selectCriterion(criterion)
    selectStandard(standard)
    // This triggers the standard row's evidence form
  }

  return (
    <>
      {/* Criterion row */}
      <div className={cn('flex items-center gap-2 px-3 py-2 border-b', cfg.indent, cfg.bg)}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-0.5 rounded hover:bg-black/5"
        >
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 font-mono flex-shrink-0', cfg.badge)}>
          {criterion.code}
        </Badge>
        <span className={cn('flex-1 truncate', cfg.label)}>{criterion.name}</span>
        <Badge variant="outline" className="text-[10px] px-1 py-0 flex-shrink-0 hidden sm:inline-flex">
          {criterion.hasDirectEvidences ? 'Directa' : 'Con estándares'}
        </Badge>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost" size="sm" className="h-6 px-1.5 text-xs gap-1"
            onClick={handleAddStandardOrEvidence}
          >
            <Plus className="h-3 w-3" />
            {criterion.hasDirectEvidences ? 'Evidencia' : 'Estándar'}
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(criterion)}>
            <PenLine className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(criterion)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {expanded && (
        <>
          {/* With standards */}
          {!criterion.hasDirectEvidences && (
            <>
              {loadingStandards && (
                <div className={cn('flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground', levelConfig.standard.indent)}>
                  <Loader2 className="h-3 w-3 animate-spin" /> Cargando estándares...
                </div>
              )}
              {standards.map((std) => (
                <StandardRow
                  key={std.id}
                  standard={std}
                  onEdit={(s) => { selectCriterion(criterion); setEditStandard(s); setShowStandardForm(true) }}
                  onDelete={(s) => setDeleteStandard(s)}
                  onAddEvidence={handleAddEvidenceToStandard}
                />
              ))}
              {!loadingStandards && standards.length === 0 && (
                <div className={cn('px-3 py-2 text-xs text-muted-foreground italic', levelConfig.standard.indent)}>
                  Sin estándares
                </div>
              )}
            </>
          )}

          {/* With direct evidences */}
          {criterion.hasDirectEvidences && (
            <>
              {loadingEvidences && (
                <div className={cn('flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground', levelConfig.evidence.indent)}>
                  <Loader2 className="h-3 w-3 animate-spin" /> Cargando evidencias...
                </div>
              )}
              {directEvidences.map((ev) => (
                <EvidenceRow
                  key={ev.id}
                  evidence={ev}
                  onEdit={(e) => { setEditEvidence(e); setShowDirectEvidenceForm(true) }}
                  onDelete={(e) => setDeleteEvidenceTarget(e)}
                />
              ))}
              {!loadingEvidences && directEvidences.length === 0 && (
                <div className={cn('px-3 py-2 text-xs text-muted-foreground italic', levelConfig.evidence.indent)}>
                  Sin evidencias directas
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Standard form */}
      <StandardForm
        open={showStandardForm}
        onClose={() => { setShowStandardForm(false); setEditStandard(null) }}
        standard={editStandard}
        onSuccess={() => { setShowStandardForm(false); setEditStandard(null) }}
      />

      {/* Direct evidence form */}
      <QualityEvidenceForm
        open={showDirectEvidenceForm}
        onClose={() => { setShowDirectEvidenceForm(false); setEditEvidence(null) }}
        evidence={editEvidence}
        onSuccess={() => { setShowDirectEvidenceForm(false); setEditEvidence(null) }}
      />

      <ConfirmDelete
        open={!!deleteStandard}
        entityName={deleteStandard?.name ?? ''}
        isPending={deleteStandardMutation.isPending}
        onCancel={() => setDeleteStandard(null)}
        onConfirm={async () => {
          if (!deleteStandard) return
          const target = deleteStandard
          setDeleteStandard(null)
          try {
            await deleteStandardMutation.mutateAsync(target.id)
          } catch (e: any) {
            reportDeleteError({
              entityLabel: `el estándar "${target.name}"`,
              message: extractDeleteErrorMessage(e, 'No se pudo eliminar el estándar.'),
            })
          }
        }}
      />

      <ConfirmDelete
        open={!!deleteEvidence}
        entityName={deleteEvidence?.name ?? ''}
        isPending={deleteEvidenceMutation.isPending}
        onCancel={() => setDeleteEvidenceTarget(null)}
        onConfirm={async () => {
          if (!deleteEvidence) return
          const target = deleteEvidence
          setDeleteEvidenceTarget(null)
          try {
            await deleteEvidenceMutation.mutateAsync(target.id)
          } catch (e: any) {
            reportDeleteError({
              entityLabel: `la evidencia "${target.name}"`,
              message: extractDeleteErrorMessage(e, 'No se pudo eliminar la evidencia.'),
            })
          }
        }}
      />
    </>
  )
}

// ─── Component Row ────────────────────────────────────────────────────────────

interface ComponentRowProps {
  component: Component
  onEdit: (c: Component) => void
  onDelete: (c: Component) => void
}

function ComponentRow({ component, onEdit, onDelete }: ComponentRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [showCriterionForm, setShowCriterionForm] = useState(false)
  const [editCriterion, setEditCriterion] = useState<Criterion | null>(null)
  const [deleteCriterion, setDeleteCriterion] = useState<Criterion | null>(null)
  const cfg = levelConfig.component
  const reportDeleteError = useReportDeleteError()

  const { selectComponent, selectCriterion } = useSinaesNavigation()

  const { data: criteriaData, isLoading } = useCriteria(
    { componentId: component.id },
    { enabled: expanded }
  )
  const criteria = criteriaData?.data ?? []

  const deleteCriterionMutation = useDeleteCriterion()

  return (
    <>
      {/* Component row */}
      <div className={cn('flex items-center gap-2 px-3 py-2 border-b', cfg.indent, cfg.bg)}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-0.5 rounded hover:bg-black/5"
        >
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
        <Badge variant="outline" className={cn('text-xs px-1.5 py-0 font-mono flex-shrink-0', cfg.badge)}>
          {component.code}
        </Badge>
        <span className={cn('flex-1 truncate', cfg.label)}>{component.name}</span>
        {component.description && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px] hidden md:block">
            {component.description}
          </span>
        )}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1"
            onClick={() => { selectComponent(component); setShowCriterionForm(true) }}
          >
            <Plus className="h-3 w-3" />
            Criterio
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(component)}>
            <PenLine className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(component)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {expanded && (
        <>
          {isLoading && (
            <div className={cn('flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground', levelConfig.criterion.indent)}>
              <Loader2 className="h-3 w-3 animate-spin" /> Cargando criterios...
            </div>
          )}
          {criteria.map((crit) => (
            <CriterionRow
              key={crit.id}
              criterion={crit}
              onEdit={(c) => { selectComponent(component); selectCriterion(c); setEditCriterion(c); setShowCriterionForm(true) }}
              onDelete={(c) => setDeleteCriterion(c)}
            />
          ))}
          {!isLoading && criteria.length === 0 && (
            <div className={cn('px-3 py-2 text-xs text-muted-foreground italic', levelConfig.criterion.indent)}>
              Sin criterios
            </div>
          )}
        </>
      )}

      <CriterionForm
        open={showCriterionForm}
        onClose={() => { setShowCriterionForm(false); setEditCriterion(null) }}
        criterion={editCriterion}
        onSuccess={() => { setShowCriterionForm(false); setEditCriterion(null) }}
      />

      <ConfirmDelete
        open={!!deleteCriterion}
        entityName={deleteCriterion?.name ?? ''}
        isPending={deleteCriterionMutation.isPending}
        onCancel={() => setDeleteCriterion(null)}
        onConfirm={async () => {
          if (!deleteCriterion) return
          const target = deleteCriterion
          setDeleteCriterion(null)
          try {
            await deleteCriterionMutation.mutateAsync(target.id)
          } catch (e: any) {
            reportDeleteError({
              entityLabel: `el criterio "${target.name}"`,
              message: extractDeleteErrorMessage(e, 'No se pudo eliminar el criterio.'),
            })
          }
        }}
      />
    </>
  )
}

// ─── Dimension Row ────────────────────────────────────────────────────────────

interface DimensionRowProps {
  dimension: Dimension
  onEdit: (d: Dimension) => void
  onDelete: (d: Dimension) => void
}

function DimensionRow({ dimension, onEdit, onDelete }: DimensionRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [showComponentForm, setShowComponentForm] = useState(false)
  const [editComponent, setEditComponent] = useState<Component | null>(null)
  const [deleteComponent, setDeleteComponent] = useState<Component | null>(null)
  const cfg = levelConfig.dimension
  const reportDeleteError = useReportDeleteError()

  const { selectDimension, selectComponent } = useSinaesNavigation()

  const { data: componentsData, isLoading } = useComponents(
    { dimensionId: dimension.id },
    { enabled: expanded }
  )
  const components = componentsData?.data ?? []

  const deleteComponentMutation = useDeleteComponent()

  return (
    <>
      {/* Dimension row */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 border-b-2 cursor-pointer select-none',
          cfg.bg,
          expanded && 'border-b-blue-400 dark:border-b-blue-600'
        )}
        onClick={() => {
          setExpanded(!expanded)
          selectDimension(dimension)
        }}
      >
        <div className="flex-shrink-0">
          {expanded
            ? <ChevronDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            : <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        </div>
        <Badge variant="outline" className={cn('text-xs px-2 py-0.5 font-mono font-bold flex-shrink-0', cfg.badge)}>
          {dimension.code}
        </Badge>
        <span className={cn('flex-1 truncate', cfg.label)}>{dimension.name}</span>
        {dimension.description && (
          <span className="text-xs text-muted-foreground truncate max-w-[250px] hidden lg:block">
            {dimension.description}
          </span>
        )}
        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1"
            onClick={() => { selectDimension(dimension); setShowComponentForm(true) }}
          >
            <Plus className="h-3.5 w-3.5" />
            Componente
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(dimension)}>
            <PenLine className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(dimension)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {expanded && (
        <>
          {isLoading && (
            <div className={cn('flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground', levelConfig.component.indent)}>
              <Loader2 className="h-3 w-3 animate-spin" /> Cargando componentes...
            </div>
          )}
          {components.map((comp) => (
            <ComponentRow
              key={comp.id}
              component={comp}
              onEdit={(c) => { selectDimension(dimension); selectComponent(c); setEditComponent(c); setShowComponentForm(true) }}
              onDelete={(c) => setDeleteComponent(c)}
            />
          ))}
          {!isLoading && components.length === 0 && (
            <div className={cn('px-3 py-2 text-xs text-muted-foreground italic', levelConfig.component.indent)}>
              Sin componentes
            </div>
          )}
        </>
      )}

      <ComponentForm
        open={showComponentForm}
        onClose={() => { setShowComponentForm(false); setEditComponent(null) }}
        component={editComponent}
        onSuccess={() => { setShowComponentForm(false); setEditComponent(null) }}
      />

      <ConfirmDelete
        open={!!deleteComponent}
        entityName={deleteComponent?.name ?? ''}
        isPending={deleteComponentMutation.isPending}
        onCancel={() => setDeleteComponent(null)}
        onConfirm={async () => {
          if (!deleteComponent) return
          const target = deleteComponent
          setDeleteComponent(null)
          try {
            await deleteComponentMutation.mutateAsync(target.id)
          } catch (e: any) {
            reportDeleteError({
              entityLabel: `el componente "${target.name}"`,
              message: extractDeleteErrorMessage(e, 'No se pudo eliminar el componente.'),
            })
          }
        }}
      />
    </>
  )
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export const SinaesStructureTab = () => {
  const [showDimensionForm, setShowDimensionForm] = useState(false)
  const [editDimension, setEditDimension] = useState<Dimension | null>(null)
  const [deleteDimension, setDeleteDimension] = useState<Dimension | null>(null)
  const [deleteError, setDeleteError] = useState<DeleteError | null>(null)
  const reportDeleteError = useCallback((err: DeleteError) => setDeleteError(err), [])

  const { data: dimensionsData, isLoading } = useDimensions()
  const dimensions = dimensionsData?.data ?? []
  const deleteDimensionMutation = useDeleteDimension()

  return (
    <DeleteErrorReporter.Provider value={reportDeleteError}>
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Estructura Jerárquica SINAES</h3>
          <span className="text-xs text-muted-foreground">
            ({dimensions.length} dimensiones)
          </span>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowDimensionForm(true)}>
          <Plus className="h-4 w-4" />
          Nueva Dimensión
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-muted/30 border-b text-xs text-muted-foreground flex-shrink-0 overflow-x-auto">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 dark:bg-blue-800 inline-block" />
          Dimensión
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-200 dark:bg-purple-800 inline-block" />
          Componente
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-600 inline-block" />
          Criterio
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-200 dark:bg-amber-800 inline-block" />
          Estándar
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-200 dark:bg-green-800 inline-block" />
          Evidencia
        </span>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Cargando estructura...</span>
          </div>
        )}

        {!isLoading && dimensions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <Layers className="h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">No hay dimensiones creadas</p>
            <Button size="sm" variant="outline" onClick={() => setShowDimensionForm(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Crear primera dimensión
            </Button>
          </div>
        )}

        {dimensions.map((dim) => (
          <DimensionRow
            key={dim.id}
            dimension={dim}
            onEdit={(d) => { setEditDimension(d); setShowDimensionForm(true) }}
            onDelete={(d) => setDeleteDimension(d)}
          />
        ))}
      </div>

      {/* Dimension form */}
      <DimensionForm
        open={showDimensionForm}
        onClose={() => { setShowDimensionForm(false); setEditDimension(null) }}
        dimension={editDimension}
        onSuccess={() => { setShowDimensionForm(false); setEditDimension(null) }}
      />

      <ConfirmDelete
        open={!!deleteDimension}
        entityName={deleteDimension?.name ?? ''}
        isPending={deleteDimensionMutation.isPending}
        onCancel={() => setDeleteDimension(null)}
        onConfirm={async () => {
          if (!deleteDimension) return
          const target = deleteDimension
          setDeleteDimension(null)
          try {
            await deleteDimensionMutation.mutateAsync(target.id)
          } catch (e: any) {
            reportDeleteError({
              entityLabel: `la dimensión "${target.name}"`,
              message: extractDeleteErrorMessage(e, 'No se pudo eliminar la dimensión.'),
            })
          }
        }}
      />

      <DeleteErrorDialog error={deleteError} onClose={() => setDeleteError(null)} />
    </div>
    </DeleteErrorReporter.Provider>
  )
}

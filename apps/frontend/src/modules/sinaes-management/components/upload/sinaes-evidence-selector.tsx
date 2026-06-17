'use client'

import React, { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, X, FolderTree } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@una-gc/ui/components/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@una-gc/ui/components/popover'
import { Badge } from '@una-gc/ui/components/badge'
import { useDimensionsWithFullHierarchy } from '../../services/dimensions.service'

interface FlatEvidence {
  id: string
  code: string
  name: string
  /** Breadcrumb of the location (dimension › component › criterion › standard). */
  path: string
  /** Lowercased text used for filtering (all codes + names along the path). */
  search: string
}

/**
 * Evidence picker for the upload form.
 *
 * The old version was a 4-level cascade (dimension → component → criterion →
 * expand standard → check evidence → close): ~6 clicks per evidence and a
 * network round-trip at each level. This version loads the whole SINAES
 * hierarchy once and shows a single searchable list where each evidence carries
 * its full location path — type any code/name and pick it with one click.
 */
export function SinaesEvidenceSelector({
  selectedEvidences = [],
  onChange,
}: {
  selectedEvidences?: string[]
  onChange: (selectedIds: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const { data: hierarchy, isLoading } = useDimensionsWithFullHierarchy()

  // Flatten dimension → component → criterion → standard → evidence into a
  // single list, each item annotated with its breadcrumb + searchable text.
  const evidences: FlatEvidence[] = useMemo(() => {
    const out: FlatEvidence[] = []
    for (const dim of (hierarchy ?? []) as any[]) {
      for (const comp of dim.components ?? []) {
        for (const crit of comp.criteria ?? []) {
          for (const std of crit.standards ?? []) {
            const list = std.evidences ?? std.qualityEvidences ?? []
            for (const ev of list) {
              const path = [dim.code, comp.code, crit.code, std.code]
                .filter(Boolean)
                .join(' › ')
              out.push({
                id: ev.id,
                code: ev.code,
                name: ev.name,
                path,
                search: [
                  dim.code, dim.name, comp.code, comp.name,
                  crit.code, crit.name, std.code, std.name,
                  ev.code, ev.name,
                ]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase(),
              })
            }
          }
        }
      }
    }
    return out
  }, [hierarchy])

  const byId = useMemo(
    () => new Map(evidences.map((e) => [e.id, e])),
    [evidences],
  )

  const toggle = (id: string) => {
    onChange(
      selectedEvidences.includes(id)
        ? selectedEvidences.filter((x) => x !== id)
        : [...selectedEvidences, id],
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Selected evidences as removable chips */}
      {selectedEvidences.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedEvidences.map((id) => {
            const e = byId.get(id)
            return (
              <Badge
                key={id}
                variant="secondary"
                className="gap-1 pr-1"
                title={e ? `${e.code}: ${e.name} — ${e.path}` : undefined}
              >
                {e ? e.code : `EV-${id.slice(-4)}`}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label="Quitar evidencia"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="flex items-center gap-2 truncate">
              <FolderTree className="h-4 w-4 shrink-0 opacity-70" />
              {selectedEvidences.length > 0
                ? `${selectedEvidences.length} evidencia${selectedEvidences.length !== 1 ? 's' : ''} seleccionada${selectedEvidences.length !== 1 ? 's' : ''}`
                : 'Buscar y seleccionar evidencia...'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-[340px] p-0"
        >
          <Command
            filter={(value, search) => {
              // `value` is the item's value prop (lowercased path + id). Match
              // every whitespace-separated term so "criterio 2 informe" narrows.
              const terms = search.toLowerCase().split(/\s+/).filter(Boolean)
              return terms.every((t) => value.includes(t)) ? 1 : 0
            }}
          >
            <CommandInput placeholder="Escribe dimensión, criterio, código o nombre…" />
            <CommandList className="max-h-[320px] overflow-y-auto">
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Cargando evidencias…
                </div>
              ) : evidences.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No hay evidencias registradas en la estructura SINAES.
                </div>
              ) : (
                <>
                  <CommandEmpty>No se encontraron evidencias.</CommandEmpty>
                  <CommandGroup>
                    {evidences.map((ev) => {
                      const checked = selectedEvidences.includes(ev.id)
                      return (
                        <CommandItem
                          key={ev.id}
                          value={`${ev.search} ${ev.id}`}
                          onSelect={() => toggle(ev.id)}
                          className="flex items-start gap-2"
                        >
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${checked ? 'opacity-100 text-primary' : 'opacity-0'}`}
                          />
                          <div className="min-w-0">
                            <div className="text-sm">
                              <span className="mr-1 font-mono text-xs text-muted-foreground">
                                {ev.code}
                              </span>
                              {ev.name}
                            </div>
                            <div className="truncate text-[11px] text-muted-foreground">
                              {ev.path}
                            </div>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card';
import { Badge } from '@una-gc/ui/components/badge';
import { Button } from '@una-gc/ui/components/button';
import { Input } from '@una-gc/ui/components/input';
import { FileX, Search, Upload } from 'lucide-react';
import type { MissingEvidence } from '../../types/sinaes-reports.types';

interface ComplianceMissingPanelProps {
  missingEvidences: MissingEvidence[];
  /** When the report was filtered by career, deep-link the upload with it pre-selected. */
  careerId?: string;
  careerCode?: string;
  careerName?: string;
}

/**
 * Panel accionable de "evidencias faltantes" para la pestaña Resultados.
 *
 * Muestra, agrupadas por jerarquía (Dimensión → Componente → Criterio), las
 * evidencias que NO tienen documentos, con un botón "Subir aquí" que abre el
 * formulario de carga con la evidencia (y la carrera, si el reporte está
 * filtrado) ya preseleccionadas. Es el atajo que responde directo a
 * "¿qué me falta y dónde lo subo?" sin tener que expandir la tabla criterio
 * por criterio.
 */
export function ComplianceMissingPanel({
  missingEvidences,
  careerId,
  careerCode,
  careerName,
}: ComplianceMissingPanelProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return missingEvidences;
    return missingEvidences.filter((m) =>
      [
        m.evidenceCode,
        m.evidenceName,
        m.criterionCode,
        m.criterionName,
        m.componentCode,
        m.componentName,
        m.dimensionCode,
        m.dimensionName,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [missingEvidences, search]);

  // Group filtered gaps by dimension → component → criterion so the user reads
  // a tree instead of a flat list.
  const grouped = useMemo(() => {
    const tree = new Map<string, Map<string, Map<string, MissingEvidence[]>>>();
    for (const m of filtered) {
      const dimKey = `${m.dimensionCode}|${m.dimensionName}`;
      const compKey = `${m.componentCode}|${m.componentName}`;
      const critKey = `${m.criterionCode}|${m.criterionName}`;
      if (!tree.has(dimKey)) tree.set(dimKey, new Map());
      const dimMap = tree.get(dimKey)!;
      if (!dimMap.has(compKey)) dimMap.set(compKey, new Map());
      const compMap = dimMap.get(compKey)!;
      if (!compMap.has(critKey)) compMap.set(critKey, []);
      compMap.get(critKey)!.push(m);
    }
    return tree;
  }, [filtered]);

  const goToUpload = (m: MissingEvidence) => {
    const params = new URLSearchParams({ tab: 'upload', evidenceId: m.evidenceId });
    if (careerId) params.set('careerId', careerId);
    if (careerCode) params.set('careerCode', careerCode);
    router.push(`/sinaes-management?${params.toString()}`);
  };

  // No missing evidences at all — celebrate, don't render an empty shell.
  if (missingEvidences.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileX className="h-4 w-4 text-green-600" />
            Evidencias faltantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            🎉 Todas las evidencias del alcance de este reporte
            {careerName ? ` para ${careerName}` : ''} tienen al menos un documento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
          <span className="flex items-center gap-2">
            <FileX className="h-4 w-4 text-amber-600" />
            Evidencias faltantes
            <Badge variant="outline">{missingEvidences.length}</Badge>
            {careerName && (
              <span className="text-xs font-normal text-muted-foreground">
                para {careerName}
              </span>
            )}
          </span>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar evidencia, criterio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4 text-center">
            No hay evidencias faltantes que coincidan con la búsqueda.
          </p>
        ) : (
          Array.from(grouped.entries()).map(([dimKey, components]) => {
            const [dimCode, dimName] = dimKey.split('|');
            return (
              <div key={dimKey} className="rounded border bg-background">
                <div className="px-3 py-1.5 border-b bg-muted/40 text-xs">
                  <span className="font-mono text-blue-700 dark:text-blue-400">{dimCode}</span>{' '}
                  <span className="font-medium">{dimName}</span>
                </div>
                <div className="p-2 space-y-2">
                  {Array.from(components.entries()).map(([compKey, criteria]) => {
                    const [compCode, compName] = compKey.split('|');
                    return (
                      <div key={compKey} className="pl-2">
                        <div className="text-xs">
                          <span className="font-mono text-purple-700 dark:text-purple-400">
                            {compCode}
                          </span>{' '}
                          {compName}
                        </div>
                        {Array.from(criteria.entries()).map(([critKey, evList]) => {
                          const [critCode, critName] = critKey.split('|');
                          return (
                            <div key={critKey} className="pl-4 mt-1">
                              <div className="text-xs text-muted-foreground">
                                <span className="font-mono">{critCode}</span> {critName}
                              </div>
                              <ul className="pl-3 mt-1 space-y-1">
                                {evList.map((m) => (
                                  <li
                                    key={m.evidenceId}
                                    className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-muted/40 text-xs"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="font-mono text-green-700 dark:text-green-400">
                                        {m.evidenceCode}
                                      </span>
                                      <span>{m.evidenceName}</span>
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={() => goToUpload(m)}
                                    >
                                      <Upload className="h-3 w-3 mr-1" />
                                      Subir aquí
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

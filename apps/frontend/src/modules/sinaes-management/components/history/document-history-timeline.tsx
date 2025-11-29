/**
 * DocumentHistoryTimeline Component
 * Timeline visual del historial de cambios de un documento
 */

'use client';

import React from 'react';
import { useDocumentHistory } from '../../services/document-history.service';
import { ChangeTypeBadge } from './change-type-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card';
import { ScrollArea } from '@una-gc/ui/components/scroll-area';
import { Skeleton } from '@una-gc/ui/components/skeleton';
import { Alert, AlertDescription } from '@una-gc/ui/components/alert';
import { Clock, User, MapPin, Laptop, AlertCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DocumentHistoryTimelineProps, DocumentHistoryRecord, DocumentChangeType } from '../../types/document-history.types';
import { Button } from '@una-gc/ui/components/button';
import { Badge } from '@una-gc/ui/components/badge';

/**
 * Agrupar cambios por usuario y día
 */
interface GroupedChange {
  id: string;
  date: Date;
  user: string;
  userId: string;
  userEmail?: string;
  changes: DocumentHistoryRecord[];
}

function groupChangesByUserAndDay(records: DocumentHistoryRecord[]): GroupedChange[] {
  const groups: GroupedChange[] = [];

  records.forEach((record) => {
    const recordDate = parseISO(record.createdAt);
    const userName = record.user?.fullName || 'Sistema';

    // Buscar grupo existente del mismo usuario y día
    const existingGroup = groups.find(
      (group) =>
        group.userId === record.userId &&
        isSameDay(group.date, recordDate)
    );

    if (existingGroup) {
      existingGroup.changes.push(record);
    } else {
      groups.push({
        id: record.id,
        date: recordDate,
        user: userName,
        userId: record.userId,
        userEmail: record.user?.email,
        changes: [record],
      });
    }
  });

  return groups;
}

/**
 * Formatear valor para visualización
 */
function formatValue(value: string | undefined | null): React.ReactNode {
  if (!value || value === '') {
    return <span className="text-muted-foreground italic">(vacío)</span>;
  }

  // Intentar parsear como JSON
  try {
    const parsed = JSON.parse(value);

    // Si es un array
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) {
        return <span className="text-muted-foreground italic">(lista vacía)</span>;
      }

      // Si es un array de objetos con campos conocidos
      if (parsed.length > 0 && typeof parsed[0] === 'object') {
        // Casos específicos según el contenido
        if (parsed[0].careerId) {
          return <span>Lista de {parsed.length} carrera{parsed.length > 1 ? 's' : ''}</span>;
        }
        return <span>Lista de {parsed.length} elemento{parsed.length > 1 ? 's' : ''}</span>;
      }

      return <span>[{parsed.join(', ')}]</span>;
    }

    // Si es un objeto
    if (typeof parsed === 'object' && parsed !== null) {
      // Mostrar algunos campos clave si existen
      if (parsed.code && parsed.name) {
        return <span>{parsed.code} - {parsed.name}</span>;
      }
      if (parsed.name) {
        return <span>{parsed.name}</span>;
      }
      return <pre className="text-xs">{JSON.stringify(parsed, null, 2)}</pre>;
    }

    return <span>{String(parsed)}</span>;
  } catch {
    // No es JSON, devolver como está
    return <span>{value}</span>;
  }
}

export function DocumentHistoryTimeline({
  documentId,
  maxItems = 50,
  showFilters = false,
}: DocumentHistoryTimelineProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data, isLoading, error } = useDocumentHistory(documentId, currentPage, maxItems);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar el historial. Por favor, intenta nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay cambios registrados para este documento.
        </AlertDescription>
      </Alert>
    );
  }

  // Agrupar cambios por usuario y día
  const groupedChanges = groupChangesByUserAndDay(data.data);

  return (
    <div className="flex flex-col h-full">
      {/* Header con título y paginación superior */}
      <div className="flex-shrink-0 space-y-3 pb-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Historial de Cambios ({data.meta.total})
          </h3>
        </div>

        {/* Paginación superior - siempre visible */}
        {data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {data.meta.page} de {data.meta.totalPages}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === data.meta.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(data.meta.totalPages, p + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 pr-4 mt-4">
        <div className="relative space-y-6 pb-4">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {groupedChanges.map((group) => {
            const isExpanded = expandedItems.has(group.id);
            const hasMultiple = group.changes.length > 1;
            const mainChange = group.changes[0];

            // Safety check
            if (!mainChange) return null;

            return (
              <div key={group.id} className="relative flex gap-4 group">
                {/* Timeline dot */}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background ring-2 ring-border">
                  <ChangeTypeBadge changeType={mainChange.changeType} size="sm" iconOnly />
                </div>

                {/* Content card */}
                <Card className="flex-1 group-hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-medium">
                            {group.user}
                          </CardTitle>
                          {hasMultiple && (
                            <Badge variant="secondary" className="text-xs">
                              {group.changes.length} cambios
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {format(group.date, 'PPp', { locale: es })}
                            </span>
                          </div>
                          {group.userEmail && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              <span className="text-xs">{group.userEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <ChangeTypeBadge changeType={mainChange.changeType} size="sm" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Lista de cambios */}
                    <div className="space-y-2">
                      {group.changes.slice(0, isExpanded ? undefined : 1).map((change) => (
                        <div
                          key={change.id}
                          className={`rounded-md border p-3 space-y-2 ${change.changeType === 'DELETED'
                            ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                            : ''
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {change.changeType === 'DELETED' && (
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                )}
                                <p className="font-medium text-sm">
                                  {change.description || 'Cambio en el documento'}
                                </p>
                              </div>

                              {change.fieldChanged && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Campo: <code className="font-mono bg-background px-1 py-0.5 rounded">{change.fieldChanged}</code>
                                </p>
                              )}
                            </div>

                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(parseISO(change.createdAt), 'HH:mm:ss')}
                            </span>
                          </div>

                          {/* Valores anterior/nuevo */}
                          {(change.oldValue || change.newValue) && (
                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                              <div className="space-y-1">
                                <span className="font-medium text-red-600">Anterior:</span>
                                <div className="bg-background p-2 rounded border border-red-200 dark:border-red-900">
                                  {formatValue(change.oldValue)}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <span className="font-medium text-green-600">Nuevo:</span>
                                <div className="bg-background p-2 rounded border border-green-200 dark:border-green-900">
                                  {formatValue(change.newValue)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Razón del cambio */}
                          {change.reason && (
                            <div className="pt-2 border-t">
                              <span className="font-medium text-xs">Razón:</span>
                              <p className="text-xs text-muted-foreground mt-1">{change.reason}</p>
                            </div>
                          )}

                          {/* Metadata adicional */}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2 border-t">
                            {change.ipAddress && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="font-mono">{change.ipAddress}</span>
                              </div>
                            )}
                            {change.userAgent && (
                              <div className="flex items-center gap-1">
                                <Laptop className="h-3 w-3" />
                                <span className="truncate max-w-[200px]" title={change.userAgent}>
                                  {change.userAgent.split(' ')[0]}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Botón para expandir/contraer */}
                    {hasMultiple && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => toggleExpanded(group.id)}
                      >
                        <span className="text-xs font-medium">
                          {isExpanded
                            ? 'Mostrar menos'
                            : `Ver ${group.changes.length - 1} cambio${group.changes.length - 1 > 1 ? 's' : ''} más`
                          }
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Paginación inferior - siempre visible */}
      {data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4 flex-shrink-0 bg-background mt-4">
          <div className="text-sm text-muted-foreground">
            Página {data.meta.page} de {data.meta.totalPages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === data.meta.totalPages}
              onClick={() => setCurrentPage((p) => Math.min(data.meta.totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

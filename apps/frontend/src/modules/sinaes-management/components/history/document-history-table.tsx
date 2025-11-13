/**
 * DocumentHistoryTable Component
 * Tabla detallada del historial de cambios
 */

'use client';

import React from 'react';
import { useDocumentHistory } from '../../services/document-history.service';
import { ChangeTypeBadge } from './change-type-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@una-gc/ui/components/table';
import { Skeleton } from '@una-gc/ui/components/skeleton';
import { Alert, AlertDescription } from '@una-gc/ui/components/alert';
import { Button } from '@una-gc/ui/components/button';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DocumentHistoryTableProps, DocumentHistoryRecord } from '../../types/document-history.types';

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
 * Intenta parsear JSON y formatear de forma legible
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
          return <span className="text-xs">Lista de {parsed.length} carrera{parsed.length > 1 ? 's' : ''}</span>;
        }
        return <span className="text-xs">Lista de {parsed.length} elemento{parsed.length > 1 ? 's' : ''}</span>;
      }

      return <span className="text-xs">[{parsed.join(', ')}]</span>;
    }

    // Si es un objeto
    if (typeof parsed === 'object' && parsed !== null) {
      // Mostrar algunos campos clave si existen
      if (parsed.code && parsed.name) {
        return <span className="text-xs">{parsed.code} - {parsed.name}</span>;
      }
      if (parsed.name) {
        return <span className="text-xs">{parsed.name}</span>;
      }
      return <span className="text-xs">{JSON.stringify(parsed, null, 2).substring(0, 100)}...</span>;
    }

    return <span className="text-xs">{String(parsed)}</span>;
  } catch {
    // No es JSON, devolver como está
    if (value.length > 100) {
      return <span className="text-xs" title={value}>{value.substring(0, 100)}...</span>;
    }
    return <span className="text-xs">{value}</span>;
  }
}

export function DocumentHistoryTable({
  documentId,
  pageSize = 20,
}: DocumentHistoryTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());

  const { data, isLoading, error } = useDocumentHistory(documentId, currentPage, pageSize);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
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
      {/* Paginación superior - siempre visible */}
      {data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between flex-shrink-0 pb-4 border-b bg-background">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, data.meta.total)} de {data.meta.total} registros
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
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Página</span>
              <span className="font-medium">{currentPage}</span>
              <span className="text-muted-foreground">de</span>
              <span className="font-medium">{data.meta.totalPages}</span>
            </div>
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

      {/* Tabla con scroll horizontal y vertical */}
      <div className="flex-1 overflow-x-auto overflow-y-auto border rounded-md min-h-0 mt-4">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="whitespace-nowrap min-w-[160px]">Fecha/Hora</TableHead>
              <TableHead className="whitespace-nowrap min-w-[180px]">Usuario</TableHead>
              <TableHead className="whitespace-nowrap min-w-[120px]">Cambios</TableHead>
              <TableHead className="whitespace-nowrap min-w-[180px]">Tipo Principal</TableHead>
              <TableHead className="whitespace-nowrap min-w-[300px]">Resumen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedChanges.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              const mainChange = group.changes[0];
              const hasMultiple = group.changes.length > 1;

              // Safety check
              if (!mainChange) return null;

              return (
                <React.Fragment key={group.id}>
                  {/* Fila principal del grupo */}
                  <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => hasMultiple && toggleGroup(group.id)}>
                    <TableCell className="text-center">
                      {hasMultiple && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap font-mono text-xs">
                      {format(group.date, 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>

                    <TableCell className="min-w-[180px]">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{group.user}</span>
                        {group.userEmail && (
                          <span className="text-xs text-muted-foreground">{group.userEmail}</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{group.changes.length}</span>
                        <span className="text-xs text-muted-foreground">
                          {group.changes.length === 1 ? 'cambio' : 'cambios'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <ChangeTypeBadge changeType={mainChange.changeType} size="sm" />
                    </TableCell>

                    <TableCell className="min-w-[300px]">
                      <div className="truncate text-sm">
                        {hasMultiple
                          ? `${mainChange.description || 'Cambio en el documento'} y ${group.changes.length - 1} más...`
                          : mainChange.description || 'Cambio en el documento'
                        }
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Filas expandidas con detalles de cada cambio */}
                  {isExpanded && group.changes.map((change, idx) => (
                    <TableRow key={change.id} className="bg-muted/30">
                      <TableCell colSpan={2} className="text-right pr-4">
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(change.createdAt), 'HH:mm:ss')}
                        </span>
                      </TableCell>

                      <TableCell>
                        <ChangeTypeBadge changeType={change.changeType} size="sm" />
                      </TableCell>

                      <TableCell>
                        {change.fieldChanged ? (
                          <code className="rounded bg-background px-1.5 py-0.5 text-xs">
                            {change.fieldChanged}
                          </code>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>

                      <TableCell colSpan={2}>
                        <div className="space-y-1.5">
                          <div className="text-sm">{change.description || '—'}</div>

                          {(change.oldValue || change.newValue) && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium text-red-600">Anterior: </span>
                                <div className="font-mono mt-1">
                                  {formatValue(change.oldValue)}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-green-600">Nuevo: </span>
                                <div className="font-mono mt-1">
                                  {formatValue(change.newValue)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Paginación inferior - siempre visible */}
      {data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between flex-shrink-0 pt-4 border-t bg-background mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, data.meta.total)} de {data.meta.total} registros
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
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">Página</span>
              <span className="font-medium">{currentPage}</span>
              <span className="text-muted-foreground">de</span>
              <span className="font-medium">{data.meta.totalPages}</span>
            </div>
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

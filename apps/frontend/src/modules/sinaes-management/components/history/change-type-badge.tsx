/**
 * ChangeTypeBadge Component
 * Badge visual para mostrar el tipo de cambio en documentos
 */

import { Badge } from '@una-gc/ui/components/badge';
import {
  FileText,
  FileEdit,
  Trash2,
  RefreshCw,
  Power,
  Users,
  FileUp,
  Tag,
} from 'lucide-react';
import type { ChangeTypeBadgeProps } from '../../types/document-history.types';
import { DocumentChangeType } from '../../types/document-history.types';

const changeTypeConfig = {
  [DocumentChangeType.CREATED]: {
    label: 'Creado',
    variant: 'default' as const,
    className: 'bg-green-500 hover:bg-green-600 text-white',
    icon: FileText,
  },
  [DocumentChangeType.UPDATED]: {
    label: 'Actualizado',
    variant: 'default' as const,
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
    icon: FileEdit,
  },
  [DocumentChangeType.DELETED]: {
    label: 'Eliminado',
    variant: 'destructive' as const,
    className: 'bg-red-500 hover:bg-red-600 text-white',
    icon: Trash2,
  },
  [DocumentChangeType.RESTORED]: {
    label: 'Restaurado',
    variant: 'default' as const,
    className: 'bg-purple-500 hover:bg-purple-600 text-white',
    icon: RefreshCw,
  },
  [DocumentChangeType.STATUS_CHANGED]: {
    label: 'Estado Cambiado',
    variant: 'default' as const,
    className: 'bg-orange-500 hover:bg-orange-600 text-white',
    icon: Power,
  },
  [DocumentChangeType.CAREERS_UPDATED]: {
    label: 'Carreras Actualizadas',
    variant: 'default' as const,
    className: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    icon: Users,
  },
  [DocumentChangeType.FILE_REPLACED]: {
    label: 'Archivo Reemplazado',
    variant: 'default' as const,
    className: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    icon: FileUp,
  },
  [DocumentChangeType.METADATA_UPDATED]: {
    label: 'Metadatos Actualizados',
    variant: 'default' as const,
    className: 'bg-teal-500 hover:bg-teal-600 text-white',
    icon: Tag,
  },
};

export function ChangeTypeBadge({ changeType, size = 'md', iconOnly = false }: ChangeTypeBadgeProps) {
  const config = changeTypeConfig[changeType];
  const Icon = config.icon;

  const sizeClasses = {
    sm: iconOnly ? 'p-1.5' : 'text-xs px-2 py-0.5',
    md: iconOnly ? 'p-2' : 'text-sm px-2.5 py-1',
    lg: iconOnly ? 'p-2.5' : 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  if (iconOnly) {
    return (
      <div
        className={`${config.className} ${sizeClasses[size]} rounded-full inline-flex items-center justify-center`}
        title={config.label}
      >
        <Icon size={iconSizes[size]} />
      </div>
    );
  }

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} inline-flex items-center gap-1.5 font-medium`}
    >
      <Icon size={iconSizes[size]} />
      {config.label}
    </Badge>
  );
}

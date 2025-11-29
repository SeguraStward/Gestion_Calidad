/**
 * Document History Types
 * Types for tracking changes to SINAES proof documents
 */

/**
 * Enum de tipos de cambios en documentos
 */
export enum DocumentChangeType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  RESTORED = 'RESTORED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  CAREERS_UPDATED = 'CAREERS_UPDATED',
  FILE_REPLACED = 'FILE_REPLACED',
  METADATA_UPDATED = 'METADATA_UPDATED',
}

/**
 * Usuario simplificado en el historial
 */
export interface HistoryUser {
  id: string;
  fullName: string;
  fullLastName: string;
  email: string;
}

/**
 * Registro individual de cambio en documento
 */
export interface DocumentHistoryRecord {
  id: string;
  documentId: string;
  userId: string;
  changeType: DocumentChangeType;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  createdAt: string;
  user?: HistoryUser;
}

/**
 * Respuesta paginada de historial
 */
export interface DocumentHistoryListResponse {
  data: DocumentHistoryRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Filtros para consultar historial
 */
export interface DocumentHistoryFilters {
  documentId?: string;
  userId?: string;
  changeType?: DocumentChangeType;
  fieldChanged?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/**
 * Estadísticas de actividad
 */
export interface ActivityStatistics {
  totalChanges: number;
  changesByType: {
    changeType: DocumentChangeType;
    count: number;
  }[];
  topUsers: {
    userId: string;
    userName: string;
    changeCount: number;
  }[];
  activityByDay: {
    date: string;
    count: number;
  }[];
}

/**
 * Props para componentes de historial
 */
export interface DocumentHistoryProps {
  documentId: string;
  onClose?: () => void;
}

export interface DocumentHistoryTimelineProps extends DocumentHistoryProps {
  maxItems?: number;
  showFilters?: boolean;
}

export interface DocumentHistoryTableProps extends DocumentHistoryProps {
  pageSize?: number;
}

export interface ChangeTypeBadgeProps {
  changeType: DocumentChangeType;
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export interface ActivityStatisticsWidgetProps {
  documentId?: string;
  showCharts?: boolean;
}

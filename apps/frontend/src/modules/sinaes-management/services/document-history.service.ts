/**
 * Document History Service
 * Servicio HTTP para gestión de historial de cambios en documentos SINAES
 */

import { HttpClient } from '@/lib/http-client';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type {
  DocumentHistoryRecord,
  DocumentHistoryListResponse,
  DocumentHistoryFilters,
  ActivityStatistics,
  DocumentChangeType,
} from '../types/document-history.types';

const DOCUMENT_HISTORY_BASE_URL = '/sinaes-document-history';

/**
 * Query Keys para React Query
 */
export const documentHistoryKeys = {
  all: ['document-history'] as const,
  lists: () => [...documentHistoryKeys.all, 'list'] as const,
  list: (filters: DocumentHistoryFilters) => [...documentHistoryKeys.lists(), filters] as const,
  document: (documentId: string) => [...documentHistoryKeys.all, 'document', documentId] as const,
  user: (userId: string) => [...documentHistoryKeys.all, 'user', userId] as const,
  recent: (filters: Partial<DocumentHistoryFilters>) => [...documentHistoryKeys.all, 'recent', filters] as const,
  statistics: (documentId?: string) => [...documentHistoryKeys.all, 'statistics', documentId] as const,
};

/**
 * Document History HTTP Service
 */
export class DocumentHistoryService {
  /**
   * Obtener historial completo de un documento
   */
  static async getDocumentHistory(
    documentId: string,
    page = 1,
    limit = 20
  ): Promise<DocumentHistoryListResponse> {
    const response = await HttpClient.get<DocumentHistoryListResponse>(
      `${DOCUMENT_HISTORY_BASE_URL}/document/${documentId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  /**
   * Obtener actividad de un usuario específico
   */
  static async getUserActivity(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<DocumentHistoryListResponse> {
    const response = await HttpClient.get<DocumentHistoryListResponse>(
      `${DOCUMENT_HISTORY_BASE_URL}/user/${userId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  /**
   * Obtener cambios recientes con filtros
   */
  static async getRecentChanges(
    filters: DocumentHistoryFilters = {}
  ): Promise<DocumentHistoryListResponse> {
    const response = await HttpClient.get<DocumentHistoryListResponse>(
      `${DOCUMENT_HISTORY_BASE_URL}/recent`,
      {
        params: filters,
      }
    );
    return response.data;
  }

  /**
   * Obtener estadísticas de actividad
   */
  static async getActivityStatistics(
    documentId?: string
  ): Promise<ActivityStatistics> {
    const response = await HttpClient.get<ActivityStatistics>(
      `${DOCUMENT_HISTORY_BASE_URL}/statistics`,
      {
        params: documentId ? { documentId } : undefined,
      }
    );
    return response.data;
  }
}

/**
 * Hook: Obtener historial de un documento
 */
export function useDocumentHistory(
  documentId: string,
  page = 1,
  limit = 20,
  options?: Omit<UseQueryOptions<DocumentHistoryListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DocumentHistoryListResponse>({
    queryKey: [...documentHistoryKeys.document(documentId), page, limit],
    queryFn: () => DocumentHistoryService.getDocumentHistory(documentId, page, limit),
    enabled: !!documentId,
    ...options,
  });
}

/**
 * Hook: Obtener actividad de un usuario
 */
export function useUserActivity(
  userId: string,
  page = 1,
  limit = 20,
  options?: Omit<UseQueryOptions<DocumentHistoryListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DocumentHistoryListResponse>({
    queryKey: documentHistoryKeys.user(userId),
    queryFn: () => DocumentHistoryService.getUserActivity(userId, page, limit),
    enabled: !!userId,
    ...options,
  });
}

/**
 * Hook: Obtener cambios recientes con filtros
 */
export function useRecentChanges(
  filters: DocumentHistoryFilters = {},
  options?: Omit<UseQueryOptions<DocumentHistoryListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<DocumentHistoryListResponse>({
    queryKey: documentHistoryKeys.recent(filters),
    queryFn: () => DocumentHistoryService.getRecentChanges(filters),
    ...options,
  });
}

/**
 * Hook: Obtener estadísticas de actividad
 */
export function useActivityStatistics(
  documentId?: string,
  options?: Omit<UseQueryOptions<ActivityStatistics>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ActivityStatistics>({
    queryKey: documentHistoryKeys.statistics(documentId),
    queryFn: () => DocumentHistoryService.getActivityStatistics(documentId),
    ...options,
  });
}

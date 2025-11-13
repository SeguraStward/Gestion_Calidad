import { Expose, Type } from 'class-transformer';
import { ChangeType } from '@una-gc/database/prisma/generated/client';

/**
 * DTO simplificado para usuario en historial
 */
export class HistoryUserDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  fullLastName: string;

  @Expose()
  email: string;
}

/**
 * DTO para respuesta de historial de documento
 */
export class DocumentHistoryDto {
  @Expose()
  id: string;

  @Expose()
  documentId: string;

  @Expose()
  userId: string;

  @Expose()
  @Type(() => HistoryUserDto)
  user?: HistoryUserDto;

  @Expose()
  changeType: ChangeType;

  @Expose()
  fieldChanged?: string;

  @Expose()
  oldValue?: string;

  @Expose()
  newValue?: string;

  @Expose()
  reason?: string;

  @Expose()
  ipAddress?: string;

  @Expose()
  userAgent?: string;

  @Expose()
  description?: string;

  @Expose()
  createdAt: Date;
}

/**
 * DTO para respuesta paginada de historial
 */
export class DocumentHistoryListDto {
  @Expose()
  data: DocumentHistoryDto[];

  @Expose()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

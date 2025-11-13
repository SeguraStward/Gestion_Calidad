import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { ChangeType } from '@una-gc/database/prisma/generated/client';

/**
 * DTO para filtros de búsqueda de historial
 */
export class DocumentHistoryFiltersDto {
  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(ChangeType)
  changeType?: ChangeType;

  @IsOptional()
  @IsString()
  fieldChanged?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

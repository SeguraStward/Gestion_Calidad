import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ChangeType } from '@una-gc/database/prisma/generated/client';

/**
 * DTO para crear un registro de historial
 */
export class CreateDocumentHistoryDto {
  @IsString()
  documentId: string;

  @IsString()
  userId: string;

  @IsEnum(ChangeType)
  changeType: ChangeType;

  @IsOptional()
  @IsString()
  fieldChanged?: string;

  @IsOptional()
  @IsString()
  oldValue?: string;

  @IsOptional()
  @IsString()
  newValue?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

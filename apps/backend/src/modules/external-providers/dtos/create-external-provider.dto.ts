import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, Matches } from 'class-validator';
import { ProviderType, Status } from '@una-gc/database/prisma/generated/client';

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export class CreateExternalProviderDto {
  @ApiProperty({ description: 'Nombre del proveedor/convenio', example: 'Universidad de Costa Rica' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Descripción del proveedor', required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProviderType, description: 'Tipo de proveedor', example: ProviderType.UNIVERSITY })
  @IsEnum(ProviderType)
  providerType!: ProviderType;

  @ApiProperty({ description: 'Email de contacto', required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsString()
  contactEmail?: string;

  @ApiProperty({ description: 'Teléfono de contacto', required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' ') || undefined)
  @IsString()
  @Matches(PHONE_REGEX, {
    message: 'El telefono debe contener solo numeros, espacios, guiones, parentesis y puede iniciar con +',
  })
  contactPhone?: string;

  @ApiProperty({ description: 'Persona de contacto', required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsString()
  contactPerson?: string;

  @ApiProperty({ description: 'ID de la asignación anual', example: '507f1f77bcf86cd799439011' })
  @IsString()
  annualAllocationId!: string;

  @ApiProperty({ description: 'Tiempo de jornada proporcionado', example: 10.5 })
  @IsNumber()
  @IsPositive()
  providedJourneyTime!: number;

  @ApiProperty({ description: 'Es tiempo fijo o variable', default: true })
  @IsOptional()
  @IsBoolean()
  isFixedTime?: boolean;

  @ApiProperty({ description: 'Fecha de inicio del convenio', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Fecha de fin del convenio', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: Status, default: Status.ACTIVE })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

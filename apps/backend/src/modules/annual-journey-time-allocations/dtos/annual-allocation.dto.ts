import { ApiProperty } from '@nestjs/swagger';
import { AllocationStatus } from '@una-gc/database/prisma/generated/client';

export class AnnualAllocationDto {
  @ApiProperty() id!: string;

  @ApiProperty() version!: number;

  @ApiProperty({ description: 'Año numérico (si aplica en tu modelo)' })
  year!: number;

  @ApiProperty({ description: 'Total de jornada disponible en el año' })
  totalJourneyTime!: number;

  @ApiProperty({ description: 'Descripción', required: false })
  description?: string;

  @ApiProperty({ enum: AllocationStatus })
  status!: AllocationStatus;

  @ApiProperty({ description: 'Total asignado a campus' })
  totalAllocatedToCampus!: number;

  @ApiProperty({ description: 'Total proveniente de proveedores externos' })
  totalFromExternalProviders!: number;

  @ApiProperty({ description: 'Derivado: disponible' })
  availableTime!: number;

  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  @ApiProperty() createdBy!: string;
  @ApiProperty() updatedBy!: string;
}

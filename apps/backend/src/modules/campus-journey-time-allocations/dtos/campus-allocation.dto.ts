import { ApiProperty } from '@nestjs/swagger';
import { AllocationStatus } from '@una-gc/database/prisma/generated/client';

export class CampusAllocationDto {
  @ApiProperty() id!: string;
  @ApiProperty() version!: number;

  @ApiProperty({ description: 'Referencia al Anual' })
  annualAllocationId!: string;

  @ApiProperty({ description: 'Ciclo académico' })
  cycleId!: string;

  @ApiProperty({ description: 'Campus' })
  campusId!: string;

  @ApiProperty({ description: 'Malla curricular' })
  meshId!: string;

  @ApiProperty({ description: 'Tiempo asignado a la sede' })
  allocatedTime!: number;

  @ApiProperty({ description: 'Tiempo base consumido' })
  baseTimeConsumed!: number;

  @ApiProperty({ description: 'Tiempo adicional (ej. refuerzos)' })
  additionalTime!: number;

  @ApiProperty({ description: 'Tiempo disponible (derivado)' })
  availableTime!: number;

  @ApiProperty({ enum: AllocationStatus })
  status!: AllocationStatus;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  @ApiProperty() createdBy!: string;
  @ApiProperty() updatedBy!: string;
}

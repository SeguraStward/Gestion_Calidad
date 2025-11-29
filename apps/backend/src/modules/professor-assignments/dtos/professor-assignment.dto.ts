import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum AssignmentType {
  FULL = 'FULL',
  THREE_QUARTER = 'THREE_QUARTER',
  HALF = 'HALF',
  QUARTER = 'QUARTER',
}

// Alias para compatibilidad
export const JourneyTimeType = AssignmentType;

export class ProfessorAssignmentDto {
  @ApiPropertyOptional() @IsString() @IsOptional() id?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() professorId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() academicCycleId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() campusId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() curricularMeshCourseId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() campusAllocationId?: string;

  @ApiPropertyOptional({ enum: AssignmentType })
  @IsEnum(AssignmentType)
  @IsOptional()
  assignmentType?: AssignmentType;

  @ApiPropertyOptional() @IsNumber() @IsOptional() calculatedJourneyTime?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;

  @ApiPropertyOptional() @IsString() @IsOptional() createdBy?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() updatedBy?: string;
}

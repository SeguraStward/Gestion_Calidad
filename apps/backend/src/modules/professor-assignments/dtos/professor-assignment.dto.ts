import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';

export enum AssignmentType {
  FULL = 'FULL',
  HALF = 'HALF',
  QUARTER = 'QUARTER',
}

export class ProfessorAssignmentDto {
  @ApiPropertyOptional() @IsString() id?: string;
  @ApiPropertyOptional() @IsString() professorId?: string;
  @ApiPropertyOptional() @IsString() campusAllocationId?: string;
  @ApiPropertyOptional() @IsString() courseId?: string;

  @ApiPropertyOptional({ enum: AssignmentType }) @IsEnum(AssignmentType) assignmentType?: AssignmentType;

  @ApiPropertyOptional() @IsNumber() calcJourneyTime?: number;

  @ApiPropertyOptional() @IsString() createdBy?: string;
  @ApiPropertyOptional() @IsString() updatedBy?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AssignmentType } from './professor-assignment.dto';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CreateProfessorAssignmentDto {
  @ApiProperty() @IsString() professorId!: string;
  @ApiProperty() @IsString() academicCycleId!: string;
  @ApiProperty() @IsString() campusId!: string;

  @ApiProperty({ enum: AssignmentType }) @IsEnum(AssignmentType) assignmentType!: AssignmentType;

  @ApiPropertyOptional() @IsString() @IsOptional() curricularMeshCourseId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() campusAllocationId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() institutionalProjectId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string;
}

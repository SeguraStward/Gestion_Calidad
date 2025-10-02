import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { AssignmentType } from './professor-assignment.dto';

export class CreateProfessorAssignmentDto {
  @ApiProperty() @IsString() professorId!: string;
  @ApiProperty() @IsString() campusAllocationId!: string;
  @ApiProperty() @IsString() courseId!: string;

  @ApiProperty({ enum: AssignmentType }) @IsEnum(AssignmentType) assignmentType!: AssignmentType;
}

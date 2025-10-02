import { PartialType } from '@nestjs/swagger';
import { CreateProfessorAssignmentDto } from './create-professor-assignment.dto';

export class UpdateProfessorAssignmentDto extends PartialType(CreateProfessorAssignmentDto) {}

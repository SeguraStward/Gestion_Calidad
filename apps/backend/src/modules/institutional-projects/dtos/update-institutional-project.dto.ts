import { PartialType } from '@nestjs/swagger';
import { CreateInstitutionalProjectDto } from './create-institutional-project.dto';

export class UpdateInstitutionalProjectDto extends PartialType(CreateInstitutionalProjectDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateCampusAllocationDto } from './create-campus-allocation.dto';

export class UpdateCampusAllocationDto extends PartialType(CreateCampusAllocationDto) {}

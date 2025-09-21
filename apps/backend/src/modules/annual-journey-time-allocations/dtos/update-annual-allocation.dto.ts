import { PartialType } from '@nestjs/swagger';
import { CreateAnnualAllocationDto } from './create-annual-allocation.dto';

export class UpdateAnnualAllocationDto extends PartialType(CreateAnnualAllocationDto) {}

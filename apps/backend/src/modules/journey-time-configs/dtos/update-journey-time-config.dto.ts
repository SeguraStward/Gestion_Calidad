import { PartialType } from '@nestjs/mapped-types';
import { CreateJourneyTimeConfigDto } from './create-journey-time-config.dto';

export class UpdateJourneyTimeConfigDto extends PartialType(CreateJourneyTimeConfigDto) {}

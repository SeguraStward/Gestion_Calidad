import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { AcademicBackgroundDto } from './dtos/academic-background.dto';
import { AcademicBackgroundsService } from './academic-backgrounds.service';

@Controller('academic-backgrounds')
export class AcademicBackgroundsController extends GenericController<
  AcademicBackgroundDto,
  AcademicBackgroundDto
> {
  protected readonly logger = new Logger(AcademicBackgroundsController.name);
  protected readonly resourceName = 'ACADEMIC_BACKGROUND';
  constructor(private readonly academicBackgroundsService: AcademicBackgroundsService) {
    super(academicBackgroundsService);
  }
}

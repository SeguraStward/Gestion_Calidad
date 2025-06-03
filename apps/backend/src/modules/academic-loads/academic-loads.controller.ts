import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { AcademicLoadDto } from './dtos/academic-load.dto';
import { AcademicLoadsService } from './academic-loads.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('ACADEMIC_LOAD')
@Controller('academic-loads')
export class AcademicLoadsController extends GenericController<AcademicLoadDto, AcademicLoadDto> {
  protected readonly logger = new Logger(AcademicLoadsController.name);
  protected readonly resourceName = 'ACADEMIC_LOAD';
  constructor(private readonly academicLoadsService: AcademicLoadsService) {
    super(academicLoadsService);
  }
}

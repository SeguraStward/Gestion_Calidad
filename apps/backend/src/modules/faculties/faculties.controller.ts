import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { FacultyDto } from './dtos/faculty.dto';
import { FacultiesService } from './faculties.service';

@Controller('faculties')
export class FacultiesController extends GenericController<FacultyDto, FacultyDto> {
  protected readonly logger = new Logger(FacultiesController.name);
  protected readonly resourceName = 'FACULTY';
  constructor(private readonly facultiesService: FacultiesService) {
    super(facultiesService);
  }
}

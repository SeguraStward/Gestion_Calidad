import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';
import { AcademicLoadDto } from './dtos/academic-load.dto';
import { AcademicLoadsService } from './academic-loads.service';

@Controller('academic-loads')
export class AcademicLoadsController extends GenericController<AcademicLoadDto, AcademicLoadDto> {
  protected readonly logger = new Logger(AcademicLoadsController.name);
  constructor(private readonly academicLoadsService: AcademicLoadsService) {
    super(academicLoadsService);
  }
}

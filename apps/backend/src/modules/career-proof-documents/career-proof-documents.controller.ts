import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { CareerProofDocumentDto } from './dtos/career-proof-document.dto';
import { CreateCareerProofDocumentDto } from './dtos/create-career-proof-document.dto';
import { UpdateCareerProofDocumentDto } from './dtos/update-career-proof-document.dto';
import { CareerProofDocumentsService } from './career-proof-documents.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';

@ResourceName('CAREER_PROOF_DOCUMENT')
@Controller('career-proof-documents')
export class CareerProofDocumentsController extends GenericController<CareerProofDocumentDto, CreateCareerProofDocumentDto, UpdateCareerProofDocumentDto> {
  protected readonly logger = new Logger(CareerProofDocumentsController.name);
  protected readonly resourceName = 'CAREER_PROOF_DOCUMENT';

  constructor(private readonly careerProofDocumentsService: CareerProofDocumentsService) {
    super(careerProofDocumentsService);
  }
}

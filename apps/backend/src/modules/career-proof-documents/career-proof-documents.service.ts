import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { CareerProofDocumentDto } from './dtos/career-proof-document.dto';
import { CreateCareerProofDocumentDto } from './dtos/create-career-proof-document.dto';
import { UpdateCareerProofDocumentDto } from './dtos/update-career-proof-document.dto';
import { CareerProofDocument } from '@una-gc/database/prisma/generated/client';
import { CareerProofDocumentsRepository } from './career-proof-documents.repository';

@Injectable()
export class CareerProofDocumentsService extends GenericService<CareerProofDocument, CareerProofDocumentDto, CreateCareerProofDocumentDto, UpdateCareerProofDocumentDto> {
  protected readonly logger = new Logger(CareerProofDocumentsService.name);

  protected readonly relationCheckConfig = {
    relationFields: [],
    errorMessage: 'Cannot delete Career Proof Document.',
  };

  constructor(
    protected readonly careerProofDocumentsRepository: CareerProofDocumentsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(careerProofDocumentsRepository, CareerProofDocumentDto);
  }
}

import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ProofDocumentDto } from './dtos/proof-document.dto';
import { CreateProofDocumentDto } from './dtos/create-proof-document.dto';
import { UpdateProofDocumentDto } from './dtos/update-proof-document.dto';
import { ProofDocument } from '@una-gc/database/prisma/generated/client';
import { ProofDocumentsRepository } from './proof-documents.repository';

@Injectable()
export class ProofDocumentsService extends GenericService<ProofDocument, ProofDocumentDto, CreateProofDocumentDto, UpdateProofDocumentDto> {
  protected readonly logger = new Logger(ProofDocumentsService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['careerProofDocuments'],
    errorMessage: 'Cannot delete Proof Document because it has associated career proof documents.',
  };

  constructor(
    protected readonly proofDocumentsRepository: ProofDocumentsRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(proofDocumentsRepository, ProofDocumentDto);
  }

  // Sobrescribir el método save para generar automáticamente el código
  async save(createDto: CreateProofDocumentDto): Promise<ProofDocumentDto> {
    this.logger.debug('Creating proof document with auto-generated code');

    // Generar el código automáticamente
    const generatedCode = await this.proofDocumentsRepository.generateNextCode(createDto.proofDocumentTypeId);

    // Crear el objeto con el código generado
    const dataWithCode = {
      ...createDto,
      code: generatedCode
    };

    this.logger.debug(`Generated code: ${generatedCode}`);

    // Usar el método save del padre que maneja la transformación correctamente
    return super.save(dataWithCode as any);
  }
}

import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { ProofDocumentTypeDto } from './dtos/proof-document-type.dto';
import { CreateProofDocumentTypeDto } from './dtos/create-proof-document-type.dto';
import { UpdateProofDocumentTypeDto } from './dtos/update-proof-document-type.dto';
import { ProofDocumentType } from '@una-gc/database/prisma/generated/client';
import { ProofDocumentTypesRepository } from './proof-document-types.repository';

@Injectable()
export class ProofDocumentTypesService extends GenericService<ProofDocumentType, ProofDocumentTypeDto, CreateProofDocumentTypeDto, UpdateProofDocumentTypeDto> {
  protected readonly logger = new Logger(ProofDocumentTypesService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['proofDocuments'],
    errorMessage: 'Cannot delete Proof Document Type because it has associated proof documents.',
  };

  constructor(
    protected readonly proofDocumentTypesRepository: ProofDocumentTypesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(proofDocumentTypesRepository, ProofDocumentTypeDto);
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      // Obtener el tipo de documento con sus documentos asociados para logging
      const docType = await this.proofDocumentTypesRepository.findById(id, {
        proofDocuments: true,
      });

      if (docType) {
        this.logger.log(`📋 Attempting to delete ProofDocumentType: ${docType.name} (${id})`);
        this.logger.log(`📄 Associated proof documents: ${docType.proofDocuments?.length || 0}`);

        if (docType.proofDocuments && docType.proofDocuments.length > 0) {
          const activeDocuments = docType.proofDocuments.filter(doc => doc.status === 'ACTIVE');
          const inactiveDocuments = docType.proofDocuments.filter(doc => doc.status === 'INACTIVE');

          this.logger.log(`✅ Active documents: ${activeDocuments.length}`);
          this.logger.log(`❌ Inactive documents: ${inactiveDocuments.length}`);

          if (activeDocuments.length > 0) {
            this.logger.warn(`⚠️ Cannot delete: Found ${activeDocuments.length} active proof documents`);
            activeDocuments.forEach((doc, index) => {
              this.logger.warn(`   ${index + 1}. ${doc.name} (${doc.id}) - Status: ${doc.status}`);
            });
          }
        }
      }

      // Llamar al método padre que hace la verificación
      return await super.deleteById(id);
    } catch (error) {
      this.logger.error(`Error deleting ProofDocumentType with id ${id}:`, error);
      throw error;
    }
  }
}

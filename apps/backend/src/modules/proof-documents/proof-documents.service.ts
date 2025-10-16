import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';

import { ProofDocumentDto } from './dtos/proof-document.dto';
import { CreateProofDocumentDto } from './dtos/create-proof-document.dto';
import { UpdateProofDocumentDto } from './dtos/update-proof-document.dto';
import { ProofDocument } from '@una-gc/database/prisma/generated/client';
import { ProofDocumentsRepository } from './proof-documents.repository';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { QualityEvidencesService } from '../quality-evidences/quality-evidences.service';
import { CareersService } from '../careers/careers.service';
import { PrismaService } from '@src/prisma/prisma.service';

export interface UploadProofDocumentDto {
  name: string;
  description?: string;
  evidenceId: string;
  proofDocumentTypeId: string;
  careerIds: string[];
}

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
    private readonly googleDriveService: GoogleDriveService,
    private readonly qualityEvidencesService: QualityEvidencesService,
    private readonly careersService: CareersService,
    private readonly prisma: PrismaService,
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
      code: generatedCode,
    };

    this.logger.debug(`Generated code: ${generatedCode}`);

    // Usar el método save del padre que maneja la transformación correctamente
    return super.save(dataWithCode as any);
  }

  /**
   * Upload proof document to Google Drive and create all necessary relations
   * This is the main method that orchestrates the entire upload process
   */
  async uploadProofDocumentWithDrive(
    file: any,
    uploadDto: UploadProofDocumentDto,
    accessToken: string,
    refreshToken?: string,
  ): Promise<{
    proofDocument: ProofDocumentDto;
    careerRelations: any[];
    folderPath: string;
  }> {
    this.logger.log('🚀 Starting proof document upload with Google Drive integration');
    this.logger.debug('Upload DTO:', uploadDto);

    try {
      // 1. Validate evidence exists and get full hierarchy
      this.logger.log('📋 Step 1: Validating evidence and getting hierarchy...');

      // Get full hierarchy: Evidence -> Standard -> Criterion -> Component -> Dimension
      const hierarchy = await this.getEvidenceHierarchy(uploadDto.evidenceId);
      this.logger.log('✅ Hierarchy retrieved:', {
        dimension: hierarchy.dimension?.code,
        component: hierarchy.component?.code,
        criterion: hierarchy.criterion?.code,
        standard: hierarchy.standard?.code,
        evidence: hierarchy.evidence.code,
      });

      // 2. Get career names for the _carreras.txt file
      this.logger.log('👥 Step 2: Getting career names...');
      const careers = await Promise.all(
        uploadDto.careerIds.map(async (careerId) => {
          const career = await this.prisma.career.findUnique({
            where: { id: careerId },
            select: { name: true }
          });
          return career?.name || `Career ${careerId}`;
        }),
      );
      this.logger.log(`✅ Found ${careers.length} careers:`, careers);

      // 3. Generate document code
      this.logger.log('🔢 Step 3: Generating document code...');
      const documentCode = await this.proofDocumentsRepository.generateNextCode(uploadDto.proofDocumentTypeId);
      this.logger.log(`✅ Generated code: ${documentCode}`);

      // 4. Create folder structure in Google Drive
      this.logger.log('📁 Step 4: Creating folder structure in Google Drive...');
      const folderStructure = {
        dimensionCode: hierarchy.dimension?.code || 'DIM-00',
        dimensionName: hierarchy.dimension?.name || 'Unknown',
        componentCode: hierarchy.component?.code,
        componentName: hierarchy.component?.name,
        criterionCode: hierarchy.criterion?.code,
        criterionName: hierarchy.criterion?.name,
        standardCode: hierarchy.standard?.code,
        standardName: hierarchy.standard?.name,
        evidenceCode: hierarchy.evidence.code,
        evidenceName: hierarchy.evidence.name,
      };

      const driveFolder = await this.googleDriveService.createFolderStructure(
        folderStructure,
        accessToken,
        refreshToken,
      );
      this.logger.log(`✅ Folder created: ${driveFolder.path}`);

      // 5. Rename file with document code
      const fileExtension = file.originalname.split('.').pop();
      const newFileName = `${documentCode}_${file.originalname.replace(/\s+/g, '-')}`;

      // 6. Upload file to Google Drive
      this.logger.log(`📤 Step 5: Uploading file to Google Drive: ${newFileName}`);
      const uploadedFile = await this.googleDriveService.uploadFile(
        { ...file, originalname: newFileName },
        driveFolder.id,
        careers,
        accessToken,
        refreshToken,
      );
      this.logger.log(`✅ File uploaded: ${uploadedFile.url}`);

      // 7. Create proof document in database
      this.logger.log('💾 Step 6: Creating proof document in database...');
      const proofDocumentData: CreateProofDocumentDto = {
        name: uploadDto.name,
        description: uploadDto.description,
        fileUrl: uploadedFile.url,
        fileName: newFileName,
        fileType: fileExtension || 'unknown',
        fileSize: uploadedFile.size,
        evidenceId: uploadDto.evidenceId,
        proofDocumentTypeId: uploadDto.proofDocumentTypeId,
        googleDriveFileId: uploadedFile.id,
        googleDriveFolderId: driveFolder.id,
      };

      const proofDocument = await this.save(proofDocumentData);
      this.logger.log(`✅ Proof document created: ${proofDocument.id} (${proofDocument.code})`);

      // 8. Create career-proof-document relations
      this.logger.log('🔗 Step 7: Creating career-proof-document relations...');
      const careerRelations = await Promise.all(
        uploadDto.careerIds.map(async (careerId) => {
          return this.prisma.careerProofDocument.create({
            data: {
              careerId: careerId,
              proofDocumentId: proofDocument.id,
            },
          });
        }),
      );
      this.logger.log(`✅ Created ${careerRelations.length} career relations`);

      this.logger.log('🎉 Upload completed successfully!');

      return {
        proofDocument,
        careerRelations,
        folderPath: driveFolder.path,
      };
    } catch (error: any) {
      this.logger.error('❌ Error uploading proof document:', error);
      throw new BadRequestException(`Error uploading proof document: ${error.message}`);
    }
  }

  /**
   * Get the complete hierarchy for an evidence
   * Evidence -> Standard (optional) -> Criterion -> Component -> Dimension
   */
  private async getEvidenceHierarchy(evidenceId: string): Promise<{
    evidence: any;
    standard?: any;
    criterion: any;
    component: any;
    dimension: any;
  }> {
    const evidence = await this.prisma.qualityEvidence.findUnique({
      where: { id: evidenceId },
      include: {
        standard: {
          include: {
            criterion: {
              include: {
                component: {
                  include: {
                    dimension: true,
                  },
                },
              },
            },
          },
        },
        criterion: {
          include: {
            component: {
              include: {
                dimension: true,
              },
            },
          },
        },
      },
    });

    if (!evidence) {
      throw new BadRequestException('Evidence not found');
    }

    // Evidence can be associated with either a standard OR directly with a criterion
    if (evidence.standard) {
      // Case 1: Evidence -> Standard -> Criterion -> Component -> Dimension
      return {
        evidence,
        standard: evidence.standard,
        criterion: evidence.standard.criterion,
        component: evidence.standard.criterion.component,
        dimension: evidence.standard.criterion.component.dimension,
      };
    } else if (evidence.criterion) {
      // Case 2: Evidence -> Criterion -> Component -> Dimension
      return {
        evidence,
        criterion: evidence.criterion,
        component: evidence.criterion.component,
        dimension: evidence.criterion.component.dimension,
      };
    } else {
      throw new BadRequestException('Evidence must be associated with either a standard or criterion');
    }
  }
}

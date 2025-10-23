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

export interface ProofDocumentSearchFilters {
  search?: string;
  dimensionId?: string;
  componentId?: string;
  criterionId?: string;
  standardId?: string;
  evidenceId?: string;
  proofDocumentTypeId?: string;
  careerIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
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
      this.logger.log(`✅ Proof document created: ${JSON.stringify(proofDocument, null, 2)}`);
      this.logger.log(`✅ Proof document ID: ${proofDocument?.id}, Code: ${proofDocument?.code}`);

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

      const result = {
        proofDocument,
        careerRelations,
        folderPath: driveFolder.path,
      };

      this.logger.log('📦 Returning result:', JSON.stringify(result, null, 2));
      this.logger.log('📦 ProofDocument in result:', !!result.proofDocument);
      this.logger.log('📦 ProofDocument code:', result.proofDocument?.code);

      return result;
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

  /**
   * Search proof documents with advanced filters
   * Supports filtering by SINAES hierarchy, document type, careers, dates, and status
   */
  async searchProofDocuments(filters: ProofDocumentSearchFilters): Promise<{
    data: ProofDocumentDto[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const {
      search,
      dimensionId,
      componentId,
      criterionId,
      standardId,
      evidenceId,
      proofDocumentTypeId,
      careerIds,
      dateFrom,
      dateTo,
      status,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = filters;

    this.logger.log('🔍 Searching proof documents with filters:', { ...filters, careerIds: careerIds?.length });

    // Build Prisma where clause
    const where: any = {};

    // Text search (name or code) - case insensitive
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter (only if not 'ALL')
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Document type filter
    if (proofDocumentTypeId) {
      where.proofDocumentTypeId = proofDocumentTypeId;
    }

    // Evidence filter (direct or through hierarchy)
    if (evidenceId) {
      where.evidenceId = evidenceId;
    } else if (standardId || criterionId || componentId || dimensionId) {
      // Need to filter through evidence relations
      where.evidence = {};

      if (standardId) {
        // Filter by standard
        where.evidence.standardId = standardId;
      } else if (criterionId) {
        // Filter by criterion - can be direct or through standard
        where.evidence.OR = [
          { criterionId }, // Evidence directly associated with criterion
          { standard: { criterionId } }, // Evidence through standard
        ];
      } else if (componentId) {
        // Filter by component - through criterion
        where.evidence.OR = [
          { criterion: { componentId } }, // Direct criterion
          { standard: { criterion: { componentId } } }, // Through standard
        ];
      } else if (dimensionId) {
        // Filter by dimension - through component -> criterion
        where.evidence.OR = [
          { criterion: { component: { dimensionId } } }, // Direct criterion
          { standard: { criterion: { component: { dimensionId } } } }, // Through standard
        ];
      }
    }

    // Career filter (through careerProofDocuments)
    if (careerIds && careerIds.length > 0) {
      where.careerProofDocuments = {
        some: {
          careerId: { in: careerIds },
        },
      };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) {
        // Set to end of day
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endOfDay;
      }
    }

    this.logger.debug('Prisma where clause:', JSON.stringify(where, null, 2));

    try {
      // Execute query with pagination
      const [data, total] = await Promise.all([
        this.prisma.proofDocument.findMany({
          where,
          include: {
            evidence: {
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
              },
            },
            proofDocumentType: true,
            careerProofDocuments: {
              include: {
                career: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [orderBy]: orderDirection },
        }),
        this.prisma.proofDocument.count({ where }),
      ]);

      this.logger.log(`✅ Found ${total} documents, returning page ${page} (${data.length} items)`);

      const totalPages = Math.ceil(total / limit);

      return {
        data: data.map((doc) => {
          const dto = new ProofDocumentDto();
          Object.assign(dto, doc);
          return dto;
        }),
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.logger.error('❌ Error searching proof documents:', error);
      throw error;
    }
  }
}

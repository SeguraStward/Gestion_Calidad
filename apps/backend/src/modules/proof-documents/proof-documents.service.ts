import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger, BadRequestException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

import { ProofDocumentDto } from './dtos/proof-document.dto';
import { CreateProofDocumentDto } from './dtos/create-proof-document.dto';
import { UpdateProofDocumentDto } from './dtos/update-proof-document.dto';
import { ProofDocument } from '@una-gc/database/prisma/generated/client';
import { ProofDocumentsRepository } from './proof-documents.repository';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { QualityEvidencesService } from '../quality-evidences/quality-evidences.service';
import { CareersService } from '../careers/careers.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { SinaesDocumentHistoryService } from '../sinaes-document-history/sinaes-document-history.service';
import type { RequestWithContext } from '@src/core/interceptors/request-context.interceptor';

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

@Injectable({ scope: Scope.REQUEST })
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
    private readonly historyService: SinaesDocumentHistoryService,
    @Inject(REQUEST) private readonly request: RequestWithContext,
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
    const result = await super.save(dataWithCode as any);

    // Log document creation to history
    try {
      await this.historyService.logChange({
        documentId: result.id,
        userId: this.request.userId || 'system',
        changeType: 'CREATED',
        description: `Documento creado: ${result.name}`,
        ipAddress: this.request.ipAddress,
        userAgent: this.request.userAgent,
      });
      this.logger.debug(`📝 History logged for document creation: ${result.id}`);
    } catch (error) {
      this.logger.warn('Failed to log document creation to history:', error);
      // Don't fail the operation if history logging fails
    }

    return result;
  }

  // Sobrescribir el método update para registrar cambios
  async update(id: string, updateDto: UpdateProofDocumentDto): Promise<ProofDocumentDto> {
    this.logger.debug(`Updating proof document: ${id}`);

    // Get old data before update
    const oldDocument = await this.proofDocumentsRepository.findById(id);
    if (!oldDocument) {
      throw new BadRequestException(`Document with id ${id} not found`);
    }

    // Perform update
    const result = await super.update(id, updateDto);

    // Detect changes and log to history
    try {
      const changes = await this.historyService.detectChanges(oldDocument, updateDto);

      if (changes.length > 0) {
        // Log each significant change
        for (const change of changes) {
          await this.historyService.logChange({
            documentId: id,
            userId: this.request.userId || 'system',
            changeType: 'UPDATED',
            fieldChanged: change.field,
            oldValue: change.oldValue,
            newValue: change.newValue,
            description: `Campo actualizado: ${change.field}`,
            ipAddress: this.request.ipAddress,
            userAgent: this.request.userAgent,
          });
        }
        this.logger.debug(`📝 Logged ${changes.length} field changes for document: ${id}`);
      }
    } catch (error) {
      this.logger.warn('Failed to log document update to history:', error);
      // Don't fail the operation if history logging fails
    }

    return result;
  }

  // Sobrescribir el método deleteById para registrar eliminación y eliminar de Google Drive
  async deleteById(id: string): Promise<boolean> {
    this.logger.debug(`Deleting proof document: ${id}`);

    // Get document info before deletion
    try {
      const document = await this.proofDocumentsRepository.findById(id);

      if (!document) {
        throw new BadRequestException(`Document with id ${id} not found`);
      }

      // Delete from Google Drive if exists
      if (document.googleDriveFileId) {
        try {
          this.logger.log(`🗑️ Attempting to delete file from Google Drive: ${document.googleDriveFileId}`);

          // Get user's Google Drive tokens
          // TODO: Get actual user tokens from database/session
          // For now, log a warning - in production, fetch from user's stored credentials
          const user = await this.prisma.user.findUnique({
            where: { id: this.request.userId || '' },
            select: {
              googleAccessToken: true,
              googleRefreshToken: true,
            },
          });

          if (user?.googleAccessToken) {
            await this.googleDriveService.deleteFile(
              document.googleDriveFileId,
              user.googleAccessToken,
              user.googleRefreshToken || undefined
            );
            this.logger.log('✅ File successfully deleted from Google Drive');
          } else {
            this.logger.warn('⚠️ Cannot delete from Google Drive: User tokens not available');
          }
        } catch (error) {
          this.logger.warn('⚠️ Failed to delete file from Google Drive:', error);
          // Continue with database deletion even if Drive deletion fails
        }
      }

      // Perform deletion (soft delete)
      const result = await super.deleteById(id);

      // Log deletion to history
      if (result) {
        try {
          await this.historyService.logChange({
            documentId: id,
            userId: this.request.userId || 'system',
            changeType: 'DELETED',
            description: `Documento eliminado: ${document.name} (${document.code})`,
            ipAddress: this.request.ipAddress,
            userAgent: this.request.userAgent,
          });
          this.logger.debug(`📝 History logged for document deletion: ${id}`);
        } catch (error) {
          this.logger.warn('Failed to log document deletion to history:', error);
          // Don't fail the operation if history logging fails
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Error deleting document ${id}:`, error);
      throw error;
    }
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

      // 2. Check for duplicate documents in the database
      this.logger.log('🔍 Step 2: Checking for duplicate documents in database...');

      // Extract original filename without extension for comparison
      const originalFileName = file.originalname;
      const fileNameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;

      // Check if a document with similar name already exists in this evidence
      const existingDocuments = await this.prisma.proofDocument.findMany({
        where: {
          evidenceId: uploadDto.evidenceId,
          status: 'ACTIVE',
          OR: [
            { fileName: { contains: fileNameWithoutExt, mode: 'insensitive' } },
            { name: { equals: uploadDto.name, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          code: true,
          fileName: true,
        },
      });

      if (existingDocuments.length > 0) {
        const existing = existingDocuments[0];
        this.logger.warn(`⚠️ Duplicate document found in database: ${existing.name} (${existing.code})`);
        throw new BadRequestException(
          `Ya existe un documento similar en esta evidencia:\n` +
          `- Nombre: "${existing.name}"\n` +
          `- Código: ${existing.code}\n` +
          `- Archivo: ${existing.fileName}\n\n` +
          `Por favor, usa un nombre diferente o elimina el documento existente primero.`
        );
      }

      this.logger.log('✅ No duplicate documents found in database');

      // 3. Get career names for the _carreras.txt file
      this.logger.log('👥 Step 3: Getting career names...');
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

      // 4. Generate document code
      this.logger.log('🔢 Step 4: Generating document code...');
      const documentCode = await this.proofDocumentsRepository.generateNextCode(uploadDto.proofDocumentTypeId);
      this.logger.log(`✅ Generated code: ${documentCode}`);

      // 5. Create folder structure in Google Drive
      this.logger.log('📁 Step 5: Creating folder structure in Google Drive...');
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

      // 6. Rename file with document code
      const fileExtension = file.originalname.split('.').pop();
      const newFileName = `${documentCode}_${file.originalname.replace(/\s+/g, '-')}`;

      // 7. Upload file to Google Drive (with duplicate check)
      this.logger.log(`📤 Step 6: Uploading file to Google Drive: ${newFileName}`);
      const uploadedFile = await this.googleDriveService.uploadFile(
        { ...file, originalname: newFileName },
        driveFolder.id,
        careers,
        accessToken,
        refreshToken,
      );
      this.logger.log(`✅ File uploaded: ${uploadedFile.url}`);

      // 8. Create proof document in database
      this.logger.log('💾 Step 7: Creating proof document in database...');
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

      // 9. Create career-proof-document relations
      this.logger.log('🔗 Step 8: Creating career-proof-document relations...');
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

  /**
   * Update document careers (carreras asociadas)
   */
  async updateDocumentCareers(
    documentId: string,
    careerIds: string[],
  ): Promise<void> {
    this.logger.log(`📋 Updating careers for document: ${documentId}`);

    // Get document info
    const document = await this.proofDocumentsRepository.findById(documentId);
    if (!document) {
      throw new BadRequestException(`Document with id ${documentId} not found`);
    }

    // Get old careers for history logging
    const oldCareers = await this.prisma.careerProofDocument.findMany({
      where: { proofDocumentId: documentId },
      include: { career: true },
    });

    // Delete existing relations
    await this.prisma.careerProofDocument.deleteMany({
      where: { proofDocumentId: documentId },
    });

    // Create new relations
    await Promise.all(
      careerIds.map((careerId) =>
        this.prisma.careerProofDocument.create({
          data: {
            proofDocumentId: documentId,
            careerId,
          },
        }),
      ),
    );

    // Get new career names
    const newCareers = await this.prisma.career.findMany({
      where: { id: { in: careerIds } },
      select: { name: true },
    });
    const newCareerNames = newCareers.map((c) => c.name);

    // Update _carreras.txt file in Google Drive
    if (document.googleDriveFolderId && newCareerNames.length > 0) {
      try {
        this.logger.log('📁 Updating _carreras.txt file in Google Drive...');

        // Get user's Google Drive tokens
        const user = await this.prisma.user.findUnique({
          where: { id: this.request.userId || '' },
          select: {
            googleAccessToken: true,
            googleRefreshToken: true,
          },
        });

        if (user?.googleAccessToken) {
          await this.googleDriveService.updateCarrerasFile(
            document.googleDriveFolderId,
            document.code,
            newCareerNames,
            user.googleAccessToken,
            user.googleRefreshToken || undefined,
          );
          this.logger.log('✅ _carreras.txt file updated in Google Drive');
        } else {
          this.logger.warn('⚠️ Cannot update _carreras.txt: User tokens not available');
        }
      } catch (error) {
        this.logger.warn('⚠️ Failed to update _carreras.txt file in Drive:', error);
        // Continue even if Drive update fails
      }
    }

    // Log to history
    try {
      const oldCareerNames = oldCareers.map((c) => c.career?.name).join(', ');
      const newCareerNamesStr = newCareerNames.join(', ');

      await this.historyService.logChange({
        documentId,
        userId: this.request.userId || 'system',
        changeType: 'CAREERS_UPDATED',
        fieldChanged: 'careers',
        oldValue: oldCareerNames,
        newValue: newCareerNamesStr,
        description: `Carreras actualizadas`,
        ipAddress: this.request.ipAddress,
        userAgent: this.request.userAgent,
      });
    } catch (error) {
      this.logger.warn('Failed to log careers update to history:', error);
    }

    this.logger.log('✅ Careers updated successfully');
  }

  /**
   * Replace document file in Google Drive
   */
  async replaceDocumentFile(
    documentId: string,
    file: any,
    accessToken: string,
    refreshToken?: string,
  ): Promise<ProofDocumentDto> {
    this.logger.log(`🔄 Replacing file for document: ${documentId}`);

    const document = await this.proofDocumentsRepository.findById(documentId);
    if (!document) {
      throw new BadRequestException(`Document with id ${documentId} not found`);
    }

    const oldFileName = document.fileName;
    const oldFileUrl = document.fileUrl;

    // Get current careers to maintain the _carreras.txt file
    const currentCareers = await this.prisma.careerProofDocument.findMany({
      where: { proofDocumentId: documentId },
      include: { career: true },
    });
    const careerNames = currentCareers.map((c) => c.career?.name || '').filter(Boolean);

    // Upload new file to Google Drive (same folder)
    const fileExtension = file.originalname.split('.').pop();
    const newFileName = `${document.code}_${file.originalname.replace(/\s+/g, '-')}`;

    const uploadedFile = await this.googleDriveService.uploadFile(
      { ...file, originalname: newFileName },
      document.googleDriveFolderId!,
      careerNames, // Pass current careers to maintain _carreras.txt
      accessToken,
      refreshToken,
    );

    // Delete old file from Drive
    if (document.googleDriveFileId) {
      try {
        this.logger.log(`🗑️ Deleting old file from Google Drive: ${document.googleDriveFileId}`);
        await this.googleDriveService.deleteFile(
          document.googleDriveFileId,
          accessToken,
          refreshToken,
        );
        this.logger.log('✅ Old file successfully deleted from Google Drive');
      } catch (error) {
        this.logger.warn('⚠️ Failed to delete old file from Drive:', error);
        // Continue even if deletion fails - new file is already uploaded
      }
    }

    // Update document in database
    const updateData: any = {
      fileUrl: uploadedFile.url,
      fileName: newFileName,
      fileType: fileExtension || document.fileType,
      fileSize: uploadedFile.size,
      googleDriveFileId: uploadedFile.id,
    };

    const updated = await this.update(documentId, updateData);

    // Log to history
    try {
      await this.historyService.logChange({
        documentId,
        userId: this.request.userId || 'system',
        changeType: 'FILE_REPLACED',
        fieldChanged: 'file',
        oldValue: oldFileName,
        newValue: newFileName,
        description: `Archivo reemplazado: ${oldFileName} → ${newFileName}`,
        ipAddress: this.request.ipAddress,
        userAgent: this.request.userAgent,
      });
    } catch (error) {
      this.logger.warn('Failed to log file replacement to history:', error);
    }

    this.logger.log('✅ File replaced successfully');
    return updated;
  }
}

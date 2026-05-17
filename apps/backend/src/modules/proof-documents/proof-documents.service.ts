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
   * Upload proof document(s) to Google Drive and create all necessary relations.
   *
   * Folder layout (new):
   *   …/{Evidence}/{DocumentType}/{Code}/
   *     ├── {Code}_<filename>.pdf  (one or more files in the same upload)
   *     └── {Code}_carreras.txt    (regenerated from DB after relations are saved)
   *
   * Duplicate detection here is intentionally minimal — the `code @unique`
   * constraint already prevents real collisions, and within a single upload
   * each archive lives inside its own per-upload folder, so name collisions
   * across uploads are impossible. Same-name uploads to the same evidence
   * are now allowed (different documents, different codes).
   *
   * `files` is the canonical input; if a legacy caller passes the singular
   * `file` field we still accept it.
   */
  async uploadProofDocumentWithDrive(
    fileOrFiles: any | any[],
    uploadDto: UploadProofDocumentDto,
    accessToken: string,
    refreshToken?: string,
  ): Promise<{
    proofDocument: ProofDocumentDto;
    careerRelations: any[];
    folderPath: string;
    uploadedFiles: Array<{ id: string; name: string; url: string; size: number }>;
  }> {
    const files: any[] = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    if (files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    this.logger.log(
      `🚀 Starting proof document upload (${files.length} file${files.length > 1 ? 's' : ''})`,
    );

    try {
      // 1. Validate evidence and fetch hierarchy + document type in parallel.
      const [hierarchy, documentType] = await Promise.all([
        this.getEvidenceHierarchy(uploadDto.evidenceId),
        this.prisma.proofDocumentType.findUnique({
          where: { id: uploadDto.proofDocumentTypeId },
          select: { id: true, name: true, prefix: true },
        }),
      ]);

      if (!documentType) {
        throw new BadRequestException('Proof document type not found');
      }

      this.logger.log('✅ Hierarchy + type retrieved', {
        evidence: hierarchy.evidence.code,
        documentType: documentType.name,
      });

      // 2. Generate the document code FIRST so the folder is named after it.
      //    DocumentCounter.upsert is atomic in Mongo, so concurrent uploads
      //    each get a distinct code.
      const documentCode = await this.proofDocumentsRepository.generateNextCode(
        uploadDto.proofDocumentTypeId,
      );
      this.logger.log(`🔢 Generated code: ${documentCode}`);

      // 3. Build the Drive folder tree, including type + per-upload folders.
      const driveFolder = await this.googleDriveService.createFolderStructure(
        {
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
          documentTypeName: documentType.name,
          documentCode,
        },
        accessToken,
        refreshToken,
      );

      const uploadFolderId = driveFolder.uploadFolderId ?? driveFolder.id;
      this.logger.log(`📁 Upload folder ready: ${driveFolder.path} (${uploadFolderId})`);

      // 4. Upload every file into the per-upload folder. Names are namespaced
      //    with the document code so even after a future rename collisions
      //    within Drive are visually obvious.
      const uploadedFiles: Array<{ id: string; name: string; url: string; size: number }> = [];
      let primaryUploaded: { id: string; name: string; url: string; size: number; mimeType: string } | undefined;

      for (const f of files) {
        const newFileName = `${documentCode}_${f.originalname.replace(/\s+/g, '-')}`;
        const result = await this.googleDriveService.uploadFile(
          { ...f, originalname: newFileName },
          uploadFolderId,
          // We pass an empty list — the canonical `_carreras.txt` is
          // regenerated from DB right after the document and relations exist.
          [],
          accessToken,
          refreshToken,
        );
        uploadedFiles.push({
          id: result.id,
          name: result.name,
          url: result.url,
          size: result.size,
        });
        if (!primaryUploaded) primaryUploaded = result;
      }

      if (!primaryUploaded) {
        throw new BadRequestException('No file could be uploaded');
      }

      // 5. Persist the proof document with the new folder IDs. Use the first
      //    uploaded file as the primary `fileUrl` / `fileName` so the legacy
      //    UI keeps working.
      const fileExtension = primaryUploaded.name.split('.').pop();
      const proofDocumentData: CreateProofDocumentDto & {
        googleDriveTypeFolderId?: string;
        googleDriveUploadFolderId?: string;
      } = {
        name: uploadDto.name,
        description: uploadDto.description,
        fileUrl: primaryUploaded.url,
        fileName: primaryUploaded.name,
        fileType: fileExtension || 'unknown',
        fileSize: primaryUploaded.size,
        evidenceId: uploadDto.evidenceId,
        proofDocumentTypeId: uploadDto.proofDocumentTypeId,
        googleDriveFileId: primaryUploaded.id,
        googleDriveFolderId: driveFolder.evidenceFolderId ?? uploadFolderId,
        googleDriveTypeFolderId: driveFolder.typeFolderId,
        googleDriveUploadFolderId: driveFolder.uploadFolderId,
      };

      const proofDocument = await this.save(proofDocumentData as CreateProofDocumentDto);
      this.logger.log(`✅ Proof document persisted: ${proofDocument.code} (${proofDocument.id})`);

      // 6. Create career-proof-document relations. We don't enforce uniqueness
      //    here because the upload is a fresh document; for the merge flow,
      //    use `appendDocumentCareers`.
      const careerRelations = await Promise.all(
        uploadDto.careerIds.map((careerId) =>
          this.prisma.careerProofDocument.create({
            data: { careerId, proofDocumentId: proofDocument.id },
          }),
        ),
      );

      // 7. Now that the DB is the source of truth, write `_carreras.txt`
      //    from it. We swallow failures so a metadata-file issue cannot
      //    invalidate an otherwise successful upload.
      try {
        await this.googleDriveService.regenerateCarrerasFileFromDb(
          proofDocument.id,
          accessToken,
          refreshToken,
        );
      } catch (err: any) {
        this.logger.warn(`Could not regenerate _carreras.txt: ${err?.message || err}`);
      }

      this.logger.log('🎉 Upload completed successfully!');
      return {
        proofDocument,
        careerRelations,
        folderPath: driveFolder.path,
        uploadedFiles,
      };
    } catch (error: any) {
      this.logger.error('❌ Error uploading proof document:', error);
      if (error instanceof BadRequestException) throw error;
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
   * Replace ALL careers of a document with a new list.
   * Use this when the user explicitly wants to *edit* the set.
   * For non-destructive merging, prefer `appendDocumentCareers`.
   */
  async updateDocumentCareers(
    documentId: string,
    careerIds: string[],
  ): Promise<void> {
    this.logger.log(`📋 Replacing careers for document: ${documentId}`);

    const document = await this.proofDocumentsRepository.findById(documentId);
    if (!document) {
      throw new BadRequestException(`Document with id ${documentId} not found`);
    }

    const oldCareers = await this.prisma.careerProofDocument.findMany({
      where: { proofDocumentId: documentId },
      include: { career: true },
    });

    await this.prisma.careerProofDocument.deleteMany({
      where: { proofDocumentId: documentId },
    });

    await Promise.all(
      careerIds.map((careerId) =>
        this.prisma.careerProofDocument.create({
          data: { proofDocumentId: documentId, careerId },
        }),
      ),
    );

    await this.regenerateCarrerasFromDbSafe(documentId);

    // Log to history
    try {
      const oldCareerNames = oldCareers.map((c) => c.career?.name).join(', ');
      const newCareers = await this.prisma.career.findMany({
        where: { id: { in: careerIds } },
        select: { name: true },
      });
      await this.historyService.logChange({
        documentId,
        userId: this.request.userId || 'system',
        changeType: 'CAREERS_UPDATED',
        fieldChanged: 'careers',
        oldValue: oldCareerNames,
        newValue: newCareers.map((c) => c.name).join(', '),
        description: `Carreras actualizadas (reemplazo)`,
        ipAddress: this.request.ipAddress,
        userAgent: this.request.userAgent,
      });
    } catch (error) {
      this.logger.warn('Failed to log careers update to history:', error);
    }

    this.logger.log('✅ Careers replaced successfully');
  }

  /**
   * Append careers to a document without losing the existing ones (union).
   * Used by the re-upload flow when the user uploads "more careers" against
   * an already-existing document — we never want to drop relations silently.
   * Returns the number of careers actually added (i.e. excluding duplicates).
   */
  async appendDocumentCareers(
    documentId: string,
    careerIds: string[],
  ): Promise<{ added: number; alreadyPresent: number }> {
    if (!careerIds.length) {
      return { added: 0, alreadyPresent: 0 };
    }

    const document = await this.proofDocumentsRepository.findById(documentId);
    if (!document) {
      throw new BadRequestException(`Document with id ${documentId} not found`);
    }

    const existing = await this.prisma.careerProofDocument.findMany({
      where: {
        proofDocumentId: documentId,
        careerId: { in: careerIds },
      },
      select: { careerId: true },
    });
    const existingIds = new Set(existing.map((r) => r.careerId));
    const toAdd = careerIds.filter((id) => !existingIds.has(id));

    if (toAdd.length === 0) {
      this.logger.log(`appendDocumentCareers: all ${careerIds.length} careers already linked`);
      return { added: 0, alreadyPresent: careerIds.length };
    }

    await Promise.all(
      toAdd.map((careerId) =>
        this.prisma.careerProofDocument.create({
          data: { proofDocumentId: documentId, careerId },
        }),
      ),
    );

    await this.regenerateCarrerasFromDbSafe(documentId);

    try {
      const addedNames = await this.prisma.career.findMany({
        where: { id: { in: toAdd } },
        select: { name: true },
      });
      await this.historyService.logChange({
        documentId,
        userId: this.request.userId || 'system',
        changeType: 'CAREERS_UPDATED',
        fieldChanged: 'careers',
        oldValue: '',
        newValue: addedNames.map((c) => c.name).join(', '),
        description: `Carreras agregadas (${toAdd.length})`,
        ipAddress: this.request.ipAddress,
        userAgent: this.request.userAgent,
      });
    } catch (error) {
      this.logger.warn('Failed to log careers append to history:', error);
    }

    return { added: toAdd.length, alreadyPresent: careerIds.length - toAdd.length };
  }

  /** Helper that regenerates `_carreras.txt` using the current user's tokens. */
  private async regenerateCarrerasFromDbSafe(documentId: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: this.request.userId || '' },
        select: { googleAccessToken: true, googleRefreshToken: true },
      });
      if (!user?.googleAccessToken) {
        this.logger.warn('Cannot regenerate _carreras.txt: user has no Google access token');
        return;
      }
      await this.googleDriveService.regenerateCarrerasFileFromDb(
        documentId,
        user.googleAccessToken,
        user.googleRefreshToken || undefined,
      );
    } catch (error: any) {
      this.logger.warn(`regenerateCarrerasFromDbSafe failed: ${error?.message || error}`);
    }
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

    // Prefer the per-upload folder when present; fall back to the evidence
    // folder for legacy documents that pre-date the new structure.
    const targetFolderId =
      (document as any).googleDriveUploadFolderId || document.googleDriveFolderId;
    if (!targetFolderId) {
      throw new BadRequestException(
        'El documento no tiene una carpeta de Drive asociada; no se puede reemplazar el archivo.',
      );
    }

    // Upload new file to Google Drive. We no longer pass careerNames here —
    // _carreras.txt is regenerated from DB right after.
    const fileExtension = file.originalname.split('.').pop();
    const newFileName = `${document.code}_${file.originalname.replace(/\s+/g, '-')}`;

    const uploadedFile = await this.googleDriveService.uploadFile(
      { ...file, originalname: newFileName },
      targetFolderId,
      [],
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

    // Regenerate _carreras.txt from DB after replacing — the careers may
    // have been edited between uploads, and the file lives next to the new
    // upload now.
    try {
      await this.googleDriveService.regenerateCarrerasFileFromDb(
        documentId,
        accessToken,
        refreshToken,
      );
    } catch (err: any) {
      this.logger.warn(`Could not regenerate _carreras.txt after replace: ${err?.message || err}`);
    }

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

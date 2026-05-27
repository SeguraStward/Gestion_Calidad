import { GenericController } from '@core/common/interfaces/generic.controller';
import {
  Controller,
  Logger,
  Post,
  Patch,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Req,
  UnauthorizedException,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { ProofDocumentDto } from './dtos/proof-document.dto';
import { CreateProofDocumentDto } from './dtos/create-proof-document.dto';
import { UpdateProofDocumentDto } from './dtos/update-proof-document.dto';
import { ProofDocumentsService } from './proof-documents.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { RequestContextInterceptor } from '@src/core/interceptors/request-context.interceptor';
import type { Request } from 'express';

export class UploadProofDocumentDto {
  name: string;
  description?: string;
  evidenceId: string;
  proofDocumentTypeId: string;
  careerIds: string[]; // Array de IDs de carreras
}

@ApiTags('Proof Documents')
@ResourceName('PROOF_DOCUMENT')
@UseInterceptors(RequestContextInterceptor)
@Controller('proof-documents')
export class ProofDocumentsController extends GenericController<
  ProofDocumentDto,
  CreateProofDocumentDto,
  UpdateProofDocumentDto
> {
  protected readonly logger = new Logger(ProofDocumentsController.name);
  protected readonly resourceName = 'PROOF_DOCUMENT';

  constructor(private readonly proofDocumentsService: ProofDocumentsService) {
    super(proofDocumentsService);
  }

  @Get(':id/deletion-preview')
  @ApiOperation({
    summary:
      'Preview what would be deleted (Drive files, career links, type folder cleanup) before confirming.',
  })
  async getDeletionPreview(@Req() req: Request) {
    const id = req.params.id;
    return this.proofDocumentsService.getDeletionPreview(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search proof documents with advanced filters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or code' })
  @ApiQuery({ name: 'dimensionId', required: false, description: 'Filter by dimension ID' })
  @ApiQuery({ name: 'componentId', required: false, description: 'Filter by component ID' })
  @ApiQuery({ name: 'criterionId', required: false, description: 'Filter by criterion ID' })
  @ApiQuery({ name: 'standardId', required: false, description: 'Filter by standard ID' })
  @ApiQuery({ name: 'evidenceId', required: false, description: 'Filter by evidence ID' })
  @ApiQuery({ name: 'proofDocumentTypeId', required: false, description: 'Filter by document type ID' })
  @ApiQuery({ name: 'careerIds', required: false, description: 'Filter by career IDs (comma-separated)' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter by date from (ISO string)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter by date to (ISO string)' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'ALL'], description: 'Filter by status (ALL to show all)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Order by field (default: createdAt)' })
  @ApiQuery({ name: 'orderDirection', required: false, enum: ['asc', 'desc'], description: 'Order direction (default: desc)' })
  async searchProofDocuments(
    @Query('search') search?: string,
    @Query('dimensionId') dimensionId?: string,
    @Query('componentId') componentId?: string,
    @Query('criterionId') criterionId?: string,
    @Query('standardId') standardId?: string,
    @Query('evidenceId') evidenceId?: string,
    @Query('proofDocumentTypeId') proofDocumentTypeId?: string,
    @Query('careerIds') careerIds?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE' | 'ALL',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: string,
    @Query('orderDirection', new DefaultValuePipe('desc')) orderDirection?: 'asc' | 'desc',
  ) {
    this.logger.log('🔍 Searching proof documents with filters');

    // Parse careerIds from comma-separated string
    const careerIdsArray = careerIds ? careerIds.split(',').map(id => id.trim()) : undefined;

    return this.proofDocumentsService.searchProofDocuments({
      search,
      dimensionId,
      componentId,
      criterionId,
      standardId,
      evidenceId,
      proofDocumentTypeId,
      careerIds: careerIdsArray,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      status,
      page,
      limit,
      orderBy,
      orderDirection,
    });
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Upload one or more proof document files to Google Drive with career associations',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        // Legacy single-file field — still accepted for compatibility with
        // clients that have not been migrated to multi-file yet.
        file: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        description: { type: 'string' },
        evidenceId: { type: 'string' },
        proofDocumentTypeId: { type: 'string' },
        careerIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'evidenceId', 'proofDocumentTypeId', 'careerIds'],
    },
  })
  async uploadProofDocument(
    @UploadedFiles() filesArr: any[],
    // Single-file fallback (old clients) — Nest accepts both interceptors
    // mounted on the same endpoint when only one is used at a time.
    @UploadedFile() singleFile: any,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('evidenceId') evidenceId: string,
    @Body('proofDocumentTypeId') proofDocumentTypeId: string,
    @Body('careerIds') careerIds: string | string[],
    @Req() request: Request,
  ) {
    this.logger.log('📤 Uploading proof document with Google Drive integration');

    const user = (request as any).user;
    if (!user?.googleAccessToken) {
      throw new UnauthorizedException(
        'User must be authenticated with Google Drive. Please log out and log in again with Google.',
      );
    }

    // Accept either `files[]` (multi) or legacy `file` (single).
    const files: any[] =
      filesArr && filesArr.length ? filesArr : singleFile ? [singleFile] : [];
    if (files.length === 0) {
      throw new BadRequestException('Se requiere al menos un archivo para subir el documento');
    }
    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) {
        throw new BadRequestException(
          `El archivo "${f.originalname}" supera el límite de 10MB permitido`,
        );
      }
    }

    // careerIds may arrive as a JSON-encoded string from multipart forms.
    let parsedCareerIds: string[] = [];
    if (typeof careerIds === 'string') {
      try {
        parsedCareerIds = JSON.parse(careerIds);
      } catch {
        parsedCareerIds = [careerIds];
      }
    } else {
      parsedCareerIds = careerIds;
    }

    if (!parsedCareerIds || parsedCareerIds.length === 0) {
      throw new BadRequestException('At least one career must be specified');
    }

    const uploadDto: UploadProofDocumentDto = {
      name,
      description,
      evidenceId,
      proofDocumentTypeId,
      careerIds: parsedCareerIds,
    };

    return this.proofDocumentsService.uploadProofDocumentWithDrive(
      files,
      uploadDto,
      user.googleAccessToken,
      user.googleRefreshToken,
    );
  }

  @Post(':id/careers')
  @ApiOperation({
    summary:
      'Replace ALL careers of a document with a new list (destructive). Prefer PATCH :id/careers/append for non-destructive merging.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        careerIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of career IDs',
        },
      },
    },
  })
  async updateDocumentCareers(
    @Req() req: Request,
    @Body('careerIds') careerIds: string[],
  ) {
    const documentId = req.params.id;

    if (!careerIds || careerIds.length === 0) {
      throw new BadRequestException('At least one career must be specified');
    }

    await this.proofDocumentsService.updateDocumentCareers(documentId, careerIds);

    return {
      success: true,
      message: 'Careers updated successfully',
    };
  }

  @Patch(':id/careers/append')
  @ApiOperation({
    summary:
      'Append careers to a document (union — existing careers are preserved). Use this when uploading additional careers for an already-existing document.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        careerIds: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async appendDocumentCareers(
    @Req() req: Request,
    @Body('careerIds') careerIds: string[],
  ) {
    const documentId = req.params.id;
    if (!careerIds || careerIds.length === 0) {
      throw new BadRequestException('At least one career must be specified');
    }

    const result = await this.proofDocumentsService.appendDocumentCareers(
      documentId,
      careerIds,
    );

    return {
      success: true,
      added: result.added,
      alreadyPresent: result.alreadyPresent,
      message:
        result.added > 0
          ? `${result.added} carrera(s) agregada(s)`
          : 'No se agregaron carreras nuevas (ya estaban asociadas)',
    };
  }

  @Post(':id/replace-file')
  @ApiOperation({ summary: 'Replace document file in Google Drive' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'New file to upload',
        },
      },
    },
  })
  async replaceDocumentFile(
    @Req() req: any,
    @UploadedFile() file: any,
  ) {
    const documentId = req.params.id;

    if (!file) {
      throw new BadRequestException('File is required');
    }

    const user = req.user;
    if (!user?.googleAccessToken) {
      throw new UnauthorizedException('Google Drive authentication required');
    }

    return this.proofDocumentsService.replaceDocumentFile(
      documentId,
      file,
      user.googleAccessToken,
      user.googleRefreshToken,
    );
  }
}

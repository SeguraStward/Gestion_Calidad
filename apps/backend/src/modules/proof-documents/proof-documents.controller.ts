import { GenericController } from '@core/common/interfaces/generic.controller';
import {
  Controller,
  Logger,
  Post,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  UnauthorizedException,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload proof document to Google Drive with career associations' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        description: { type: 'string' },
        evidenceId: { type: 'string' },
        proofDocumentTypeId: { type: 'string' },
        careerIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['file', 'name', 'evidenceId', 'proofDocumentTypeId', 'careerIds'],
    },
  })
  async uploadProofDocument(
    @UploadedFile() file: any,
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('evidenceId') evidenceId: string,
    @Body('proofDocumentTypeId') proofDocumentTypeId: string,
    @Body('careerIds') careerIds: string | string[],
    @Req() request: Request,
  ) {
    this.logger.log('📤 Uploading proof document with Google Drive integration');

    // Validar usuario autenticado con Google
    const user = (request as any).user;
    if (!user?.googleAccessToken) {
      throw new UnauthorizedException(
        'User must be authenticated with Google Drive. Please log out and log in again with Google.',
      );
    }

    // Validar archivo
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Parsear careerIds si viene como string JSON
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

    // Validar que haya al menos una carrera
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
      file,
      uploadDto,
      user.googleAccessToken,
      user.googleRefreshToken,
    );
  }

  @Post(':id/careers')
  @ApiOperation({ summary: 'Update document careers' })
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

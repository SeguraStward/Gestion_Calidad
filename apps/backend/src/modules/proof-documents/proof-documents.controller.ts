import { GenericController } from '@core/common/interfaces/generic.controller';
import {
  Controller,
  Logger,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';

import { ProofDocumentDto } from './dtos/proof-document.dto';
import { CreateProofDocumentDto } from './dtos/create-proof-document.dto';
import { UpdateProofDocumentDto } from './dtos/update-proof-document.dto';
import { ProofDocumentsService } from './proof-documents.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
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
}

import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger, Get, Post, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { DocumentCounterDto } from './dtos/document-counter.dto';
import { CreateDocumentCounterDto } from './dtos/create-document-counter.dto';
import { UpdateDocumentCounterDto } from './dtos/update-document-counter.dto';
import { DocumentCountersService } from './document-counters.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { AuthorizedEndpoint } from '@src/core/common/decorators/authorized-endpoint.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';

@ResourceName('DOCUMENT_COUNTER')
@Controller('document-counters')
export class DocumentCountersController extends GenericController<DocumentCounterDto, CreateDocumentCounterDto, UpdateDocumentCounterDto> {
  protected readonly logger = new Logger(DocumentCountersController.name);
  protected readonly resourceName = 'DOCUMENT_COUNTER';

  constructor(private readonly documentCountersService: DocumentCountersService) {
    super(documentCountersService);
  }

  @Get('next-number/:typeId')
  @ApiOperation({ summary: 'Get next document number for type' })
  @ApiParam({ name: 'typeId', type: String })
  @ApiResponse({ status: 200, schema: { properties: { nextNumber: { type: 'number' }, code: { type: 'string' } } } })
  @AuthorizedEndpoint(PermissionType.READ)
  async getNextNumber(@Param('typeId') typeId: string) {
    return this.documentCountersService.getNextNumber(typeId);
  }

  @Post('increment/:typeId')
  @ApiOperation({ summary: 'Increment document counter for type' })
  @ApiParam({ name: 'typeId', type: String })
  @ApiResponse({ status: 200, schema: { properties: { newNumber: { type: 'number' }, code: { type: 'string' } } } })
  @AuthorizedEndpoint(PermissionType.CREATE)
  async incrementCounter(@Param('typeId') typeId: string) {
    return this.documentCountersService.incrementCounter(typeId);
  }
}

import {
  Controller,
  Get,
  Query,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SinaesDocumentHistoryService } from './sinaes-document-history.service';
import { DocumentHistoryFiltersDto } from './dtos/document-history-filters.dto';
import { ResourceName } from '../auth/decorators/resource-name.decorator';

@ApiTags('SINAES Document History')
@ResourceName('SINAES_DOCUMENT_HISTORY')
@Controller('sinaes-document-history')
export class SinaesDocumentHistoryController {
  private readonly logger = new Logger(SinaesDocumentHistoryController.name);

  constructor(
    private readonly historyService: SinaesDocumentHistoryService
  ) { }

  /**
   * Obtener historial de un documento específico
   */
  @Get('document/:documentId')
  @ApiOperation({ summary: 'Get history for a specific document' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getDocumentHistory(
    @Param('documentId') documentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number
  ) {
    this.logger.log(`📋 Getting history for document ${documentId}`);
    return this.historyService.getDocumentHistory(documentId, page, limit);
  }

  /**
   * Obtener actividad de un usuario
   */
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get activity for a specific user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number
  ) {
    this.logger.log(`👤 Getting activity for user ${userId}`);
    return this.historyService.getUserActivity(userId, page, limit);
  }

  /**
   * Obtener cambios recientes del sistema
   */
  @Get('recent')
  @ApiOperation({ summary: 'Get recent changes in the system' })
  async getRecentChanges(@Query() filters: DocumentHistoryFiltersDto) {
    this.logger.log('🕐 Getting recent changes');
    return this.historyService.getRecentChanges(filters);
  }

  /**
   * Obtener estadísticas de actividad
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get activity statistics' })
  @ApiQuery({ name: 'documentId', required: false, type: String })
  async getStatistics(@Query('documentId') documentId?: string) {
    this.logger.log('📊 Getting activity statistics');
    return this.historyService.getActivityStatistics(documentId);
  }
}

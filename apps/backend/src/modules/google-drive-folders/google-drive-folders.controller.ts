import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger, Get, Param, Query } from '@nestjs/common';

import { GoogleDriveFolderDto } from './dtos/google-drive-folder.dto';
import { CreateGoogleDriveFolderDto } from './dtos/create-google-drive-folder.dto';
import { UpdateGoogleDriveFolderDto } from './dtos/update-google-drive-folder.dto';
import { GoogleDriveFoldersService } from './google-drive-folders.service';

import { ResourceName } from '@src/modules/auth/decorators/resource-name.decorator';
import { AuthorizedEndpoint } from '@src/core/common/decorators/authorized-endpoint.decorator';
import { PermissionType } from '@una-gc/database/prisma/generated/client';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ResourceName('GOOGLE_DRIVE_FOLDER')
@Controller('google-drive-folders')
export class GoogleDriveFoldersController extends GenericController<GoogleDriveFolderDto, CreateGoogleDriveFolderDto, UpdateGoogleDriveFolderDto> {
  protected readonly logger = new Logger(GoogleDriveFoldersController.name);
  protected readonly resourceName = 'GOOGLE_DRIVE_FOLDER';

  constructor(private readonly googleDriveFoldersService: GoogleDriveFoldersService) {
    super(googleDriveFoldersService);
  }

  @Get('by-level/:level')
  @ApiOperation({ summary: 'Find folders by level' })
  @ApiParam({ name: 'level', type: 'number', description: 'Folder level' })
  @ApiResponse({ status: 200, description: 'Folders found', type: [GoogleDriveFolderDto] })
  @AuthorizedEndpoint(PermissionType.READ)
  async findByLevel(@Param('level') level: string): Promise<GoogleDriveFolderDto[]> {
    return this.googleDriveFoldersService.findByLevel(parseInt(level, 10));
  }

  @Get('by-entity-type')
  @ApiOperation({ summary: 'Find folders by entity type' })
  @ApiResponse({ status: 200, description: 'Folders found', type: [GoogleDriveFolderDto] })
  @AuthorizedEndpoint(PermissionType.READ)
  async findByEntityType(@Query('entityType') entityType: string): Promise<GoogleDriveFolderDto[]> {
    return this.googleDriveFoldersService.findByEntityType(entityType);
  }
}

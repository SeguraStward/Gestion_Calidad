import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { GoogleDriveFolderDto } from './dtos/google-drive-folder.dto';
import { CreateGoogleDriveFolderDto } from './dtos/create-google-drive-folder.dto';
import { UpdateGoogleDriveFolderDto } from './dtos/update-google-drive-folder.dto';
import { GoogleDriveFolder } from '@una-gc/database/prisma/generated/client';
import { GoogleDriveFoldersRepository } from './google-drive-folders.repository';

@Injectable()
export class GoogleDriveFoldersService extends GenericService<GoogleDriveFolder, GoogleDriveFolderDto, CreateGoogleDriveFolderDto, UpdateGoogleDriveFolderDto> {
  protected readonly logger = new Logger(GoogleDriveFoldersService.name);

  protected readonly relationCheckConfig = {
    relationFields: ['childFolders'],
    errorMessage: 'Cannot delete Google Drive Folder because it has child folders.',
  };

  constructor(
    protected readonly googleDriveFoldersRepository: GoogleDriveFoldersRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(googleDriveFoldersRepository, GoogleDriveFolderDto);
  }

  // Método específico para obtener carpetas por nivel
  async findByLevel(level: number): Promise<GoogleDriveFolderDto[]> {
    try {
      const folders = await this.googleDriveFoldersRepository.findByLevel(level);
      return folders.map(folder => folder as any); // Temporalmente usar casting directo
    } catch (error) {
      this.logger.error(`Error finding folders by level ${level}`, error);
      throw error;
    }
  }

  // Método específico para obtener carpetas por tipo de entidad
  async findByEntityType(entityType: string): Promise<GoogleDriveFolderDto[]> {
    try {
      const folders = await this.googleDriveFoldersRepository.findByEntityType(entityType);
      return folders.map(folder => folder as any); // Temporalmente usar casting directo
    } catch (error) {
      this.logger.error(`Error finding folders by entity type ${entityType}`, error);
      throw error;
    }
  }
}

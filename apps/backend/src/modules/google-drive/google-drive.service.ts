import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drive_v3 } from '@googleapis/drive';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@src/prisma/prisma.service';
import { GoogleDriveFoldersService } from '../google-drive-folders/google-drive-folders.service';
import { Readable } from 'stream';

export interface FolderStructure {
  dimensionCode: string;
  dimensionName: string;
  componentCode?: string;
  componentName?: string;
  criterionCode?: string;
  criterionName?: string;
  standardCode?: string;
  standardName?: string;
  evidenceCode: string;
  evidenceName: string;
  careerCode?: string;
  careerName?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  path: string;
  level: number;
  rootFolderId?: string;
}

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private readonly rootFolderName = 'SINAES - Gestión de Calidad';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly googleDriveFoldersService: GoogleDriveFoldersService,
  ) { }

  /**
   * Creates an OAuth2 client using the user's access token
   */
  private createDriveClient(accessToken: string, refreshToken?: string): drive_v3.Drive {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    const oauth2Client = new OAuth2Client(clientId, clientSecret);
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return new drive_v3.Drive({ auth: oauth2Client });
  }

  /**
   * Ensures the root folder "SINAES - Gestión de Calidad" exists
   * Returns the folder ID
   */
  private async ensureRootFolder(userDrive: drive_v3.Drive): Promise<string> {
    this.logger.log('Checking if root folder exists...');

    // Search for existing root folder
    const searchResponse = await userDrive.files.list({
      q: `name='${this.rootFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      const folderId = searchResponse.data.files[0]!.id!;
      this.logger.log(`Root folder already exists: ${folderId}`);
      return folderId;
    }

    // Create root folder if it doesn't exist
    this.logger.log('Creating root folder...');
    const createResponse = await userDrive.files.create({
      requestBody: {
        name: this.rootFolderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id, name',
    });

    const folderId = createResponse.data.id!;
    this.logger.log(`Root folder created: ${folderId}`);
    return folderId;
  }

  /**
   * Ensures a folder exists in Google Drive, creates it if not
   * Returns the folder ID
   */
  private async ensureFolderWithClient(
    userDrive: drive_v3.Drive,
    folderName: string,
    parentId: string,
  ): Promise<string> {
    this.logger.log(`Ensuring folder: ${folderName} in parent: ${parentId}`);

    // Search for existing folder
    const searchResponse = await userDrive.files.list({
      q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      const folderId = searchResponse.data.files[0]!.id!;
      this.logger.log(`Folder already exists: ${folderId}`);
      return folderId;
    }

    // Create folder if it doesn't exist
    this.logger.log(`Creating folder: ${folderName}`);
    const createResponse = await userDrive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id, name',
    });

    const folderId = createResponse.data.id!;
    this.logger.log(`Folder created: ${folderId}`);
    return folderId;
  }

  /**
   * Creates the complete folder structure for SINAES hierarchy
   * Structure: Root / Dimension / Component / Criterion / Standard (optional) / Evidence
   */
  async createFolderStructure(
    structure: FolderStructure,
    accessToken: string,
    refreshToken?: string,
  ): Promise<DriveFolder> {
    this.logger.log('🔵 Creating folder structure for SINAES hierarchy');
    this.logger.debug('Structure:', structure);

    try {
      const drive = this.createDriveClient(accessToken, refreshToken);

      // 1. Ensure root folder exists
      const rootFolderId = await this.ensureRootFolder(drive);
      let currentFolderId = rootFolderId;
      let currentPath = `/${this.rootFolderName}`;
      let level = 1;

      // 2. Create Dimension folder with full code prefix
      const dimensionFolderName = `${structure.dimensionCode} ${structure.dimensionName}`;
      currentFolderId = await this.ensureFolderWithClient(drive, dimensionFolderName, currentFolderId);
      currentPath += `/${dimensionFolderName}`;
      level++;

      // Save dimension folder metadata
      await this.saveFolderMetadata({
        name: dimensionFolderName,
        googleFolderId: currentFolderId,
        parentFolderId: null,
        level: 1,
        entityType: 'dimension',
        entityId: null, // Will be set by dimension service
        path: currentPath,
      });

      // 3. Create Component folder with full code prefix (if provided)
      if (structure.componentCode && structure.componentName) {
        const componentFolderName = `${structure.componentCode} ${structure.componentName}`;
        currentFolderId = await this.ensureFolderWithClient(drive, componentFolderName, currentFolderId);
        currentPath += `/${componentFolderName}`;
        level++;

        await this.saveFolderMetadata({
          name: componentFolderName,
          googleFolderId: currentFolderId,
          parentFolderId: null,
          level: 2,
          entityType: 'component',
          entityId: null,
          path: currentPath,
        });
      }

      // 4. Create Criterion folder with full code prefix (if provided)
      if (structure.criterionCode && structure.criterionName) {
        const criterionFolderName = `${structure.criterionCode} ${structure.criterionName}`;
        currentFolderId = await this.ensureFolderWithClient(drive, criterionFolderName, currentFolderId);
        currentPath += `/${criterionFolderName}`;
        level++;

        await this.saveFolderMetadata({
          name: criterionFolderName,
          googleFolderId: currentFolderId,
          parentFolderId: null,
          level: 3,
          entityType: 'criterion',
          entityId: null,
          path: currentPath,
        });
      }

      // 5. Create Standard folder with full code prefix (if provided - optional)
      if (structure.standardCode && structure.standardName) {
        const standardFolderName = `${structure.standardCode} ${structure.standardName}`;
        currentFolderId = await this.ensureFolderWithClient(drive, standardFolderName, currentFolderId);
        currentPath += `/${standardFolderName}`;
        level++;

        await this.saveFolderMetadata({
          name: standardFolderName,
          googleFolderId: currentFolderId,
          parentFolderId: null,
          level: 4,
          entityType: 'standard',
          entityId: null,
          path: currentPath,
        });
      }

      // 6. Create Evidence folder with full code prefix (always required)
      const evidenceFolderName = `${structure.evidenceCode} ${structure.evidenceName}`;
      currentFolderId = await this.ensureFolderWithClient(drive, evidenceFolderName, currentFolderId);
      currentPath += `/${evidenceFolderName}`;
      level++;

      await this.saveFolderMetadata({
        name: evidenceFolderName,
        googleFolderId: currentFolderId,
        parentFolderId: null,
        level: 5,
        entityType: 'evidence',
        entityId: null,
        path: currentPath,
      });

      this.logger.log(`✅ Folder structure created successfully: ${currentPath}`);

      return {
        id: currentFolderId,
        name: evidenceFolderName,
        path: currentPath,
        level,
        rootFolderId,
      };
    } catch (error: any) {
      this.logger.error('❌ Error creating folder structure:', error);
      if (error.message?.includes('invalid_grant') || error.message?.includes('Token')) {
        throw new UnauthorizedException(
          'Google Drive authentication expired. Please log out and log in again with Google.',
        );
      }
      throw new BadRequestException(`Error creating folder structure: ${error.message}`);
    }
  }

  /**
   * Saves folder metadata to database
   */
  private async saveFolderMetadata(data: {
    name: string;
    googleFolderId: string;
    parentFolderId: string | null;
    level: number;
    entityType: string;
    entityId: string | null;
    path: string;
  }) {
    try {
      // Check if folder already exists
      const existing = await this.prisma.googleDriveFolder.findUnique({
        where: { googleFolderId: data.googleFolderId },
      });

      if (!existing) {
        await this.googleDriveFoldersService.save({
          name: data.name,
          googleFolderId: data.googleFolderId,
          parentFolderId: data.parentFolderId,
          level: data.level,
          entityType: data.entityType,
          entityId: data.entityId,
          path: data.path,
        } as any);

        this.logger.log(`Folder metadata saved: ${data.name}`);
      }
    } catch (error: any) {
      this.logger.warn(`Could not save folder metadata: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Uploads a file to Google Drive
   * Also creates a _carreras.txt file with the list of careers
   */
  async uploadFile(
    file: any, // Multer file from upload
    folderId: string,
    careerNames: string[],
    accessToken: string,
    refreshToken?: string,
  ): Promise<DriveFile> {
    this.logger.log(`🔵 Uploading file to Google Drive: ${file.originalname}`);
    this.logger.log(`Folder ID: ${folderId}`);
    this.logger.log(`Careers: ${careerNames.join(', ')}`);

    try {
      const drive = this.createDriveClient(accessToken, refreshToken);

      // 1. Upload the main file
      const fileMetadata = {
        name: file.originalname,
        parents: [folderId],
      };

      const media = {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      };

      const uploadResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size, webViewLink',
      });

      const uploadedFile = uploadResponse.data;
      this.logger.log(`✅ File uploaded: ${uploadedFile.id}`);

      // 2. Make file publicly accessible (or set specific permissions)
      await drive.permissions.create({
        fileId: uploadedFile.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone', // Anyone with the link can view
        },
      });

      // 3. Create _carreras.txt file with career information
      if (careerNames.length > 0) {
        await this.createCarrerasFile(drive, folderId, file.originalname, careerNames);
      }

      return {
        id: uploadedFile.id!,
        name: uploadedFile.name!,
        url: uploadedFile.webViewLink || `https://drive.google.com/file/d/${uploadedFile.id}/view`,
        size: parseInt(uploadedFile.size || '0'),
        mimeType: uploadedFile.mimeType || file.mimetype,
      };
    } catch (error: any) {
      this.logger.error('❌ Error uploading file:', error);
      if (error.message?.includes('invalid_grant') || error.message?.includes('Token')) {
        throw new UnauthorizedException(
          'Google Drive authentication expired. Please log out and log in again with Google.',
        );
      }
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }
  }

  /**
   * Creates a _carreras.txt file in the same folder with the list of careers
   */
  private async createCarrerasFile(
    drive: drive_v3.Drive,
    folderId: string,
    documentName: string,
    careerNames: string[],
  ): Promise<void> {
    this.logger.log('Creating _carreras.txt file...');

    try {
      // Extract document code from filename (e.g., "CONV-001_convenio.pdf" -> "CONV-001")
      const documentCode = documentName.split('_')[0] || documentName.split('.')[0];
      const carrerasFileName = `${documentCode}_carreras.txt`;

      // Create content for the file
      const content = this.generateCarrerasFileContent(documentCode, careerNames);

      // Check if _carreras.txt already exists
      const existingFiles = await drive.files.list({
        q: `name='${carrerasFileName}' and '${folderId}' in parents and trashed=false`,
        fields: 'files(id)',
      });

      if (existingFiles.data.files && existingFiles.data.files.length > 0) {
        // Update existing file
        const fileId = existingFiles.data.files[0]!.id!;
        this.logger.log(`Updating existing _carreras.txt file: ${fileId}`);

        await drive.files.update({
          fileId: fileId,
          media: {
            mimeType: 'text/plain',
            body: Readable.from([content]),
          },
        });
      } else {
        // Create new file
        this.logger.log('Creating new _carreras.txt file');

        const fileMetadata = {
          name: carrerasFileName,
          parents: [folderId],
          mimeType: 'text/plain',
        };

        await drive.files.create({
          requestBody: fileMetadata,
          media: {
            mimeType: 'text/plain',
            body: Readable.from([content]),
          },
          fields: 'id, name',
        });
      }

      this.logger.log(`✅ _carreras.txt file created/updated successfully`);
    } catch (error) {
      this.logger.error('Error creating _carreras.txt file:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Generates the content for the _carreras.txt file
   */
  private generateCarrerasFileContent(documentCode: string, careerNames: string[]): string {
    const currentDate = new Date().toISOString().split('T')[0];

    return `
=================================================================
  DOCUMENTO PROBATORIO: ${documentCode}
  CARRERAS ASOCIADAS
=================================================================

Fecha de última actualización: ${currentDate}
Total de carreras: ${careerNames.length}

-----------------------------------------------------------------
CARRERAS:
-----------------------------------------------------------------

${careerNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}

-----------------------------------------------------------------

Este documento probatorio es utilizado por las carreras listadas
arriba como evidencia para el proceso de acreditación SINAES.

Generado automáticamente por el Sistema de Gestión de Calidad - UNA
=================================================================
`.trim();
  }

  /**
   * Deletes a file from Google Drive
   */
  async deleteFile(fileId: string, accessToken: string, refreshToken?: string): Promise<void> {
    this.logger.log(`🗑️ Deleting file from Google Drive: ${fileId}`);

    try {
      const drive = this.createDriveClient(accessToken, refreshToken);
      await drive.files.delete({ fileId });
      this.logger.log(`✅ File deleted: ${fileId}`);
    } catch (error: any) {
      this.logger.error('❌ Error deleting file:', error);
      throw new BadRequestException(`Error deleting file: ${error.message}`);
    }
  }

  /**
   * Gets all files in a folder
   */
  async getFolderFiles(folderId: string, accessToken: string, refreshToken?: string): Promise<DriveFile[]> {
    this.logger.log(`📂 Getting files from folder: ${folderId}`);

    try {
      const drive = this.createDriveClient(accessToken, refreshToken);

      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, mimeType, size, webViewLink)',
      });

      const files = response.data.files || [];

      return files.map((file) => ({
        id: file.id!,
        name: file.name!,
        url: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        size: parseInt(file.size || '0'),
        mimeType: file.mimeType || 'application/octet-stream',
      }));
    } catch (error: any) {
      this.logger.error('❌ Error getting folder files:', error);
      throw new BadRequestException(`Error getting folder files: ${error.message}`);
    }
  }

  /**
   * Gets the public URL of a file
   */
  async getPublicUrl(fileId: string): Promise<string> {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
}

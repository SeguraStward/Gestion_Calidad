import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drive_v3 } from '@googleapis/drive';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@src/prisma/prisma.service';
import { GoogleDriveFoldersService } from '../google-drive-folders/google-drive-folders.service';
import { CreateGoogleDriveFolderDto } from '../google-drive-folders/dtos/create-google-drive-folder.dto';
import { Readable } from 'stream';

const AUTH_ERROR_CODES = new Set([401, 403]);
const AUTH_ERROR_REASONS = new Set([
  'invalid_grant',
  'authError',
  'unauthorized',
  'invalidCredentials',
]);

function isGoogleAuthError(error: any): boolean {
  if (!error) return false;
  if (AUTH_ERROR_CODES.has(error.code) || AUTH_ERROR_CODES.has(error.status)) return true;
  if (AUTH_ERROR_CODES.has(error.response?.status)) return true;
  const reason = error.errors?.[0]?.reason || error.response?.data?.error;
  if (reason && AUTH_ERROR_REASONS.has(reason)) return true;
  return false;
}

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
  /**
   * When provided, an additional folder named after the document type is
   * created inside the evidence folder (e.g. "Convenio/", "Acta/"). All
   * uploads of that type for the evidence live under that type folder.
   */
  documentTypeName?: string;
  /**
   * When provided (together with documentTypeName), a per-upload folder
   * named after the document code is created (e.g. "CONV-001/"). Each
   * upload owns its files and its `_carreras.txt`.
   */
  documentCode?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  /** Present when the main file uploaded but the metadata file (_carreras.txt) failed. */
  carrerasFileWarning?: string;
}

export interface DriveFolder {
  /** The deepest folder created — points to the upload folder when documentCode is provided, else the evidence folder. */
  id: string;
  name: string;
  path: string;
  level: number;
  rootFolderId?: string;
  /** Always set: folder ID for the SINAES evidence (parent of any type folders). */
  evidenceFolderId?: string;
  /** Set when documentTypeName was provided. */
  typeFolderId?: string;
  /** Set when documentCode was provided (this is the leaf where files land). */
  uploadFolderId?: string;
}

/** Drive forbids these chars in folder/file names; replace with a hyphen. */
function sanitizeForDrive(name: string): string {
  return name.replace(/[\\/]/g, '-').trim();
}

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private readonly rootFolderName = 'SINAES - Gestión de Calidad';

  /**
   * In-process mutex keyed by `${parentId}::${folderName}`. Two concurrent
   * uploads asking for the same folder share a single in-flight Promise so
   * we never `list → not found → create` twice and end up with duplicate
   * folders in Drive. Cleared as soon as the operation resolves.
   *
   * Caveat: only protects against concurrency within this Node process.
   * Multi-instance deployments would need a Redis-based lock.
   */
  private readonly folderLocks = new Map<string, Promise<string>>();

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly googleDriveFoldersService: GoogleDriveFoldersService,
  ) { }

  /**
   * Creates an OAuth2 client using the user's access token.
   * Public so other services (e.g. DriveSyncCheckerService) can reuse it
   * without resorting to private-member access via brackets.
   */
  createDriveClient(accessToken: string, refreshToken?: string): drive_v3.Drive {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    const oauth2Client = new OAuth2Client(clientId, clientSecret);
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // googleapis automatically refreshes the access token when it expires
    // as long as a refresh_token is present; log it so downstream consumers
    // could persist the new token if needed.
    oauth2Client.on('tokens', (tokens) => {
      if (tokens.access_token) {
        this.logger.debug('OAuth2 access token refreshed by googleapis');
      }
    });

    return new drive_v3.Drive({ auth: oauth2Client });
  }

  /**
   * Standard error handler for Google Drive API failures.
   */
  private handleDriveError(error: any, context: string): never {
    if (isGoogleAuthError(error)) {
      this.logger.warn(`Google auth error during ${context}: ${error.message}`);
      throw new UnauthorizedException(
        'Google Drive authentication expired. Please log out and log in again with Google.',
      );
    }
    this.logger.error(`Error during ${context}:`, error);
    throw new BadRequestException(`Error during ${context}: ${error.message}`);
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
   * Ensures a folder exists in Google Drive, creates it if not.
   * Guarded by an in-process mutex so concurrent callers asking for the same
   * (parentId, folderName) share a single Drive API round-trip.
   */
  private async ensureFolderWithClient(
    userDrive: drive_v3.Drive,
    folderName: string,
    parentId: string,
  ): Promise<string> {
    const cleanName = sanitizeForDrive(folderName);
    const lockKey = `${parentId}::${cleanName}`;
    const inFlight = this.folderLocks.get(lockKey);
    if (inFlight) {
      this.logger.debug(`Reusing in-flight ensureFolder for ${lockKey}`);
      return inFlight;
    }

    const job = (async () => {
      this.logger.log(`Ensuring folder: ${cleanName} in parent: ${parentId}`);

      // Escape single quotes inside folder names for the Drive q-syntax.
      const escapedName = cleanName.replace(/'/g, "\\'");
      const searchResponse = await userDrive.files.list({
        q: `name='${escapedName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (searchResponse.data.files && searchResponse.data.files.length > 0) {
        const folderId = searchResponse.data.files[0]!.id!;
        this.logger.log(`Folder already exists: ${folderId}`);
        return folderId;
      }

      this.logger.log(`Creating folder: ${cleanName}`);
      const createResponse = await userDrive.files.create({
        requestBody: {
          name: cleanName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        },
        fields: 'id, name',
      });

      const folderId = createResponse.data.id!;
      this.logger.log(`Folder created: ${folderId}`);
      return folderId;
    })();

    this.folderLocks.set(lockKey, job);
    try {
      return await job;
    } finally {
      this.folderLocks.delete(lockKey);
    }
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

    try {
      const drive = this.createDriveClient(accessToken, refreshToken);

      // 1. Ensure root folder exists
      const rootFolderId = await this.ensureRootFolder(drive);
      let currentFolderId = rootFolderId;
      let currentPath = `/${this.rootFolderName}`;
      let level = 1;

      // Tracks the DB id of the previously-saved folder so each level
      // can reference it via parentFolderId (mirrors the Drive tree).
      let parentDbFolderId: string | null = null;

      const persist = async (
        name: string,
        levelNumber: number,
        entityType: string,
      ) => {
        const saved = await this.saveFolderMetadata({
          name,
          googleFolderId: currentFolderId,
          parentFolderId: parentDbFolderId,
          level: levelNumber,
          entityType,
          entityId: null,
          path: currentPath,
        });
        if (saved?.id) {
          parentDbFolderId = saved.id;
        }
      };

      // 2. Dimension
      const dimensionFolderName = `${structure.dimensionCode} ${structure.dimensionName}`;
      currentFolderId = await this.ensureFolderWithClient(drive, dimensionFolderName, currentFolderId);
      currentPath += `/${dimensionFolderName}`;
      await persist(dimensionFolderName, 1, 'dimension');
      level++;

      // 3. Component
      if (structure.componentCode && structure.componentName) {
        const componentFolderName = `${structure.componentCode} ${structure.componentName}`;
        currentFolderId = await this.ensureFolderWithClient(drive, componentFolderName, currentFolderId);
        currentPath += `/${componentFolderName}`;
        await persist(componentFolderName, 2, 'component');
        level++;
      }

      // 4. Criterion
      if (structure.criterionCode && structure.criterionName) {
        const criterionFolderName = `${structure.criterionCode} ${structure.criterionName}`;
        currentFolderId = await this.ensureFolderWithClient(drive, criterionFolderName, currentFolderId);
        currentPath += `/${criterionFolderName}`;
        await persist(criterionFolderName, 3, 'criterion');
        level++;
      }

      // 5. Standard (optional)
      if (structure.standardCode && structure.standardName) {
        const standardFolderName = `${structure.standardCode} ${structure.standardName}`;
        currentFolderId = await this.ensureFolderWithClient(drive, standardFolderName, currentFolderId);
        currentPath += `/${standardFolderName}`;
        await persist(standardFolderName, 4, 'standard');
        level++;
      }

      // 6. Evidence (always required)
      const evidenceFolderName = `${structure.evidenceCode} ${structure.evidenceName}`;
      currentFolderId = await this.ensureFolderWithClient(drive, evidenceFolderName, currentFolderId);
      currentPath += `/${evidenceFolderName}`;
      await persist(evidenceFolderName, 5, 'evidence');
      const evidenceFolderId = currentFolderId;
      level++;

      let typeFolderId: string | undefined;
      let uploadFolderId: string | undefined;
      let leafName = evidenceFolderName;

      // 7. Document type folder (e.g. "Convenio/") — only when caller asks
      //    for it. Old upload callers that don't pass documentTypeName keep
      //    landing on the evidence folder, so legacy data stays compatible.
      if (structure.documentTypeName) {
        const typeName = structure.documentTypeName;
        currentFolderId = await this.ensureFolderWithClient(drive, typeName, currentFolderId);
        currentPath += `/${typeName}`;
        await persist(typeName, 6, 'documentType');
        typeFolderId = currentFolderId;
        leafName = typeName;
        level++;

        // 8. Per-upload folder (e.g. "CONV-001/") — also opt-in.
        if (structure.documentCode) {
          const codeName = structure.documentCode;
          currentFolderId = await this.ensureFolderWithClient(drive, codeName, currentFolderId);
          currentPath += `/${codeName}`;
          await persist(codeName, 7, 'upload');
          uploadFolderId = currentFolderId;
          leafName = codeName;
          level++;
        }
      }

      this.logger.log(`✅ Folder structure created successfully: ${currentPath}`);

      return {
        id: currentFolderId,
        name: leafName,
        path: currentPath,
        level,
        rootFolderId,
        evidenceFolderId,
        typeFolderId,
        uploadFolderId,
      };
    } catch (error: any) {
      this.handleDriveError(error, 'createFolderStructure');
    }
  }

  /**
   * Saves folder metadata to database (idempotent by googleFolderId).
   * Returns the existing or newly-saved record so callers can chain parentFolderId.
   */
  private async saveFolderMetadata(data: {
    name: string;
    googleFolderId: string;
    parentFolderId: string | null;
    level: number;
    entityType: string;
    entityId: string | null;
    path: string;
  }): Promise<{ id: string } | null> {
    try {
      const existing = await this.prisma.googleDriveFolder.findUnique({
        where: { googleFolderId: data.googleFolderId },
        select: { id: true },
      });

      if (existing) {
        return existing;
      }

      const payload: CreateGoogleDriveFolderDto = {
        name: data.name,
        googleFolderId: data.googleFolderId,
        level: data.level,
        entityType: data.entityType,
        path: data.path,
        ...(data.parentFolderId ? { parentFolderId: data.parentFolderId } : {}),
        ...(data.entityId ? { entityId: data.entityId } : {}),
      };

      const saved = await this.googleDriveFoldersService.save(payload);
      this.logger.log(`Folder metadata saved: ${data.name}`);
      return saved ? { id: (saved as any).id } : null;
    } catch (error: any) {
      this.logger.warn(`Could not save folder metadata for ${data.name}: ${error?.message || 'Unknown error'}`);
      return null;
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

      // 1. Check if file already exists in the folder
      this.logger.log('🔍 Checking for duplicate files in folder...');
      const existingFiles = await drive.files.list({
        q: `name='${file.originalname}' and '${folderId}' in parents and trashed=false`,
        fields: 'files(id, name, webViewLink, size, mimeType)',
        spaces: 'drive',
      });

      if (existingFiles.data.files && existingFiles.data.files.length > 0) {
        const existingFile = existingFiles.data.files[0]!;
        this.logger.warn(`⚠️ File already exists in folder: ${existingFile.name} (ID: ${existingFile.id})`);
        throw new BadRequestException(
          `El archivo "${file.originalname}" ya existe en esta carpeta de Google Drive. ` +
          `Por favor, elimina el archivo existente primero o usa la función de reemplazar archivo.`
        );
      }

      this.logger.log('✅ No duplicate found, proceeding with upload...');

      // 2. Upload the main file
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

      // 3. Make file publicly accessible (or set specific permissions)
      await drive.permissions.create({
        fileId: uploadedFile.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone', // Anyone with the link can view
        },
      });

      // 4. Create _carreras.txt file. The main upload already succeeded, so we
      //    do not want a metadata-file failure to roll back the file upload.
      //    The caller can re-trigger updateCarrerasFile() if needed.
      let carrerasFileWarning: string | undefined;
      if (careerNames.length > 0) {
        try {
          await this.createCarrerasFile(drive, folderId, file.originalname, careerNames);
        } catch (err: any) {
          carrerasFileWarning = err?.message || 'Unknown error creating _carreras.txt';
          this.logger.error(
            `CARRERAS_FILE_WARNING: file uploaded (${uploadedFile.id}) but _carreras.txt failed: ${carrerasFileWarning}`,
          );
        }
      }

      return {
        id: uploadedFile.id!,
        name: uploadedFile.name!,
        url: uploadedFile.webViewLink || `https://drive.google.com/file/d/${uploadedFile.id}/view`,
        size: parseInt(uploadedFile.size || '0'),
        mimeType: uploadedFile.mimeType || file.mimetype,
        ...(carrerasFileWarning ? { carrerasFileWarning } : {}),
      };
    } catch (error: any) {
      // BadRequestException for duplicates is already specific — keep it.
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.handleDriveError(error, 'uploadFile');
    }
  }

  /**
   * Creates a _carreras.txt file in the same folder with the list of careers.
   * The lookup is scoped to the parent folder to avoid collisions with files
   * of the same name in other folders.
   *
   * Failures are logged with a CARRERAS_FILE_WARNING tag and rethrown so the
   * caller can decide whether to surface a partial-success to the user.
   */
  private async createCarrerasFile(
    drive: drive_v3.Drive,
    folderId: string,
    documentName: string,
    careerNames: string[],
  ): Promise<void> {
    const documentCode = documentName.split('_')[0] || documentName.split('.')[0] || documentName;
    const carrerasFileName = `${documentCode}_carreras.txt`;
    const content = this.generateCarrerasFileContent(documentCode, careerNames);

    // Lookup scoped to the parent folder.
    const existingFiles = await drive.files.list({
      q: `name='${carrerasFileName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, parents)',
      spaces: 'drive',
    });

    const matching = (existingFiles.data.files || []).filter((f) =>
      (f.parents || []).includes(folderId),
    );

    if (matching.length > 0) {
      const fileId = matching[0]!.id!;
      this.logger.log(`Updating existing _carreras.txt (${fileId}) in folder ${folderId}`);
      await drive.files.update({
        fileId,
        media: { mimeType: 'text/plain', body: Readable.from([content]) },
      });
      return;
    }

    this.logger.log(`Creating new _carreras.txt in folder ${folderId}`);
    await drive.files.create({
      requestBody: {
        name: carrerasFileName,
        parents: [folderId],
        mimeType: 'text/plain',
      },
      media: { mimeType: 'text/plain', body: Readable.from([content]) },
      fields: 'id, name',
    });
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
      this.handleDriveError(error, 'deleteFile');
    }
  }

  /**
   * Updates the _carreras.txt file for a specific document.
   * Used by legacy/replace flows that already know the careers and folder.
   * Prefer `regenerateCarrerasFileFromDb` for new code so the DB is the
   * single source of truth.
   */
  async updateCarrerasFile(
    folderId: string,
    documentCode: string,
    careerNames: string[],
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    this.logger.log(`📝 Updating _carreras.txt file for document: ${documentCode}`);

    try {
      const drive = this.createDriveClient(accessToken, refreshToken);
      await this.createCarrerasFile(drive, folderId, documentCode, careerNames);
      this.logger.log('✅ _carreras.txt file updated successfully');
    } catch (error: any) {
      this.handleDriveError(error, 'updateCarrerasFile');
    }
  }

  /**
   * Regenerates `_carreras.txt` for a proof document using the DB as the
   * source of truth. The file is written inside the upload folder
   * (preferred) or, for legacy documents that don't have one, inside the
   * evidence folder.
   *
   * This is the canonical way to refresh the file after careers change:
   * never trust whatever happens to be in Drive — always rebuild from DB.
   */
  async regenerateCarrerasFileFromDb(
    proofDocumentId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    const document = await this.prisma.proofDocument.findUnique({
      where: { id: proofDocumentId },
      select: {
        code: true,
        googleDriveFolderId: true,
        googleDriveUploadFolderId: true,
        careerProofDocuments: {
          select: { career: { select: { name: true } } },
        },
      },
    });

    if (!document) {
      this.logger.warn(`regenerateCarrerasFileFromDb: document ${proofDocumentId} not found`);
      return;
    }

    const folderId = document.googleDriveUploadFolderId || document.googleDriveFolderId;
    if (!folderId) {
      this.logger.warn(
        `regenerateCarrerasFileFromDb: document ${document.code} has no Drive folder ID`,
      );
      return;
    }

    const careerNames = document.careerProofDocuments
      .map((rel) => rel.career?.name)
      .filter((n): n is string => !!n);

    this.logger.log(
      `📝 Regenerating _carreras.txt for ${document.code} with ${careerNames.length} careers (folder: ${folderId})`,
    );

    try {
      const drive = this.createDriveClient(accessToken, refreshToken);
      await this.createCarrerasFile(drive, folderId, document.code, careerNames);
    } catch (error: any) {
      this.handleDriveError(error, 'regenerateCarrerasFileFromDb');
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
      this.handleDriveError(error, 'getFolderFiles');
    }
  }

  /**
   * Gets the public URL of a file
   */
  async getPublicUrl(fileId: string): Promise<string> {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
}

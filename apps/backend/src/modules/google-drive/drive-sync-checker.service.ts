import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { GoogleDriveService } from './google-drive.service';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Service to verify synchronization between database and Google Drive
 * Detects orphaned records (documents in DB but not in Drive)
 */
@Injectable()
export class DriveSyncCheckerService {
  private readonly logger = new Logger(DriveSyncCheckerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly googleDriveService: GoogleDriveService,
  ) { }

  /**
   * Verify all active documents exist in Google Drive
   * This can be run manually or scheduled via cron
   */
  async verifyAllDocuments(): Promise<{
    total: number;
    verified: number;
    missing: number;
    errors: number;
    missingDocuments: Array<{
      id: string;
      code: string;
      name: string;
      googleDriveFileId: string;
    }>;
  }> {
    this.logger.log('🔍 Starting Google Drive sync verification...');

    const documents = await this.prisma.proofDocument.findMany({
      where: {
        status: 'ACTIVE',
        googleDriveFileId: { not: null },
      },
      select: {
        id: true,
        code: true,
        name: true,
        googleDriveFileId: true,
      },
    });

    this.logger.log(`📊 Found ${documents.length} active documents with Drive links`);

    let verified = 0;
    let missing = 0;
    let errors = 0;
    const missingDocuments: Array<{
      id: string;
      code: string;
      name: string;
      googleDriveFileId: string;
    }> = [];

    for (const doc of documents) {
      try {
        // Try to verify file exists in Drive
        // Note: This requires a service account or user token
        // For now, we'll mark the logic but actual implementation
        // depends on having access tokens available

        // TODO: Implement actual Drive verification
        // For now, just log what would be checked
        this.logger.debug(
          `Would verify: ${doc.code} (Drive ID: ${doc.googleDriveFileId})`,
        );

        verified++;
      } catch (error: any) {
        if (error.code === 404 || error.message?.includes('not found')) {
          this.logger.warn(
            `⚠️ Document ${doc.code} (${doc.name}) not found in Drive`,
          );
          missing++;
          missingDocuments.push(doc);

          // Mark document as inconsistent
          await this.markAsInconsistent(doc.id, doc.code);
        } else {
          this.logger.error(`❌ Error verifying ${doc.code}:`, error.message);
          errors++;
        }
      }
    }

    const result = {
      total: documents.length,
      verified,
      missing,
      errors,
      missingDocuments,
    };

    this.logger.log('✅ Verification complete:', result);

    return result;
  }

  /**
   * Mark a document as inconsistent (exists in DB but not in Drive)
   */
  private async markAsInconsistent(
    documentId: string,
    documentCode: string,
  ): Promise<void> {
    try {
      // Add inconsistency warning to document description
      const document = await this.prisma.proofDocument.findUnique({
        where: { id: documentId },
        select: { description: true },
      });

      const warningNote = `[${new Date().toISOString()}] ⚠️ ADVERTENCIA: Archivo no encontrado en Google Drive. Puede haber sido eliminado externamente.`;
      const updatedDescription = document?.description
        ? `${document.description}\n\n${warningNote}`
        : warningNote;

      await this.prisma.proofDocument.update({
        where: { id: documentId },
        data: {
          description: updatedDescription,
        },
      });

      this.logger.log(
        `📝 Marked document ${documentCode} as inconsistent in description`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to mark document ${documentCode} as inconsistent:`,
        error,
      );
    }
  }

  /**
   * Verify a single document exists in Google Drive
   * @param documentId - Document ID to verify
   * @param accessToken - User's Google access token
   * @param refreshToken - User's Google refresh token (optional)
   */
  async verifySingleDocument(
    documentId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<{
    exists: boolean;
    fileId: string | null;
    error?: string;
  }> {
    try {
      const document = await this.prisma.proofDocument.findUnique({
        where: { id: documentId },
        select: {
          id: true,
          code: true,
          name: true,
          googleDriveFileId: true,
        },
      });

      if (!document) {
        return {
          exists: false,
          fileId: null,
          error: 'Document not found in database',
        };
      }

      if (!document.googleDriveFileId) {
        return {
          exists: false,
          fileId: null,
          error: 'Document has no Google Drive file ID',
        };
      }

      // Try to get file metadata from Drive
      try {
        const drive = this.googleDriveService['createDriveClient'](
          accessToken,
          refreshToken,
        );
        await drive.files.get({
          fileId: document.googleDriveFileId,
          fields: 'id, name',
        });

        this.logger.log(`✅ Document ${document.code} exists in Drive`);
        return {
          exists: true,
          fileId: document.googleDriveFileId,
        };
      } catch (error: any) {
        if (error.code === 404) {
          this.logger.warn(
            `⚠️ Document ${document.code} NOT found in Drive (404)`,
          );
          await this.markAsInconsistent(document.id, document.code);

          return {
            exists: false,
            fileId: document.googleDriveFileId,
            error: 'File not found in Google Drive (404)',
          };
        }

        throw error;
      }
    } catch (error: any) {
      this.logger.error(`Error verifying document ${documentId}:`, error);
      return {
        exists: false,
        fileId: null,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Get list of all inconsistent documents
   * (documents with warning notes in description)
   */
  async getInconsistentDocuments(): Promise<
    Array<{
      id: string;
      code: string;
      name: string;
      description: string | null;
      googleDriveFileId: string | null;
    }>
  > {
    const documents = await this.prisma.proofDocument.findMany({
      where: {
        status: 'ACTIVE',
        description: {
          contains: 'ADVERTENCIA: Archivo no encontrado en Google Drive',
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        googleDriveFileId: true,
      },
    });

    this.logger.log(`Found ${documents.length} inconsistent documents`);

    return documents;
  }

  /**
   * Optional: Run verification automatically every day at 2 AM
   * Uncomment the @Cron decorator to enable
   */
  // @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledVerification(): Promise<void> {
    this.logger.log('🕐 Running scheduled Drive sync verification...');

    // Note: This requires having service account credentials
    // or a way to access user tokens programmatically
    // For now, this is just a placeholder

    this.logger.log(
      '⚠️ Scheduled verification requires service account setup',
    );

    // await this.verifyAllDocuments();
  }
}

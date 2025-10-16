import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleDriveService } from './google-drive.service';
import { GoogleDriveController } from './google-drive.controller';
import { GoogleDriveFoldersModule } from '../google-drive-folders/google-drive-folders.module';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [ConfigModule, GoogleDriveFoldersModule, PrismaModule],
  controllers: [GoogleDriveController],
  providers: [GoogleDriveService],
  exports: [GoogleDriveService],
})
export class GoogleDriveModule { }

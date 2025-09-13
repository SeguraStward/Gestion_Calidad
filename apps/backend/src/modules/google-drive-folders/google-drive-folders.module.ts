import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { GoogleDriveFoldersService } from './google-drive-folders.service';
import { GoogleDriveFoldersController } from './google-drive-folders.controller';
import { GoogleDriveFoldersRepository } from './google-drive-folders.repository';

@Module({
  imports: [PrismaModule],
  controllers: [GoogleDriveFoldersController],
  providers: [GoogleDriveFoldersService, GoogleDriveFoldersRepository, DtoValidator],
  exports: [GoogleDriveFoldersService, GoogleDriveFoldersRepository],
})
export class GoogleDriveFoldersModule { }

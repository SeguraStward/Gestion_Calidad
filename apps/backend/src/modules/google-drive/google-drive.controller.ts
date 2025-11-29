import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { FolderStructure } from './google-drive.service';
import { GoogleDriveService } from './google-drive.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('Google Drive')
@Controller('google-drive')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) { }

  @Post('create-structure')
  @ApiOperation({ summary: 'Create folder structure for SINAES hierarchy' })
  async createFolderStructure(@Body() structure: FolderStructure, @Req() request: Request) {
    const user = (request as any).user;

    if (!user?.googleAccessToken) {
      throw new UnauthorizedException(
        'User must be authenticated with Google Drive. Please log out and log in again with Google.',
      );
    }

    return this.googleDriveService.createFolderStructure(
      structure,
      user.googleAccessToken,
      user.googleRefreshToken,
    );
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folderId: { type: 'string' },
        careerNames: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: any,
    @Body('folderId') folderId: string,
    @Body('careerNames') careerNames: string[],
    @Req() request: Request,
  ): Promise<any> {
    const user = (request as any).user;

    if (!user?.googleAccessToken) {
      throw new UnauthorizedException(
        'User must be authenticated with Google Drive. Please log out and log in again with Google.',
      );
    }

    return this.googleDriveService.uploadFile(
      file,
      folderId,
      careerNames || [],
      user.googleAccessToken,
      user.googleRefreshToken,
    );
  }

  @Delete('files/:fileId')
  async deleteFile(@Param('fileId') fileId: string, @Req() request: Request) {
    const user = (request as any).user;

    if (!user?.googleAccessToken) {
      throw new UnauthorizedException(
        'User must be authenticated with Google Drive. Please log out and log in again with Google.',
      );
    }

    return this.googleDriveService.deleteFile(fileId, user.googleAccessToken, user.googleRefreshToken);
  }

  @Get('folders/:folderId/files')
  async getFolderFiles(@Param('folderId') folderId: string, @Req() request: Request) {
    const user = (request as any).user;

    if (!user?.googleAccessToken) {
      throw new UnauthorizedException(
        'User must be authenticated with Google Drive. Please log out and log in again with Google.',
      );
    }

    return this.googleDriveService.getFolderFiles(folderId, user.googleAccessToken, user.googleRefreshToken);
  }

  @Get('files/:fileId/public-url')
  async getPublicUrl(@Param('fileId') fileId: string) {
    return { url: await this.googleDriveService.getPublicUrl(fileId) };
  }
}
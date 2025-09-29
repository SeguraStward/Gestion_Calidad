import { Controller, Post, Body, UploadedFile, UseInterceptors, Get, Param, Delete } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger'
import { GoogleDriveService } from './google-drive.service'

export interface CreateFolderStructureDto {
  dimensionId: string
  componentId?: string
  criterionId?: string
  standardId?: string
  evidenceId?: string
  careerCode: string
}

@ApiTags('Google Drive')
@Controller('google-drive')
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) { }

  @Post('create-structure')
  @ApiOperation({ summary: 'Create folder structure for SINAES hierarchy' })
  async createFolderStructure(@Body() dto: CreateFolderStructureDto) {
    return this.googleDriveService.createFolderStructure(dto)
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folderId: { type: 'string' }
      }
    }
  })
  async uploadFile(
    @UploadedFile() file: any,
    @Body('folderId') folderId: string
  ): Promise<any> {
    return this.googleDriveService.uploadFile(file, folderId)
  }

  @Delete('files/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    return this.googleDriveService.deleteFile(fileId)
  }

  @Get('folders/:folderId/files')
  async getFolderFiles(@Param('folderId') folderId: string) {
    return this.googleDriveService.getFolderFiles(folderId)
  }

  @Get('files/:fileId/public-url')
  async getPublicUrl(@Param('fileId') fileId: string) {
    return { url: await this.googleDriveService.getPublicUrl(fileId) }
  }
}
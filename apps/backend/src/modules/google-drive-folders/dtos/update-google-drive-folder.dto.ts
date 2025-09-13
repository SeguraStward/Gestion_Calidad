import { PartialType } from '@nestjs/swagger';
import { CreateGoogleDriveFolderDto } from './create-google-drive-folder.dto';

export class UpdateGoogleDriveFolderDto extends PartialType(CreateGoogleDriveFolderDto) { }

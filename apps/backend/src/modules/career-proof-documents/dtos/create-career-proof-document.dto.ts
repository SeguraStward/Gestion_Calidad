import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

export class CreateCareerProofDocumentDto {
  @ApiProperty({ description: 'Career ID' })
  @IsString()
  @IsNotEmpty()
  careerId: string;

  @ApiProperty({ description: 'Proof Document ID' })
  @IsString()
  @IsNotEmpty()
  proofDocumentId: string;

  @ApiProperty({ enum: Status, description: 'Career Proof Document status', default: Status.ACTIVE })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}

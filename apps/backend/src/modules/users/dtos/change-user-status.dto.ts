import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@una-gc/database/prisma/generated/client';
import { IsEnum } from 'class-validator';

export class ChangeUserStatusDto {
  @ApiProperty({
    description: 'New status for the user',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus, { message: 'Status must be a valid UserStatus enum value' })
  status: UserStatus;
}

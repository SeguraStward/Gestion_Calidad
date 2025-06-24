import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class SetActiveRoleDto {
  @ApiProperty({
    description: 'The ID of the role to set as active',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  roleId: string;
}

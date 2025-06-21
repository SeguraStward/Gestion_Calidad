import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class SelectRoleDto {
  @ApiProperty({
    description: 'ID of the role to select as active',
    example: '60568b084988222a703272d1',
  })
  @IsString()
  @IsNotEmpty()
  @IsMongoId({ message: 'Role ID must be a valid MongoDB ObjectId' })
  roleId: string;
}

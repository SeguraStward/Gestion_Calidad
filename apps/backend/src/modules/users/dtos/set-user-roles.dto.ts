import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class SetUserRolesDto {
  @ApiProperty({
    description: 'Array of role IDs to assign to the user',
    type: [String],
    example: ['role-id-1', 'role-id-2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  roleIds: string[];
}

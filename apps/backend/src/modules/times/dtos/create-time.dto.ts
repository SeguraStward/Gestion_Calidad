import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTimeDto {
  @IsString()
  campus: string;

  @IsString()
  mesh: string;

  @IsString()
  cycle: string;

  @IsNumber()
  allocatedTime: number;

  @IsOptional()
  @IsNumber()
  additionalTime?: number;
}

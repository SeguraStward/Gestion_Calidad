import { IsBoolean, IsNumber, IsOptional, IsInt } from 'class-validator';

export class CreateJourneyTimeConfigDto {
  @IsInt()
  effectiveYear: number;

  @IsNumber()
  quarterTimeMinHours: number;

  @IsNumber()
  quarterTimeMaxHours: number;

  @IsNumber()
  halfTimeMinHours: number;

  @IsNumber()
  halfTimeMaxHours: number;

  @IsNumber()
  threeQuarterMinHours: number;

  @IsNumber()
  threeQuarterMaxHours: number;

  @IsNumber()
  fullTimeMinHours: number;

  @IsNumber()
  quarterTimeValue: number;

  @IsNumber()
  halfTimeValue: number;

  @IsNumber()
  threeQuarterTimeValue: number;

  @IsNumber()
  fullTimeValue: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

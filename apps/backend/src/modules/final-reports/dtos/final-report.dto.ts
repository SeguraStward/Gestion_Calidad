import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Status } from '@una-gc/database/prisma/generated/client';
import { Type } from 'class-transformer';

export class FinalReportStatisticsDto {
  @ApiProperty({ description: 'Number of passed students' })
  @IsInt()
  passed: number;

  @ApiProperty({ description: 'Number of failed students' })
  @IsInt()
  failed: number;

  @ApiProperty({ description: 'Number of dropouts' })
  @IsInt()
  dropouts: number;

  @ApiProperty({ description: 'Total number of students' })
  @IsInt()
  totalStudents: number;
}

export class FinalReportEvaluationOptionsDto {
  @ApiProperty({ description: 'Category of the option' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Label of the option' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Value of the option' })
  @IsString()
  value: string;
}

export class FinalReportEvaluationDto {
  @ApiProperty({ description: 'Question group' })
  @IsString()
  questionGroup: string;

  @ApiProperty({ description: 'Question ID' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Options for the evaluation' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportEvaluationOptionsDto)
  options: FinalReportEvaluationOptionsDto[];

  @ApiPropertyOptional({ description: 'Other response' })
  @IsString()
  @IsOptional()
  otherResponse?: string;

  @ApiProperty({ description: 'Question text' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'Response text' })
  @IsString()
  response: string;

  @ApiPropertyOptional({ description: 'Multiple responses' })
  @IsArray()
  @IsOptional()
  multipleResponse?: string[];

  @ApiProperty({ description: 'Response type' })
  @IsString()
  responseType: string;
}

export class FinalReportStudentAdjustmentDto {
  @ApiProperty({ description: 'Support provided' })
  @IsString()
  support: string;

  @ApiProperty({ description: 'ID number of the student' })
  @IsString()
  idNumber: string;

  @ApiProperty({ description: 'Name of the student' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Grade of the student' })
  @IsString()
  grade: string;

  @ApiPropertyOptional({ description: 'Observation' })
  @IsString()
  @IsOptional()
  observation?: string;
}

export class FinalReportStudentSafeguardDto {
  @ApiProperty({ description: 'ID number of the student' })
  @IsString()
  idNumber: string;

  @ApiProperty({ description: 'Name of the student' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Grade of the student' })
  @IsString()
  grade: string;

  @ApiPropertyOptional({ description: 'Observation' })
  @IsString()
  @IsOptional()
  observation?: string;
}

export class FinalReportStudentInformationDto {
  @ApiProperty({ description: 'Adjustments for students' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportStudentAdjustmentDto)
  adjustments: FinalReportStudentAdjustmentDto[];

  @ApiProperty({ description: 'Safeguards for students' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportStudentSafeguardDto)
  safeguards: FinalReportStudentSafeguardDto[];
}

export class FinalReportDto {
  @ApiPropertyOptional({ description: 'FinalReport ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Version of the report' })
  @IsInt()
  version: number;

  @ApiProperty({ description: 'Load ID' })
  @IsString()
  loadId: string;

  @ApiProperty({ description: 'Statistics of the report' })
  @ValidateNested()
  @Type(() => FinalReportStatisticsDto)
  statistics: FinalReportStatisticsDto;

  @ApiProperty({ description: 'Final Report Dto', enum: Status, default: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'Evaluations of the report' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportEvaluationDto)
  evaluation: FinalReportEvaluationDto[];

  @ApiProperty({ description: 'Student information' })
  @ValidateNested()
  @Type(() => FinalReportStudentInformationDto)
  studentInformation: FinalReportStudentInformationDto;

  @ApiProperty({ description: 'Professor ID' })
  @IsString()
  professorId: string;

  constructor(dto: Partial<FinalReportDto> = {}) {
    Object.assign(this, dto);
  }
}

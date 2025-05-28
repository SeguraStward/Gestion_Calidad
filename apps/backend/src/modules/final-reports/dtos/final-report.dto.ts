import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';

import { Type } from 'class-transformer';
import { FinalReportStatus } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

export class FinalReportEvaluationOptionsDto extends BaseDto {
  @ApiProperty({ description: 'Category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Label' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Value' })
  @IsString()
  value: string;
}

export class FinalReportEvaluationDto extends BaseDto {
  @ApiProperty({ description: 'Question Group' })
  @IsString()
  questionGroup: string;

  @ApiProperty({ description: 'Question ID' })
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Options', type: [FinalReportEvaluationOptionsDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportEvaluationOptionsDto)
  options: FinalReportEvaluationOptionsDto[];

  @ApiProperty({ description: 'Other Response' })
  @IsString()
  otherResponse: string;

  @ApiProperty({ description: 'Question' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'Response' })
  @IsString()
  response: string;

  @ApiProperty({ description: 'Multiple Response', type: [String] })
  @IsArray()
  @IsString({ each: true })
  multipleResponse: string[];

  @ApiProperty({ description: 'Response Type' })
  @IsString()
  responseType: string;
}

export class FinalReportStatisticsDto extends BaseDto {
  @ApiProperty({ description: 'Number of students that passed' })
  @IsInt()
  @Min(0)
  passed: number;

  @ApiProperty({ description: 'Number of students that failed' })
  @IsInt()
  @Min(0)
  failed: number;

  @ApiProperty({ description: 'Number of students that dropped out' })
  @IsInt()
  @Min(0)
  dropouts: number;

  @ApiProperty({ description: 'Total number of students' })
  @IsInt()
  @Min(0)
  totalStudents: number;
}

export class FinalReportStudentAdjustmentDto extends BaseDto {
  @ApiProperty({ description: 'Support' })
  @IsString()
  support: string;

  @ApiProperty({ description: 'ID Number' })
  @IsString()
  idNumber: string;

  @ApiProperty({ description: 'Student Name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Grade' })
  @IsString()
  grade: string;

  @ApiProperty({ description: 'Observation' })
  @IsString()
  observation: string;
}

export class FinalReportStudentSafeguardDto extends BaseDto {
  @ApiProperty({ description: 'ID Number' })
  @IsString()
  idNumber: string;

  @ApiProperty({ description: 'Student Name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Grade' })
  @IsString()
  grade: string;

  @ApiProperty({ description: 'Observation' })
  @IsString()
  observation: string;
}

export class FinalReportStudentInformationDto extends BaseDto {
  @ApiProperty({ description: 'Student Adjustments', type: [FinalReportStudentAdjustmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportStudentAdjustmentDto)
  adjustments: FinalReportStudentAdjustmentDto[];

  @ApiProperty({ description: 'Student Safeguards', type: [FinalReportStudentSafeguardDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportStudentSafeguardDto)
  safeguards: FinalReportStudentSafeguardDto[];
}

export class FinalReportDto extends BaseDto {
  @ApiPropertyOptional({ description: 'Final Report ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Academic Load ID' })
  @IsString()
  academicLoadId: string;

  @ApiProperty({ description: 'Professor ID' })
  @IsString()
  professorId: string;

  @ApiProperty({ description: 'Statistics', type: FinalReportStatisticsDto })
  @ValidateNested()
  @Type(() => FinalReportStatisticsDto)
  statistics: FinalReportStatisticsDto;

  @ApiProperty({ description: 'Evaluations', type: [FinalReportEvaluationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportEvaluationDto)
  evaluation: FinalReportEvaluationDto[];

  @ApiProperty({ description: 'Student Information', type: FinalReportStudentInformationDto })
  @ValidateNested()
  @Type(() => FinalReportStudentInformationDto)
  studentInformation: FinalReportStudentInformationDto;

  @ApiProperty({
    description: 'Final Report Status',
    enum: FinalReportStatus,
    default: FinalReportStatus.PENDING,
  })
  @IsEnum(FinalReportStatus)
  status: FinalReportStatus;

  constructor(dto: Partial<FinalReportDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}

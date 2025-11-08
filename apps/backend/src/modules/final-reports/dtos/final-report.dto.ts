import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';
import { FinalReport, FinalReportStatus } from '@una-gc/database/prisma/generated/client';
import { Expose, Type } from 'class-transformer';

import { AcademicLoadDto } from '@src/modules/academic-loads/dtos/academic-load.dto';
import { UserDto } from '@src/modules/users/dtos/user.dto';

export class FinalReportStatisticsDto {
  @ApiProperty({ description: 'Number of students that passed' })
  @Expose()
  @IsNumber()
  passed: number;

  @ApiProperty({ description: 'Number of students that failed' })
  @Expose()
  @IsNumber()
  failed: number;

  @ApiProperty({ description: 'Number of students that dropped out' })
  @Expose()
  @IsNumber()
  dropouts: number;

  @ApiProperty({ description: 'Total number of students' })
  @Expose()
  @IsNumber()
  totalStudents: number;

  constructor(partial: Partial<FinalReportStatisticsDto> | any = {}) {
    Object.assign(this, partial);
  }
}

export class FinalReportEvaluationOptionsDto {
  @ApiPropertyOptional({ description: 'Category' })
  @Expose()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Label' })
  @Expose()
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ description: 'Value' })
  @Expose()
  @IsString()
  @IsOptional()
  value?: string;
  constructor(partial: Partial<FinalReportEvaluationOptionsDto> | any = {}) {
    Object.assign(this, partial);
    // Clean up optional fields
    if (this.category === 'undefined' || this.category === '') {
      this.category = undefined;
    }
    if (this.label === 'undefined' || this.label === '') {
      this.label = undefined;
    }
    if (this.value === 'undefined' || this.value === '') {
      this.value = undefined;
    }
  }
}

export class FinalReportEvaluationDto {
  @ApiPropertyOptional({ description: 'Question Group' })
  @Expose()
  @IsString()
  @IsOptional()
  questionGroup?: string;

  @ApiProperty({ description: 'Question ID' })
  @Expose()
  @IsString()
  questionId: string;

  @ApiProperty({ description: 'Options', type: [FinalReportEvaluationOptionsDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportEvaluationOptionsDto)
  options: FinalReportEvaluationOptionsDto[];

  @ApiPropertyOptional({ description: 'Other Response' })
  @Expose()
  @IsString()
  @IsOptional()
  otherResponse?: string;

  @ApiProperty({ description: 'Question' })
  @Expose()
  @IsString()
  question: string;

  @ApiPropertyOptional({ description: 'Response' })
  @Expose()
  @IsString()
  @IsOptional()
  response?: string;

  @ApiProperty({ description: 'Multiple Response', type: [String] })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  multipleResponse: string[];

  @ApiProperty({ description: 'Response Type' })
  @Expose()
  @IsString()
  responseType: string;

  @ApiPropertyOptional({ description: 'Step Number (5, 6, or 7)' })
  @Expose()
  @IsNumber()
  @IsOptional()
  stepNumber?: number;

  constructor(partial: Partial<FinalReportEvaluationDto> | any = {}) {
    Object.assign(this, partial);
    if (partial.options && Array.isArray(partial.options)) {
      this.options = partial.options.map((opt) =>
        opt instanceof FinalReportEvaluationOptionsDto ? opt : new FinalReportEvaluationOptionsDto(opt),
      );
    }
    // Clean up fields that might come as string "undefined" or empty strings
    if (this.response === 'undefined' || this.response === '') {
      this.response = undefined;
    }
    if (this.otherResponse === 'undefined' || this.otherResponse === '') {
      this.otherResponse = undefined;
    }
    if (this.questionGroup === 'undefined' || this.questionGroup === '') {
      this.questionGroup = undefined;
    }
  }
}

export class FinalReportStudentAdjustmentDto {
  @ApiProperty({ description: 'Support' })
  @Expose()
  @IsString()
  support: string;

  @ApiProperty({ description: 'ID Number' })
  @Expose()
  @IsString()
  idNumber: string;

  @ApiProperty({ description: 'Student Name' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Grade' })
  @Expose()
  @IsString()
  grade: string;

  @ApiPropertyOptional({ description: 'Observation' })
  @Expose()
  @IsString()
  @IsOptional()
  observation?: string;
  constructor(partial: Partial<FinalReportStudentAdjustmentDto> | any = {}) {
    Object.assign(this, partial);
    // Convert empty strings to undefined for optional fields
    if (this.observation === '') {
      this.observation = undefined;
    }
  }
}

export class FinalReportStudentSafeguardDto {
  @ApiProperty({ description: 'ID Number' })
  @Expose()
  @IsString()
  idNumber: string;

  @ApiProperty({ description: 'Student Name' })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Grade' })
  @Expose()
  @IsString()
  grade: string;

  @ApiPropertyOptional({ description: 'Observation' })
  @Expose()
  @IsString()
  @IsOptional()
  observation?: string;
  constructor(partial: Partial<FinalReportStudentSafeguardDto> | any = {}) {
    Object.assign(this, partial);
    // Convert empty strings to undefined for optional fields
    if (this.observation === '') {
      this.observation = undefined;
    }
  }
}

export class FinalReportStudentInformationDto {
  @ApiProperty({ description: 'Student Adjustments', type: [FinalReportStudentAdjustmentDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportStudentAdjustmentDto)
  adjustments: FinalReportStudentAdjustmentDto[];

  @ApiProperty({ description: 'Student Safeguards', type: [FinalReportStudentSafeguardDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportStudentSafeguardDto)
  safeguards: FinalReportStudentSafeguardDto[];

  constructor(partial: Partial<FinalReportStudentInformationDto> | any = {}) {
    Object.assign(this, partial);
    if (partial.adjustments && Array.isArray(partial.adjustments)) {
      this.adjustments = partial.adjustments.map((adj) =>
        adj instanceof FinalReportStudentAdjustmentDto ? adj : new FinalReportStudentAdjustmentDto(adj),
      );
    }
    if (partial.safeguards && Array.isArray(partial.safeguards)) {
      this.safeguards = partial.safeguards.map((sg) =>
        sg instanceof FinalReportStudentSafeguardDto ? sg : new FinalReportStudentSafeguardDto(sg),
      );
    }
  }
}

export class FinalReportDto extends AuditFields {
  @ApiPropertyOptional({ description: 'Final Report ID' })
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  // academicLoadId and professorId are fine for creation, but the response will have the objects
  @ApiProperty({ description: 'Academic Load ID' })
  @IsString()
  academicLoadId: string; // Keep for create/update DTO if needed

  @ApiProperty({ description: 'Professor ID' })
  @IsString()
  professorId: string; // Keep for create/update DTO if needed

  @ApiProperty({ description: 'Statistics', type: FinalReportStatisticsDto })
  @Expose()
  @ValidateNested()
  @Type(() => FinalReportStatisticsDto)
  statistics: FinalReportStatisticsDto;

  @ApiProperty({ description: 'Evaluations', type: [FinalReportEvaluationDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportEvaluationDto)
  evaluation: FinalReportEvaluationDto[];

  @ApiProperty({ description: 'Student Information', type: FinalReportStudentInformationDto })
  @Expose()
  @ValidateNested()
  @Type(() => FinalReportStudentInformationDto)
  studentInformation: FinalReportStudentInformationDto;

  @ApiProperty({
    description: 'Final Report Status',
    enum: FinalReportStatus,
    default: FinalReportStatus.PENDING,
  })
  @Expose()
  @IsEnum(FinalReportStatus)
  status: FinalReportStatus;

  // ADD NESTED DTOs FOR RELATIONS
  @ApiPropertyOptional({ type: () => AcademicLoadDto, description: 'Associated Academic Load' })
  @Expose()
  @Type(() => AcademicLoadDto)
  @ValidateNested()
  @IsOptional()
  academicLoad?: AcademicLoadDto;

  @ApiPropertyOptional({ type: () => UserDto, description: 'Associated Professor' })
  @Expose()
  @Type(() => UserDto)
  @ValidateNested()
  @IsOptional()
  professor?: UserDto;

  constructor(partial: Partial<FinalReportDto> | FinalReport = {}) {
    super();
    Object.assign(this, partial); // This will copy IDs and already-transformed objects if partial is a DTO

    // The manual instantiation of nested composite types (statistics, evaluation, studentInformation)
    // is still useful if 'partial' is a raw Prisma entity without these being pre-transformed.
    if (partial.statistics && !(partial.statistics instanceof FinalReportStatisticsDto)) {
      this.statistics = new FinalReportStatisticsDto(partial.statistics as any);
    }
    if (partial.evaluation && Array.isArray(partial.evaluation)) {
      this.evaluation = partial.evaluation.map((e) =>
        e instanceof FinalReportEvaluationDto ? e : new FinalReportEvaluationDto(e as any),
      );
    }
    if (
      partial.studentInformation &&
      !(partial.studentInformation instanceof FinalReportStudentInformationDto)
    ) {
      this.studentInformation = new FinalReportStudentInformationDto(partial.studentInformation as any);
    }

    // For relational objects like academicLoad and professor, class-transformer's @Type decorator
    // handles their transformation when plainToClass is called with an entity that has these relations included.
    // So, the manual checks for `partial.academicLoad` and `partial.professor` might be redundant
    // if the transformation is primarily handled by plainToClass in your service layer.

    // If you absolutely need to handle the case where 'partial' is a Prisma entity
    // and you want to create DTOs from its *included* relations within this constructor:
    // This assumes 'partial' (if it's a FinalReport entity) might have academicLoad/professor objects already populated by Prisma.
    if (
      'academicLoad' in partial &&
      partial.academicLoad &&
      !(partial.academicLoad instanceof AcademicLoadDto)
    ) {
      this.academicLoad = new AcademicLoadDto(partial.academicLoad as any);
    }
    if ('professor' in partial && partial.professor && !(partial.professor instanceof UserDto)) {
      this.professor = new UserDto(partial.professor as any);
    }
  }
}

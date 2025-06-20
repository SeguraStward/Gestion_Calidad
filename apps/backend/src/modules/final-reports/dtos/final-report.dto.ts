import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray, ValidateNested } from 'class-validator';

import { Expose, Type } from 'class-transformer';
import { FinalReport, FinalReportStatus } from '@una-gc/database/prisma/generated/client';
import { BaseDto } from '@src/modules/generalDto';

import { AcademicLoadDto } from '@src/modules/academic-loads/dtos/academic-load.dto';
import { UserDto } from '@src/modules/users/dtos/user.dto';

export class FinalReportStatisticsDto {
  @ApiProperty({ description: 'Number of students that passed' })
  @Expose()
  passed: number;

  @ApiProperty({ description: 'Number of students that failed' })
  @Expose()
  failed: number;

  @ApiProperty({ description: 'Number of students that dropped out' })
  @Expose()
  dropouts: number;

  @ApiProperty({ description: 'Total number of students' })
  @Expose()
  totalStudents: number;

  constructor(partial: Partial<FinalReportStatisticsDto> | any = {}) {
    Object.assign(this, partial);
  }
}

export class FinalReportEvaluationOptionsDto {
  @ApiProperty({ description: 'Category' })
  @Expose()
  category: string;
  @ApiProperty({ description: 'Label' })
  @Expose()
  label: string;
  @ApiProperty({ description: 'Value' })
  @Expose()
  value: string;
  constructor(partial: Partial<FinalReportEvaluationOptionsDto> | any = {}) {
    Object.assign(this, partial);
  }
}

export class FinalReportEvaluationDto {
  @ApiProperty({ description: 'Question Group' })
  @Expose()
  questionGroup: string;
  @ApiProperty({ description: 'Question ID' })
  @Expose()
  questionId: string;
  @ApiProperty({ description: 'Options', type: [FinalReportEvaluationOptionsDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FinalReportEvaluationOptionsDto)
  options: FinalReportEvaluationOptionsDto[];
  @ApiProperty({ description: 'Other Response' })
  @Expose()
  otherResponse: string;
  @ApiProperty({ description: 'Question' })
  @Expose()
  question: string;
  @ApiProperty({ description: 'Response' })
  @Expose()
  response: string;
  @ApiProperty({ description: 'Multiple Response', type: [String] })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  multipleResponse: string[];
  @ApiProperty({ description: 'Response Type' })
  @Expose()
  responseType: string;

  constructor(partial: Partial<FinalReportEvaluationDto> | any = {}) {
    Object.assign(this, partial);
    if (partial.options && Array.isArray(partial.options)) {
      this.options = partial.options.map((opt) =>
        opt instanceof FinalReportEvaluationOptionsDto ? opt : new FinalReportEvaluationOptionsDto(opt),
      );
    }
  }
}

export class FinalReportStudentAdjustmentDto {
  @ApiProperty({ description: 'Support' })
  @Expose()
  support: string;
  @ApiProperty({ description: 'ID Number' })
  @Expose()
  idNumber: string;
  @ApiProperty({ description: 'Student Name' })
  @Expose()
  name: string;
  @ApiProperty({ description: 'Grade' })
  @Expose()
  grade: string;
  @ApiProperty({ description: 'Observation' })
  @Expose()
  observation: string;
  constructor(partial: Partial<FinalReportStudentAdjustmentDto> | any = {}) {
    Object.assign(this, partial);
  }
}

export class FinalReportStudentSafeguardDto {
  @ApiProperty({ description: 'ID Number' })
  @Expose()
  idNumber: string;
  @ApiProperty({ description: 'Student Name' })
  @Expose()
  name: string;
  @ApiProperty({ description: 'Grade' })
  @Expose()
  grade: string;
  @ApiProperty({ description: 'Observation' })
  @Expose()
  observation: string;
  constructor(partial: Partial<FinalReportStudentSafeguardDto> | any = {}) {
    Object.assign(this, partial);
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

export class FinalReportDto extends BaseDto {
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

import { PartialType } from '@nestjs/swagger';
import { CreateCourseReportDto } from './create-course-report.dto';

export class UpdateCourseReportDto extends PartialType(CreateCourseReportDto) {}

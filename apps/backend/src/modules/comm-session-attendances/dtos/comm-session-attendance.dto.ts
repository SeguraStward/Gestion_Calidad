import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { AuditFields } from '@src/dtos/audit-fields.dto';

export class CommSessionAttendanceDto extends AuditFields {
  @ApiPropertyOptional({ description: 'CommSessionAttendance ID' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Session ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Member ID' })
  @IsString()
  memberId: string;

  constructor(dto: Partial<CommSessionAttendanceDto> = {}) {
    super();
    Object.assign(this, dto);
  }
}

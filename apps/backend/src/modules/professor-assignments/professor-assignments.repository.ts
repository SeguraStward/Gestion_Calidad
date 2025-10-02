import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { GenericPrismaRepository } from '@core/common/repositories/generic-prisma.repository';
import { Prisma, ProfessorAssignment } from '@una-gc/database/prisma/generated/client';

@Injectable()
export class ProfessorAssignmentsRepository extends GenericPrismaRepository<
  ProfessorAssignment,
  Prisma.ProfessorAssignmentCreateInput,
  Prisma.ProfessorAssignmentUpdateInput,
  Prisma.ProfessorAssignmentWhereUniqueInput
> {
  protected readonly modelName = 'professorAssignment' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }
}

import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';

import { ProfessorPortalController } from './professor-portal.controller';
import { ProfessorPortalService } from './professor-portal.service';
import { ProfessorPortalGuard } from './guards/professor-portal.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ProfessorPortalController],
  providers: [ProfessorPortalService, ProfessorPortalGuard],
  exports: [ProfessorPortalService],
})
export class ProfessorPortalModule {}

import { Module } from '@nestjs/common';
import { InstitutionalProjectsController } from './institutional-projects.controller';
import { InstitutionalProjectsService } from './institutional-projects.service';
import { InstitutionalProjectsRepository } from './institutional-projects.repository';
import { PrismaModule } from '@src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InstitutionalProjectsController],
  providers: [InstitutionalProjectsService, InstitutionalProjectsRepository],
  exports: [InstitutionalProjectsService],
})
export class InstitutionalProjectsModule {}

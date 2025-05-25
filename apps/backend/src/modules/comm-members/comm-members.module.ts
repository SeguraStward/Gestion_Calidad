import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/prisma/prisma.module';
import { DtoValidator } from '@core/common/dto-validator';

import { CommMembersService } from './comm-members.service';
import { CommMembersController } from './comm-members.controller';
import { CommMembersRepository } from './comm-members.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CommMembersController],
  providers: [CommMembersService, CommMembersRepository, DtoValidator],
  exports: [CommMembersService, CommMembersRepository],
})
export class CommMembersModule {}

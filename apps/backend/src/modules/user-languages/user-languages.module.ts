import { Module } from '@nestjs/common';

import { PrismaModule } from '@src/prisma/prisma.module';

import { DtoValidator } from '@core/common/dto-validator';

import { UserLanguagesService } from './user-languages.service';

import { UserLanguagesController } from './user-languages.controller';

import { UserLanguagesRepository } from './user-languages.repository';

@Module({
  imports: [PrismaModule],

  controllers: [UserLanguagesController],

  providers: [UserLanguagesService, UserLanguagesRepository, DtoValidator],

  exports: [UserLanguagesService, UserLanguagesRepository],
})
export class UserLanguagesModule {}

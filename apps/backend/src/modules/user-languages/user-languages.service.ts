import { GenericService } from '@core/common/interfaces/generic.service';
import { DtoValidator } from '@core/common/dto-validator';
import { Injectable, Logger } from '@nestjs/common';

import { UserLanguageDto } from './dtos/user-language.dto';
import { UserLanguage } from '@una-gc/database/prisma/generated/client';
import { UserLanguagesRepository } from './user-languages.repository';

@Injectable()
export class UserLanguagesService extends GenericService<UserLanguage, UserLanguageDto, UserLanguageDto> {
  protected readonly logger = new Logger(UserLanguagesService.name);

  protected readonly relationCheckConfig = {
    relationFields: [''],
    errorMessage: 'Cannot delete UserLanguage because it has associated: none.',
  };

  constructor(
    protected readonly userLanguagesRepository: UserLanguagesRepository,
    protected readonly dtoValidator: DtoValidator,
  ) {
    super(userLanguagesRepository, UserLanguageDto);
  }
}

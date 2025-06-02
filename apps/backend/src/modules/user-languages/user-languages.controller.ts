import { GenericController } from '@core/common/interfaces/generic.controller';
import { Controller, Logger } from '@nestjs/common';

import { UserLanguageDto } from './dtos/user-language.dto';
import { UserLanguagesService } from './user-languages.service';

@Controller('user-languages')
export class UserLanguagesController extends GenericController<UserLanguageDto, UserLanguageDto> {
  protected readonly logger = new Logger(UserLanguagesController.name);
  protected readonly resourceName = 'USER_LANGUAGE';
  constructor(private readonly userLanguagesService: UserLanguagesService) {
    super(userLanguagesService);
  }
}

import { GenericController } from '@core/common/interfaces/generic.controller';
import { Body, Controller, Logger, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dtos/user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController extends GenericController<UserDto, UserDto> {
  protected readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update user profile information' })
  @ApiResponse({
    status: 200,
    description: 'User profile was updated successfully',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserDto> {
    return this.usersService.updateProfile(id, updateUserDto);
  }
}

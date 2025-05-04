import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '@src/modules/users/users.controller';
import { UsersService } from '@src/modules/users/users.service';
import { UpdateUserDto } from '@src/modules/users/dtos/update-user.dto';

const mockUsersService = {
  updateProfile: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should call UsersService.updateProfile with correct parameters', async () => {
      const id = '1';
      const updateUserDto: UpdateUserDto = { email: 'test@est.una.ac.cr', fullName: 'Test User' };
      const updatedUser = { id, ...updateUserDto };

      service.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(id, updateUserDto);

      expect(service.updateProfile).toHaveBeenCalledWith(id, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });
});

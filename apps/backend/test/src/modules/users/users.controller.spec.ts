import { Test } from '@nestjs/testing';
import { UsersController } from '@modules/users/users.controller';
import { UsersService } from '@modules/users/users.service';
import { NotFoundException } from '@nestjs/common';
import { testUser, testUserDto, testUserUpdate, createMockRepository } from './test-fixtures';

describe('UsersController', () => {
  let controller: UsersController;
  let mockService;

  beforeEach(async () => {
    mockService = createMockRepository();
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('CRUD operations', () => {
    it('should get all users', async () => {
      const paginatedResult = {
        data: [testUserDto],
        meta: { page: 1, limit: 10, total: 1 },
      };
      mockService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll();
      expect(result).toEqual(paginatedResult);
    });

    it('should get user by id', async () => {
      mockService.findById.mockResolvedValue(testUserDto);

      const result = await controller.findById(testUser.id);
      expect(result).toEqual(testUserDto);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockService.findById.mockResolvedValue(null);
      await expect(controller.findById('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should create a new user', async () => {
      mockService.save.mockResolvedValue(testUserDto);

      const result = await controller.create(testUserDto);
      expect(result).toEqual(testUserDto);
    });

    it('should update an existing user', async () => {
      const updatedUser = { ...testUserDto, ...testUserUpdate };
      mockService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(testUser.id, testUserUpdate);
      expect(result).toEqual(updatedUser);
    });

    it('should delete a user', async () => {
      mockService.deleteById.mockResolvedValue(true);

      const result = await controller.delete(testUser.id);
      expect(result).toBeUndefined();
      expect(mockService.deleteById).toHaveBeenCalledWith(testUser.id);
    });
  });
});

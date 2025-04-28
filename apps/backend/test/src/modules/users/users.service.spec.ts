import { Test } from '@nestjs/testing';
import { UsersService } from '@modules/users/users.service';
import { UsersRepository } from '@modules/users/users.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { testUser, testUserDto, testUserUpdate, createMockRepository } from './test-fixtures';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository;

  beforeEach(async () => {
    mockRepository = createMockRepository();
    const mockDtoValidator = {
      validate: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    };

    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
        { provide: DtoValidator, useValue: mockDtoValidator },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('CRUD operations', () => {
    it('should find all users', async () => {
      const paginatedResult = {
        data: [testUser],
        meta: { page: 1, limit: 10, total: 1 },
      };
      mockRepository.findAll.mockResolvedValue(paginatedResult);

      const result = await service.findAll();
      expect(result).toEqual(paginatedResult);
    });

    it('should find user by id', async () => {
      mockRepository.findById.mockResolvedValue(testUser);

      const result = await service.findById(testUser.id);
      expect(result).toEqual(expect.objectContaining({ id: testUser.id }));
    });

    it('should return null if user not found', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Not found'));

      const result = await service.findById('non-existent');
      expect(result).toBeNull();
    });

    it('should create a new user', async () => {
      mockRepository.save.mockResolvedValue(testUser);

      const result = await service.save(testUserDto);
      expect(result).toEqual(expect.objectContaining({ id: testUser.id }));
    });

    it('should update an existing user', async () => {
      const updatedUser = { ...testUser, ...testUserUpdate };
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(testUser.id, testUserUpdate);
      expect(result.fullName).toBe(testUserUpdate.fullName);
    });

    it('should delete a user', async () => {
      mockRepository.deleteById.mockResolvedValue(testUser);

      const result = await service.deleteById(testUser.id);
      expect(result).toEqual(expect.objectContaining({ id: testUser.id }));
    });
  });
});

import { Test } from '@nestjs/testing';
import { UsersRepository } from '@modules/users/users.repository';
import { PrismaModule } from '@src/prisma/prisma.module';
import { NotFoundException } from '@nestjs/common';
import { testUser, testUserUpdate, createMockPrisma } from './test-fixtures';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mockPrisma;

  beforeEach(async () => {
    mockPrisma = createMockPrisma();
    const module = await Test.createTestingModule({
      providers: [UsersRepository, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('CRUD operations', () => {
    it('should find all users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([testUser]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await repository.findAll();
      expect(result.data).toEqual([testUser]);
      expect(result.meta.total).toBe(1);
    });

    it('should find user by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(testUser);

      const result = await repository.findById(testUser.id);
      expect(result).toEqual(testUser);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(repository.findById('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should create a new user', async () => {
      const userToCreate = {
        email: testUser.email,
        fullName: testUser.fullName,
        fullLastName: testUser.fullLastName,
        status: testUser.status,
      };

      mockPrisma.user.create.mockResolvedValue({
        id: 'new-id',
        ...userToCreate,
      });

      const result = await repository.save(userToCreate);
      expect(result).toHaveProperty('id', 'new-id');
    });

    it('should update an existing user', async () => {
      mockPrisma.user.update.mockResolvedValue({
        ...testUser,
        ...testUserUpdate,
      });

      const result = await repository.update(testUser.id, testUserUpdate);
      expect(result.fullName).toBe(testUserUpdate.fullName);
    });

    it('should delete a user', async () => {
      mockPrisma.user.delete.mockResolvedValue(testUser);

      const result = await repository.deleteById(testUser.id);
      expect(result).toBe(true);
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: testUser.id },
      });
    });
  });
});

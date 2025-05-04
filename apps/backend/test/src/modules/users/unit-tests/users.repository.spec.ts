import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '@src/modules/users/users.repository';
import { PrismaService } from '@src/prisma/prisma.service';

const mockPrismaService = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: '1', email: 'test@est.una.ac.cr' }];
      prisma.user.findMany.mockResolvedValue(users);
      prisma.user.count.mockResolvedValue(1);

      const result = await repository.findAll(1, 10);

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(prisma.user.count).toHaveBeenCalled();
      expect(result.data).toEqual(users);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const user = { id: '1', email: 'test@est.una.ac.cr' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await repository.findById('1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, include: {} });
      expect(result).toEqual(user);
    });
  });

  describe('save', () => {
    it('should create a new user', async () => {
      const user = { id: '1', email: 'test@est.una.ac.cr', fullName: 'Test User' };
      prisma.user.create.mockResolvedValue(user);

      const result = await repository.save(user);

      expect(prisma.user.create).toHaveBeenCalledWith({ data: user, include: {} });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user by ID', async () => {
      const user = { id: '1', email: 'updated@est.una.ac.cr' };
      prisma.user.update.mockResolvedValue(user);

      const result = await repository.update('1', user);

      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: '1' }, data: user, include: {} });
      expect(result).toEqual(user);
    });
  });

  describe('deleteById', () => {
    it('should delete a user by ID', async () => {
      prisma.user.delete.mockResolvedValue(true);

      const result = await repository.deleteById('1');

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBe(true);
    });
  });
});

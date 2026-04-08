import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { UserRolesRepository } from '@modules/user-roles/user-roles.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

describe('UserRolesService (Unitaria)', () => {
  let service: UserRolesService;
  let repository: jest.Mocked<UserRolesRepository>;
  let prisma: jest.Mocked<PrismaService>;

  const mockRole = {
    id: 'role-1',
    name: 'ADMIN',
    description: 'System Administrator',
    status: 'ACTIVE',
    permissions: [{ permissionID: 'perm-1', permissions: ['READ'], scope: 'GLOBAL', actions: [] }],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'sys',
    updatedBy: 'sys',
  };

  const mockPermission = {
    id: 'perm-1',
    name: 'Manage Users',
    code: 'USERS_MANAGEMENT',
    status: 'ACTIVE',
  };

  const mockUserRolesRepository = () => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    count: jest.fn(),
  });

  const mockPrismaService = () => ({
    userRole: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userPermission: {
      findMany: jest.fn(),
    },
  });

  const mockDtoValidatorFactory = () => ({
    validate: jest.fn().mockImplementation((entity) => entity),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRolesService,
        {
          provide: UserRolesRepository,
          useFactory: mockUserRolesRepository,
        },
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
        {
          provide: DtoValidator,
          useFactory: mockDtoValidatorFactory,
        },
      ],
    }).compile();

    service = module.get<UserRolesService>(UserRolesService);
    repository = module.get(UserRolesRepository);
    prisma = module.get(PrismaService) as any;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRoleWithPermissions', () => {
    it('Retorna nulo si el rol no existe', async () => {
      prisma.userRole.findFirst.mockResolvedValue(null as any);

      const result = await service.getRoleWithPermissions('non-exist');

      expect(result).toBeNull();
    });

    it('Lista rol con sus respectivos permisos integrados', async () => {
      prisma.userRole.findFirst.mockResolvedValue(mockRole as any);
      prisma.userPermission.findMany.mockResolvedValue([mockPermission] as any);

      const result = await service.getRoleWithPermissions('role-1');

      expect(prisma.userPermission.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['perm-1'] } },
        select: expect.any(Object),
      });

      expect(result).toBeDefined();
      expect(result!.id).toBe('role-1');
      expect(result!.permissions).toHaveLength(1);
      expect(result!.permissions[0].code).toBe('USERS_MANAGEMENT');
    });
  });

  describe('getAllPermissions', () => {
    it('Valida que los permisos estructurados se retornen correctamente formateados', async () => {
      prisma.userPermission.findMany.mockResolvedValue([mockPermission] as any);

      const result = await service.getAllPermissions();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'perm-1',
        name: 'Manage Users',
        code: 'USERS_MANAGEMENT',
        status: 'ACTIVE',
        type: 'READ',
        scope: 'GLOBAL',
        actions: [],
      });
    });
  });

  describe('updateRolePermissions', () => {
    it('Lanza error si el rol no existe', async () => {
      prisma.userRole.findUnique.mockResolvedValue(null as any);

      await expect(
        service.updateRolePermissions('role-1', [])
      ).rejects.toThrow('Role with id role-1 not found');
    });

    it('Actualiza permisos si el rol es válido y hace relist del rol', async () => {
      prisma.userRole.findUnique.mockResolvedValue(mockRole as any);
      prisma.userRole.update.mockResolvedValue(mockRole as any);

      // Para el getRoleWithPermissions() recursivo
      prisma.userRole.findFirst.mockResolvedValue(mockRole as any);
      prisma.userPermission.findMany.mockResolvedValue([mockPermission] as any);

      const updateData = [
        { permissionID: 'perm-1', permissions: ['CREATE'], scope: 'GLOBAL', actions: [] }
      ];

      const result = await service.updateRolePermissions('role-1', updateData);

      expect(prisma.userRole.update).toHaveBeenCalledWith({
        where: { id: 'role-1' },
        data: expect.objectContaining({
          permissions: updateData,
        }),
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('role-1');
    });
  });
});
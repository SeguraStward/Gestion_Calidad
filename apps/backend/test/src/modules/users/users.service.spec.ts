/**
 * Pruebas unitarias — UsersService
 *
 * Cubre:
 *  - updateProfile        → limpieza de datos y delegación a Prisma
 *  - setUserRoles         → validación de roles y actualización
 *  - changeUserStatus     → cambio de estado con Prisma
 *  - deleteById           → transacción: desconectar roles → limpiar roleIds → eliminar usuario
 *  - bulkImportProfessors → crear nuevos / actualizar existentes / registrar errores
 *  - meGetUser            → wrapper sobre findById
 *  - findUsersByRoleNameAndStatus → wrapper sobre findAll
 *  - getAllRoles           → consulta roles activos
 */

import { Logger } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { UsersRepository } from '@modules/users/users.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

// ─── Factories de mocks ──────────────────────────────────────────────────────

const mockUsersRepository = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
  count: jest.fn(),
  softDeleteById: jest.fn(),
});

const mockDtoValidator = () => ({
  validate: jest.fn().mockImplementation((_entity, dto) => dto),
});

const mockPrisma = () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userRole: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  userPermission: {
    findMany: jest.fn(),
  },
  refreshToken: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
});

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('UsersService', () => {
  let service: UsersService;
  let repo: ReturnType<typeof mockUsersRepository>;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(() => {
    repo = mockUsersRepository();
    prisma = mockPrisma();
    service = new UsersService(
      repo as unknown as UsersRepository,
      mockDtoValidator() as unknown as DtoValidator,
      prisma as unknown as PrismaService,
    );
  });

  // ── updateProfile ─────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    const usuarioActualizado = {
      id: 'u1',
      email: 'juan@una.cr',
      fullName: 'Juan',
      fullLastName: 'Pérez',
      roles: [],
    };

    it('debe actualizar los campos válidos y retornar el usuario', async () => {
      prisma.user.update.mockResolvedValue(usuarioActualizado);

      const dto = { email: '  juan@una.cr  ', fullName: '  Juan  ', fullLastName: '  Pérez  ' };
      const resultado = await service.updateProfile('u1', dto as any);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: expect.objectContaining({
            email: 'juan@una.cr',
            fullName: 'Juan',
            fullLastName: 'Pérez',
          }),
        }),
      );
      expect(resultado).toEqual(usuarioActualizado);
    });

    it('debe ignorar campos vacíos o nulos', async () => {
      prisma.user.update.mockResolvedValue(usuarioActualizado);

      const dto = { email: '', fullName: '   ', photoUrl: undefined, status: undefined };
      await service.updateProfile('u1', dto as any);

      const { data } = prisma.user.update.mock.calls[0][0];
      expect(data).not.toHaveProperty('email');
      expect(data).not.toHaveProperty('fullName');
      expect(data).not.toHaveProperty('photoUrl');
    });

    it('debe incluir status solo si es valor válido del enum', async () => {
      prisma.user.update.mockResolvedValue(usuarioActualizado);

      await service.updateProfile('u1', { status: 'ACTIVE' } as any);
      const { data: dataValido } = prisma.user.update.mock.calls[0][0];
      expect(dataValido.status).toBe('ACTIVE');

      prisma.user.update.mockClear();

      await service.updateProfile('u1', { status: 'INEXISTENTE' } as any);
      const { data: dataInvalido } = prisma.user.update.mock.calls[0][0];
      expect(dataInvalido).not.toHaveProperty('status');
    });

    it('debe propagar el error si Prisma falla', async () => {
      prisma.user.update.mockRejectedValue(new Error('DB error'));
      await expect(service.updateProfile('u1', {} as any)).rejects.toThrow('DB error');
    });
  });

  // ── setUserRoles ──────────────────────────────────────────────────────────

  describe('setUserRoles', () => {
    it('debe asignar roles válidos al usuario', async () => {
      const usuarioConRoles = { id: 'u1', roles: [{ id: 'r1', name: 'ADMIN' }] };
      prisma.userRole.findMany.mockResolvedValue([{ id: 'r1' }]);
      prisma.user.update.mockResolvedValue(usuarioConRoles);

      const resultado = await service.setUserRoles('u1', ['r1']);

      expect(prisma.userRole.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: { in: ['r1'] }, status: 'ACTIVE' } }),
      );
      expect(resultado).toEqual(usuarioConRoles);
    });

    it('debe lanzar error si algún roleId no existe o está inactivo', async () => {
      prisma.userRole.findMany.mockResolvedValue([{ id: 'r1' }]); // r2 no existe

      await expect(service.setUserRoles('u1', ['r1', 'r2'])).rejects.toThrow(
        /do not exist or are not active/i,
      );
    });

    it('debe aceptar lista de roles vacía sin llamar findMany', async () => {
      const usuarioSinRoles = { id: 'u1', roles: [] };
      prisma.user.update.mockResolvedValue(usuarioSinRoles);

      const resultado = await service.setUserRoles('u1', []);

      expect(prisma.userRole.findMany).not.toHaveBeenCalled();
      expect(resultado).toEqual(usuarioSinRoles);
    });
  });

  // ── changeUserStatus ──────────────────────────────────────────────────────

  describe('changeUserStatus', () => {
    it('debe cambiar el estado del usuario y retornarlo', async () => {
      const usuarioInactivo = { id: 'u1', status: 'INACTIVE', roles: [] };
      prisma.user.update.mockResolvedValue(usuarioInactivo);

      const resultado = await service.changeUserStatus('u1', 'INACTIVE' as any);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: { status: 'INACTIVE' },
        }),
      );
      expect(resultado).toEqual(usuarioInactivo);
    });
  });

  // ── deleteById ────────────────────────────────────────────────────────────

  describe('deleteById', () => {
    it('debe ejecutar la transacción completa y retornar true', async () => {
      const usuarioConRoles = { id: 'u1', fullName: 'Juan', email: 'juan@una.cr', roles: [{ id: 'r1' }] };
      prisma.user.findUnique.mockResolvedValue(usuarioConRoles);
      prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
      prisma.user.update.mockResolvedValue({});
      prisma.user.delete.mockResolvedValue({});

      const resultado = await service.deleteById('u1');

      expect(resultado).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('debe lanzar error si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteById('no-existe')).rejects.toThrow(/not found/i);
    });

    it('debe propagar errores de la transacción', async () => {
      const usuario = { id: 'u1', fullName: 'Juan', email: 'j@una.cr', roles: [] };
      prisma.user.findUnique.mockResolvedValue(usuario);
      prisma.$transaction.mockRejectedValue(new Error('TX falló'));

      await expect(service.deleteById('u1')).rejects.toThrow('TX falló');
    });
  });

  // ── bulkImportProfessors ──────────────────────────────────────────────────

  describe('bulkImportProfessors', () => {
    beforeEach(() => {
      prisma.userRole.findFirst.mockResolvedValue({ id: 'rol-profesor' });
    });

    it('debe crear un usuario nuevo si no existe', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'new-u1' });

      const resultado = await service.bulkImportProfessors([{ cedula: '12345', nombre: 'Ana García' }]);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'profesor.12345@una.cr',
            nationalId: '12345',
            fullName: 'Ana García',
          }),
        }),
      );
      expect(resultado.created).toBe(1);
      expect(resultado.updated).toBe(0);
      expect(resultado.errors).toBe(0);
      expect(resultado.userIds).toContain('new-u1');
    });

    it('debe actualizar usuario existente que no tiene el rol PROFESOR', async () => {
      const existente = { id: 'ex-u1', roleIds: [], nationalId: '12345' };
      prisma.user.findFirst.mockResolvedValue(existente);
      prisma.user.update.mockResolvedValue({});

      const resultado = await service.bulkImportProfessors([{ cedula: '12345', nombre: 'Pedro' }]);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ex-u1' },
          data: expect.objectContaining({ roleIds: ['rol-profesor'] }),
        }),
      );
      expect(resultado.updated).toBe(1);
      expect(resultado.created).toBe(0);
    });

    it('debe omitir usuario existente que ya tiene el rol PROFESOR', async () => {
      const existente = { id: 'ex-u2', roleIds: ['rol-profesor'], nationalId: '99999' };
      prisma.user.findFirst.mockResolvedValue(existente);

      const resultado = await service.bulkImportProfessors([{ cedula: '99999', nombre: 'María' }]);

      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(resultado.created).toBe(0);
      expect(resultado.updated).toBe(0);
    });

    it('debe registrar error si cedula o nombre están vacíos', async () => {
      const resultado = await service.bulkImportProfessors([{ cedula: '', nombre: '' }]);

      expect(resultado.errors).toBe(1);
      expect(resultado.errorDetails.length).toBe(1);
    });

    it('debe lanzar error si el rol PROFESOR no existe en BD', async () => {
      prisma.userRole.findFirst.mockResolvedValue(null);

      await expect(
        service.bulkImportProfessors([{ cedula: '1', nombre: 'X' }]),
      ).rejects.toThrow(/Role PROFESOR not found/);
    });
  });

  // ── meGetUser ─────────────────────────────────────────────────────────────

  describe('meGetUser', () => {
    it('debe llamar a findById con el include de roles activos', async () => {
      const usuarioRaw = { id: 'u1', email: 'x@una.cr', roles: [] };
      repo.findById.mockResolvedValue(usuarioRaw);

      const resultado = await service.meGetUser('u1');

      expect(repo.findById).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ roles: expect.any(Object) }),
      );
      // El GenericService mapea el resultado a UserDto, verificamos los campos clave
      expect(resultado).toMatchObject({ id: 'u1', email: 'x@una.cr' });
    });
  });

  // ── findUsersByRoleNameAndStatus ──────────────────────────────────────────

  describe('findUsersByRoleNameAndStatus', () => {
    it('debe llamar a findAll con los filtros de rol y estado correctos', async () => {
      const paginado = { data: [], meta: { page: 1, limit: 10, total: 0 } };
      repo.findAll.mockResolvedValue(paginado);

      const resultado = await service.findUsersByRoleNameAndStatus('ADMIN', 'ACTIVE', 1, 10);

      expect(repo.findAll).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({
          status: 'ACTIVE',
          roles: { some: { name: 'ADMIN', status: 'ACTIVE' } },
        }),
        { createdAt: 'desc' },
        expect.any(Object),
      );
      expect(resultado).toEqual(paginado);
    });
  });

  // ── getAllRoles ────────────────────────────────────────────────────────────

  describe('getAllRoles', () => {
    it('debe retornar roles activos mapeados como SimpleUserRole', async () => {
      prisma.userRole.findMany.mockResolvedValue([
        { id: 'r1', name: 'ADMIN', description: 'Administrador', status: 'ACTIVE' },
        { id: 'r2', name: 'EDITOR', description: null, status: 'ACTIVE' },
      ]);

      const resultado = await service.getAllRoles();

      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toEqual({ id: 'r1', name: 'ADMIN', description: 'Administrador', status: 'ACTIVE' });
      expect(resultado[1].description).toBeNull();
    });

    it('debe retornar arreglo vacío si no hay roles activos', async () => {
      prisma.userRole.findMany.mockResolvedValue([]);
      const resultado = await service.getAllRoles();
      expect(resultado).toEqual([]);
    });
  });
});

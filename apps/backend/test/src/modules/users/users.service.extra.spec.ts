/**
 * Pruebas adicionales — UsersService
 * Cubre las ramas sin cobertura:
 *  - getUserActiveRolesWithPermissions → usuario sin roles, con roles sin permisos, con permisos activos
 *  - mapRolesWithPermissions (privado) → vía getUserActiveRolesWithPermissions
 *  - meUpdateUser → wrapper sobre update
 */

import { Logger } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { UsersRepository } from '@modules/users/users.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PrismaService } from '@src/prisma/prisma.service';

const mockRepo = () => ({
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
  validate: jest.fn().mockImplementation(async (e) => e),
});

const mockPrisma = () => ({
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  userRole: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  userPermission: {
    findMany: jest.fn(),
  },
  refreshToken: { findMany: jest.fn(), deleteMany: jest.fn() },
  $transaction: jest.fn(),
});

describe('UsersService — cobertura adicional', () => {
  let service: UsersService;
  let prisma: ReturnType<typeof mockPrisma>;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(() => {
    repo = mockRepo();
    prisma = mockPrisma();
    service = new UsersService(
      repo as unknown as UsersRepository,
      mockDtoValidator() as unknown as DtoValidator,
      prisma as unknown as PrismaService,
    );
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});
    jest.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => {});
  });

  // ── getUserActiveRolesWithPermissions ─────────────────────────────────────

  describe('getUserActiveRolesWithPermissions', () => {
    it('debe retornar arreglo vacío si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const resultado = await service.getUserActiveRolesWithPermissions('no-existe');
      expect(resultado).toEqual([]);
    });

    it('debe retornar arreglo vacío si el usuario no tiene roles activos', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', roles: [] });
      const resultado = await service.getUserActiveRolesWithPermissions('u1');
      expect(resultado).toEqual([]);
    });

    it('debe retornar roles con permisos vacíos si los roles no tienen permissionIDs', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        roles: [{ id: 'r1', name: 'ADMIN', description: 'Admin', status: 'ACTIVE', permissions: [] }],
      });

      const resultado = await service.getUserActiveRolesWithPermissions('u1');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('r1');
      expect(resultado[0].permissions).toEqual([]);
    });

    it('debe retornar roles con permisos mapeados correctamente', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        roles: [{
          id: 'r1',
          name: 'EDITOR',
          description: 'Editor',
          status: 'ACTIVE',
          permissions: [{ permissionID: 'perm-1', permissions: 'READ', scope: 'GLOBAL', actions: [] }],
        }],
      });
      prisma.userPermission.findMany.mockResolvedValue([
        { id: 'perm-1', name: 'Leer documentos', code: 'DOCS_READ', status: 'ACTIVE' },
      ]);

      const resultado = await service.getUserActiveRolesWithPermissions('u1');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].permissions).toHaveLength(1);
      expect(resultado[0].permissions[0].code).toBe('DOCS_READ');
      expect(resultado[0].permissions[0].type).toBe('READ');
    });

    it('debe filtrar permisos que no están activos en el permissionMap', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        roles: [{
          id: 'r1', name: 'VIEWER', description: '', status: 'ACTIVE',
          permissions: [
            { permissionID: 'perm-activo', permissions: 'READ', scope: 'GLOBAL', actions: [] },
            { permissionID: 'perm-inactivo', permissions: 'DELETE', scope: 'GLOBAL', actions: [] },
          ],
        }],
      });
      // Solo perm-activo está en la BD de permisos activos
      prisma.userPermission.findMany.mockResolvedValue([
        { id: 'perm-activo', name: 'Leer', code: 'READ', status: 'ACTIVE' },
      ]);

      const resultado = await service.getUserActiveRolesWithPermissions('u1');

      expect(resultado[0].permissions).toHaveLength(1);
      expect(resultado[0].permissions[0].id).toBe('perm-activo');
    });
  });

  // ── meUpdateUser ──────────────────────────────────────────────────────────

  describe('meUpdateUser', () => {
    it('debe delegar a update con los mismos parámetros', async () => {
      const actualizado = { id: 'u1', fullName: 'Nuevo Nombre' };
      repo.update.mockResolvedValue(actualizado);

      const resultado = await service.meUpdateUser('u1', { fullName: 'Nuevo Nombre' });

      expect(repo.update).toHaveBeenCalledWith('u1', expect.objectContaining({ fullName: 'Nuevo Nombre' }));
      expect(resultado).toBeDefined();
    });
  });
});

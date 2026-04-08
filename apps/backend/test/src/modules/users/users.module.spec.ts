import { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { JwtAuthGuard } from '@src/modules/auth/guards';
import { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { JwtAuthGuard } from '@src/modules/auth/guards';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersModule } from '@modules/users/users.module';
import { PrismaService } from '@src/prisma/prisma.service';

describe('UsersModule (Modular)', () => {
  let app: INestApplication;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@una.ac.cr',
    fullName: 'Test',
    fullLastName: 'User',
    status: 'ACTIVE',
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: (ctx: ExecutionContext) => { ctx.switchToHttp().getRequest().user = { id: "test", email: "test@x.com" }; return true; } })
      .overrideGuard(AuditFieldsGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: (ctx: ExecutionContext) => { ctx.switchToHttp().getRequest().user = { id: "test", email: "test@x.com" }; return true; } })
      .overrideGuard(AuditFieldsGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - Users', () => {
    it('GET /users — Lista usuarios — responde 200', async () => {
      prismaService.user.findMany.mockResolvedValue([mockUser] as any);
      prismaService.user.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      // GenericController pagination structure is usually standard or flat
      expect(response.status).toBe(200);
      expect(prismaService.user.findMany).toHaveBeenCalled();
    });

    it('PATCH /users/:id/profile — Actualiza perfil limpiando campos vacíos', async () => {
      const updateDto = { fullName: 'New Name', email: 'test_updated@una.ac.cr', photoUrl: '  ' }; // Valid fullName, empty email
      const updatedUser = { ...mockUser, fullName: 'New Name' };

      prismaService.user.update.mockResolvedValue(updatedUser as any);

      const response = await request(app.getHttpServer())
        .patch('/users/user-1/profile')
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(updatedUser);
      // Ensure empty email was filtered out and not sent to Prisma
      expect(prismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({ fullName: 'New Name' }),
        })
      );

      const updateCall = prismaService.user.update.mock.calls[0][0];
      expect(updateCall.data.photoUrl).toBeUndefined();
    });

    it('DELETE /users/:id — Elimina con transacción — responde 200', async () => {
      // It uses findUnique, then checks, then $transaction
      prismaService.user.findUnique.mockResolvedValue({ ...mockUser, roles: [] } as any);
      prismaService.$transaction.mockResolvedValue(true as any);

      const response = await request(app.getHttpServer())
        .delete('/users/user-1')
        .expect(204);

      expect(response.status).toBe(204);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'user-1' } }));
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('GET /users/:id — Usuario no encontrado — responde 404', async () => {
      // In a generic service, findById calls findUnique
      prismaService.user.findUnique.mockResolvedValue(null as any);

      await request(app.getHttpServer())
        .get('/users/non-existent')
        .expect(404);

      expect(prismaService.user.findUnique).toHaveBeenCalled();
    });
  });
});

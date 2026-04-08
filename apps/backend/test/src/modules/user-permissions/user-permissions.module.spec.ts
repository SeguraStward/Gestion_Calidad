import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { UserPermissionsModule } from '@modules/user-permissions/user-permissions.module';
import { UserPermissionsRepository } from '@modules/user-permissions/user-permissions.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { Status } from '@una-gc/database/prisma/generated/client';

describe('UserPermissionsModule (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<UserPermissionsRepository>;

  const mockEntity = {
    id: 'test-id-1',
    name: 'Test Permission',
    status: Status.ACTIVE,
  };

  const mockRepository = {
    save: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockDtoValidator = {
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserPermissionsModule],
    })
      .overrideProvider(UserPermissionsRepository).useValue(mockRepository)
      .overrideProvider(DtoValidator).useValue(mockDtoValidator)
      .overrideProvider(PrismaService).useValue({})
      .overrideGuard(JwtAuthGuard).useValue({ 
        canActivate: (ctx: ExecutionContext) => { 
          ctx.switchToHttp().getRequest().user = { id: 'admin-1', email: 'admin@una.cr' }; 
          return true; 
        } 
      })
      .overrideGuard(AuditFieldsGuard).useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    repository = moduleFixture.get<UserPermissionsRepository>(UserPermissionsRepository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - UserPermissions', () => {
    it('POST /user-permissions — Crea registro — debe dar error 500 (metodo no permitido)', async () => {
      const createDto = { name: 'Test UserPermissions', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const response = await request(app.getHttpServer())
        .post('/user-permissions')
        .send(createDto);
        
      expect(response.status).toBe(500); 
    });

    it('GET /user-permissions — Lista registros — responde 200', async () => {
      repository.findAll.mockResolvedValue({ data: [mockEntity as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/user-permissions?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('GET /user-permissions/:id — Obtiene un registro — responde 200', async () => {
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .get('/user-permissions/test-id-1')
        .expect(200);

      expect(response.body.id).toBe('test-id-1');
    });

    it('PUT /user-permissions/:id — Actualiza registro — responde 204 o 200', async () => {
      const updateDto = { name: 'Updated' };
      repository.update.mockResolvedValue({ ...mockEntity, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/user-permissions/test-id-1')
        .send(updateDto);

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got ' + res.status);
    });

    it('DELETE /user-permissions/:id — Elimina registro — da error 500 (metodo no permitido)', async () => {
      const res = await request(app.getHttpServer())
        .delete('/user-permissions/test-id-1');

      expect(res.status).toBe(500);
    });

    it('PATCH /user-permissions/:id/switch-status — Cambia el estado - responde 200', async () => {
      repository.findById.mockResolvedValue(mockEntity as any);
      repository.update.mockResolvedValue({ ...mockEntity, status: Status.INACTIVE } as any);

      const res = await request(app.getHttpServer())
        .patch('/user-permissions/test-id-1/switch-status');

      expect(res.status).toBe(200);
    });
  });
});

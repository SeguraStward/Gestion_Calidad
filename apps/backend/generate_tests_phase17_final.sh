#!/bin/bash

# Array de módulos solicitados (con GenericController)
MODULES=(
  "standards"
  "question-groups"
)

for MODULE in "${MODULES[@]}"; do
  echo "Procesando $MODULE..."
  
  # Directorios
  MODULE_DIR="src/modules/$MODULE"
  TEST_DIR="test/src/modules/$MODULE"
  
  mkdir -p "$TEST_DIR"
  
  # Nombre de la clase (CamelCase)
  MODULE_CLASS=$(echo "$MODULE" | awk -F- '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1' OFS="")
  
  # 1. Boilerplate para .module.spec.ts
  if [ ! -f "$TEST_DIR/$MODULE.module.spec.ts" ]; then
    cat <<INNER_EOF > "$TEST_DIR/$MODULE.module.spec.ts"
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { ${MODULE_CLASS}Module } from '@modules/$MODULE/$MODULE.module';
import { ${MODULE_CLASS}Repository } from '@modules/$MODULE/$MODULE.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('${MODULE_CLASS}Module (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<${MODULE_CLASS}Repository>;

  const mockEntity = {
    id: 'test-id-1',
    name: 'Test ${MODULE_CLASS}',
    status: 'ACTIVE',
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
      imports: [${MODULE_CLASS}Module],
    })
      .overrideProvider(${MODULE_CLASS}Repository).useValue(mockRepository)
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

    repository = moduleFixture.get<${MODULE_CLASS}Repository>(${MODULE_CLASS}Repository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - ${MODULE_CLASS}', () => {
    it('POST /$MODULE — Crea registro — responde 201', async () => {
      const createDto = { name: 'Test ${MODULE_CLASS}' };
      repository.save.mockResolvedValue(mockEntity as any);
      repository.create.mockResolvedValue(mockEntity as any);
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .post('/$MODULE')
        .send(createDto);
        
      if (response.status !== 201) console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(repository.save.mock.calls.length > 0 || repository.create.mock.calls.length > 0).toBeTruthy();
    });

    it('GET /$MODULE — Lista registros — responde 200', async () => {
      repository.findAll.mockResolvedValue({ data: [mockEntity as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/$MODULE?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('GET /$MODULE/:id — Obtiene un registro — responde 200', async () => {
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .get('/$MODULE/test-id-1')
        .expect(200);

      expect(response.body.id).toBe('test-id-1');
    });

    it('PUT /$MODULE/:id — Actualiza registro — responde 204 o 200', async () => {
      const updateDto = { name: 'Updated' };
      repository.update.mockResolvedValue({ ...mockEntity, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/$MODULE/test-id-1')
        .send(updateDto);

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got ' + res.status);
    });

    it('DELETE /$MODULE/:id — Elimina registro — responde 200 o 204', async () => {
      repository.deleteById.mockResolvedValue(true);
      repository.delete.mockResolvedValue(true as any);
      repository.findById.mockResolvedValue(mockEntity as any);

      const res = await request(app.getHttpServer())
        .delete('/$MODULE/test-id-1');

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got ' + res.status);
    });
  });
});
INNER_EOF
    echo "  -> Creado $MODULE.module.spec.ts"
  fi
done

# === AUTH MODULE BOILERPLATE ===
echo "Procesando auth..."
mkdir -p test/src/modules/auth
if [ ! -f "test/src/modules/auth/auth.module.spec.ts" ]; then
    cat <<'INNER_EOF' > "test/src/modules/auth/auth.module.spec.ts"
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '@src/modules/auth/auth.module';
import { AuthService } from '@src/modules/auth/auth.service';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { PrismaService } from '@src/prisma/prisma.service';

describe('AuthModule (Modular)', () => {
  let app: INestApplication;
  let authService: jest.Mocked<Partial<AuthService>>;

  beforeAll(async () => {
    authService = {
      loginTokenApp: jest.fn(),
      getProfile: jest.fn(),
      logout: jest.fn(),
      setActiveRole: jest.fn(),
      refreshAuthCookies: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(AuthService).useValue(authService)
      .overrideProvider(PrismaService).useValue({})
      .overrideGuard(JwtAuthGuard).useValue({ 
        canActivate: (ctx: ExecutionContext) => { 
          const req = ctx.switchToHttp().getRequest();
          req.user = { id: 'test-user-1', email: 'test@una.cr', currentRole: { id: 'role-1' } }; 
          return true; 
        } 
      })
      .overrideGuard(PermissionsGuard).useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Autenticación y Sesión', () => {
    it('POST /auth/login — Deve validar credenciales (MOCK) responde 200', async () => {
      authService.loginTokenApp.mockResolvedValueOnce({
         user: { id: 'u1' } as any, accessToken: 'jwt', refreshToken: 'jwt-refresh', permissions: [] 
      });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ token: 'test-token-jwt' });
        
      expect(res.status).toBe(200);
      expect(authService.loginTokenApp).toHaveBeenCalled();
    });

    it('GET /auth/profile — Obtiene perfil de usuario actual — responde 200', async () => {
      authService.getProfile.mockResolvedValueOnce({ id: 'u1', email: 'a@una.cr' } as any);

      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(200);

      expect(authService.getProfile).toHaveBeenCalledWith('test-user-1');
    });

    it('POST /auth/logout — Cierra sesión — responde 200', async () => {
      authService.logout.mockResolvedValueOnce(undefined);

      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200);

      expect(authService.logout).toHaveBeenCalled();
      expect(res.headers['set-cookie'][0]).toMatch(/access_token=;/);
    });

    it('PATCH /auth/role — Cambia el rol activo del usuario — responde 200', async () => {
       authService.setActiveRole.mockResolvedValueOnce({ user: { id: 'u1' }, accessToken: 'x', refreshToken: 'y', permissions: [] } as any);

       await request(app.getHttpServer())
         .patch('/auth/role')
         .send({ roleId: 'new-role' })
         .expect(200);

       expect(authService.setActiveRole).toHaveBeenCalledWith('test-user-1', 'new-role');
    });
  });
});
INNER_EOF
    echo "  -> Creado auth.module.spec.ts"
fi

echo "Script completado!"

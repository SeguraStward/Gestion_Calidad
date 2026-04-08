#!/bin/bash

# Array de módulos 
MODULES=(
  "user-roles"
  "user-work-experiences"
  "user-languages"
  "user-permissions"
  "academic-backgrounds"
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

echo "Script completado!"

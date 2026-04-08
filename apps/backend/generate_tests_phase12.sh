#!/bin/bash

# Generador automático de Unit y Module Tests para catálogos Genéricos de NestJS.
MODULES=(
  "courses:Courses:courses:course-1"
  "course-reports:CourseReports:course-reports:course-report-1"
  "schedules:Schedules:schedules:schedule-1"
  "times:Times:times:time-1"
  "repitencias:Repitencias:repitencias:repitencia-1"
)

mkdir -p test/src/modules

for item in "${MODULES[@]}"; do
  IFS=":" read -r dirName className routeName mockId <<< "${item}"
  
  mkdir -p "test/src/modules/${dirName}"
  
  SERVICE_SPEC="test/src/modules/${dirName}/${dirName}.service.spec.ts"
  MODULE_SPEC="test/src/modules/${dirName}/${dirName}.module.spec.ts"

  # Create Service Spec
  cat << INNER_EOF > "$SERVICE_SPEC"
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ${className}Service } from '@modules/${dirName}/${dirName}.service';
import { ${className}Repository } from '@modules/${dirName}/${dirName}.repository';
import { DtoValidator } from '@core/common/dto-validator';

describe('${className}Service (Unitaria)', () => {
  let service: ${className}Service;
  let repository: jest.Mocked<${className}Repository>;

  const mockEntity = {
    id: '${mockId}',
    name: 'Test ${className}',
    status: 'ACTIVE',
  };

  const mockRepository = () => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    count: jest.fn(),
  });

  const mockDtoValidator = () => ({
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${className}Service,
        { provide: ${className}Repository, useFactory: mockRepository },
        { provide: DtoValidator, useFactory: mockDtoValidator },
      ],
    }).compile();

    service = module.get<${className}Service>(${className}Service);
    repository = module.get(${className}Repository);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('Debe consultar todos los registros', async () => {
      repository.findAll.mockResolvedValue({ data: [mockEntity as any], meta: { total: 1 } } as any);
      const result = await service.findAll(1, 10, {});
      expect(repository.findAll).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
    });
  });
});
INNER_EOF

  # Create Module Spec
  cat << INNER_EOF > "$MODULE_SPEC"
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { AuditFieldsGuard } from '@src/core/http/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

import { ${className}Module } from '@modules/${dirName}/${dirName}.module';
import { ${className}Repository } from '@modules/${dirName}/${dirName}.repository';

describe('${className}Module (Modular)', () => {
  let app: INestApplication;
  let repository: jest.Mocked<${className}Repository>;

  const mockEntity = {
    id: '${mockId}',
    name: 'Test ${className}',
    status: 'ACTIVE',
  };

  const mockRepository = {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    count: jest.fn(),
  };

  const mockDtoValidator = {
    validate: jest.fn().mockImplementation((payload, cls) => payload),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [${className}Module],
    })
      .overrideProvider(${className}Repository).useValue(mockRepository)
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

    repository = moduleFixture.get<${className}Repository>(${className}Repository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - ${className}', () => {
    it('POST /${routeName} — Crea registro — responde 201', async () => {
      const createDto = { name: 'Test ${className}' };
      repository.save.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .post('/${routeName}')
        .send(createDto);
        
      if (response.status !== 201) console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(repository.save).toHaveBeenCalled();
    });

    it('GET /${routeName} — Lista registros — responde 200', async () => {
      repository.findAll.mockResolvedValue({ data: [mockEntity as any], meta: { total: 1 } } as any);

      const response = await request(app.getHttpServer())
        .get('/${routeName}?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('GET /${routeName}/:id — Obtiene un registro — responde 200', async () => {
      repository.findById.mockResolvedValue(mockEntity as any);

      const response = await request(app.getHttpServer())
        .get('/${routeName}/${mockId}')
        .expect(200);

      expect(response.body.id).toBe('${mockId}');
    });

    it('PUT /${routeName}/:id — Actualiza registro — responde 204 o 200', async () => {
      const updateDto = { name: 'Updated' };
      repository.update.mockResolvedValue({ ...mockEntity, ...updateDto } as any);

      const res = await request(app.getHttpServer())
        .put('/${routeName}/${mockId}')
        .send(updateDto);

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204, got ' + res.status);
    });

    it('DELETE /${routeName}/:id — Elimina registro — responde 200 o 204', async () => {
      repository.deleteById.mockResolvedValue(true);
      repository.findById.mockResolvedValue(mockEntity as any);

      const res = await request(app.getHttpServer())
        .delete('/${routeName}/${mockId}');

      if (res.status !== 200 && res.status !== 204) throw new Error('Expected status 200 or 204');
    });
  });
});
INNER_EOF

  echo "Generados: ${dirName}"
done

echo "Terminado."

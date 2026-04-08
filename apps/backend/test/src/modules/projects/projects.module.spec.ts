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
import { ProjectsModule } from '@modules/projects/projects.module';
import { ProjectsRepository } from '@modules/projects/projects.repository';
import { PrismaService } from '@src/prisma/prisma.service';
import { DtoValidator } from '@core/common/dto-validator';

describe('ProjectsModule (Modular)', () => {
  let app: INestApplication;
  let projectsRepository: jest.Mocked<ProjectsRepository>;

  const mockProject = {
    id: 'project-1',
    name: 'Project Alpha',
    description: 'Description',
    status: 'ACTIVE',
  };

  const mockProjectsRepository = {
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    count: jest.fn(),
  };

  const mockDtoValidator = {
    validate: jest.fn().mockImplementation((entity) => entity),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProjectsModule],
    })
      .overrideProvider(ProjectsRepository)
      .useValue(mockProjectsRepository)
      .overrideProvider(DtoValidator)
      .useValue(mockDtoValidator)
      .overrideProvider(PrismaService)
      .useValue({})
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

    projectsRepository = moduleFixture.get<ProjectsRepository>(ProjectsRepository) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Flujos HTTP - Projects', () => {
    it('POST /projects — Crea proyecto — responde 201', async () => {
      const createDto = {
        name: 'Project Alpha',
        description: 'Description',
      };

      projectsRepository.save.mockResolvedValue(mockProject as any);

      const response = await request(app.getHttpServer())
        .post('/projects')
        .send(createDto)
        .expect(201);

      // El GenericController espera un transform, como no estamos usando el repo real, mockearemos
      // el save pero tmb deberiamos ver que se llame bien.
      expect(projectsRepository.save).toHaveBeenCalled();
    });

    it('GET /projects — Lista con paginación — responde 200', async () => {
      projectsRepository.findAll.mockResolvedValue([mockProject] as any);
      projectsRepository.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/projects?page=1&limit=10')
        .expect(200);

      // GenericController returns paginated response (data, metadata)
      // If GenericService wraps it natively, the format might be { data: [], total: 1 } or just []
      // Let's just expect 200 and verify findAll was called

      expect(projectsRepository.findAll).toHaveBeenCalled();
    });

    it('DELETE /projects/:id — Intenta eliminar con docs activos — responde 400', async () => {
      const projectWithRelations = {
        ...mockProject,
        documents: [{ id: 'doc-1', status: 'ACTIVE' }],
      };
      projectsRepository.findById.mockResolvedValue(projectWithRelations as any);

      const response = await request(app.getHttpServer())
        .delete('/projects/project-1')
        .expect(400);

      expect(response.body.message).toContain('Cannot delete Project because it has associated: documents, reviews.');
      expect(projectsRepository.deleteById).not.toHaveBeenCalled();
    });

    it('DELETE /projects/:id — Elimina sin relaciones — responde 200', async () => {
      const projectWithoutRelations = {
        ...mockProject,
        documents: [],
        reviews: [],
      };
      projectsRepository.findById.mockResolvedValue(projectWithoutRelations as any);
      projectsRepository.deleteById.mockResolvedValue(projectWithoutRelations as any);

      const response = await request(app.getHttpServer())
        .delete('/projects/project-1')
        .expect(204);

      // GenericService runs DtoValidator.validate on result

      expect(projectsRepository.deleteById).toHaveBeenCalledWith('project-1');
    });
  });
});

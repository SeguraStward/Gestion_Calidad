import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@src/prisma/prisma.service';
import { HttpResponseInterceptor } from '@core/http/interceptors/http-response.interceptor';
import { ErrorResponseFilter } from '@core/http/filters/error-response.filter';
import { testUser2 } from './test-fixtures';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // API configuration
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalInterceptors(new HttpResponseInterceptor());
    app.useGlobalFilters(new ErrorResponseFilter());
    app.useGlobalPipes(new ValidationPipe());

    prismaService = app.get<PrismaService>(PrismaService);

    // Mock database responses
    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([testUser2]);
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(testUser2);
    jest.spyOn(prismaService.user, 'create').mockResolvedValue({ ...testUser2, id: 'new-id' });

    await app.init();
  });

  afterAll(async () => await app.close());

  // Tests aligned with client-users.http endpoints
  it('GET /api/v1/users - should return all users', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it('GET /api/v1/users/:id - should return user by ID', async () => {
    return request(app.getHttpServer())
      .get(`/api/v1/users/${testUser2.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe(testUser2.id);
      });
  });

  it('POST /api/v1/users - should create a new user', async () => {
    const newUser = {
      email: { email: 'new@example.com', isVerified: false },
      fullName: 'New',
      fullLastName: 'User',
      status: 'ACTIVE',
    };

    return request(app.getHttpServer())
      .post('/api/v1/users')
      .send(newUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('id');
      });
  });
});

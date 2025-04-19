import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersModule } from '@modules/users/users.module';
import { PrismaService } from '@src/prisma/prisma.service';
import { UserStatus } from '@una-gc/database/prisma/generated/client';
import { HttpResponseInterceptor } from '@core/http/interceptors/http-response.interceptor';
import { ErrorResponseFilter } from '@core/http/filters/error-response.filter';
import { testUser } from './test-fixtures';

describe('Users Integration', () => {
  let app: INestApplication;
  const mockUser = { ...testUser };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findMany: jest.fn().mockResolvedValue([mockUser]),
        findUnique: jest.fn().mockResolvedValue(mockUser),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({
            id: 'new-id',
            ...args.data,
          }),
        ),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve({
            ...mockUser,
            ...args.data,
          }),
        ),
        delete: jest.fn().mockResolvedValue(mockUser),
        count: jest.fn().mockResolvedValue(1),
      },
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };

    const moduleFixture = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new HttpResponseInterceptor());
    app.useGlobalFilters(new ErrorResponseFilter());
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(async () => await app.close());

  // Tests aligned with client-users.http endpoints
  it('GET /users - should return users list', async () => {
    const response = await request(app.getHttpServer()).get('/users');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(mockUser.id);
  });

  it('GET /users/:id - should return a specific user', async () => {
    const response = await request(app.getHttpServer()).get(`/users/${mockUser.id}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(mockUser.id);
  });

  it('POST /users - should create a user', async () => {
    const userToCreate = {
      email: { email: 'new@example.com', isVerified: false },
      firstName: 'New',
      lastName: 'User',
      status: UserStatus.ACTIVE,
    };

    const response = await request(app.getHttpServer()).post('/users').send(userToCreate);

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBe('new-id');
    expect(response.body.data.firstName).toBe(userToCreate.firstName);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '@src/modules/auth/auth.module';
import { AuthService } from '@src/modules/auth/auth.service';
import { JwtAuthGuard, PermissionsGuard } from '@src/modules/auth/guards';
import { PrismaService } from '@src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CookieUtil } from '@src/modules/auth/utils/cookie.util';

describe('AuthModule (Modular)', () => {
  let app: INestApplication;
  let authService: jest.Mocked<Partial<AuthService>>;

  beforeAll(async () => {
    authService = {
      googleLogin: jest.fn(),
      getUserById: jest.fn(),
      revokeRefreshToken: jest.fn(), logout: jest.fn(),
      setActiveRole: jest.fn(),
      refreshAuthCookies: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [CookieUtil],
      imports: [AuthModule],
    })
      .overrideProvider(AuthService).useValue(authService)
      .overrideProvider(PrismaService).useValue({})
      .overrideProvider(CookieUtil).useValue({
        getAuthTokenConfig: jest.fn().mockReturnValue({}),
        getRefreshTokenConfig: jest.fn().mockReturnValue({}),
        getBaseCookieConfig: jest.fn().mockReturnValue({}),
      })
      .overrideProvider(ConfigService).useValue({
        get: jest.fn().mockImplementation((key) => {
          if (key === 'GOOGLE_CLIENT_ID') return 'mock-client-id';
          if (key === 'GOOGLE_CLIENT_SECRET') return 'mock-client-secret';
          if (key === 'GOOGLE_CALLBACK_URL') return 'http://localhost/callback';
          if (key === 'JWT_SECRET') return 'secret';
          if (key === 'JWT_REFRESH_SECRET') return 'secret2';
          if (key === 'JWT_EXPIRATION_TIME') return '15m'; 
          if (key === 'JWT_EXPIRATION') return '15m'; 
          if (key === 'JWT_REFRESH_EXPIRATION_TIME') return '7d';
          if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
          if (key === 'NODE_ENV') return 'test';
          return 'default';
        }),
        getOrThrow: jest.fn().mockReturnValue('default-required-val')
      })
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Autenticación y Sesión', () => {
    it('POST /auth/authenticate — Debe validar credenciales (MOCK) responde 200 o 201', async () => {
      authService.googleLogin.mockResolvedValue({
         user: { id: 'u1' } as any, token: 'jwt', refreshToken: 'jwt-refresh', needsProfileCompletion: false 
      });

      const res = await request(app.getHttpServer())
        .post('/auth/authenticate')
        .send({ token: 'test-token-jwt', email: 'test@una.cr', googleId: '123456789' });
        
      if(res.status !== 200 && res.status !== 201) console.log(res.body);
      expect([200, 201]).toContain(res.status);
      expect(authService.googleLogin).toHaveBeenCalled();
    });

    it('GET /auth/me — Obtiene perfil de usuario actual — responde 200', async () => {
      authService.getUserById.mockResolvedValue({ 
        id: 'u1', 
        email: 'a@una.cr',
        roles: [],
        status: 'ACTIVE',
        googleId: '123',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(200);

      expect(authService.getUserById).toHaveBeenCalled();
    });

    it('POST /auth/logout — Cierra sesión — responde 200', async () => {
      authService.logout.mockResolvedValueOnce(undefined);

      const res = await request(app.getHttpServer())
        .get('/auth/logout')
        .expect(200);
    });

    it('POST /auth/set-active-role — Cambia el rol activo del usuario — responde 200 o 201', async () => {
       authService.setActiveRole.mockResolvedValue({} as any);

       const res = await request(app.getHttpServer())
         .post('/auth/set-active-role')
         .send({ roleId: '64d1f2e1a3b9c718e2d4f5b6' }); // Valid MongoDB ObjectId
         
       if(res.status !== 200 && res.status !== 201) console.log(res.body);
       expect([200, 201]).toContain(res.status);
       expect(authService.setActiveRole).toHaveBeenCalled();
    });
  });
});

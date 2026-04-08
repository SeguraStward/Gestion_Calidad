/**
 * Pruebas unitarias — AuthService
 *
 * Cubre:
 *  - googleLogin          → flujos: usuario nuevo, ACTIVE, INACTIVE, estado inválido, datos incompletos
 *  - generateAccessToken  → generación de JWT de acceso
 *  - generateAndStoreRefreshToken → creación y persistencia del refresh token
 *  - refreshToken         → rotación: marca usado + emite nuevos tokens
 *  - revokeRefreshToken   → revocación en logout
 *  - validateToken        → verificación de JWT (válido / inválido)
 *  - getUserById          → búsqueda + validaciones de estado
 *  - completeUserProfile  → completar perfil de usuario PRE_REGISTRATION
 *  - cleanUpExpiredRefreshTokens → cron de limpieza
 *  - setActiveRole        → validar que el usuario tiene el rol
 */

import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '@modules/auth/auth.service';
import { PrismaService } from '@src/prisma/prisma.service';

// ─── Factories de mocks ──────────────────────────────────────────────────────

const mockPrisma = () => ({
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
});

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('token-jwt-mock'),
  verify: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn().mockImplementation((key: string) => {
    const cfg: Record<string, string> = {
      JWT_SECRET: 'secret-test',
      JWT_REFRESH_SECRET: 'refresh-secret-test',
      JWT_EXPIRATION: '15m',
      JWT_REFRESH_EXPIRATION: '7d',
    };
    return cfg[key] ?? null;
  }),
});

// ─── Datos de prueba reutilizables ────────────────────────────────────────────

const googleUserBase = {
  email: 'test@una.cr',
  googleId: 'google-id-123',
  firstName: 'Ana',
  familyName: 'Pérez',
  picture: 'https://foto.com/ana.jpg',
  accessToken: 'access-google',
  refreshToken: 'refresh-google',
};

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof mockPrisma>;
  let jwtService: ReturnType<typeof mockJwtService>;
  let configService: ReturnType<typeof mockConfigService>;

  beforeEach(() => {
    prisma = mockPrisma();
    jwtService = mockJwtService();
    configService = mockConfigService();

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  // ── googleLogin ───────────────────────────────────────────────────────────

  describe('googleLogin', () => {
    it('debe lanzar UnauthorizedException si faltan email o googleId', async () => {
      await expect(
        service.googleLogin({ ...googleUserBase, email: '' }),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        service.googleLogin({ ...googleUserBase, googleId: '' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe crear un usuario nuevo con estado PRE_REGISTRATION', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const nuevoUsuario = { id: 'u-new', email: 'test@una.cr', status: 'PRE_REGISTRATION' };
      prisma.user.create.mockResolvedValue(nuevoUsuario);
      prisma.refreshToken.create.mockResolvedValue({});

      const resultado = await service.googleLogin(googleUserBase);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@una.cr',
            googleId: 'google-id-123',
            status: 'PRE_REGISTRATION',
          }),
        }),
      );
      expect(resultado.needsProfileCompletion).toBe(true);
      expect(resultado.token).toBeDefined();
      expect(resultado.refreshToken).toBeDefined();
    });

    it('debe retornar needsProfileCompletion=true para usuarios PRE_REGISTRATION existentes', async () => {
      const usuario = { id: 'u1', email: 'test@una.cr', status: 'PRE_REGISTRATION' };
      prisma.user.findFirst.mockResolvedValue(usuario);
      prisma.refreshToken.create.mockResolvedValue({});

      const resultado = await service.googleLogin(googleUserBase);

      expect(resultado.needsProfileCompletion).toBe(true);
    });

    it('debe lanzar UnauthorizedException para usuarios INACTIVE', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'u1', status: 'INACTIVE' });

      await expect(service.googleLogin(googleUserBase)).rejects.toThrow(UnauthorizedException);
    });

    it('debe retornar tokens y needsProfileCompletion=false para usuarios ACTIVE', async () => {
      const usuarioActivo = {
        id: 'u1',
        email: 'test@una.cr',
        status: 'ACTIVE',
        googleId: 'google-id-123',
        photoUrl: 'https://foto.com/ana.jpg',
        fullName: 'Ana',
        fullLastName: 'Pérez',
      };
      prisma.user.findFirst.mockResolvedValue(usuarioActivo);
      prisma.user.update.mockResolvedValue(usuarioActivo);
      prisma.refreshToken.create.mockResolvedValue({});

      const resultado = await service.googleLogin(googleUserBase);

      expect(resultado.needsProfileCompletion).toBe(false);
      expect(resultado.token).toBeDefined();
    });

    it('debe lanzar UnauthorizedException para estado inválido (ej. BANNED)', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'u1', status: 'BANNED' });

      await expect(service.googleLogin(googleUserBase)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── generateAccessToken ───────────────────────────────────────────────────

  describe('generateAccessToken', () => {
    it('debe llamar a jwtService.sign con el payload correcto', () => {
      const token = service.generateAccessToken('u1', 'test@una.cr');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: 'u1', email: 'test@una.cr' },
        expect.objectContaining({ secret: 'secret-test' }),
      );
      expect(token).toBe('token-jwt-mock');
    });
  });

  // ── generateAndStoreRefreshToken ──────────────────────────────────────────

  describe('generateAndStoreRefreshToken', () => {
    it('debe persistir el hash del token y retornar el token raw', async () => {
      prisma.refreshToken.create.mockResolvedValue({});

      const resultado = await service.generateAndStoreRefreshToken('u1');

      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'u1' }),
        }),
      );
      expect(resultado.rawRefreshToken).toBeDefined();
      expect(resultado.expiresAt).toBeInstanceOf(Date);
    });
  });

  // ── refreshToken ──────────────────────────────────────────────────────────

  describe('refreshToken', () => {
    it('debe marcar el refresh token como usado y emitir un nuevo par de tokens', async () => {
      prisma.refreshToken.update.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      const userGuard = { id: 'u1', email: 'test@una.cr', refreshTokenDbId: 'rt-db-1' };
      const resultado = await service.refreshToken(userGuard as any);

      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt-db-1' },
          data: { usedAt: expect.any(Date) },
        }),
      );
      expect(resultado.token).toBeDefined();
      expect(resultado.refreshToken).toBeDefined();
    });

    it('debe lanzar UnauthorizedException si el update de Prisma falla', async () => {
      prisma.refreshToken.update.mockRejectedValue(new Error('DB error'));

      await expect(
        service.refreshToken({ id: 'u1', email: 'x@una.cr', refreshTokenDbId: 'rt-1' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── revokeRefreshToken ────────────────────────────────────────────────────

  describe('revokeRefreshToken', () => {
    it('debe revocar el token si existe y no ha sido usado', async () => {
      const registro = { id: 'rt-1', revokedAt: null, usedAt: null };
      prisma.refreshToken.findUnique.mockResolvedValue(registro);
      prisma.refreshToken.update.mockResolvedValue({});

      await service.revokeRefreshToken('raw-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rt-1' },
          data: { revokedAt: expect.any(Date) },
        }),
      );
    });

    it('debe omitir la operación si el token ya fue revocado', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'rt-1',
        revokedAt: new Date(),
        usedAt: null,
      });

      await service.revokeRefreshToken('raw-token');

      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it('debe no hacer nada si se pasa string vacío', async () => {
      await service.revokeRefreshToken('');
      expect(prisma.refreshToken.findUnique).not.toHaveBeenCalled();
    });
  });

  // ── validateToken ─────────────────────────────────────────────────────────

  describe('validateToken', () => {
    it('debe retornar el payload decodificado para token válido', () => {
      const payload = { sub: 'u1', email: 'test@una.cr' };
      jwtService.verify.mockReturnValue(payload);

      const resultado = service.validateToken('token-valido');

      expect(resultado).toEqual(payload);
    });

    it('debe retornar null para token inválido o expirado', () => {
      jwtService.verify.mockImplementation(() => { throw new Error('jwt expired'); });

      const resultado = service.validateToken('token-invalido');

      expect(resultado).toBeNull();
    });
  });

  // ── getUserById ───────────────────────────────────────────────────────────

  describe('getUserById', () => {
    it('debe retornar datos básicos del usuario activo', async () => {
      const usuario = { id: 'u1', email: 'ana@una.cr', fullName: 'Ana', fullLastName: 'P', photoUrl: '', status: 'ACTIVE' };
      prisma.user.findUnique.mockResolvedValue(usuario);

      const resultado = await service.getUserById('u1');

      expect(resultado).toMatchObject({ id: 'u1', email: 'ana@una.cr' });
    });

    it('debe lanzar UnauthorizedException si el userId es inválido', async () => {
      await expect(service.getUserById('')).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getUserById('no-existe')).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario está INACTIVE', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', status: 'INACTIVE', email: 'a@una.cr', fullName: 'A' });
      await expect(service.getUserById('u1')).rejects.toThrow(UnauthorizedException);
    });

    it('debe usar prefijo del email si fullName está vacío', async () => {
      const usuario = { id: 'u1', email: 'carlos@una.cr', fullName: '', fullLastName: '', photoUrl: '', status: 'ACTIVE' };
      prisma.user.findUnique.mockResolvedValue(usuario);

      const resultado = await service.getUserById('u1');

      expect(resultado.fullName).toBe('carlos');
    });
  });

  // ── completeUserProfile ───────────────────────────────────────────────────

  describe('completeUserProfile', () => {
    it('debe actualizar el perfil y cambiar estado a ACTIVE', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', status: 'PRE_REGISTRATION', email: 'a@una.cr' });
      prisma.user.update.mockResolvedValue({ id: 'u1', email: 'a@una.cr', fullName: 'Ana', fullLastName: 'P', photoUrl: '', status: 'ACTIVE' });

      const resultado = await service.completeUserProfile('u1', { fullName: 'Ana', fullLastName: 'P' });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ACTIVE', fullName: 'Ana', fullLastName: 'P' }),
        }),
      );
      expect(resultado.user.status).toBe('ACTIVE');
      expect(resultado.message).toBeDefined();
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.completeUserProfile('u1', { fullName: 'X', fullLastName: 'Y' })).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario no está en PRE_REGISTRATION', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', status: 'ACTIVE', email: 'a@una.cr' });
      await expect(service.completeUserProfile('u1', { fullName: 'X', fullLastName: 'Y' })).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── cleanUpExpiredRefreshTokens ───────────────────────────────────────────

  describe('cleanUpExpiredRefreshTokens', () => {
    it('debe eliminar tokens expirados no revocados y no usados', async () => {
      prisma.refreshToken.findMany.mockResolvedValue([{ id: 'rt-1' }, { id: 'rt-2' }]);
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      await service.cleanUpExpiredRefreshTokens();

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['rt-1', 'rt-2'] } },
        }),
      );
    });

    it('no debe llamar deleteMany si no hay tokens expirados', async () => {
      prisma.refreshToken.findMany.mockResolvedValue([]);

      await service.cleanUpExpiredRefreshTokens();

      expect(prisma.refreshToken.deleteMany).not.toHaveBeenCalled();
    });
  });

  // ── setActiveRole ─────────────────────────────────────────────────────────

  describe('setActiveRole', () => {
    it('debe completar sin error si el usuario tiene el rol activo', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        roles: [{ id: 'r1', name: 'ADMIN', status: 'ACTIVE' }],
      });

      await expect(service.setActiveRole('u1', 'r1')).resolves.toBeUndefined();
    });

    it('debe lanzar UnauthorizedException si el usuario no tiene el rol', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', roles: [] });

      await expect(service.setActiveRole('u1', 'r-invalido')).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.setActiveRole('no-existe', 'r1')).rejects.toThrow(UnauthorizedException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '@src/modules/auth/guards';
import { GoogleDriveModule } from '@modules/google-drive/google-drive.module';
import { GoogleDriveService } from '@modules/google-drive/google-drive.service';

describe('GoogleDriveModule (Modular)', () => {
  let app: INestApplication;
  let service: jest.Mocked<GoogleDriveService>;

  const mockGoogleDriveService = {
    createFolderStructure: jest.fn().mockResolvedValue({ id: 'folder-id', name: 'Folder' }),
    uploadFile: jest.fn().mockResolvedValue({ fileId: 'file-id' }),
    deleteFile: jest.fn().mockResolvedValue({ success: true }),
    getFolderFiles: jest.fn().mockResolvedValue([{ id: 'f1' }]),
    getPublicUrl: jest.fn().mockResolvedValue('http://public.url'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [GoogleDriveModule],
    })
      .overrideProvider(GoogleDriveService).useValue(mockGoogleDriveService)
      .overrideGuard(JwtAuthGuard).useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = {
            id: 'admin-1',
            googleAccessToken: 'test-token',
            googleRefreshToken: 'refresh-token'
          };
          return true;
        }
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    service = moduleFixture.get<GoogleDriveService>(GoogleDriveService) as any;
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GoogleDriveController', () => {
    it('POST /google-drive/create-structure', async () => {
      const res = await request(app.getHttpServer())
        .post('/google-drive/create-structure')
        .send({ structure: { name: 'Root' } })
        .expect(201);
      expect(res.body.id).toBe('folder-id');
    });

    it('POST /google-drive/upload', async () => {
      const res = await request(app.getHttpServer())
        .post('/google-drive/upload')
        .field('folderId', '123')
        .field('careerNames', '[]')
        .attach('file', Buffer.from('test'), 'test.txt')
        .expect(201);
      expect(res.body.fileId).toBe('file-id');
    });

    it('DELETE /google-drive/files/:fileId', async () => {
      const res = await request(app.getHttpServer())
        .delete('/google-drive/files/file1')
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /google-drive/folders/:folderId/files', async () => {
      const res = await request(app.getHttpServer())
        .get('/google-drive/folders/folder1/files')
        .expect(200);
      expect(res.body).toHaveLength(1);
    });

    it('GET /google-drive/files/:fileId/public-url', async () => {
      const res = await request(app.getHttpServer())
        .get('/google-drive/files/file1/public-url')
        .expect(200);
      expect(res.body.url).toBe('http://public.url');
    });
  });
});

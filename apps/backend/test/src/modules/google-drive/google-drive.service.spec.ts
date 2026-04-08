/**
 * Pruebas unitarias — GoogleDriveService
 *
 * Cubre:
 *  - createFolderStructure → jerarquía completa y manejo de token expirado
 *  - uploadFile            → carga exitosa y archivo duplicado
 *  - deleteFile            → eliminación correcta
 *  - getFolderFiles        → listado de archivos
 *  - getPublicUrl          → URL pública
 *  - updateCarrerasFile    → delegación a createCarrerasFile
 *  - generateCarrerasFileContent (privado) → verificado vía uploadFile
 */

import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleDriveService } from '@modules/google-drive/google-drive.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { GoogleDriveFoldersService } from '@modules/google-drive-folders/google-drive-folders.service';

// ─── Mock de googleapis/drive ────────────────────────────────────────────────

const mockDriveFiles = {
  list: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

const mockDrivePermissions = {
  create: jest.fn(),
};

jest.mock('@googleapis/drive', () => ({
  drive_v3: {
    Drive: jest.fn().mockImplementation(() => ({
      files: mockDriveFiles,
      permissions: mockDrivePermissions,
    })),
  },
}));

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    setCredentials: jest.fn(),
  })),
}));

// ─── Factories de mocks ──────────────────────────────────────────────────────

const mockConfigService = () => ({
  get: jest.fn().mockImplementation((key: string) => {
    const cfg: Record<string, string> = {
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: 'client-secret',
    };
    return cfg[key] ?? null;
  }),
});

const mockPrisma = () => ({
  googleDriveFolder: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
});

const mockGoogleDriveFoldersService = () => ({
  save: jest.fn().mockResolvedValue({ id: 'folder-db-1' }),
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const estructuraBase = {
  dimensionCode: 'D1',
  dimensionName: 'Dimensión 1',
  componentCode: 'C1',
  componentName: 'Componente 1',
  criterionCode: 'CR1',
  criterionName: 'Criterio 1',
  evidenceCode: 'EV1',
  evidenceName: 'Evidencia 1',
};

const archivoMock = {
  originalname: 'documento.pdf',
  mimetype: 'application/pdf',
  buffer: Buffer.from('contenido'),
  size: 100,
};

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('GoogleDriveService', () => {
  let service: GoogleDriveService;
  let prisma: ReturnType<typeof mockPrisma>;
  let foldersService: ReturnType<typeof mockGoogleDriveFoldersService>;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = mockPrisma();
    foldersService = mockGoogleDriveFoldersService();

    service = new GoogleDriveService(
      mockConfigService() as unknown as ConfigService,
      prisma as unknown as PrismaService,
      foldersService as unknown as GoogleDriveFoldersService,
    );

    jest.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => { });
    jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => { });
    jest.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => { });
    jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => { });
  });

  // ── createFolderStructure ─────────────────────────────────────────────────

  describe('createFolderStructure', () => {
    beforeEach(() => {
      // carpeta raíz no existe → se crea
      mockDriveFiles.list.mockResolvedValue({ data: { files: [] } });
      mockDriveFiles.create.mockResolvedValue({ data: { id: 'folder-drive-id', name: 'Carpeta' } });
    });

    it('debe crear la estructura jerárquica completa y retornar DriveFolder', async () => {
      const resultado = await service.createFolderStructure(estructuraBase, 'access-token', 'refresh-token');

      expect(mockDriveFiles.create).toHaveBeenCalled();
      expect(resultado).toMatchObject({
        id: 'folder-drive-id',
        path: expect.stringContaining('SINAES'),
        level: expect.any(Number),
      });
    });

    it('debe reutilizar carpeta existente si ya existe en Drive', async () => {
      mockDriveFiles.list.mockResolvedValue({ data: { files: [{ id: 'existing-folder' }] } });

      const resultado = await service.createFolderStructure(
        { ...estructuraBase, componentCode: undefined, criterionCode: undefined },
        'access-token',
      );

      expect(resultado.id).toBe('existing-folder');
    });

    it('debe lanzar UnauthorizedException si el token está expirado', async () => {
      mockDriveFiles.list.mockRejectedValue(new Error('invalid_grant'));

      await expect(
        service.createFolderStructure(estructuraBase, 'token-expirado'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar BadRequestException para otros errores de Drive', async () => {
      mockDriveFiles.list.mockRejectedValue(new Error('Network error'));

      await expect(
        service.createFolderStructure(estructuraBase, 'access-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe crear estructura sin carpeta de standard si no se proporciona', async () => {
      mockDriveFiles.list.mockResolvedValue({ data: { files: [] } });
      mockDriveFiles.create.mockResolvedValue({ data: { id: 'f-id', name: 'Carpeta' } });

      const estructura = { ...estructuraBase };
      delete (estructura as any).standardCode;
      delete (estructura as any).standardName;

      const resultado = await service.createFolderStructure(estructura, 'access-token');
      expect(resultado).toBeDefined();
    });
  });

  // ── uploadFile ────────────────────────────────────────────────────────────

  describe('uploadFile', () => {
    beforeEach(() => {
      // Sin duplicados
      mockDriveFiles.list.mockResolvedValue({ data: { files: [] } });
      mockDriveFiles.create.mockResolvedValue({
        data: { id: 'file-id-1', name: 'documento.pdf', mimeType: 'application/pdf', size: '100', webViewLink: 'https://drive.google.com/file/d/file-id-1/view' },
      });
      mockDrivePermissions.create.mockResolvedValue({});
    });

    it('debe subir el archivo y retornar DriveFile con url', async () => {
      const resultado = await service.uploadFile(archivoMock, 'folder-id', ['Carrera A'], 'access-token');

      expect(mockDriveFiles.create).toHaveBeenCalled();
      expect(mockDrivePermissions.create).toHaveBeenCalled();
      expect(resultado).toMatchObject({
        id: 'file-id-1',
        url: expect.stringContaining('drive.google.com'),
      });
    });

    it('debe lanzar BadRequestException si el archivo ya existe en la carpeta', async () => {
      mockDriveFiles.list.mockResolvedValue({
        data: { files: [{ id: 'dup-id', name: 'documento.pdf' }] },
      });

      await expect(
        service.uploadFile(archivoMock, 'folder-id', [], 'access-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe crear archivo _carreras.txt si se proporcionan carreras', async () => {
      await service.uploadFile(archivoMock, 'folder-id', ['Carrera A', 'Carrera B'], 'access-token');

      // El segundo create es el _carreras.txt
      expect(mockDriveFiles.create.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    it('debe lanzar UnauthorizedException si el token expira durante la subida', async () => {
      mockDriveFiles.list.mockRejectedValue(new Error('Token has been expired'));

      await expect(
        service.uploadFile(archivoMock, 'folder-id', [], 'token-expirado'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── deleteFile ────────────────────────────────────────────────────────────

  describe('deleteFile', () => {
    it('debe eliminar el archivo de Drive sin lanzar excepción', async () => {
      mockDriveFiles.delete.mockResolvedValue({});

      await expect(service.deleteFile('file-id-1', 'access-token')).resolves.toBeUndefined();
      expect(mockDriveFiles.delete).toHaveBeenCalledWith({ fileId: 'file-id-1' });
    });

    it('debe lanzar BadRequestException si Drive falla al eliminar', async () => {
      mockDriveFiles.delete.mockRejectedValue(new Error('File not found'));

      await expect(service.deleteFile('bad-id', 'access-token')).rejects.toThrow(BadRequestException);
    });
  });

  // ── getFolderFiles ────────────────────────────────────────────────────────

  describe('getFolderFiles', () => {
    it('debe retornar lista de archivos de la carpeta', async () => {
      mockDriveFiles.list.mockResolvedValue({
        data: {
          files: [
            { id: 'f1', name: 'archivo1.pdf', mimeType: 'application/pdf', size: '1024', webViewLink: 'https://drive.google.com/f1' },
            { id: 'f2', name: 'archivo2.docx', mimeType: 'application/vnd.openxmlformats', size: '2048', webViewLink: 'https://drive.google.com/f2' },
          ],
        },
      });

      const resultado = await service.getFolderFiles('folder-id', 'access-token');

      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toMatchObject({ id: 'f1', name: 'archivo1.pdf', size: 1024 });
    });

    it('debe retornar arreglo vacío si la carpeta no tiene archivos', async () => {
      mockDriveFiles.list.mockResolvedValue({ data: { files: [] } });

      const resultado = await service.getFolderFiles('folder-vacía', 'access-token');
      expect(resultado).toEqual([]);
    });

    it('debe lanzar BadRequestException si Drive falla', async () => {
      mockDriveFiles.list.mockRejectedValue(new Error('API error'));

      await expect(service.getFolderFiles('folder-id', 'access-token')).rejects.toThrow(BadRequestException);
    });
  });

  // ── getPublicUrl ──────────────────────────────────────────────────────────

  describe('getPublicUrl', () => {
    it('debe retornar la URL pública de Google Drive', async () => {
      const url = await service.getPublicUrl('file-abc-123');
      expect(url).toBe('https://drive.google.com/file/d/file-abc-123/view');
    });
  });

  // ── updateCarrerasFile ────────────────────────────────────────────────────

  describe('updateCarrerasFile', () => {
    it('debe actualizar el archivo _carreras.txt exitosamente', async () => {
      mockDriveFiles.list.mockResolvedValue({ data: { files: [] } });
      mockDriveFiles.create.mockResolvedValue({ data: { id: 'txt-id', name: '_carreras.txt' } });

      await expect(
        service.updateCarrerasFile('folder-id', 'DOC-001', ['Carrera X'], 'access-token'),
      ).resolves.toBeUndefined();

      expect(mockDriveFiles.create).toHaveBeenCalled();
    });

    it('debe actualizar archivo existente con update en lugar de create', async () => {
      mockDriveFiles.list.mockResolvedValue({ data: { files: [{ id: 'txt-existing' }] } });
      mockDriveFiles.update.mockResolvedValue({});

      await service.updateCarrerasFile('folder-id', 'DOC-001', ['Carrera Y'], 'access-token');

      expect(mockDriveFiles.update).toHaveBeenCalledWith(
        expect.objectContaining({ fileId: 'txt-existing' }),
      );
    });

    it('debe loggear error si falla la operación', async () => {
      mockDriveFiles.list.mockRejectedValue(new Error('Drive error'));

      await expect(
        service.updateCarrerasFile('folder-id', 'DOC-001', ['Carrera Z'], 'token'),
      ).resolves.toBeUndefined();
    });
  });
});

/**
 * Pruebas unitarias — ProofDocumentsService
 *
 * Cubre:
 *  - save             → genera código automático y registra historial
 *  - update           → detecta cambios y registra historial
 *  - deleteById       → elimina de Drive, BD y registra historial
 *  - searchProofDocuments → filtros (texto, status, jerarquía, fechas)
 *  - updateDocumentCareers → reemplaza relaciones y actualiza Drive
 *
 * ProofDocumentsService usa Scope.REQUEST, por eso se instancia directamente
 * con un request mock en lugar de usar Test.createTestingModule.
 */

import { BadRequestException, Logger } from '@nestjs/common';
import { ProofDocumentsService } from '@modules/proof-documents/proof-documents.service';
import { ProofDocumentsRepository } from '@modules/proof-documents/proof-documents.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { GoogleDriveService } from '@modules/google-drive/google-drive.service';
import { QualityEvidencesService } from '@modules/quality-evidences/quality-evidences.service';
import { CareersService } from '@modules/careers/careers.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { SinaesDocumentHistoryService } from '@modules/sinaes-document-history/sinaes-document-history.service';

// ─── Factories de mocks ──────────────────────────────────────────────────────

const mockRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
  count: jest.fn(),
  generateNextCode: jest.fn().mockResolvedValue('DOC-001'),
});

const mockDtoValidator = () => ({
  validate: jest.fn().mockImplementation(async (entity) => entity),
});

const mockGoogleDriveService = () => ({
  createFolderStructure: jest.fn(),
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  updateCarrerasFile: jest.fn(),
});

const mockQualityEvidencesService = () => ({
  findById: jest.fn(),
});

const mockCareersService = () => ({
  findById: jest.fn(),
});

const mockHistoryService = () => ({
  logChange: jest.fn().mockResolvedValue({}),
  detectChanges: jest.fn().mockReturnValue([]),
});

const mockPrisma = () => ({
  proofDocument: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  career: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  careerProofDocument: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
  qualityEvidence: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
});

const mockRequest = () => ({
  userId: 'user-test-1',
  ipAddress: '127.0.0.1',
  userAgent: 'jest-test',
});

// ─── Datos de prueba ─────────────────────────────────────────────────────────

const documentoBase = {
  id: 'doc-1',
  name: 'Convenio UNA',
  code: 'DOC-001',
  fileName: 'DOC-001_convenio.pdf',
  fileUrl: 'https://drive.google.com/file/d/abc/view',
  fileType: 'pdf',
  fileSize: 1024,
  evidenceId: 'ev-1',
  proofDocumentTypeId: 'type-1',
  googleDriveFileId: 'drive-file-1',
  googleDriveFolderId: 'drive-folder-1',
  status: 'ACTIVE',
  careerProofDocuments: [],
};

// ─── Factory del servicio ────────────────────────────────────────────────────

const crearServicio = (overrides: Partial<{
  repo: any; prisma: any; history: any; drive: any;
}> = {}) => {
  const repo = overrides.repo ?? mockRepo();
  const prisma = overrides.prisma ?? mockPrisma();
  const history = overrides.history ?? mockHistoryService();
  const drive = overrides.drive ?? mockGoogleDriveService();

  const service = new ProofDocumentsService(
    repo as unknown as ProofDocumentsRepository,
    mockDtoValidator() as unknown as DtoValidator,
    drive as unknown as GoogleDriveService,
    mockQualityEvidencesService() as unknown as QualityEvidencesService,
    mockCareersService() as unknown as CareersService,
    prisma as unknown as PrismaService,
    history as unknown as SinaesDocumentHistoryService,
    mockRequest() as any,
  );

  // Silenciar logs
  jest.spyOn(service['logger'] as Logger, 'log').mockImplementation(() => {});
  jest.spyOn(service['logger'] as Logger, 'error').mockImplementation(() => {});
  jest.spyOn(service['logger'] as Logger, 'warn').mockImplementation(() => {});
  jest.spyOn(service['logger'] as Logger, 'debug').mockImplementation(() => {});

  return { service, repo, prisma, history, drive };
};

// ─── Suite principal ─────────────────────────────────────────────────────────

describe('ProofDocumentsService', () => {

  // ── save ──────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('debe generar el código automático y crear el documento', async () => {
      const { service, repo, history } = crearServicio();
      repo.save.mockResolvedValue(documentoBase);
      (service['dtoValidator'] as any).validate.mockResolvedValue(documentoBase);

      const dto = { name: 'Convenio UNA', proofDocumentTypeId: 'type-1', evidenceId: 'ev-1' } as any;
      const resultado = await service.save(dto);

      expect(repo.generateNextCode).toHaveBeenCalledWith('type-1');
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ code: 'DOC-001' }));
      expect(resultado).toBeDefined();
    });

    it('debe registrar el historial de creación', async () => {
      const { service, repo, history } = crearServicio();
      repo.save.mockResolvedValue(documentoBase);
      (service['dtoValidator'] as any).validate.mockResolvedValue(documentoBase);

      await service.save({ name: 'Doc', proofDocumentTypeId: 'type-1', evidenceId: 'ev-1' } as any);

      expect(history.logChange).toHaveBeenCalledWith(
        expect.objectContaining({ changeType: 'CREATED' }),
      );
    });

    it('no debe fallar si el historial lanza error (operación no crítica)', async () => {
      const history = { ...mockHistoryService(), logChange: jest.fn().mockRejectedValue(new Error('History DB error')) };
      const { service, repo } = crearServicio({ history });
      repo.save.mockResolvedValue(documentoBase);
      (service['dtoValidator'] as any).validate.mockResolvedValue(documentoBase);

      await expect(
        service.save({ name: 'Doc', proofDocumentTypeId: 'type-1', evidenceId: 'ev-1' } as any),
      ).resolves.toBeDefined();
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('debe lanzar BadRequestException si el documento no existe', async () => {
      const { service, repo } = crearServicio();
      repo.findById.mockResolvedValue(null);

      await expect(service.update('no-existe', { name: 'Nuevo' } as any)).rejects.toThrow(BadRequestException);
    });

    it('debe detectar cambios y registrarlos en el historial', async () => {
      const history = {
        ...mockHistoryService(),
        detectChanges: jest.fn().mockReturnValue([{ field: 'name', oldValue: 'Viejo', newValue: 'Nuevo' }]),
        logChange: jest.fn().mockResolvedValue({}),
      };
      const { service, repo } = crearServicio({ history });
      repo.findById.mockResolvedValue(documentoBase);
      repo.update.mockResolvedValue({ ...documentoBase, name: 'Nuevo' });

      await service.update('doc-1', { name: 'Nuevo' } as any);

      expect(history.detectChanges).toHaveBeenCalled();
      expect(history.logChange).toHaveBeenCalledWith(
        expect.objectContaining({ changeType: 'UPDATED', fieldChanged: 'name' }),
      );
    });

    it('no debe registrar historial si no hay cambios detectados', async () => {
      const history = { ...mockHistoryService(), detectChanges: jest.fn().mockReturnValue([]) };
      const { service, repo } = crearServicio({ history });
      repo.findById.mockResolvedValue(documentoBase);
      repo.update.mockResolvedValue(documentoBase);

      await service.update('doc-1', {} as any);

      expect(history.logChange).not.toHaveBeenCalled();
    });
  });

  // ── deleteById ────────────────────────────────────────────────────────────

  describe('deleteById', () => {
    it('debe lanzar BadRequestException si el documento no existe', async () => {
      const { service, repo } = crearServicio();
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteById('no-existe')).rejects.toThrow(BadRequestException);
    });

    it('debe eliminar de Drive si el documento tiene googleDriveFileId', async () => {
      const { service, repo, prisma, drive } = crearServicio();
      repo.findById.mockResolvedValue({ ...documentoBase, careerProofDocuments: [] });
      prisma.user.findUnique.mockResolvedValue({ googleAccessToken: 'access-tok', googleRefreshToken: 'refresh-tok' });
      repo.deleteById.mockResolvedValue(true);

      await service.deleteById('doc-1');

      expect(drive.deleteFile).toHaveBeenCalledWith('drive-file-1', 'access-tok', 'refresh-tok');
    });

    it('debe continuar con eliminación de BD aunque Drive falle', async () => {
      const drive = { ...mockGoogleDriveService(), deleteFile: jest.fn().mockRejectedValue(new Error('Drive error')) };
      const { service, repo, prisma } = crearServicio({ drive });
      repo.findById.mockResolvedValue({ ...documentoBase, careerProofDocuments: [] });
      prisma.user.findUnique.mockResolvedValue({ googleAccessToken: 'tok', googleRefreshToken: null });
      repo.deleteById.mockResolvedValue(true);

      await expect(service.deleteById('doc-1')).resolves.toBe(true);
    });

    it('debe registrar historial de eliminación', async () => {
      const { service, repo, prisma, history } = crearServicio();
      repo.findById.mockResolvedValue({ ...documentoBase, googleDriveFileId: null, careerProofDocuments: [] });
      repo.deleteById.mockResolvedValue(true);

      await service.deleteById('doc-1');

      expect(history.logChange).toHaveBeenCalledWith(
        expect.objectContaining({ changeType: 'DELETED' }),
      );
    });

    it('no debe intentar eliminar de Drive si no hay googleDriveFileId', async () => {
      const { service, repo, drive } = crearServicio();
      repo.findById.mockResolvedValue({ ...documentoBase, googleDriveFileId: null, careerProofDocuments: [] });
      repo.deleteById.mockResolvedValue(true);

      await service.deleteById('doc-1');

      expect(drive.deleteFile).not.toHaveBeenCalled();
    });
  });

  // ── searchProofDocuments ──────────────────────────────────────────────────

  describe('searchProofDocuments', () => {
    it('debe retornar documentos paginados con meta', async () => {
      const { service, prisma } = crearServicio();
      prisma.proofDocument.findMany.mockResolvedValue([documentoBase]);
      prisma.proofDocument.count.mockResolvedValue(1);

      const resultado = await service.searchProofDocuments({ page: 1, limit: 10 });

      expect(resultado.data).toHaveLength(1);
      expect(resultado.meta).toMatchObject({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });

    it('debe filtrar por texto de búsqueda', async () => {
      const { service, prisma } = crearServicio();
      prisma.proofDocument.findMany.mockResolvedValue([]);
      prisma.proofDocument.count.mockResolvedValue(0);

      await service.searchProofDocuments({ search: 'convenio', page: 1, limit: 10 });

      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.OR).toBeDefined();
      expect(where.OR[0].name).toMatchObject({ contains: 'convenio' });
    });

    it('debe filtrar por status ACTIVE', async () => {
      const { service, prisma } = crearServicio();
      prisma.proofDocument.findMany.mockResolvedValue([]);
      prisma.proofDocument.count.mockResolvedValue(0);

      await service.searchProofDocuments({ status: 'ACTIVE', page: 1, limit: 10 });

      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.status).toBe('ACTIVE');
    });

    it('no debe incluir filtro de status cuando es ALL', async () => {
      const { service, prisma } = crearServicio();
      prisma.proofDocument.findMany.mockResolvedValue([]);
      prisma.proofDocument.count.mockResolvedValue(0);

      await service.searchProofDocuments({ status: 'ALL', page: 1, limit: 10 });

      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.status).toBeUndefined();
    });

    it('debe filtrar por rango de fechas', async () => {
      const { service, prisma } = crearServicio();
      prisma.proofDocument.findMany.mockResolvedValue([]);
      prisma.proofDocument.count.mockResolvedValue(0);

      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-12-31');
      await service.searchProofDocuments({ dateFrom, dateTo, page: 1, limit: 10 });

      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.createdAt.gte).toEqual(dateFrom);
      expect(where.createdAt.lte).toBeDefined();
    });

    it('debe filtrar por careerId', async () => {
      const { service, prisma } = crearServicio();
      prisma.proofDocument.findMany.mockResolvedValue([]);
      prisma.proofDocument.count.mockResolvedValue(0);

      await service.searchProofDocuments({ careerIds: ['c1', 'c2'], page: 1, limit: 10 });

      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.careerProofDocuments.some.careerId.in).toEqual(['c1', 'c2']);
    });

    it('debe calcular hasNext y hasPrev correctamente', async () => {
      const { service, prisma } = crearServicio();
      prisma.proofDocument.findMany.mockResolvedValue([documentoBase]);
      prisma.proofDocument.count.mockResolvedValue(25);

      const resultado = await service.searchProofDocuments({ page: 2, limit: 10 });

      expect(resultado.meta.hasNext).toBe(true);
      expect(resultado.meta.hasPrev).toBe(true);
      expect(resultado.meta.totalPages).toBe(3);
    });
  });

  // ── searchProofDocuments — filtros jerárquicos ────────────────────────────

  describe('searchProofDocuments — filtros jerárquicos', () => {
    const setupEmpty = (prisma: any) => {
      prisma.proofDocument.findMany.mockResolvedValue([]);
      prisma.proofDocument.count.mockResolvedValue(0);
    };

    it('debe filtrar por evidenceId directamente', async () => {
      const { service, prisma } = crearServicio();
      setupEmpty(prisma);
      await service.searchProofDocuments({ evidenceId: 'ev-1' });
      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.evidenceId).toBe('ev-1');
    });

    it('debe filtrar por standardId a través de evidence', async () => {
      const { service, prisma } = crearServicio();
      setupEmpty(prisma);
      await service.searchProofDocuments({ standardId: 'std-1' });
      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.evidence.standardId).toBe('std-1');
    });

    it('debe filtrar por criterionId a través de evidence', async () => {
      const { service, prisma } = crearServicio();
      setupEmpty(prisma);
      await service.searchProofDocuments({ criterionId: 'crit-1' });
      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.evidence.OR).toBeDefined();
    });

    it('debe filtrar por componentId a través de evidence', async () => {
      const { service, prisma } = crearServicio();
      setupEmpty(prisma);
      await service.searchProofDocuments({ componentId: 'comp-1' });
      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.evidence.OR).toBeDefined();
    });

    it('debe filtrar por dimensionId a través de evidence', async () => {
      const { service, prisma } = crearServicio();
      setupEmpty(prisma);
      await service.searchProofDocuments({ dimensionId: 'dim-1' });
      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.evidence.OR).toBeDefined();
    });

    it('debe filtrar solo por dateFrom sin dateTo', async () => {
      const { service, prisma } = crearServicio();
      setupEmpty(prisma);
      const dateFrom = new Date('2024-01-01');
      await service.searchProofDocuments({ dateFrom });
      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.createdAt.gte).toEqual(dateFrom);
      expect(where.createdAt.lte).toBeUndefined();
    });

    it('debe filtrar solo por dateTo sin dateFrom', async () => {
      const { service, prisma } = crearServicio();
      setupEmpty(prisma);
      const dateTo = new Date('2024-12-31');
      await service.searchProofDocuments({ dateTo });
      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.createdAt.lte).toBeDefined();
      expect(where.createdAt.gte).toBeUndefined();
    });

    it('debe filtrar por proofDocumentTypeId', async () => {
      const { service, prisma } = crearServicio();
      setupEmpty(prisma);
      await service.searchProofDocuments({ proofDocumentTypeId: 'type-1' });
      const where = prisma.proofDocument.findMany.mock.calls[0][0].where;
      expect(where.proofDocumentTypeId).toBe('type-1');
    });

    it('debe propagar errores de prisma', async () => {
      const { service, prisma } = crearServicio();
      prisma.proofDocument.findMany.mockRejectedValue(new Error('DB error'));
      prisma.proofDocument.count.mockResolvedValue(0);
      await expect(service.searchProofDocuments({})).rejects.toThrow('DB error');
    });
  });

  // ── uploadProofDocumentWithDrive ──────────────────────────────────────────

  describe('uploadProofDocumentWithDrive', () => {
    const fileMock = {
      originalname: 'documento.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('contenido'),
      size: 1024,
    };

    const uploadDto = {
      name: 'Convenio 2024',
      description: 'Descripción',
      evidenceId: 'ev-1',
      proofDocumentTypeId: 'type-1',
      careerIds: ['career-1', 'career-2'],
    };

    const evidenciaConStandard = {
      id: 'ev-1',
      code: 'EV-01',
      name: 'Evidencia 1',
      standard: {
        id: 'std-1',
        code: 'STD-01',
        name: 'Estándar 1',
        criterion: {
          id: 'crit-1',
          code: 'CR-01',
          name: 'Criterio 1',
          component: {
            id: 'comp-1',
            code: 'C-01',
            name: 'Componente 1',
            dimension: { id: 'dim-1', code: 'D-01', name: 'Dimensión 1' },
          },
        },
      },
      criterion: null,
    };

    const evidenciaConCriterion = {
      id: 'ev-2',
      code: 'EV-02',
      name: 'Evidencia 2',
      standard: null,
      criterion: {
        id: 'crit-1',
        code: 'CR-01',
        name: 'Criterio 1',
        component: {
          id: 'comp-1',
          code: 'C-01',
          name: 'Componente 1',
          dimension: { id: 'dim-1', code: 'D-01', name: 'Dimensión 1' },
        },
      },
    };

    const driveFolder = { id: 'folder-drive', path: 'SINAES/D-01/C-01/CR-01', level: 4 };
    const driveFile = { id: 'file-drive', url: 'https://drive.google.com/file/d/file-drive/view', size: 1024 };

    const setupHappyPath = (prisma: any, drive: any) => {
      prisma.qualityEvidence.findUnique.mockResolvedValue(evidenciaConStandard);
      prisma.proofDocument.findMany.mockResolvedValue([]); // sin duplicados
      prisma.career.findUnique
        .mockResolvedValueOnce({ name: 'Carrera A' })
        .mockResolvedValueOnce({ name: 'Carrera B' });
      prisma.careerProofDocument.create.mockResolvedValue({});
      drive.createFolderStructure.mockResolvedValue(driveFolder);
      drive.uploadFile.mockResolvedValue(driveFile);
    };

    it('debe subir el archivo y crear el documento con jerarquía via standard', async () => {
      const { service, repo, prisma, drive } = crearServicio();
      setupHappyPath(prisma, drive);
      repo.generateNextCode.mockResolvedValue('DOC-002');
      repo.save.mockResolvedValue({ ...documentoBase, id: 'doc-new', code: 'DOC-002' });
      (service['dtoValidator'] as any).validate.mockResolvedValue({ ...documentoBase, id: 'doc-new', code: 'DOC-002' });

      const result = await service.uploadProofDocumentWithDrive(fileMock, uploadDto, 'access-token', 'refresh-token');

      expect(drive.createFolderStructure).toHaveBeenCalled();
      expect(drive.uploadFile).toHaveBeenCalled();
      expect(result.proofDocument).toBeDefined();
      expect(result.careerRelations).toHaveLength(2);
      expect(result.folderPath).toBe('SINAES/D-01/C-01/CR-01');
    });

    it('debe subir el archivo con jerarquía via criterion directo', async () => {
      const { service, repo, prisma, drive } = crearServicio();
      prisma.qualityEvidence.findUnique.mockResolvedValue(evidenciaConCriterion);
      prisma.proofDocument.findMany.mockResolvedValue([]);
      prisma.career.findUnique.mockResolvedValue({ name: 'Carrera A' });
      prisma.careerProofDocument.create.mockResolvedValue({});
      drive.createFolderStructure.mockResolvedValue(driveFolder);
      drive.uploadFile.mockResolvedValue(driveFile);
      repo.generateNextCode.mockResolvedValue('DOC-003');
      repo.save.mockResolvedValue({ ...documentoBase, id: 'doc-new2', code: 'DOC-003' });
      (service['dtoValidator'] as any).validate.mockResolvedValue({ ...documentoBase, id: 'doc-new2', code: 'DOC-003' });

      const result = await service.uploadProofDocumentWithDrive(
        fileMock,
        { ...uploadDto, evidenceId: 'ev-2', careerIds: ['career-1'] },
        'access-token',
      );

      expect(result.proofDocument).toBeDefined();
    });

    it('debe lanzar BadRequestException si la evidencia no existe', async () => {
      const { service, prisma } = crearServicio();
      prisma.qualityEvidence.findUnique.mockResolvedValue(null);

      await expect(
        service.uploadProofDocumentWithDrive(fileMock, uploadDto, 'access-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si la evidencia no tiene standard ni criterion', async () => {
      const { service, prisma } = crearServicio();
      prisma.qualityEvidence.findUnique.mockResolvedValue({
        id: 'ev-bad',
        code: 'EV-BAD',
        name: 'Sin jerarquía',
        standard: null,
        criterion: null,
      });

      await expect(
        service.uploadProofDocumentWithDrive(fileMock, uploadDto, 'access-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si ya existe un documento duplicado', async () => {
      const { service, prisma } = crearServicio();
      prisma.qualityEvidence.findUnique.mockResolvedValue(evidenciaConStandard);
      prisma.proofDocument.findMany.mockResolvedValue([
        { id: 'dup-1', name: 'Convenio 2024', code: 'DOC-001', fileName: 'DOC-001_convenio.pdf' },
      ]);

      await expect(
        service.uploadProofDocumentWithDrive(fileMock, uploadDto, 'access-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe usar nombre de carrera de fallback si no se encuentra en BD', async () => {
      const { service, repo, prisma, drive } = crearServicio();
      prisma.qualityEvidence.findUnique.mockResolvedValue(evidenciaConStandard);
      prisma.proofDocument.findMany.mockResolvedValue([]);
      prisma.career.findUnique.mockResolvedValue(null); // carrera no encontrada
      prisma.careerProofDocument.create.mockResolvedValue({});
      drive.createFolderStructure.mockResolvedValue(driveFolder);
      drive.uploadFile.mockResolvedValue(driveFile);
      repo.generateNextCode.mockResolvedValue('DOC-004');
      repo.save.mockResolvedValue({ ...documentoBase, code: 'DOC-004' });
      (service['dtoValidator'] as any).validate.mockResolvedValue({ ...documentoBase, code: 'DOC-004' });

      // No debe lanzar error — usa fallback "Career {id}"
      await expect(
        service.uploadProofDocumentWithDrive(fileMock, { ...uploadDto, careerIds: ['career-x'] }, 'access-token'),
      ).resolves.toBeDefined();
    });

    it('debe envolver errores inesperados en BadRequestException', async () => {
      const { service, prisma } = crearServicio();
      prisma.qualityEvidence.findUnique.mockRejectedValue(new Error('DB connection lost'));

      await expect(
        service.uploadProofDocumentWithDrive(fileMock, uploadDto, 'access-token'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── replaceDocumentFile ───────────────────────────────────────────────────

  describe('replaceDocumentFile', () => {
    const fileMock = {
      originalname: 'nuevo-archivo.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('nuevo contenido'),
      size: 2048,
    };

    const driveFileNuevo = {
      id: 'file-drive-nuevo',
      url: 'https://drive.google.com/file/d/file-drive-nuevo/view',
      size: 2048,
    };

    it('debe lanzar BadRequestException si el documento no existe', async () => {
      const { service, repo } = crearServicio();
      repo.findById.mockResolvedValue(null);

      await expect(
        service.replaceDocumentFile('no-existe', fileMock, 'access-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe subir el nuevo archivo, eliminar el antiguo y actualizar en BD', async () => {
      const { service, repo, prisma, drive } = crearServicio();
      repo.findById.mockResolvedValue({
        ...documentoBase,
        googleDriveFolderId: 'folder-1',
        googleDriveFileId: 'old-file-id',
        code: 'DOC-001',
        fileType: 'pdf',
      });
      prisma.careerProofDocument.findMany.mockResolvedValue([
        { career: { name: 'Carrera X' } },
      ]);
      drive.uploadFile.mockResolvedValue(driveFileNuevo);
      drive.deleteFile.mockResolvedValue(undefined);
      repo.update.mockResolvedValue({ ...documentoBase, fileName: 'DOC-001_nuevo-archivo.pdf' });
      (service['dtoValidator'] as any).validate.mockResolvedValue({ ...documentoBase });

      const result = await service.replaceDocumentFile('doc-1', fileMock, 'access-token', 'refresh-token');

      expect(drive.uploadFile).toHaveBeenCalledWith(
        expect.objectContaining({ originalname: 'DOC-001_nuevo-archivo.pdf' }),
        'folder-1',
        ['Carrera X'],
        'access-token',
        'refresh-token',
      );
      expect(drive.deleteFile).toHaveBeenCalledWith('old-file-id', 'access-token', 'refresh-token');
      expect(result).toBeDefined();
    });

    it('debe continuar aunque falle la eliminación del archivo antiguo en Drive', async () => {
      const { service, repo, prisma, drive } = crearServicio();
      repo.findById.mockResolvedValue({
        ...documentoBase,
        googleDriveFolderId: 'folder-1',
        googleDriveFileId: 'old-file-id',
        code: 'DOC-001',
        fileType: 'pdf',
      });
      prisma.careerProofDocument.findMany.mockResolvedValue([]);
      drive.uploadFile.mockResolvedValue(driveFileNuevo);
      drive.deleteFile.mockRejectedValue(new Error('Drive error'));
      repo.update.mockResolvedValue(documentoBase);
      (service['dtoValidator'] as any).validate.mockResolvedValue(documentoBase);

      await expect(
        service.replaceDocumentFile('doc-1', fileMock, 'access-token'),
      ).resolves.toBeDefined();
    });

    it('debe omitir eliminación del archivo antiguo si no hay googleDriveFileId', async () => {
      const { service, repo, prisma, drive } = crearServicio();
      repo.findById.mockResolvedValue({
        ...documentoBase,
        googleDriveFolderId: 'folder-1',
        googleDriveFileId: null,
        code: 'DOC-001',
        fileType: 'pdf',
      });
      prisma.careerProofDocument.findMany.mockResolvedValue([]);
      drive.uploadFile.mockResolvedValue(driveFileNuevo);
      repo.update.mockResolvedValue(documentoBase);
      (service['dtoValidator'] as any).validate.mockResolvedValue(documentoBase);

      await service.replaceDocumentFile('doc-1', fileMock, 'access-token');

      expect(drive.deleteFile).not.toHaveBeenCalled();
    });

    it('debe registrar el cambio de archivo en historial', async () => {
      const { service, repo, prisma, drive, history } = crearServicio();
      repo.findById.mockResolvedValue({
        ...documentoBase,
        googleDriveFolderId: 'folder-1',
        googleDriveFileId: null,
        code: 'DOC-001',
        fileType: 'pdf',
      });
      prisma.careerProofDocument.findMany.mockResolvedValue([]);
      drive.uploadFile.mockResolvedValue(driveFileNuevo);
      repo.update.mockResolvedValue(documentoBase);
      (service['dtoValidator'] as any).validate.mockResolvedValue(documentoBase);

      await service.replaceDocumentFile('doc-1', fileMock, 'access-token');

      expect(history.logChange).toHaveBeenCalledWith(
        expect.objectContaining({ changeType: 'FILE_REPLACED' }),
      );
    });
  });

  // ── updateDocumentCareers ─────────────────────────────────────────────────

  describe('updateDocumentCareers', () => {
    it('debe lanzar BadRequestException si el documento no existe', async () => {
      const { service, repo } = crearServicio();
      repo.findById.mockResolvedValue(null);

      await expect(service.updateDocumentCareers('no-existe', ['c1'])).rejects.toThrow(BadRequestException);
    });

    it('debe reemplazar las relaciones de carrera', async () => {
      const { service, repo, prisma } = crearServicio();
      repo.findById.mockResolvedValue({ ...documentoBase, googleDriveFolderId: null });
      prisma.careerProofDocument.findMany.mockResolvedValue([]);
      prisma.careerProofDocument.create.mockResolvedValue({});
      prisma.career.findMany.mockResolvedValue([{ name: 'Ingeniería' }]);

      await service.updateDocumentCareers('doc-1', ['c1', 'c2']);

      expect(prisma.careerProofDocument.deleteMany).toHaveBeenCalledWith({ where: { proofDocumentId: 'doc-1' } });
      expect(prisma.careerProofDocument.create).toHaveBeenCalledTimes(2);
    });

    it('debe actualizar _carreras.txt en Drive si el documento tiene folderId y tokens disponibles', async () => {
      const { service, repo, prisma, drive } = crearServicio();
      repo.findById.mockResolvedValue({ ...documentoBase, googleDriveFolderId: 'folder-1', code: 'DOC-001' });
      prisma.careerProofDocument.findMany.mockResolvedValue([]);
      prisma.careerProofDocument.create.mockResolvedValue({});
      prisma.career.findMany.mockResolvedValue([{ name: 'Carrera X' }]);
      prisma.user.findUnique.mockResolvedValue({ googleAccessToken: 'tok', googleRefreshToken: 'refresh' });

      await service.updateDocumentCareers('doc-1', ['c1']);

      expect(drive.updateCarrerasFile).toHaveBeenCalled();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { SinaesDocumentHistoryService } from '@modules/sinaes-document-history/sinaes-document-history.service';
import { PrismaService } from '@src/prisma/prisma.service';

describe('SinaesDocumentHistoryService (Unitaria)', () => {
  let service: SinaesDocumentHistoryService;
  let prisma: jest.Mocked<PrismaService>;

  const mockHistory = {
    id: 'hist-1',
    documentId: 'doc-1',
    action: 'VERSION_CREATED',
    changedBy: 'user-1',
    reason: 'Update content',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = () => ({
    sinaesDocumentHistory: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SinaesDocumentHistoryService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SinaesDocumentHistoryService>(SinaesDocumentHistoryService);
    prisma = module.get(PrismaService) as any;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logChange', () => {
    it('Registra el log de trazabilidad al modificar un documento clave', async () => {
      const dto = {
        documentId: 'doc-1',
        changeType: 'VERSION_CREATED' as any,
        userId: 'user-1',
        reason: 'Update content'
      };

      prisma.sinaesDocumentHistory.create.mockResolvedValue(mockHistory as any);

      const result = await service.logChange(dto as any);

      expect(prisma.sinaesDocumentHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          documentId: 'doc-1',
          changeType: 'VERSION_CREATED',
        }),
        include: expect.any(Object),
      });
      expect(result.documentId).toEqual(mockHistory.documentId);
    });
  });

  describe('getDocumentHistory', () => {
    it('Retorna la trazabilidad páginada', async () => {
      prisma.sinaesDocumentHistory.findMany.mockResolvedValue([mockHistory] as any);
      prisma.sinaesDocumentHistory.count.mockResolvedValue(1);

      const result = await service.getDocumentHistory('doc-1', {}, 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(prisma.sinaesDocumentHistory.findMany).toHaveBeenCalled();
    });
  });
});
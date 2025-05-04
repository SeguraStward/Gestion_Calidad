import { NotFoundException } from '@nestjs/common';
import { GenericController } from '@core/common/interfaces/generic.controller';
import { IGenericService } from '@core/common/interfaces/generic-service.interface';

describe('GenericController', () => {
  let controller: GenericController<any, any>;
  let mockService: jest.Mocked<IGenericService<any, any, any>>;

  beforeEach(() => {
    mockService = {
      findAll: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      findOne: jest.fn(),
    };

    controller = new (class extends GenericController<any, any> {
      protected readonly logger = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        debug: console.debug,
        verbose: console.info,
        fatal: console.error,
        registerLocalInstanceRef: () => {},
      } as any; // Use 'as any' to bypass type mismatch for testing purposes
      constructor() {
        super(mockService);
      }
    })();
  });

  describe('findAll', () => {
    it('should return paginated records', async () => {
      const mockResult = { data: [{ id: 1 }], meta: { page: 1, limit: 10, total: 1 } };
      mockService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(1, 10, {}, '{"id":"asc"}');

      expect(result).toEqual(mockResult);
      expect(mockService.findAll).toHaveBeenCalledWith(1, 10, {}, { id: 'asc' });
    });
  });

  describe('count', () => {
    it('should return the count of records', async () => {
      mockService.count.mockResolvedValue(5);

      const result = await controller.count({});

      expect(result).toEqual({ count: 5 });
      expect(mockService.count).toHaveBeenCalledWith({});
    });
  });

  describe('findById', () => {
    it('should return a record by id', async () => {
      const mockEntity = { id: 1 };
      mockService.findById.mockResolvedValue(mockEntity);

      const result = await controller.findById('1');

      expect(result).toEqual(mockEntity);
      expect(mockService.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if record not found', async () => {
      mockService.findById.mockResolvedValue(null);

      await expect(controller.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const mockDto = { name: 'Test' };
      const mockEntity = { id: 1, ...mockDto };
      mockService.save.mockResolvedValue(mockEntity);

      const result = await controller.create(mockDto);

      expect(result).toEqual(mockEntity);
      expect(mockService.save).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('update', () => {
    it('should update a record by id', async () => {
      const mockDto = { name: 'Updated' };
      const mockEntity = { id: 1, ...mockDto };
      mockService.update.mockResolvedValue(mockEntity);

      const result = await controller.update('1', mockDto);

      expect(result).toEqual(mockEntity);
      expect(mockService.update).toHaveBeenCalledWith('1', mockDto);
    });
  });

  describe('delete', () => {
    it('should delete a record by id', async () => {
      mockService.deleteById.mockResolvedValue(undefined);

      const result = await controller.delete('1');

      expect(result).toBeUndefined();
      expect(mockService.deleteById).toHaveBeenCalledWith('1');
    });
  });
});

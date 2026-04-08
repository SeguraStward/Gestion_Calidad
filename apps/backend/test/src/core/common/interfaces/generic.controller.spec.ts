import { NotFoundException } from '@nestjs/common';
import { GenericController } from '@core/common/interfaces/generic.controller';
import { IGenericService } from '@core/common/interfaces/generic-service.interface';

// ─── Mock del servicio genérico ─────────────────────────────────────────────
const crearMockServicio = (): jest.Mocked<IGenericService<any, any, any>> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
  softDeleteById: jest.fn(),
});

// ─── Subclase concreta para poder instanciar la clase abstracta ──────────────
const crearControlador = (servicio: jest.Mocked<IGenericService<any, any, any>>) =>
  new (class extends GenericController<any, any> {
    protected readonly logger = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      debug: console.debug,
      verbose: console.info,
      fatal: console.error,
      registerLocalInstanceRef: () => {},
    } as any;
    protected readonly resourceName = 'TestResource';
    constructor() {
      super(servicio);
    }
  })();

// ─── Suite principal ─────────────────────────────────────────────────────────
describe('GenericController', () => {
  let controller: GenericController<any, any>;
  let mockServicio: jest.Mocked<IGenericService<any, any, any>>;

  beforeEach(() => {
    mockServicio = crearMockServicio();
    controller = crearControlador(mockServicio);
  });

  // ── findAll ────────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('debe retornar registros paginados sin filtros', async () => {
      const resultado = { data: [{ id: '1' }], meta: { page: 1, limit: 10, total: 1 } };
      mockServicio.findAll.mockResolvedValue(resultado);

      const respuesta = await controller.findAll(1, 10, {}, undefined, undefined);

      expect(respuesta).toEqual(resultado);
      // Sin filtros activos se pasa undefined al servicio
      expect(mockServicio.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
    });

    it('debe parsear orderBy desde JSON y pasar filtros transformados', async () => {
      const resultado = { data: [], meta: { page: 2, limit: 5, total: 0 } };
      mockServicio.findAll.mockResolvedValue(resultado);

      // where contiene page/limit/orderBy que deben descartarse y filtros extra
      const where = { page: '2', limit: '5', orderBy: '{"name":"asc"}', activo: 'true', numero: '42' };
      const respuesta = await controller.findAll(2, 5, where, '{"name":"asc"}', undefined);

      expect(respuesta).toEqual(resultado);
      // "numero" es numérico → debe convertirse; "activo" no lo es → queda como string
      expect(mockServicio.findAll).toHaveBeenCalledWith(
        2,
        5,
        { activo: 'true', numero: 42 },
        { name: 'asc' },
        undefined,
      );
    });

    it('debe pasar page y limit como números aunque vengan como string', async () => {
      const resultado = { data: [], meta: { page: 1, limit: 20, total: 0 } };
      mockServicio.findAll.mockResolvedValue(resultado);

      await controller.findAll('1' as any, '20' as any, {}, undefined, undefined);

      expect(mockServicio.findAll).toHaveBeenCalledWith(1, 20, undefined, undefined, undefined);
    });
  });

  // ── count ──────────────────────────────────────────────────────────────────
  describe('count', () => {
    it('debe retornar el total de registros como objeto { count }', async () => {
      mockServicio.count.mockResolvedValue(7);

      const resultado = await controller.count({});

      expect(resultado).toEqual({ count: 7 });
      expect(mockServicio.count).toHaveBeenCalledWith({});
    });

    it('debe funcionar sin filtros (where undefined)', async () => {
      mockServicio.count.mockResolvedValue(0);

      const resultado = await controller.count(undefined);

      expect(resultado).toEqual({ count: 0 });
      expect(mockServicio.count).toHaveBeenCalledWith(undefined);
    });
  });

  // ── findById ───────────────────────────────────────────────────────────────
  describe('findById', () => {
    it('debe retornar la entidad cuando existe', async () => {
      const entidad = { id: 'abc123', nombre: 'Test' };
      mockServicio.findById.mockResolvedValue(entidad);

      const resultado = await controller.findById('abc123');

      expect(resultado).toEqual(entidad);
      expect(mockServicio.findById).toHaveBeenCalledWith('abc123', undefined);
    });

    it('debe lanzar NotFoundException cuando el registro no existe', async () => {
      mockServicio.findById.mockResolvedValue(null);

      await expect(controller.findById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────
  describe('create', () => {
    it('debe crear y retornar la nueva entidad', async () => {
      const dto = { nombre: 'Nuevo' };
      const entidad = { id: 'xyz', ...dto };
      mockServicio.save.mockResolvedValue(entidad);

      const resultado = await controller.create(dto);

      expect(resultado).toEqual(entidad);
      expect(mockServicio.save).toHaveBeenCalledWith(dto);
    });
  });

  // ── update ─────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('debe actualizar y retornar la entidad modificada', async () => {
      const dto = { nombre: 'Actualizado' };
      const entidad = { id: '1', ...dto };
      mockServicio.update.mockResolvedValue(entidad);

      const resultado = await controller.update('1', dto);

      expect(resultado).toEqual(entidad);
      expect(mockServicio.update).toHaveBeenCalledWith('1', dto);
    });
  });

  // ── delete ─────────────────────────────────────────────────────────────────
  describe('delete', () => {
    it('debe eliminar el registro y retornar undefined (204 No Content)', async () => {
      mockServicio.deleteById.mockResolvedValue(true);

      const resultado = await controller.delete('1');

      expect(resultado).toBeUndefined();
      expect(mockServicio.deleteById).toHaveBeenCalledWith('1');
    });
  });

  // ── softDelete ─────────────────────────────────────────────────────────────
  describe('softDelete', () => {
    it('debe marcar el registro como inactivo y retornarlo', async () => {
      const entidad = { id: '1', activo: false };
      mockServicio.softDeleteById.mockResolvedValue(entidad);

      const resultado = await controller.softDelete('1');

      expect(resultado).toEqual(entidad);
      expect(mockServicio.softDeleteById).toHaveBeenCalledWith('1');
    });
  });

  // ── transformNumericFilters ────────────────────────────────────────────────
  describe('transformNumericFilters (método protegido)', () => {
    // Accedemos al método protegido vía cast a any para prueba unitaria directa
    it('debe convertir strings numéricos a números', () => {
      const filtros = { edad: '25', nombre: 'Juan', id: '0' };
      const resultado = (controller as any).transformNumericFilters(filtros);

      expect(resultado).toEqual({ edad: 25, nombre: 'Juan', id: 0 });
    });

    it('debe ignorar strings vacíos y no numéricos', () => {
      const filtros = { valor: '', texto: 'abc', num: '3.14' };
      const resultado = (controller as any).transformNumericFilters(filtros);

      expect(resultado).toEqual({ valor: '', texto: 'abc', num: 3.14 });
    });

    it('debe retornar objeto vacío si no hay filtros', () => {
      const resultado = (controller as any).transformNumericFilters({});
      expect(resultado).toEqual({});
    });
  });
});

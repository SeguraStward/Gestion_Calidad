import { Test, TestingModule } from '@nestjs/testing';
import { Logger, BadRequestException } from '@nestjs/common';
import { UserPermissionsService } from '@modules/user-permissions/user-permissions.service';
import { UserPermissionsRepository } from '@modules/user-permissions/user-permissions.repository';
import { DtoValidator } from '@core/common/dto-validator';
import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

describe('UserPermissionsService (Unitaria)', () => {
  let service: UserPermissionsService;
  let repository: jest.Mocked<UserPermissionsRepository>;
  let dtoValidator: jest.Mocked<DtoValidator>;

  const mockPermission = {
    id: 'perm-1',
    name: 'Manage Questions',
    code: 'QUESTIONS_MGR',
    status: 'ACTIVE',
  };

  const mockPaginatedResponse: PaginatedResponse<any> = {
    data: [mockPermission],
    meta: { total: 1, page: 1, lastPage: 1, limit: 10 },
  };

  const mockUserPermissionsRepository = () => ({
    findAll: jest.fn().mockResolvedValue(mockPaginatedResponse),
    findById: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
    count: jest.fn(),
  });

  const mockDtoValidatorFactory = () => ({
    validate: jest.fn().mockImplementation((entity) => entity),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPermissionsService,
        {
          provide: UserPermissionsRepository,
          useFactory: mockUserPermissionsRepository,
        },
        {
          provide: DtoValidator,
          useFactory: mockDtoValidatorFactory,
        },
      ],
    }).compile();

    service = module.get<UserPermissionsService>(UserPermissionsService);
    repository = module.get(UserPermissionsRepository);
    dtoValidator = module.get(DtoValidator);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('Valida que los permisos estructurados se retornen correctamente', async () => {
      const result = await service.findAll(1, 10);

      expect(repository.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('perm-1');
    });
  });
});
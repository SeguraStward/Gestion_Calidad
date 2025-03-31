import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

export interface IGenericController<D, C = any, U = any> {
  findAll(page: number, limit: number, where?: any, orderBy?: any): Promise<PaginatedResponse<D>>;
  findById(id: string): Promise<D>;
  create(payload: C): Promise<D>;
  update(id: string, payload: U): Promise<D>;
  delete(id: string): Promise<boolean>;
}

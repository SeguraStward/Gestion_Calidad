import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

export interface IGenericService<D, C = any, U = any> {
  findAll(page: number, limit: number, where?: any, orderBy?: any): Promise<PaginatedResponse<D>>;
  findById(id: string): Promise<D>;
  findOne(where: any): Promise<D | null>;
  count(where?: any): Promise<number>;
  save(payload: C): Promise<D>;
  update(id: string, payload: U): Promise<D>;
  deleteById(id: string): Promise<boolean>;
}

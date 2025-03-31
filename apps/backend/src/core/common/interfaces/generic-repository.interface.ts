import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

export interface GenericRepository<T> {
  findAll(page?: number, limit?: number, where?: any, orderBy?: any): Promise<PaginatedResponse<T>>;
  findById(id: string): Promise<T>;
  findOne(where: any): Promise<T | null>;
  count(where?: any): Promise<number>;
  save(payload: unknown): Promise<T | T[]>;
  update(id: string, payload: unknown): Promise<T>;
  deleteById(id: string): Promise<boolean>;
}

import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

export interface BaseService<T> {
  findAll(page: number, limit: number): Promise<PaginatedResponse<T>>;
  findById(id: string): Promise<T>;
  save(payload: unknown): Promise<T | T[]>;
  update(id: string, payload: unknown): Promise<T>;
  deleteById(id: string): Promise<boolean>;
}

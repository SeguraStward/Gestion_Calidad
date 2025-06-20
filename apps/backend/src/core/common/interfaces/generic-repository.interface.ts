import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

export interface GenericRepository<T> {
  findAll(
    page?: number,
    limit?: number,
    where?: any,
    orderBy?: any,
    include?: any,
  ): Promise<PaginatedResponse<T>>;
  findById(id: string, include?: any): Promise<T | null>; // Ensure T | null
  findOne(where: any, include?: any): Promise<T | null>; // Add include here too
  count(where?: any): Promise<number>;
  save(payload: unknown): Promise<T | T[]>;
  update(id: string, payload: unknown): Promise<T>;
  deleteById(id: string): Promise<boolean>;
}

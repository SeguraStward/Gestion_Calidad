import { PaginatedResponse } from '@core/http/interfaces/paginated-response.interface';

export interface IGenericService<D, C = any, U = any> {
  findAll(
    page: number,
    limit: number,
    where?: any,
    orderBy?: any,
    include?: any,
  ): Promise<PaginatedResponse<D>>;
  findById(id: string, include?: any): Promise<D | null>; // Ensure D | null
  findOne(where: any, include?: any): Promise<D | null>; // Add include here too
  count(where?: any): Promise<number>;
  save(payload: C): Promise<D>;
  update(id: string, payload: U): Promise<D>;
  deleteById(id: string): Promise<boolean>;
  softDeleteById(id: string): Promise<D>;
}

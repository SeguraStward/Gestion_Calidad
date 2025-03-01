export interface DatabasePaginatedResponse<T> {
  data: T[];
  total: number;
}

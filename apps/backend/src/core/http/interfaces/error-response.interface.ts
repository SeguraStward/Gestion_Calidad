export interface ErrorResponse {
  errors: {
    code: string;
    title: string;
    details?: Record<string, string[]>;
  };
}

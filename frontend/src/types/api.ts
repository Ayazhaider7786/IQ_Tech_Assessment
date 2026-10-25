export interface ProblemDetailsResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

export interface IdentityErrorResponse {
  errors: string[];
}

export interface PagedResultResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

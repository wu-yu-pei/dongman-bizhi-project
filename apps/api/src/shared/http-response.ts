export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiPaginatedResponse<T> = ApiSuccessResponse<T[]> & {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function buildSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  },
): ApiPaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages:
        pagination.total === 0
          ? 0
          : Math.ceil(pagination.total / pagination.pageSize),
    },
  };
}

export function buildErrorResponse(
  code: string,
  message: string,
  details?: unknown,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details }),
    },
  };
}

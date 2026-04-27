export type Category = {
  id: number;
  name: string;
  wallpaperCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Wallpaper = {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  imageUrl: string;
  ossObjectKey: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WallpaperPayload = {
  categoryId: number;
  title: string;
  imageUrl: string;
  ossObjectKey: string;
  isFeatured: boolean;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  pagination: Pagination;
};

export type OssPolicy = {
  host: string;
  objectKey: string;
  imageUrl: string;
  expireAt: string;
  formData: Record<string, string>;
};

type SuccessEnvelope<T> = {
  success: true;
  data: T;
};

type PaginatedEnvelope<T> = SuccessEnvelope<T[]> & {
  pagination: Pagination;
};

type ErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ApiEnvelope<T> = SuccessEnvelope<T> | ErrorEnvelope;
type Fetcher = typeof fetch;

export type AdminApi = ReturnType<typeof createAdminApi>;

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function createAdminApi(options: {
  baseUrl: string;
  fetcher?: Fetcher;
}) {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetcher = options.fetcher ?? fetch;

  async function request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const response = await fetcher(`${baseUrl}${path}`, {
      method: "GET",
      ...init,
    });
    const body = (await response.json()) as ApiEnvelope<T>;

    if (!body.success) {
      throw new ApiError(
        body.error.code,
        body.error.message,
        response.status,
        body.error.details,
      );
    }

    return body.data;
  }

  async function requestPaginated<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<Paginated<T>> {
    const response = await fetcher(`${baseUrl}${path}`, {
      method: "GET",
      ...init,
    });
    const body = (await response.json()) as PaginatedEnvelope<T> | ErrorEnvelope;

    if (!body.success) {
      throw new ApiError(
        body.error.code,
        body.error.message,
        response.status,
        body.error.details,
      );
    }

    return {
      data: body.data,
      pagination: body.pagination,
    };
  }

  const jsonRequest = <T>(path: string, method: string, payload: unknown) =>
    request<T>(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  return {
    listCategories: () => request<Category[]>("/admin/categories"),
    createCategory: (payload: { name: string }) =>
      jsonRequest<Category>("/admin/categories", "POST", payload),
    updateCategory: (id: number, payload: { name: string }) =>
      jsonRequest<Category>(`/admin/categories/${id}`, "PUT", payload),
    deleteCategory: (id: number) =>
      request<{ deleted: boolean }>(`/admin/categories/${id}`, {
        method: "DELETE",
      }),
    listWallpapers: (input: {
      categoryId?: number;
      page?: number;
      pageSize?: number;
    } = {}) => {
      const params = new URLSearchParams();
      if (input.categoryId) params.set("categoryId", String(input.categoryId));
      if (input.page) params.set("page", String(input.page));
      if (input.pageSize) params.set("pageSize", String(input.pageSize));
      const query = params.toString();
      return requestPaginated<Wallpaper>(
        `/admin/wallpapers${query ? `?${query}` : ""}`,
      );
    },
    createWallpaper: (payload: WallpaperPayload) =>
      jsonRequest<Wallpaper>("/admin/wallpapers", "POST", payload),
    updateWallpaper: (id: number, payload: WallpaperPayload) =>
      jsonRequest<Wallpaper>(`/admin/wallpapers/${id}`, "PUT", payload),
    deleteWallpaper: (id: number) =>
      request<{ deleted: boolean }>(`/admin/wallpapers/${id}`, {
        method: "DELETE",
      }),
    requestOssPolicy: (payload: { filename: string; contentType: string }) =>
      jsonRequest<OssPolicy>("/admin/uploads/oss-policy", "POST", payload),
  };
}

export const adminApi = createAdminApi({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, createAdminApi } from "./adminApi";

describe("createAdminApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads categories through the shared API envelope", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        success: true,
        data: [
          {
            id: 1,
            name: "咒术回战",
            wallpaperCount: 3,
            createdAt: "2026-04-27T00:00:00.000Z",
            updatedAt: "2026-04-27T00:00:00.000Z",
          },
        ],
      }),
    );
    const api = createAdminApi({
      baseUrl: "http://localhost:3000",
      fetcher: fetchMock,
    });

    await expect(api.listCategories()).resolves.toEqual([
      {
        id: 1,
        name: "咒术回战",
        wallpaperCount: 3,
        createdAt: "2026-04-27T00:00:00.000Z",
        updatedAt: "2026-04-27T00:00:00.000Z",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/admin/categories",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("sends wallpaper payloads as JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        success: true,
        data: {
          id: 7,
          categoryId: 1,
          categoryName: "间谍过家家",
          title: "阿尼亚壁纸",
          imageUrl: "https://cdn.example.com/anya.jpg",
          ossObjectKey: "wallpapers/anya.jpg",
          isFeatured: true,
          createdAt: "2026-04-27T00:00:00.000Z",
          updatedAt: "2026-04-27T00:00:00.000Z",
        },
      }),
    );
    const api = createAdminApi({
      baseUrl: "http://localhost:3000/",
      fetcher: fetchMock,
    });

    await api.createWallpaper({
      categoryId: 1,
      title: "阿尼亚壁纸",
      imageUrl: "https://cdn.example.com/anya.jpg",
      ossObjectKey: "wallpapers/anya.jpg",
      isFeatured: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/admin/wallpapers",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: 1,
          title: "阿尼亚壁纸",
          imageUrl: "https://cdn.example.com/anya.jpg",
          ossObjectKey: "wallpapers/anya.jpg",
          isFeatured: true,
        }),
      }),
    );
  });

  it("throws ApiError with server message when the API rejects a request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          success: false,
          error: {
            code: "CATEGORY_NAME_EXISTS",
            message: "动漫分类已存在",
          },
        },
        409,
      ),
    );
    const api = createAdminApi({
      baseUrl: "http://localhost:3000",
      fetcher: fetchMock,
    });

    await expect(api.createCategory({ name: "鬼灭之刃" })).rejects.toEqual(
      new ApiError("CATEGORY_NAME_EXISTS", "动漫分类已存在", 409),
    );
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

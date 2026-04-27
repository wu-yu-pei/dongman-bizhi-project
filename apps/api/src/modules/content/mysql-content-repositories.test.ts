import { describe, expect, it } from "vitest";
import {
  createMysqlContentRepositories,
  type MysqlExecutor,
} from "./mysql-content-repositories.js";

class FakeExecutor implements MysqlExecutor {
  readonly calls: Array<{ sql: string; params: unknown[] }> = [];

  constructor(private readonly responses: unknown[][]) {}

  async execute<T>(sql: string, params: unknown[] = []): Promise<[T, unknown]> {
    this.calls.push({ sql, params });
    const response = this.responses.shift() ?? [];
    return [response as T, undefined];
  }
}

describe("createMysqlContentRepositories", () => {
  it("maps category rows with wallpaper counts", async () => {
    const executor = new FakeExecutor([
      [
        {
          id: 1,
          name: "咒术回战",
          wallpaper_count: "2",
          created_at: new Date("2026-01-01T00:00:00.000Z"),
          updated_at: new Date("2026-01-01T00:00:00.000Z"),
        },
      ],
    ]);
    const repositories = createMysqlContentRepositories(executor);

    await expect(repositories.categories.list()).resolves.toEqual([
      {
        id: 1,
        name: "咒术回战",
        wallpaperCount: 2,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    expect(executor.calls[0].sql).toContain("COUNT(w.id)");
  });

  it("lists wallpapers with category filtering and pagination", async () => {
    const executor = new FakeExecutor([
      [
        {
          id: 3,
          category_id: 7,
          category_name: "火影忍者",
          title: "鸣人壁纸",
          image_url: "https://cdn.example.com/naruto.jpg",
          oss_object_key: "wallpapers/naruto.jpg",
          is_featured: 1,
          created_at: new Date("2026-01-02T00:00:00.000Z"),
          updated_at: new Date("2026-01-02T00:00:00.000Z"),
        },
      ],
      [{ total: "9" }],
    ]);
    const repositories = createMysqlContentRepositories(executor);

    await expect(
      repositories.wallpapers.list({
        categoryId: 7,
        page: 2,
        pageSize: 3,
      }),
    ).resolves.toEqual({
      items: [
        {
          id: 3,
          categoryId: 7,
          categoryName: "火影忍者",
          title: "鸣人壁纸",
          imageUrl: "https://cdn.example.com/naruto.jpg",
          ossObjectKey: "wallpapers/naruto.jpg",
          isFeatured: true,
          createdAt: "2026-01-02T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      total: 9,
    });
    expect(executor.calls[0].params).toEqual([7, 3, 3]);
    expect(executor.calls[1].params).toEqual([7]);
  });
});

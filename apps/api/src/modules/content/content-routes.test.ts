import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { createContentRouter } from "./content-router.js";
import {
  createInMemoryContentRepositories,
  type InMemoryContentRepositories,
} from "./test-utils/in-memory-content-repositories.js";

function createTestApp(repositories: InMemoryContentRepositories) {
  return createApp({
    registerRoutes: (router) => {
      router.use(createContentRouter(repositories));
    },
  });
}

describe("content routes", () => {
  let repositories: InMemoryContentRepositories;

  beforeEach(() => {
    repositories = createInMemoryContentRepositories();
  });

  it("creates and lists anime categories for admin", async () => {
    const app = createTestApp(repositories);

    const createResponse = await request(app)
      .post("/admin/categories")
      .send({ name: "咒术回战" })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      success: true,
      data: {
        id: 1,
        name: "咒术回战",
        wallpaperCount: 0,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    });

    const listResponse = await request(app).get("/admin/categories").expect(200);

    expect(listResponse.body.data).toEqual([createResponse.body.data]);
  });

  it("rejects duplicate category names", async () => {
    const app = createTestApp(repositories);

    await request(app)
      .post("/admin/categories")
      .send({ name: "鬼灭之刃" })
      .expect(201);

    const response = await request(app)
      .post("/admin/categories")
      .send({ name: "鬼灭之刃" })
      .expect(409);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "CATEGORY_NAME_EXISTS",
        message: "动漫分类已存在",
      },
    });
  });

  it("updates and deletes empty categories", async () => {
    const app = createTestApp(repositories);

    await request(app)
      .post("/admin/categories")
      .send({ name: "旧名称" })
      .expect(201);

    const updateResponse = await request(app)
      .put("/admin/categories/1")
      .send({ name: "新名称" })
      .expect(200);

    expect(updateResponse.body.data.name).toBe("新名称");

    await request(app).delete("/admin/categories/1").expect(200);

    const listResponse = await request(app).get("/admin/categories").expect(200);
    expect(listResponse.body.data).toEqual([]);
  });

  it("prevents deleting categories that still have wallpapers", async () => {
    const app = createTestApp(repositories);

    await request(app)
      .post("/admin/categories")
      .send({ name: "海贼王" })
      .expect(201);
    await request(app)
      .post("/admin/wallpapers")
      .send({
        categoryId: 1,
        title: "路飞竖屏壁纸",
        imageUrl: "https://cdn.example.com/luffy.jpg",
        ossObjectKey: "wallpapers/luffy.jpg",
        isFeatured: true,
      })
      .expect(201);

    const response = await request(app)
      .delete("/admin/categories/1")
      .expect(409);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "CATEGORY_HAS_WALLPAPERS",
        message: "分类下已有壁纸，不能删除",
      },
    });
  });

  it("creates, lists, updates, and deletes wallpapers for admin", async () => {
    const app = createTestApp(repositories);

    await request(app)
      .post("/admin/categories")
      .send({ name: "间谍过家家" })
      .expect(201);

    const createResponse = await request(app)
      .post("/admin/wallpapers")
      .send({
        categoryId: 1,
        title: "阿尼亚手机壁纸",
        imageUrl: "https://cdn.example.com/anya.jpg",
        ossObjectKey: "wallpapers/anya.jpg",
        isFeatured: false,
      })
      .expect(201);

    expect(createResponse.body.data).toMatchObject({
      id: 1,
      categoryId: 1,
      categoryName: "间谍过家家",
      title: "阿尼亚手机壁纸",
      imageUrl: "https://cdn.example.com/anya.jpg",
      ossObjectKey: "wallpapers/anya.jpg",
      isFeatured: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    const listResponse = await request(app)
      .get("/admin/wallpapers")
      .query({ categoryId: 1, page: 1, pageSize: 10 })
      .expect(200);

    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });

    const updateResponse = await request(app)
      .put("/admin/wallpapers/1")
      .send({
        categoryId: 1,
        title: "阿尼亚精选壁纸",
        imageUrl: "https://cdn.example.com/anya-new.jpg",
        ossObjectKey: "wallpapers/anya-new.jpg",
        isFeatured: true,
      })
      .expect(200);

    expect(updateResponse.body.data).toMatchObject({
      title: "阿尼亚精选壁纸",
      imageUrl: "https://cdn.example.com/anya-new.jpg",
      isFeatured: true,
    });

    await request(app).delete("/admin/wallpapers/1").expect(200);

    const afterDeleteResponse = await request(app)
      .get("/admin/wallpapers")
      .expect(200);
    expect(afterDeleteResponse.body.data).toEqual([]);
  });

  it("rejects wallpapers that reference a missing category", async () => {
    const app = createTestApp(repositories);

    const response = await request(app)
      .post("/admin/wallpapers")
      .send({
        categoryId: 999,
        title: "不存在分类的壁纸",
        imageUrl: "https://cdn.example.com/missing.jpg",
        ossObjectKey: "wallpapers/missing.jpg",
      })
      .expect(404);

    expect(response.body).toEqual({
      success: false,
      error: {
        code: "CATEGORY_NOT_FOUND",
        message: "动漫分类不存在",
      },
    });
  });

  it("returns featured wallpapers for the mini program homepage", async () => {
    const app = createTestApp(repositories);

    await request(app).post("/admin/categories").send({ name: "火影忍者" });
    await request(app).post("/admin/wallpapers").send({
      categoryId: 1,
      title: "普通壁纸",
      imageUrl: "https://cdn.example.com/normal.jpg",
      ossObjectKey: "wallpapers/normal.jpg",
      isFeatured: false,
    });
    await request(app).post("/admin/wallpapers").send({
      categoryId: 1,
      title: "精选壁纸",
      imageUrl: "https://cdn.example.com/featured.jpg",
      ossObjectKey: "wallpapers/featured.jpg",
      isFeatured: true,
    });

    const response = await request(app)
      .get("/public/featured-wallpapers")
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      title: "精选壁纸",
      categoryName: "火影忍者",
      isFeatured: true,
    });
  });

  it("returns categories with their latest wallpapers for the anime tab", async () => {
    const app = createTestApp(repositories);

    await request(app).post("/admin/categories").send({ name: "分类 A" });
    await request(app).post("/admin/categories").send({ name: "分类 B" });
    await request(app).post("/admin/wallpapers").send({
      categoryId: 1,
      title: "A1",
      imageUrl: "https://cdn.example.com/a1.jpg",
      ossObjectKey: "wallpapers/a1.jpg",
    });
    await request(app).post("/admin/wallpapers").send({
      categoryId: 1,
      title: "A2",
      imageUrl: "https://cdn.example.com/a2.jpg",
      ossObjectKey: "wallpapers/a2.jpg",
    });
    await request(app).post("/admin/wallpapers").send({
      categoryId: 2,
      title: "B1",
      imageUrl: "https://cdn.example.com/b1.jpg",
      ossObjectKey: "wallpapers/b1.jpg",
    });

    const response = await request(app)
      .get("/public/categories-with-latest")
      .query({ latestLimit: 1 })
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toMatchObject({
      id: 1,
      name: "分类 A",
      latestWallpapers: [
        {
          title: "A2",
          categoryName: "分类 A",
        },
      ],
    });
    expect(response.body.data[1].latestWallpapers[0].title).toBe("B1");
  });

  it("returns paginated wallpapers and details for public category pages", async () => {
    const app = createTestApp(repositories);

    await request(app).post("/admin/categories").send({ name: "银魂" });
    await request(app).post("/admin/wallpapers").send({
      categoryId: 1,
      title: "银魂 1",
      imageUrl: "https://cdn.example.com/gintama-1.jpg",
      ossObjectKey: "wallpapers/gintama-1.jpg",
    });
    await request(app).post("/admin/wallpapers").send({
      categoryId: 1,
      title: "银魂 2",
      imageUrl: "https://cdn.example.com/gintama-2.jpg",
      ossObjectKey: "wallpapers/gintama-2.jpg",
    });

    const listResponse = await request(app)
      .get("/public/categories/1/wallpapers")
      .query({ page: 1, pageSize: 1 })
      .expect(200);

    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].title).toBe("银魂 2");
    expect(listResponse.body.pagination).toEqual({
      page: 1,
      pageSize: 1,
      total: 2,
      totalPages: 2,
    });

    const detailResponse = await request(app)
      .get("/public/wallpapers/1")
      .expect(200);

    expect(detailResponse.body.data).toMatchObject({
      id: 1,
      title: "银魂 1",
      categoryName: "银魂",
    });
  });
});

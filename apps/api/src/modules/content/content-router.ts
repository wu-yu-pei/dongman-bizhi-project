import { Router } from "express";
import { z } from "zod";
import {
  buildPaginatedResponse,
  buildSuccessResponse,
} from "../../shared/http-response.js";
import { validateBody } from "../../shared/validate-request.js";
import { ContentService } from "./content-service.js";
import type {
  ContentRepositories,
  WallpaperStorage,
} from "./content-types.js";

const categoryBodySchema = z.object({
  name: z.string().trim().min(1, "分类名称不能为空").max(100),
});

const wallpaperBodySchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  title: z.string().trim().min(1, "壁纸标题不能为空").max(120),
  imageUrl: z.string().url("图片地址格式不正确").max(500),
  ossObjectKey: z.string().trim().min(1, "OSS objectKey 不能为空").max(500),
  isFeatured: z.boolean().optional().default(false),
});

type CreateContentRouterOptions = {
  wallpaperStorage?: WallpaperStorage;
};

export function createContentRouter(
  repositories: ContentRepositories,
  options: CreateContentRouterOptions = {},
): Router {
  const router = Router();
  const service = new ContentService(
    repositories,
    options.wallpaperStorage,
  );

  router.get("/admin/categories", async (_req, res, next) => {
    try {
      res.json(buildSuccessResponse(await service.listCategories()));
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/admin/categories",
    validateBody(categoryBodySchema),
    async (req, res, next) => {
      try {
        res.status(201).json(
          buildSuccessResponse(await service.createCategory(req.body)),
        );
      } catch (error) {
        next(error);
      }
    },
  );

  router.put(
    "/admin/categories/:id",
    validateBody(categoryBodySchema),
    async (req, res, next) => {
      try {
        res.json(
          buildSuccessResponse(
            await service.updateCategory(readIdParam(req.params.id), req.body),
          ),
        );
      } catch (error) {
        next(error);
      }
    },
  );

  router.delete("/admin/categories/:id", async (req, res, next) => {
    try {
      res.json(
        buildSuccessResponse(
          await service.deleteCategory(readIdParam(req.params.id)),
        ),
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/admin/wallpapers", async (req, res, next) => {
    try {
      const pagination = readPagination(req.query);
      const result = await service.listWallpapers({
        ...pagination,
        categoryId: readOptionalPositiveInt(req.query.categoryId),
      });

      res.json(
        buildPaginatedResponse(result.items, {
          ...pagination,
          total: result.total,
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  router.post(
    "/admin/wallpapers",
    validateBody(wallpaperBodySchema),
    async (req, res, next) => {
      try {
        res.status(201).json(
          buildSuccessResponse(await service.createWallpaper(req.body)),
        );
      } catch (error) {
        next(error);
      }
    },
  );

  router.put(
    "/admin/wallpapers/:id",
    validateBody(wallpaperBodySchema),
    async (req, res, next) => {
      try {
        res.json(
          buildSuccessResponse(
            await service.updateWallpaper(readIdParam(req.params.id), req.body),
          ),
        );
      } catch (error) {
        next(error);
      }
    },
  );

  router.delete("/admin/wallpapers/:id", async (req, res, next) => {
    try {
      res.json(
        buildSuccessResponse(
          await service.deleteWallpaper(readIdParam(req.params.id)),
        ),
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/public/featured-wallpapers", async (req, res, next) => {
    try {
      const limit = readPositiveInt(req.query.limit, 20);
      res.json(
        buildSuccessResponse(await service.listFeaturedWallpapers(limit)),
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/public/categories-with-latest", async (req, res, next) => {
    try {
      const latestLimit = readPositiveInt(req.query.latestLimit, 4);
      res.json(
        buildSuccessResponse(
          await service.listCategoriesWithLatestWallpapers(latestLimit),
        ),
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/public/categories/:id/wallpapers", async (req, res, next) => {
    try {
      const pagination = readPagination(req.query);
      const result = await service.listPublicCategoryWallpapers(
        readIdParam(req.params.id),
        pagination,
      );

      res.json(
        buildPaginatedResponse(result.items, {
          ...pagination,
          total: result.total,
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/public/wallpapers/:id", async (req, res, next) => {
    try {
      res.json(
        buildSuccessResponse(
          await service.getWallpaperDetail(readIdParam(req.params.id)),
        ),
      );
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function readIdParam(value: unknown): number {
  return readPositiveInt(value, 0);
}

function readPagination(query: Record<string, unknown>) {
  return {
    page: readPositiveInt(query.page, 1),
    pageSize: readPositiveInt(query.pageSize, 20),
  };
}

function readOptionalPositiveInt(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return readPositiveInt(value, 0);
}

function readPositiveInt(value: unknown, defaultValue: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? defaultValue);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return parsed;
}

import type {
  CategoryRepository,
  CategoryWithCount,
  ContentRepositories,
  CreateCategoryInput,
  CreateWallpaperInput,
  ListWallpapersInput,
  PaginatedResult,
  UpdateCategoryInput,
  UpdateWallpaperInput,
  WallpaperRepository,
  WallpaperWithCategory,
} from "./content-types.js";

export type MysqlExecutor = {
  execute<T = unknown>(
    sql: string,
    params?: SqlValue[],
  ): Promise<[T, unknown]>;
};

export type SqlValue = string | number | boolean | null;

type CategoryRow = {
  id: number;
  name: string;
  wallpaper_count: number | string;
  created_at: Date | string;
  updated_at: Date | string;
};

type WallpaperRow = {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  image_url: string;
  oss_object_key: string;
  is_featured: number | boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

type CountRow = {
  total: number | string;
};

type InsertResult = {
  insertId: number;
  affectedRows: number;
};

type UpdateResult = {
  affectedRows: number;
};

const CATEGORY_SELECT = `
  SELECT
    c.id,
    c.name,
    c.created_at,
    c.updated_at,
    COUNT(w.id) AS wallpaper_count
  FROM anime_categories c
  LEFT JOIN wallpapers w ON w.category_id = c.id
`;

const WALLPAPER_SELECT = `
  SELECT
    w.id,
    w.category_id,
    c.name AS category_name,
    w.title,
    w.image_url,
    w.oss_object_key,
    w.is_featured,
    w.created_at,
    w.updated_at
  FROM wallpapers w
  INNER JOIN anime_categories c ON c.id = w.category_id
`;

export function createMysqlContentRepositories(
  executor: MysqlExecutor,
): ContentRepositories {
  const categories: CategoryRepository = {
    async list() {
      const [rows] = await executor.execute<CategoryRow[]>(
        `${CATEGORY_SELECT}
         GROUP BY c.id
         ORDER BY c.created_at ASC, c.id ASC`,
      );
      return rows.map(mapCategoryRow);
    },
    async findById(id) {
      const [rows] = await executor.execute<CategoryRow[]>(
        `${CATEGORY_SELECT}
         WHERE c.id = ?
         GROUP BY c.id
         LIMIT 1`,
        [id],
      );
      return rows[0] ? mapCategoryRow(rows[0]) : null;
    },
    async findByName(name) {
      const [rows] = await executor.execute<CategoryRow[]>(
        `${CATEGORY_SELECT}
         WHERE c.name = ?
         GROUP BY c.id
         LIMIT 1`,
        [name],
      );
      return rows[0] ? mapCategoryRow(rows[0]) : null;
    },
    async create(input: CreateCategoryInput) {
      const [result] = await executor.execute<InsertResult>(
        "INSERT INTO anime_categories (name) VALUES (?)",
        [input.name],
      );
      const category = await this.findById(result.insertId);
      if (!category) {
        throw new Error("Created category could not be loaded");
      }
      return category;
    },
    async update(id: number, input: UpdateCategoryInput) {
      const [result] = await executor.execute<UpdateResult>(
        "UPDATE anime_categories SET name = ? WHERE id = ?",
        [input.name, id],
      );
      if (result.affectedRows === 0) {
        return null;
      }
      return this.findById(id);
    },
    async delete(id) {
      const [result] = await executor.execute<UpdateResult>(
        "DELETE FROM anime_categories WHERE id = ?",
        [id],
      );
      return result.affectedRows > 0;
    },
    async countWallpapers(categoryId) {
      const [rows] = await executor.execute<CountRow[]>(
        "SELECT COUNT(*) AS total FROM wallpapers WHERE category_id = ?",
        [categoryId],
      );
      return readCount(rows);
    },
  };

  const wallpapers: WallpaperRepository = {
    async list(input: ListWallpapersInput): Promise<
      PaginatedResult<WallpaperWithCategory>
    > {
      const filters: string[] = [];
      const params: SqlValue[] = [];

      if (input.categoryId !== undefined) {
        filters.push("w.category_id = ?");
        params.push(input.categoryId);
      }

      const where = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
      const offset = (input.page - 1) * input.pageSize;

      const [rows] = await executor.execute<WallpaperRow[]>(
        `${WALLPAPER_SELECT}
         ${where}
         ORDER BY w.created_at DESC, w.id DESC
         LIMIT ? OFFSET ?`,
        [...params, input.pageSize, offset],
      );
      const [countRows] = await executor.execute<CountRow[]>(
        `SELECT COUNT(*) AS total
         FROM wallpapers w
         ${where}`,
        params,
      );

      return {
        items: rows.map(mapWallpaperRow),
        total: readCount(countRows),
      };
    },
    async findById(id) {
      const [rows] = await executor.execute<WallpaperRow[]>(
        `${WALLPAPER_SELECT}
         WHERE w.id = ?
         LIMIT 1`,
        [id],
      );
      return rows[0] ? mapWallpaperRow(rows[0]) : null;
    },
    async create(input: CreateWallpaperInput) {
      const [result] = await executor.execute<InsertResult>(
        `INSERT INTO wallpapers
          (category_id, title, image_url, oss_object_key, is_featured)
         VALUES (?, ?, ?, ?, ?)`,
        [
          input.categoryId,
          input.title,
          input.imageUrl,
          input.ossObjectKey,
          input.isFeatured ? 1 : 0,
        ],
      );
      const wallpaper = await this.findById(result.insertId);
      if (!wallpaper) {
        throw new Error("Created wallpaper could not be loaded");
      }
      return wallpaper;
    },
    async update(id: number, input: UpdateWallpaperInput) {
      const [result] = await executor.execute<UpdateResult>(
        `UPDATE wallpapers
         SET category_id = ?,
             title = ?,
             image_url = ?,
             oss_object_key = ?,
             is_featured = ?
         WHERE id = ?`,
        [
          input.categoryId,
          input.title,
          input.imageUrl,
          input.ossObjectKey,
          input.isFeatured ? 1 : 0,
          id,
        ],
      );
      if (result.affectedRows === 0) {
        return null;
      }
      return this.findById(id);
    },
    async delete(id) {
      const [result] = await executor.execute<UpdateResult>(
        "DELETE FROM wallpapers WHERE id = ?",
        [id],
      );
      return result.affectedRows > 0;
    },
    async listFeatured(limit) {
      const [rows] = await executor.execute<WallpaperRow[]>(
        `${WALLPAPER_SELECT}
         WHERE w.is_featured = 1
         ORDER BY w.created_at DESC, w.id DESC
         LIMIT ?`,
        [limit],
      );
      return rows.map(mapWallpaperRow);
    },
    async listLatestByCategory(categoryId, limit) {
      const [rows] = await executor.execute<WallpaperRow[]>(
        `${WALLPAPER_SELECT}
         WHERE w.category_id = ?
         ORDER BY w.created_at DESC, w.id DESC
         LIMIT ?`,
        [categoryId, limit],
      );
      return rows.map(mapWallpaperRow);
    },
  };

  return { categories, wallpapers };
}

function mapCategoryRow(row: CategoryRow): CategoryWithCount {
  return {
    id: row.id,
    name: row.name,
    wallpaperCount: Number(row.wallpaper_count),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapWallpaperRow(row: WallpaperRow): WallpaperWithCategory {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    title: row.title,
    imageUrl: row.image_url,
    ossObjectKey: row.oss_object_key,
    isFeatured: Boolean(row.is_featured),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function readCount(rows: CountRow[]): number {
  return Number(rows[0]?.total ?? 0);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

import { AppError } from "../../shared/app-error.js";
import type {
  CategoryWithLatestWallpapers,
  ContentRepositories,
  CreateCategoryInput,
  CreateWallpaperInput,
  ListWallpapersInput,
  PaginationInput,
  UpdateCategoryInput,
  UpdateWallpaperInput,
} from "./content-types.js";

export class ContentService {
  constructor(private readonly repositories: ContentRepositories) {}

  async listCategories() {
    return this.repositories.categories.list();
  }

  async createCategory(input: CreateCategoryInput) {
    await this.ensureCategoryNameAvailable(input.name);
    return this.repositories.categories.create(input);
  }

  async updateCategory(id: number, input: UpdateCategoryInput) {
    const category = await this.repositories.categories.findById(id);
    if (!category) {
      throw new AppError("CATEGORY_NOT_FOUND", "动漫分类不存在", 404);
    }

    const existing = await this.repositories.categories.findByName(input.name);
    if (existing && existing.id !== id) {
      throw new AppError("CATEGORY_NAME_EXISTS", "动漫分类已存在", 409);
    }

    const updated = await this.repositories.categories.update(id, input);
    if (!updated) {
      throw new AppError("CATEGORY_NOT_FOUND", "动漫分类不存在", 404);
    }

    return updated;
  }

  async deleteCategory(id: number) {
    const category = await this.repositories.categories.findById(id);
    if (!category) {
      throw new AppError("CATEGORY_NOT_FOUND", "动漫分类不存在", 404);
    }

    const wallpaperCount =
      await this.repositories.categories.countWallpapers(id);
    if (wallpaperCount > 0) {
      throw new AppError(
        "CATEGORY_HAS_WALLPAPERS",
        "分类下已有壁纸，不能删除",
        409,
      );
    }

    await this.repositories.categories.delete(id);
    return { deleted: true };
  }

  async listWallpapers(input: ListWallpapersInput) {
    if (input.categoryId !== undefined) {
      await this.ensureCategoryExists(input.categoryId);
    }

    return this.repositories.wallpapers.list(input);
  }

  async createWallpaper(input: CreateWallpaperInput) {
    await this.ensureCategoryExists(input.categoryId);
    return this.repositories.wallpapers.create(input);
  }

  async updateWallpaper(id: number, input: UpdateWallpaperInput) {
    const wallpaper = await this.repositories.wallpapers.findById(id);
    if (!wallpaper) {
      throw new AppError("WALLPAPER_NOT_FOUND", "壁纸不存在", 404);
    }

    await this.ensureCategoryExists(input.categoryId);

    const updated = await this.repositories.wallpapers.update(id, input);
    if (!updated) {
      throw new AppError("WALLPAPER_NOT_FOUND", "壁纸不存在", 404);
    }

    return updated;
  }

  async deleteWallpaper(id: number) {
    const wallpaper = await this.repositories.wallpapers.findById(id);
    if (!wallpaper) {
      throw new AppError("WALLPAPER_NOT_FOUND", "壁纸不存在", 404);
    }

    await this.repositories.wallpapers.delete(id);
    return { deleted: true };
  }

  async listFeaturedWallpapers(limit: number) {
    return this.repositories.wallpapers.listFeatured(limit);
  }

  async listCategoriesWithLatestWallpapers(
    latestLimit: number,
  ): Promise<CategoryWithLatestWallpapers[]> {
    const categories = await this.repositories.categories.list();

    return Promise.all(
      categories.map(async (category) => ({
        ...category,
        latestWallpapers:
          await this.repositories.wallpapers.listLatestByCategory(
            category.id,
            latestLimit,
          ),
      })),
    );
  }

  async listPublicCategoryWallpapers(categoryId: number, input: PaginationInput) {
    await this.ensureCategoryExists(categoryId);
    return this.repositories.wallpapers.list({
      categoryId,
      ...input,
    });
  }

  async getWallpaperDetail(id: number) {
    const wallpaper = await this.repositories.wallpapers.findById(id);
    if (!wallpaper) {
      throw new AppError("WALLPAPER_NOT_FOUND", "壁纸不存在", 404);
    }

    return wallpaper;
  }

  private async ensureCategoryNameAvailable(name: string) {
    const existing = await this.repositories.categories.findByName(name);
    if (existing) {
      throw new AppError("CATEGORY_NAME_EXISTS", "动漫分类已存在", 409);
    }
  }

  private async ensureCategoryExists(id: number) {
    const category = await this.repositories.categories.findById(id);
    if (!category) {
      throw new AppError("CATEGORY_NOT_FOUND", "动漫分类不存在", 404);
    }

    return category;
  }
}

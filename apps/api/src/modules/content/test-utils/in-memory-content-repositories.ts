import type {
  Category,
  CategoryRepository,
  CategoryWithCount,
  ContentRepositories,
  CreateCategoryInput,
  CreateWallpaperInput,
  ListWallpapersInput,
  PaginatedResult,
  UpdateCategoryInput,
  UpdateWallpaperInput,
  Wallpaper,
  WallpaperRepository,
  WallpaperWithCategory,
} from "../content-types.js";

export type InMemoryContentRepositories = ContentRepositories;

export function createInMemoryContentRepositories(): InMemoryContentRepositories {
  const state = {
    categoryId: 1,
    wallpaperId: 1,
    clock: 0,
    categories: [] as Category[],
    wallpapers: [] as Wallpaper[],
  };

  function timestamp() {
    state.clock += 1;
    return new Date(Date.UTC(2026, 0, 1, 0, 0, state.clock)).toISOString();
  }

  function categoryWithCount(category: Category): CategoryWithCount {
    return {
      ...category,
      wallpaperCount: state.wallpapers.filter(
        (wallpaper) => wallpaper.categoryId === category.id,
      ).length,
    };
  }

  function wallpaperWithCategory(
    wallpaper: Wallpaper,
  ): WallpaperWithCategory {
    const category = state.categories.find(
      (item) => item.id === wallpaper.categoryId,
    );

    return {
      ...wallpaper,
      categoryName: category?.name ?? "",
    };
  }

  function newestFirst<T extends { createdAt: string; id: number }>(
    items: T[],
  ): T[] {
    return [...items].sort((left, right) => {
      const byCreatedAt = right.createdAt.localeCompare(left.createdAt);
      return byCreatedAt === 0 ? right.id - left.id : byCreatedAt;
    });
  }

  const categories: CategoryRepository = {
    async list() {
      return state.categories.map(categoryWithCount);
    },
    async findById(id) {
      const category = state.categories.find((item) => item.id === id);
      return category ? categoryWithCount(category) : null;
    },
    async findByName(name) {
      const category = state.categories.find((item) => item.name === name);
      return category ? categoryWithCount(category) : null;
    },
    async create(input: CreateCategoryInput) {
      const now = timestamp();
      const category: Category = {
        id: state.categoryId,
        name: input.name,
        createdAt: now,
        updatedAt: now,
      };

      state.categoryId += 1;
      state.categories.push(category);
      return categoryWithCount(category);
    },
    async update(id: number, input: UpdateCategoryInput) {
      const category = state.categories.find((item) => item.id === id);
      if (!category) {
        return null;
      }

      category.name = input.name;
      category.updatedAt = timestamp();
      return categoryWithCount(category);
    },
    async delete(id: number) {
      const before = state.categories.length;
      state.categories = state.categories.filter((item) => item.id !== id);
      return state.categories.length !== before;
    },
    async countWallpapers(categoryId) {
      return state.wallpapers.filter(
        (wallpaper) => wallpaper.categoryId === categoryId,
      ).length;
    },
  };

  const wallpapers: WallpaperRepository = {
    async list(input: ListWallpapersInput): Promise<
      PaginatedResult<WallpaperWithCategory>
    > {
      const filtered = state.wallpapers.filter(
        (wallpaper) =>
          input.categoryId === undefined ||
          wallpaper.categoryId === input.categoryId,
      );
      const sorted = newestFirst(filtered).map(wallpaperWithCategory);
      const start = (input.page - 1) * input.pageSize;

      return {
        items: sorted.slice(start, start + input.pageSize),
        total: sorted.length,
      };
    },
    async findById(id) {
      const wallpaper = state.wallpapers.find((item) => item.id === id);
      return wallpaper ? wallpaperWithCategory(wallpaper) : null;
    },
    async create(input: CreateWallpaperInput) {
      const now = timestamp();
      const wallpaper: Wallpaper = {
        id: state.wallpaperId,
        categoryId: input.categoryId,
        title: input.title,
        imageUrl: input.imageUrl,
        ossObjectKey: input.ossObjectKey,
        isFeatured: input.isFeatured,
        createdAt: now,
        updatedAt: now,
      };

      state.wallpaperId += 1;
      state.wallpapers.push(wallpaper);
      return wallpaperWithCategory(wallpaper);
    },
    async update(id: number, input: UpdateWallpaperInput) {
      const wallpaper = state.wallpapers.find((item) => item.id === id);
      if (!wallpaper) {
        return null;
      }

      wallpaper.categoryId = input.categoryId;
      wallpaper.title = input.title;
      wallpaper.imageUrl = input.imageUrl;
      wallpaper.ossObjectKey = input.ossObjectKey;
      wallpaper.isFeatured = input.isFeatured;
      wallpaper.updatedAt = timestamp();
      return wallpaperWithCategory(wallpaper);
    },
    async delete(id) {
      const before = state.wallpapers.length;
      state.wallpapers = state.wallpapers.filter((item) => item.id !== id);
      return state.wallpapers.length !== before;
    },
    async listFeatured(limit) {
      return newestFirst(
        state.wallpapers.filter((wallpaper) => wallpaper.isFeatured),
      )
        .slice(0, limit)
        .map(wallpaperWithCategory);
    },
    async listLatestByCategory(categoryId, limit) {
      return newestFirst(
        state.wallpapers.filter(
          (wallpaper) => wallpaper.categoryId === categoryId,
        ),
      )
        .slice(0, limit)
        .map(wallpaperWithCategory);
    },
  };

  return { categories, wallpapers };
}

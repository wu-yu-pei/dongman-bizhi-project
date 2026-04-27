export type Category = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryWithCount = Category & {
  wallpaperCount: number;
};

export type Wallpaper = {
  id: number;
  categoryId: number;
  title: string;
  imageUrl: string;
  ossObjectKey: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WallpaperWithCategory = Wallpaper & {
  categoryName: string;
};

export type CategoryWithLatestWallpapers = CategoryWithCount & {
  latestWallpapers: WallpaperWithCategory[];
};

export type PaginationInput = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
};

export type CreateCategoryInput = {
  name: string;
};

export type UpdateCategoryInput = {
  name: string;
};

export type CreateWallpaperInput = {
  categoryId: number;
  title: string;
  imageUrl: string;
  ossObjectKey: string;
  isFeatured: boolean;
};

export type UpdateWallpaperInput = CreateWallpaperInput;

export type ListWallpapersInput = PaginationInput & {
  categoryId?: number;
};

export type CategoryRepository = {
  list(): Promise<CategoryWithCount[]>;
  findById(id: number): Promise<CategoryWithCount | null>;
  findByName(name: string): Promise<CategoryWithCount | null>;
  create(input: CreateCategoryInput): Promise<CategoryWithCount>;
  update(
    id: number,
    input: UpdateCategoryInput,
  ): Promise<CategoryWithCount | null>;
  delete(id: number): Promise<boolean>;
  countWallpapers(categoryId: number): Promise<number>;
};

export type WallpaperRepository = {
  list(input: ListWallpapersInput): Promise<PaginatedResult<WallpaperWithCategory>>;
  findById(id: number): Promise<WallpaperWithCategory | null>;
  create(input: CreateWallpaperInput): Promise<WallpaperWithCategory>;
  update(
    id: number,
    input: UpdateWallpaperInput,
  ): Promise<WallpaperWithCategory | null>;
  delete(id: number): Promise<boolean>;
  listFeatured(limit: number): Promise<WallpaperWithCategory[]>;
  listLatestByCategory(
    categoryId: number,
    limit: number,
  ): Promise<WallpaperWithCategory[]>;
};

export type WallpaperStorage = {
  deleteObject(objectKey: string): Promise<void>;
};

export type ContentRepositories = {
  categories: CategoryRepository;
  wallpapers: WallpaperRepository;
};

<template>
  <div class="admin-shell">
    <aside class="side-panel">
      <div class="brand">
        <span class="brand-mark">漫</span>
        <div>
          <h1>动漫壁纸库</h1>
          <p>内容后台</p>
        </div>
      </div>

      <div class="metric-strip">
        <div class="metric">
          <strong>{{ categories.length }}</strong>
          <span>动漫分类</span>
        </div>
        <div class="metric">
          <strong>{{ pagination.total }}</strong>
          <span>壁纸数量</span>
        </div>
      </div>

      <section>
        <div class="section-header">
          <div class="section-title">
            <h2>分类管理</h2>
            <p>按动漫名称组织内容</p>
          </div>
          <el-button :icon="Refresh" text @click="reload">刷新</el-button>
        </div>

        <form class="category-tools" @submit.prevent="saveCategory">
          <el-input
            v-model="categoryDraft"
            maxlength="100"
            placeholder="动漫名称"
            clearable
          />
          <el-button native-type="submit" type="primary" :icon="Check">
            {{ editingCategoryId ? "更新" : "新增" }}
          </el-button>
        </form>

        <div class="category-list">
          <button
            class="category-item"
            :class="{ 'is-active': selectedCategoryId === undefined }"
            type="button"
            @click="selectCategory(undefined)"
          >
            <span>
              <span class="category-name">全部壁纸</span>
              <span class="category-meta">查看所有分类内容</span>
            </span>
          </button>

          <button
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{ 'is-active': selectedCategoryId === category.id }"
            type="button"
            @click="selectCategory(category.id)"
          >
            <span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-meta">{{ category.wallpaperCount }} 张壁纸</span>
            </span>
            <span class="category-actions">
              <el-button
                :icon="Edit"
                text
                @click.stop="startEditCategory(category)"
              />
              <el-button
                :icon="Delete"
                text
                class="danger-link"
                @click.stop="removeCategory(category)"
              />
            </span>
          </button>
        </div>
      </section>
    </aside>

    <main class="workspace">
      <header class="workspace-header">
        <div class="workspace-title">
          <h2>壁纸管理</h2>
          <p>{{ activeCategoryLabel }}</p>
        </div>
        <el-button type="primary" :icon="UploadFilled" @click="openCreateWallpaper">
          上传壁纸
        </el-button>
      </header>

      <section class="wallpaper-toolbar">
        <div class="filter-group">
          <span class="time-text">分类筛选</span>
          <el-select
            v-model="selectedCategoryId"
            clearable
            placeholder="全部分类"
            @change="onFilterChange"
            @clear="onFilterClear"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </div>
        <el-button :icon="Refresh" @click="reload">刷新</el-button>
      </section>

      <section class="wallpaper-panel">
        <div class="wallpaper-grid">
          <div class="wallpaper-head">
            <span>壁纸</span>
            <span>精选</span>
            <span>时间</span>
            <span></span>
          </div>

          <div v-if="wallpapers.length === 0" class="panel-footer">
            <el-empty description="还没有壁纸" />
          </div>

          <div
            v-for="wallpaper in wallpapers"
            :key="wallpaper.id"
            class="wallpaper-row"
          >
            <div class="wallpaper-info">
              <div class="thumb">
                <img :src="thumbnailUrl(wallpaper.imageUrl)" :alt="wallpaper.title" />
              </div>
              <div>
                <p class="wallpaper-title">{{ wallpaper.title }}</p>
                <span class="wallpaper-subtitle">{{ wallpaper.categoryName }}</span>
              </div>
            </div>
            <div>
              <el-tag v-if="wallpaper.isFeatured" type="warning">精选</el-tag>
              <el-tag v-else type="info">普通</el-tag>
            </div>
            <span class="time-text">{{ formatDate(wallpaper.createdAt) }}</span>
            <div class="row-actions">
              <el-button :icon="Edit" @click="openEditWallpaper(wallpaper)">
                编辑
              </el-button>
              <el-button
                :icon="Delete"
                class="danger-link"
                @click="removeWallpaper(wallpaper)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>

        <div v-if="pagination.total > pagination.pageSize" class="panel-footer">
          <el-pagination
            layout="prev, pager, next"
            :current-page="pagination.page"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            @current-change="changePage"
          />
        </div>
      </section>
    </main>

    <el-dialog
      v-model="wallpaperDialogVisible"
      :title="wallpaperForm.id ? '编辑壁纸' : '上传壁纸'"
      width="min(680px, calc(100vw - 24px))"
    >
      <div class="dialog-grid">
        <el-form label-position="top">
          <el-form-item label="所属动漫">
            <el-select v-model="wallpaperForm.categoryId" placeholder="选择动漫分类">
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="壁纸标题">
            <el-input v-model="wallpaperForm.title" maxlength="120" />
          </el-form-item>

          <el-form-item label="手机竖屏图片">
            <el-upload
              :auto-upload="false"
              :limit="1"
              :show-file-list="true"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
            >
              <el-button :icon="UploadFilled">选择图片</el-button>
            </el-upload>
          </el-form-item>

          <el-form-item label="精选">
            <el-switch v-model="wallpaperForm.isFeatured" />
          </el-form-item>
        </el-form>

        <div class="preview-frame">
          <img
            v-if="wallpaperPreviewUrl"
            :src="wallpaperPreviewUrl"
            alt="壁纸预览"
          />
          <div v-else class="preview-empty">预览</div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="wallpaperDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="savingWallpaper" @click="saveWallpaper">
            保存壁纸
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox, type UploadFile } from "element-plus";
import {
  Check,
  Delete,
  Edit,
  Refresh,
  UploadFilled,
} from "@element-plus/icons-vue";
import {
  adminApi,
  ApiError,
  type AdminApi,
  type Category,
  type Pagination,
  type Wallpaper,
} from "./services/adminApi";
import { uploadWallpaperFile } from "./services/ossUpload";

const props = withDefaults(
  defineProps<{
    api?: AdminApi;
  }>(),
  {
    api: () => adminApi,
  },
);

const categories = ref<Category[]>([]);
const wallpapers = ref<Wallpaper[]>([]);
const selectedCategoryId = ref<number | undefined>();
const categoryDraft = ref("");
const editingCategoryId = ref<number | undefined>();
const loading = ref(false);
const savingWallpaper = ref(false);
const wallpaperDialogVisible = ref(false);
const selectedFile = ref<File | undefined>();
const wallpaperPreviewUrl = ref("");
const pagination = reactive<Pagination>({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
});
const wallpaperForm = reactive<{
  id?: number;
  categoryId?: number;
  title: string;
  imageUrl: string;
  ossObjectKey: string;
  isFeatured: boolean;
}>({
  categoryId: undefined,
  title: "",
  imageUrl: "",
  ossObjectKey: "",
  isFeatured: false,
});

const activeCategoryLabel = computed(() => {
  const category = categories.value.find(
    (item) => item.id === selectedCategoryId.value,
  );
  return category ? `${category.name} / ${category.wallpaperCount} 张` : "全部内容";
});

onMounted(() => {
  void reload();
});

async function reload() {
  loading.value = true;
  try {
    await Promise.all([loadCategories(), loadWallpapers()]);
  } catch (error) {
    showError(error);
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  categories.value = await props.api.listCategories();
}

async function loadWallpapers() {
  const result = await props.api.listWallpapers({
    categoryId: selectedCategoryId.value,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
  wallpapers.value = result.data;
  Object.assign(pagination, result.pagination);
}

function selectCategory(categoryId: number | undefined) {
  selectedCategoryId.value = categoryId;
  pagination.page = 1;
  void loadWallpapers().catch(showError);
}

function onFilterChange() {
  pagination.page = 1;
  void loadWallpapers().catch(showError);
}

function onFilterClear() {
  selectCategory(undefined);
}

function changePage(page: number) {
  pagination.page = page;
  void loadWallpapers().catch(showError);
}

function startEditCategory(category: Category) {
  editingCategoryId.value = category.id;
  categoryDraft.value = category.name;
}

async function saveCategory() {
  const name = categoryDraft.value.trim();
  if (!name) {
    ElMessage.warning("请填写动漫名称");
    return;
  }

  try {
    if (editingCategoryId.value) {
      await props.api.updateCategory(editingCategoryId.value, { name });
      ElMessage.success("分类已更新");
    } else {
      await props.api.createCategory({ name });
      ElMessage.success("分类已新增");
    }
    categoryDraft.value = "";
    editingCategoryId.value = undefined;
    await loadCategories();
  } catch (error) {
    showError(error);
  }
}

async function removeCategory(category: Category) {
  try {
    await ElMessageBox.confirm(`删除分类「${category.name}」？`, "确认删除", {
      type: "warning",
    });
    await props.api.deleteCategory(category.id);
    if (selectedCategoryId.value === category.id) {
      selectedCategoryId.value = undefined;
    }
    await reload();
    ElMessage.success("分类已删除");
  } catch (error) {
    if (error !== "cancel") showError(error);
  }
}

function openCreateWallpaper() {
  resetWallpaperForm();
  wallpaperForm.categoryId = selectedCategoryId.value ?? categories.value[0]?.id;
  wallpaperDialogVisible.value = true;
}

function openEditWallpaper(wallpaper: Wallpaper) {
  resetWallpaperForm();
  wallpaperForm.id = wallpaper.id;
  wallpaperForm.categoryId = wallpaper.categoryId;
  wallpaperForm.title = wallpaper.title;
  wallpaperForm.imageUrl = wallpaper.imageUrl;
  wallpaperForm.ossObjectKey = wallpaper.ossObjectKey;
  wallpaperForm.isFeatured = wallpaper.isFeatured;
  wallpaperPreviewUrl.value = wallpaper.imageUrl;
  wallpaperDialogVisible.value = true;
}

function handleFileChange(uploadFile: UploadFile) {
  selectedFile.value = uploadFile.raw;
  if (uploadFile.raw) {
    wallpaperPreviewUrl.value = URL.createObjectURL(uploadFile.raw);
  }
}

function handleFileRemove() {
  selectedFile.value = undefined;
  wallpaperPreviewUrl.value = wallpaperForm.imageUrl;
}

async function saveWallpaper() {
  if (!wallpaperForm.categoryId) {
    ElMessage.warning("请选择动漫分类");
    return;
  }
  if (!wallpaperForm.title.trim()) {
    ElMessage.warning("请填写壁纸标题");
    return;
  }

  savingWallpaper.value = true;
  try {
    let imageUrl = wallpaperForm.imageUrl;
    let ossObjectKey = wallpaperForm.ossObjectKey;

    if (selectedFile.value) {
      const uploaded = await uploadWallpaperFile({
        api: props.api,
        file: selectedFile.value,
      });
      imageUrl = uploaded.imageUrl;
      ossObjectKey = uploaded.ossObjectKey;
    }

    if (!imageUrl || !ossObjectKey) {
      ElMessage.warning("请选择壁纸图片");
      return;
    }

    const payload = {
      categoryId: wallpaperForm.categoryId,
      title: wallpaperForm.title.trim(),
      imageUrl,
      ossObjectKey,
      isFeatured: wallpaperForm.isFeatured,
    };

    if (wallpaperForm.id) {
      await props.api.updateWallpaper(wallpaperForm.id, payload);
      ElMessage.success("壁纸已更新");
    } else {
      await props.api.createWallpaper(payload);
      ElMessage.success("壁纸已保存");
    }

    wallpaperDialogVisible.value = false;
    await reload();
  } catch (error) {
    showError(error);
  } finally {
    savingWallpaper.value = false;
  }
}

async function removeWallpaper(wallpaper: Wallpaper) {
  try {
    await ElMessageBox.confirm(`删除壁纸「${wallpaper.title}」？`, "确认删除", {
      type: "warning",
    });
    await props.api.deleteWallpaper(wallpaper.id);
    await reload();
    ElMessage.success("壁纸已删除");
  } catch (error) {
    if (error !== "cancel") showError(error);
  }
}

function resetWallpaperForm() {
  selectedFile.value = undefined;
  wallpaperPreviewUrl.value = "";
  Object.assign(wallpaperForm, {
    id: undefined,
    categoryId: undefined,
    title: "",
    imageUrl: "",
    ossObjectKey: "",
    isFeatured: false,
  });
}

function thumbnailUrl(url: string) {
  return `${url}?x-oss-process=image/resize,w_240/quality,q_80`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function showError(error: unknown) {
  if (error instanceof ApiError) {
    ElMessage.error(error.message);
    return;
  }
  if (error instanceof TypeError) {
    ElMessage.error("无法连接 API 服务");
    return;
  }
  if (error instanceof Error) {
    ElMessage.error(error.message);
    return;
  }
  ElMessage.error("操作失败");
}
</script>

import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import App from "./App.vue";
import type { AdminApi } from "./services/adminApi";

describe("Admin App", () => {
  it("renders the content management workspace with loaded data", async () => {
    const api = {
      listCategories: vi.fn().mockResolvedValue([
        {
          id: 1,
          name: "咒术回战",
          wallpaperCount: 2,
          createdAt: "2026-04-27T00:00:00.000Z",
          updatedAt: "2026-04-27T00:00:00.000Z",
        },
      ]),
      listWallpapers: vi.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            categoryId: 1,
            categoryName: "咒术回战",
            title: "五条悟壁纸",
            imageUrl: "https://cdn.example.com/gojo.jpg",
            ossObjectKey: "wallpapers/gojo.jpg",
            isFeatured: true,
            createdAt: "2026-04-27T00:00:00.000Z",
            updatedAt: "2026-04-27T00:00:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        },
      }),
    } as unknown as AdminApi;

    const wrapper = mount(App, {
      props: { api },
      global: {
        stubs: {
          ElButton: { template: "<button><slot /></button>" },
          ElInput: { template: "<input />" },
          ElSelect: { template: "<select><slot /></select>" },
          ElOption: { template: "<option><slot /></option>" },
          ElSwitch: { template: "<input type=\"checkbox\" />" },
          ElDialog: { template: "<div><slot /></div>" },
          ElForm: { template: "<form><slot /></form>" },
          ElFormItem: { template: "<label><slot /></label>" },
          ElUpload: { template: "<div><slot /></div>" },
          ElTag: { template: "<span><slot /></span>" },
          ElIcon: { template: "<span><slot /></span>" },
          ElEmpty: { template: "<div><slot /></div>" },
          ElPagination: { template: "<nav />" },
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("动漫壁纸库");
    expect(wrapper.text()).toContain("分类管理");
    expect(wrapper.text()).toContain("壁纸管理");
    expect(wrapper.text()).toContain("上传壁纸");
    expect(wrapper.text()).toContain("咒术回战");
    expect(wrapper.text()).toContain("五条悟壁纸");
  });
});

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

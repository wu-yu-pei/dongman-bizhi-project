import { describe, expect, it, vi } from "vitest";
import { createOssObjectStorage } from "./oss-object-storage.js";

describe("createOssObjectStorage", () => {
  it("deletes objects through the injected OSS client", async () => {
    const deleteObject = vi.fn().mockResolvedValue({});
    const createClient = vi.fn(() => ({ delete: deleteObject }));
    const storage = createOssObjectStorage(
      {
        region: "oss-cn-hangzhou",
        bucket: "dongman-wallpapers",
        accessKeyId: "access-key",
        accessKeySecret: "access-secret",
        cdnBaseUrl: "https://cdn.example.com",
        uploadDir: "wallpapers",
      },
      createClient,
    );

    expect(createClient).not.toHaveBeenCalled();

    await storage.deleteObject("wallpapers/anya.jpg");

    expect(createClient).toHaveBeenCalledWith({
      region: "oss-cn-hangzhou",
      accessKeyId: "access-key",
      accessKeySecret: "access-secret",
      bucket: "dongman-wallpapers",
    });
    expect(deleteObject).toHaveBeenCalledWith("wallpapers/anya.jpg");
  });

  it("fails with a clear app error when OSS storage config is missing", async () => {
    const storage = createOssObjectStorage(
      {
        region: "oss-cn-hangzhou",
        bucket: "",
        accessKeyId: "",
        accessKeySecret: "",
        cdnBaseUrl: "",
        uploadDir: "wallpapers",
      },
      () => ({
        delete: vi.fn(),
      }),
    );

    await expect(storage.deleteObject("wallpapers/anya.jpg")).rejects.toThrow(
      "OSS 配置不完整",
    );
  });
});

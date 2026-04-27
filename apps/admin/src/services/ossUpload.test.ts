import { describe, expect, it, vi } from "vitest";
import { uploadWallpaperFile } from "./ossUpload";
import type { AdminApi } from "./adminApi";

describe("uploadWallpaperFile", () => {
  it("gets an OSS policy, posts a multipart form to OSS, and returns metadata", async () => {
    const file = new File(["wallpaper"], "Anya.png", { type: "image/png" });
    const requestOssPolicy = vi.fn().mockResolvedValue({
      host: "https://bucket.oss-cn-hangzhou.aliyuncs.com",
      objectKey: "wallpapers/2026/04/27/fixed.png",
      imageUrl: "https://cdn.example.com/wallpapers/2026/04/27/fixed.png",
      expireAt: "2026-04-27T12:44:56.000Z",
      formData: {
        key: "wallpapers/2026/04/27/fixed.png",
        policy: "policy",
        "x-oss-credential": "credential",
        "x-oss-date": "20260427T123456Z",
        "x-oss-signature-version": "OSS4-HMAC-SHA256",
        signature: "signature",
        success_action_status: "200",
      },
    });
    const api = { requestOssPolicy } as unknown as AdminApi;
    const fetcher = vi.fn().mockResolvedValue({ ok: true });

    await expect(
      uploadWallpaperFile({ api, file, fetcher }),
    ).resolves.toEqual({
      imageUrl: "https://cdn.example.com/wallpapers/2026/04/27/fixed.png",
      ossObjectKey: "wallpapers/2026/04/27/fixed.png",
    });

    expect(requestOssPolicy).toHaveBeenCalledWith({
      filename: "Anya.png",
      contentType: "image/png",
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://bucket.oss-cn-hangzhou.aliyuncs.com",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );
    const formData = fetcher.mock.calls[0][1].body as FormData;
    expect(formData.get("key")).toBe("wallpapers/2026/04/27/fixed.png");
    expect(formData.get("signature")).toBe("signature");
    expect(formData.get("file")).toBe(file);
  });

  it("throws a clear error when OSS upload fails", async () => {
    const api = {
      requestOssPolicy: vi.fn().mockResolvedValue({
        host: "https://bucket.oss-cn-hangzhou.aliyuncs.com",
        objectKey: "wallpapers/fail.png",
        imageUrl: "https://cdn.example.com/wallpapers/fail.png",
        expireAt: "2026-04-27T12:44:56.000Z",
        formData: {
          key: "wallpapers/fail.png",
          policy: "policy",
          "x-oss-credential": "credential",
          "x-oss-date": "20260427T123456Z",
          "x-oss-signature-version": "OSS4-HMAC-SHA256",
          signature: "signature",
          success_action_status: "200",
        },
      }),
    } as unknown as AdminApi;
    const fetcher = vi.fn().mockResolvedValue({ ok: false, status: 403 });

    await expect(
      uploadWallpaperFile({
        api,
        file: new File(["wallpaper"], "fail.png", { type: "image/png" }),
        fetcher,
      }),
    ).rejects.toThrow("OSS 上传失败");
  });
});

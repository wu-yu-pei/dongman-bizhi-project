import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { createUploadRouter } from "./upload-router.js";
import { OssPolicyService } from "./oss-policy-service.js";

describe("upload routes", () => {
  it("returns an OSS upload policy in the shared success envelope", async () => {
    const policyService = new OssPolicyService({
      config: {
        region: "oss-cn-shanghai",
        bucket: "dongman-wallpapers",
        accessKeyId: "test-access-key",
        accessKeySecret: "test-secret",
        cdnBaseUrl: "https://cdn.example.com",
        uploadDir: "wallpapers",
      },
      now: () => new Date("2026-04-27T12:34:56.000Z"),
      randomId: () => "route-id",
    });
    const app = createApp({
      registerRoutes: (router) => {
        router.use(createUploadRouter(policyService));
      },
    });

    const response = await request(app)
      .post("/admin/uploads/oss-policy")
      .send({
        filename: "wallpaper.jpg",
        contentType: "image/jpeg",
      })
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        host: "https://dongman-wallpapers.oss-cn-shanghai.aliyuncs.com",
        objectKey: "wallpapers/2026/04/27/route-id.jpg",
        imageUrl: "https://cdn.example.com/wallpapers/2026/04/27/route-id.jpg",
        formData: {
          key: "wallpapers/2026/04/27/route-id.jpg",
          "x-oss-signature-version": "OSS4-HMAC-SHA256",
          success_action_status: "200",
        },
      },
    });
  });
});

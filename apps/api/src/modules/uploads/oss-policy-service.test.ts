import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { OssPolicyService } from "./oss-policy-service.js";

describe("OssPolicyService", () => {
  it("creates a V4 POST policy for direct browser uploads", () => {
    const service = new OssPolicyService({
      config: {
        region: "oss-cn-hangzhou",
        bucket: "dongman-wallpapers",
        accessKeyId: "test-access-key",
        accessKeySecret: "test-secret",
        cdnBaseUrl: "https://cdn.example.com/",
        uploadDir: "wallpapers",
      },
      now: () => new Date("2026-04-27T12:34:56.000Z"),
      randomId: () => "fixed-id",
    });

    const result = service.createUploadPolicy({
      filename: "Anya.PNG",
      contentType: "image/png",
    });

    expect(result.host).toBe(
      "https://dongman-wallpapers.oss-cn-hangzhou.aliyuncs.com",
    );
    expect(result.objectKey).toBe("wallpapers/2026/04/27/fixed-id.png");
    expect(result.imageUrl).toBe(
      "https://cdn.example.com/wallpapers/2026/04/27/fixed-id.png",
    );
    expect(result.expireAt).toBe("2026-04-27T12:44:56.000Z");
    expect(result.formData).toMatchObject({
      key: "wallpapers/2026/04/27/fixed-id.png",
      "x-oss-credential":
        "test-access-key/20260427/cn-hangzhou/oss/aliyun_v4_request",
      "x-oss-date": "20260427T123456Z",
      "x-oss-signature-version": "OSS4-HMAC-SHA256",
      success_action_status: "200",
    });

    const decodedPolicy = JSON.parse(
      Buffer.from(result.formData.policy, "base64").toString("utf8"),
    );
    expect(decodedPolicy).toEqual({
      expiration: "2026-04-27T12:44:56.000Z",
      conditions: [
        { bucket: "dongman-wallpapers" },
        ["starts-with", "$key", "wallpapers/"],
        ["content-length-range", 1, 20 * 1024 * 1024],
        {
          "x-oss-credential":
            "test-access-key/20260427/cn-hangzhou/oss/aliyun_v4_request",
        },
        { "x-oss-date": "20260427T123456Z" },
        { "x-oss-signature-version": "OSS4-HMAC-SHA256" },
        { success_action_status: "200" },
      ],
    });
    expect(result.formData.signature).toBe(
      signV4Policy({
        accessKeySecret: "test-secret",
        dateStamp: "20260427",
        region: "cn-hangzhou",
        encodedPolicy: result.formData.policy,
      }),
    );
  });

  it("rejects unsupported wallpaper file extensions", () => {
    const service = new OssPolicyService({
      config: {
        region: "oss-cn-hangzhou",
        bucket: "dongman-wallpapers",
        accessKeyId: "test-access-key",
        accessKeySecret: "test-secret",
        cdnBaseUrl: "https://cdn.example.com",
        uploadDir: "wallpapers",
      },
      now: () => new Date("2026-04-27T12:34:56.000Z"),
      randomId: () => "fixed-id",
    });

    expect(() =>
      service.createUploadPolicy({
        filename: "wallpaper.gif",
        contentType: "image/gif",
      }),
    ).toThrow("仅支持 jpg、jpeg、png、webp 格式的壁纸");
  });
});

function signV4Policy(input: {
  accessKeySecret: string;
  dateStamp: string;
  region: string;
  encodedPolicy: string;
}) {
  const dateKey = hmac(`aliyun_v4${input.accessKeySecret}`, input.dateStamp);
  const dateRegionKey = hmac(dateKey, input.region);
  const dateRegionServiceKey = hmac(dateRegionKey, "oss");
  const signingKey = hmac(dateRegionServiceKey, "aliyun_v4_request");

  return crypto
    .createHmac("sha256", signingKey)
    .update(input.encodedPolicy)
    .digest("hex");
}

function hmac(key: string | Buffer, value: string) {
  return crypto.createHmac("sha256", key).update(value).digest();
}

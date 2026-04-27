import { describe, expect, it } from "vitest";
import { loadConfigFromEnv } from "./env.js";

describe("loadConfigFromEnv", () => {
  it("parses API, MySQL, and OSS settings from environment variables", () => {
    const config = loadConfigFromEnv({
      NODE_ENV: "test",
      API_PORT: "4100",
      API_CORS_ORIGIN: "http://localhost:5173",
      MYSQL_HOST: "db.local",
      MYSQL_PORT: "3307",
      MYSQL_DATABASE: "dongman_bizhi_test",
      MYSQL_USER: "tester",
      MYSQL_PASSWORD: "secret",
      ALIYUN_OSS_REGION: "oss-cn-shanghai",
      ALIYUN_OSS_BUCKET: "wallpapers",
      ALIYUN_OSS_ACCESS_KEY_ID: "access-key",
      ALIYUN_OSS_ACCESS_KEY_SECRET: "access-secret",
      ALIYUN_OSS_CDN_BASE_URL: "https://cdn.example.com",
      ALIYUN_OSS_UPLOAD_DIR: "mobile-wallpapers",
    });

    expect(config).toEqual({
      nodeEnv: "test",
      api: {
        port: 4100,
        corsOrigin: "http://localhost:5173",
      },
      mysql: {
        host: "db.local",
        port: 3307,
        database: "dongman_bizhi_test",
        user: "tester",
        password: "secret",
      },
      oss: {
        region: "oss-cn-shanghai",
        bucket: "wallpapers",
        accessKeyId: "access-key",
        accessKeySecret: "access-secret",
        cdnBaseUrl: "https://cdn.example.com",
        uploadDir: "mobile-wallpapers",
      },
    });
  });

  it("uses safe local defaults for optional development settings", () => {
    const config = loadConfigFromEnv({});

    expect(config.nodeEnv).toBe("development");
    expect(config.api.port).toBe(3000);
    expect(config.api.corsOrigin).toBe("*");
    expect(config.mysql.host).toBe("127.0.0.1");
    expect(config.mysql.port).toBe(3306);
    expect(config.mysql.database).toBe("dongman_bizhi");
    expect(config.mysql.user).toBe("root");
    expect(config.mysql.password).toBe("");
    expect(config.oss.uploadDir).toBe("wallpapers");
  });
});

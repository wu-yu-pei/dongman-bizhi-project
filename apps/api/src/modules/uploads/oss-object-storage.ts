import OSS from "ali-oss";
import type { AppConfig } from "../../config/env.js";
import { AppError } from "../../shared/app-error.js";
import type { WallpaperStorage } from "../content/content-types.js";

type OssConfig = AppConfig["oss"];
type OssClient = {
  delete(objectKey: string): Promise<unknown>;
};
type OssClientFactory = (options: {
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
}) => OssClient;

export function createOssObjectStorage(
  config: OssConfig,
  createClient: OssClientFactory = (options) => new OSS(options),
): WallpaperStorage {
  let client: OssClient | null = null;

  return {
    async deleteObject(objectKey: string) {
      client ??= createClient(readClientOptions(config));
      await client.delete(objectKey);
    },
  };
}

function readClientOptions(config: OssConfig) {
  const missing = [
    ["ALIYUN_OSS_REGION", config.region],
    ["ALIYUN_OSS_BUCKET", config.bucket],
    ["ALIYUN_OSS_ACCESS_KEY_ID", config.accessKeyId],
    ["ALIYUN_OSS_ACCESS_KEY_SECRET", config.accessKeySecret],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new AppError(
      "OSS_CONFIG_MISSING",
      "OSS 配置不完整",
      500,
      missing.map(([name]) => name),
    );
  }

  return {
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
  };
}

export type AppConfig = {
  nodeEnv: string;
  api: {
    port: number;
    corsOrigin: string;
  };
  mysql: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  oss: {
    region: string;
    bucket: string;
    accessKeyId: string;
    accessKeySecret: string;
    cdnBaseUrl: string;
    uploadDir: string;
  };
};

type EnvInput = Record<string, string | undefined>;

function readNumber(
  env: EnvInput,
  key: string,
  defaultValue: number,
): number {
  const value = env[key];
  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function readString(
  env: EnvInput,
  key: string,
  defaultValue = "",
): string {
  return env[key] ?? defaultValue;
}

export function loadConfigFromEnv(env: EnvInput = process.env): AppConfig {
  return {
    nodeEnv: readString(env, "NODE_ENV", "development"),
    api: {
      port: readNumber(env, "API_PORT", 3000),
      corsOrigin: readString(env, "API_CORS_ORIGIN", "*"),
    },
    mysql: {
      host: readString(env, "MYSQL_HOST", "127.0.0.1"),
      port: readNumber(env, "MYSQL_PORT", 3306),
      database: readString(env, "MYSQL_DATABASE", "dongman_bizhi"),
      user: readString(env, "MYSQL_USER", "root"),
      password: readString(env, "MYSQL_PASSWORD", ""),
    },
    oss: {
      region: readString(env, "ALIYUN_OSS_REGION", "oss-cn-hangzhou"),
      bucket: readString(env, "ALIYUN_OSS_BUCKET", ""),
      accessKeyId: readString(env, "ALIYUN_OSS_ACCESS_KEY_ID", ""),
      accessKeySecret: readString(env, "ALIYUN_OSS_ACCESS_KEY_SECRET", ""),
      cdnBaseUrl: readString(env, "ALIYUN_OSS_CDN_BASE_URL", ""),
      uploadDir: readString(env, "ALIYUN_OSS_UPLOAD_DIR", "wallpapers"),
    },
  };
}

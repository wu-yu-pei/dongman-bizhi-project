import crypto from "node:crypto";
import { AppError } from "../../shared/app-error.js";
import type { AppConfig } from "../../config/env.js";

type OssConfig = AppConfig["oss"];

type OssPolicyServiceOptions = {
  config: OssConfig;
  now?: () => Date;
  randomId?: () => string;
  maxSizeBytes?: number;
  expiresInSeconds?: number;
};

type CreateUploadPolicyInput = {
  filename: string;
  contentType: string;
};

type UploadPolicyResult = {
  host: string;
  objectKey: string;
  imageUrl: string;
  expireAt: string;
  formData: {
    key: string;
    policy: string;
    "x-oss-credential": string;
    "x-oss-date": string;
    "x-oss-signature-version": "OSS4-HMAC-SHA256";
    signature: string;
    success_action_status: "200";
  };
};

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const DEFAULT_MAX_SIZE_BYTES = 20 * 1024 * 1024;
const DEFAULT_EXPIRES_IN_SECONDS = 10 * 60;

export class OssPolicyService {
  private readonly config: OssConfig;
  private readonly now: () => Date;
  private readonly randomId: () => string;
  private readonly maxSizeBytes: number;
  private readonly expiresInSeconds: number;

  constructor(options: OssPolicyServiceOptions) {
    this.config = options.config;
    this.now = options.now ?? (() => new Date());
    this.randomId = options.randomId ?? (() => crypto.randomUUID());
    this.maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
    this.expiresInSeconds =
      options.expiresInSeconds ?? DEFAULT_EXPIRES_IN_SECONDS;
  }

  createUploadPolicy(input: CreateUploadPolicyInput): UploadPolicyResult {
    this.ensureConfigured();

    const extension = readWallpaperExtension(input.filename);
    const now = this.now();
    const expireAt = new Date(now.getTime() + this.expiresInSeconds * 1000);
    const objectKey = this.buildObjectKey(now, extension);
    const standardRegion = getStandardRegion(this.config.region);
    const dateStamp = formatDateStamp(now);
    const ossDate = formatOssDate(now);
    const credential = `${this.config.accessKeyId}/${dateStamp}/${standardRegion}/oss/aliyun_v4_request`;
    const policy = {
      expiration: expireAt.toISOString(),
      conditions: [
        { bucket: this.config.bucket },
        ["starts-with", "$key", `${normalizeDir(this.config.uploadDir)}/`],
        ["content-length-range", 1, this.maxSizeBytes],
        { "x-oss-credential": credential },
        { "x-oss-date": ossDate },
        { "x-oss-signature-version": "OSS4-HMAC-SHA256" },
        { success_action_status: "200" },
      ],
    };
    const encodedPolicy = Buffer.from(JSON.stringify(policy)).toString(
      "base64",
    );

    return {
      host: buildOssHost(this.config),
      objectKey,
      imageUrl: buildImageUrl(this.config, objectKey),
      expireAt: expireAt.toISOString(),
      formData: {
        key: objectKey,
        policy: encodedPolicy,
        "x-oss-credential": credential,
        "x-oss-date": ossDate,
        "x-oss-signature-version": "OSS4-HMAC-SHA256",
        signature: signV4Policy({
          accessKeySecret: this.config.accessKeySecret,
          dateStamp,
          region: standardRegion,
          encodedPolicy,
        }),
        success_action_status: "200",
      },
    };
  }

  private buildObjectKey(now: Date, extension: string): string {
    const year = String(now.getUTCFullYear());
    const month = pad2(now.getUTCMonth() + 1);
    const day = pad2(now.getUTCDate());
    const uploadDir = normalizeDir(this.config.uploadDir);

    return `${uploadDir}/${year}/${month}/${day}/${this.randomId()}.${extension}`;
  }

  private ensureConfigured() {
    const missing = [
      ["ALIYUN_OSS_REGION", this.config.region],
      ["ALIYUN_OSS_BUCKET", this.config.bucket],
      ["ALIYUN_OSS_ACCESS_KEY_ID", this.config.accessKeyId],
      ["ALIYUN_OSS_ACCESS_KEY_SECRET", this.config.accessKeySecret],
    ].filter(([, value]) => !value);

    if (missing.length > 0) {
      throw new AppError(
        "OSS_CONFIG_MISSING",
        "OSS 配置不完整",
        500,
        missing.map(([name]) => name),
      );
    }
  }
}

function readWallpaperExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    throw new AppError(
      "UNSUPPORTED_FILE_TYPE",
      "仅支持 jpg、jpeg、png、webp 格式的壁纸",
      400,
    );
  }

  return extension;
}

function signV4Policy(input: {
  accessKeySecret: string;
  dateStamp: string;
  region: string;
  encodedPolicy: string;
}): string {
  const dateKey = hmac(`aliyun_v4${input.accessKeySecret}`, input.dateStamp);
  const dateRegionKey = hmac(dateKey, input.region);
  const dateRegionServiceKey = hmac(dateRegionKey, "oss");
  const signingKey = hmac(dateRegionServiceKey, "aliyun_v4_request");

  return crypto
    .createHmac("sha256", signingKey)
    .update(input.encodedPolicy)
    .digest("hex");
}

function hmac(key: string | Buffer, value: string): Buffer {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function buildOssHost(config: OssConfig): string {
  return `https://${config.bucket}.${config.region}.aliyuncs.com`;
}

function buildImageUrl(config: OssConfig, objectKey: string): string {
  const baseUrl = config.cdnBaseUrl || buildOssHost(config);
  return `${baseUrl.replace(/\/+$/, "")}/${objectKey}`;
}

function getStandardRegion(region: string): string {
  return region.startsWith("oss-") ? region.slice(4) : region;
}

function normalizeDir(dir: string): string {
  return (dir || "wallpapers").replace(/^\/+|\/+$/g, "");
}

function formatDateStamp(date: Date): string {
  return [
    date.getUTCFullYear(),
    pad2(date.getUTCMonth() + 1),
    pad2(date.getUTCDate()),
  ].join("");
}

function formatOssDate(date: Date): string {
  return `${formatDateStamp(date)}T${pad2(date.getUTCHours())}${pad2(
    date.getUTCMinutes(),
  )}${pad2(date.getUTCSeconds())}Z`;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

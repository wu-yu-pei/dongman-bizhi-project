import type { AdminApi } from "./adminApi";

export async function uploadWallpaperFile(options: {
  api: AdminApi;
  file: File;
  fetcher?: typeof fetch;
}) {
  const fetcher = options.fetcher ?? fetch;
  const policy = await options.api.requestOssPolicy({
    filename: options.file.name,
    contentType: options.file.type || "application/octet-stream",
  });
  const formData = new FormData();

  for (const [key, value] of Object.entries(policy.formData)) {
    formData.append(key, value);
  }
  formData.append("file", options.file);

  const response = await fetcher(policy.host, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("OSS 上传失败");
  }

  return {
    imageUrl: policy.imageUrl,
    ossObjectKey: policy.objectKey,
  };
}

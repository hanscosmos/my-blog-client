import { uploadFileApi } from "@/api/upload";

/** 图片大小上限（MB） */
export const MAX_IMAGE_SIZE = 3;

/** 允许上传的图片类型，同时用于推导上传后的文件扩展名 */
const IMAGE_EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

/**
 * 上传前的本地校验，返回错误提示；校验通过返回空串。
 *
 * 注意：后端 /sys/file/upload 并不校验文件类型与大小，
 * 这里的校验只是体验层的提前拦截，不能当作安全边界。
 */
export const validateImage = (file: File): string => {
  if (!IMAGE_EXT_MAP[file.type]) {
    return "只支持 jpg / png / gif / webp 格式的图片";
  }
  if (file.size / 1024 / 1024 > MAX_IMAGE_SIZE) {
    return `图片大小不能超过 ${MAX_IMAGE_SIZE}MB`;
  }
  return "";
};

/**
 * 生成上传用的随机文件名（不含扩展名）。
 *
 * crypto.randomUUID 只在安全上下文（https / localhost）可用，
 * 用局域网 IP 调试时它是 undefined，因此留一个降级实现。
 */
const randomFileName = () =>
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * 上传单张图片，返回 CDN 完整 URL。
 *
 * 文件名用随机串重新生成：后端会直接把它拼进 COS 的 key，
 * 保留原文件名（尤其是中文名）容易带来编码问题。
 */
export const uploadImage = async (
  file: File,
  dir = "comment",
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", `${randomFileName()}${IMAGE_EXT_MAP[file.type]}`);
  formData.append("type", dir);
  return uploadFileApi(formData);
};

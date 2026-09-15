import { adminRequest } from "@/services/request";

/**
 * 上传文件到 COS，返回可直接访问的 CDN 完整 URL。
 *
 * 接口挂在 /sys 下而不是 /client 下，因此走 adminRequest（baseURL 为 /api）。
 * 该接口需要登录态，adminRequest 与 request 一样会自动带上 token 并处理 401 刷新。
 */
export const uploadFileApi = (data: FormData) =>
  adminRequest.post<string>("/sys/file/upload", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

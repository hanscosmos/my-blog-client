import request, { adminRequest } from "@/services/request";
import type { UserInfo } from "@/store/useAuth";

export interface LoginRes {
  userInfo: UserInfo;
  token: string;
  csrfToken: string;
}

export const loginApi = (data: { username: string; password: string; key: string; code: string }) =>
  adminRequest.post<LoginRes>("/user/login", data);

export const getValidCodeApi = (data: { key: string }) =>
  adminRequest.post<string>("/user/valid/code", data);

export const getUserInfoApi = () =>
  request.post<{ id: string; name: string; avatar: string }>("/user/info", {});

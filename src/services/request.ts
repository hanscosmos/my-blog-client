/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";
import axios from "axios";
import { message } from "antd";
import { useAuth } from "@/store/useAuth";

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  message?: string;
  data: T;
}

const adminInstance: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

adminInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token, csrfToken } = useAuth.getState();
    if (token) {
      config.headers.Authorization = token;
      if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    if (res.code === 401) {
      useAuth.getState().logout();
      window.location.replace("/login");
      return Promise.reject(new Error("Unauthorized"));
    }
    if (res.code && res.code !== 0) {
      message.error(res.msg || res.message);
      return Promise.reject(new Error(res.msg || "Error"));
    }
    return res.data as any;
  },
  (error) => {
    const status = error.response?.status;
    let msg = "网络异常";
    switch (status) {
      case 400:
        msg = "请求错误(400)";
        break;
      case 401:
        msg = "未授权，请重新登录(401)";
        useAuth.getState().logout();
        window.location.replace("/login");
        break;
      case 403:
        msg = "拒绝访问(403)";
        break;
      case 404:
        msg = "请求出错(404)";
        break;
      case 408:
        msg = "请求超时(408)";
        break;
      case 500:
        msg = "服务器错误(500)";
        break;
      case 502:
        msg = "网络错误(502)";
        break;
      case 503:
        msg = "服务不可用(503)";
        break;
      case 504:
        msg = "网络超时(504)";
        break;
      default:
        msg = `连接出错(${status})!`;
    }
    message.error(msg);
    return Promise.reject(error);
  }
);

const instance: AxiosInstance = axios.create({
  baseURL: "/api/client",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token, csrfToken } = useAuth.getState();
    if (token) {
      config.headers.Authorization = token;
      if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    if (res.code === 401) {
      useAuth.getState().logout();
      window.location.replace("/login");
      return Promise.reject(new Error("Unauthorized"));
    }
    if (res.code && res.code !== 0) {
      message.error(res.msg || res.message);
      return Promise.reject(new Error(res.msg || "Error"));
    }
    return res.data as any;
  },
  (error) => {
    const status = error.response?.status;
    let msg = "网络异常";
    switch (status) {
      case 400:
        msg = "请求错误(400)";
        break;
      case 401:
        msg = "未授权，请重新登录(401)";
        useAuth.getState().logout();
        window.location.replace("/login");
        break;
      case 403:
        msg = "拒绝访问(403)";
        break;
      case 404:
        msg = "请求出错(404)";
        break;
      case 408:
        msg = "请求超时(408)";
        break;
      case 500:
        msg = "服务器错误(500)";
        break;
      case 502:
        msg = "网络错误(502)";
        break;
      case 503:
        msg = "服务不可用(503)";
        break;
      case 504:
        msg = "网络超时(504)";
        break;
      default:
        msg = `连接出错(${status})!`;
    }
    message.error(msg);
    return Promise.reject(error);
  }
);

const setCsrfCookie = (token: string) => {
  document.cookie = `csrftoken=${token};path=/`;
};

const createRequest = (inst: AxiosInstance) => ({
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return inst.get<any, T>(url, config);
  },
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return inst.post<any, T>(url, data, config);
  },
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return inst.put<any, T>(url, data, config);
  },
  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    return inst.delete<any, T>(url, config);
  },
});

const request = {
  ...createRequest(instance),
  setCsrfCookie,
};

export const adminRequest = createRequest(adminInstance);

export default request;

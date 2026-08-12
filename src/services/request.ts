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

// ---------- 工具函数 ----------

/** 读取浏览器 cookie */
const getCookie = (name: string): string | undefined => {
  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\/+^])/g, "\\$&") + "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

// ---------- refresh token 状态管理（模块级变量，全局共享）----------

let isRefreshing = false;
let subscribers: Array<(token: string) => void> = [];

function onRefreshed(newToken: string) {
  subscribers.forEach((cb) => cb(newToken));
  subscribers = [];
}

function addSubscriber(cb: (token: string) => void) {
  subscribers.push(cb);
}

// ---------- 创建带 refresh 逻辑的响应拦截器 ----------

/**
 * 创建一个响应拦截器，包含完整的 401 → refresh token → 重试 逻辑
 * 参考 my-blog-admin 项目的实现
 */
const createResponseInterceptor = (instance: AxiosInstance) => {
  // 响应拦截器（成功回调）
  const onFulfilled = async (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    if (res.code === 401) {
      const store = useAuth.getState();
      const originalRequest = response.config as any;

      // 以下情况不尝试刷新，直接跳转登录：
      // 1. 登录接口本身返回 401
      // 2. refresh 接口本身返回 401（refresh token 也过期了）
      // 3. 已经重试过的请求再次 401（防止死循环）
      if (
        originalRequest.url === "/user/login" ||
        originalRequest.url === "/user/refresh" ||
        originalRequest._isRetry
      ) {
        store.logout();
        sessionStorage.setItem("tokenValid", "true");
        window.location.replace("/login");
        return Promise.reject(res);
      }

      // 没有 refreshToken 可用，直接登出
      if (!store.refreshToken) {
        store.logout();
        sessionStorage.setItem("tokenValid", "true");
        window.location.replace("/login");
        return Promise.reject(res);
      }

      // 如果正在刷新中，把当前请求加入等待队列
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((newToken: string) => {
            originalRequest.headers.Authorization = newToken;
            originalRequest._isRetry = true;
            resolve(instance(originalRequest));
          });
        });
      }

      // 发起刷新请求
      isRefreshing = true;

      try {
        const refreshRes: any = await instance.post("/user/refresh", {
          refreshToken: store.refreshToken,
        });

        if (refreshRes.code === 0 && refreshRes.data?.token) {
          const newToken = refreshRes.data.token;
          // 更新 store 中的 access token
          useAuth.setState({ token: newToken });
          // 通知所有等待中的请求
          onRefreshed(newToken);
          // 重试当前请求
          originalRequest.headers.Authorization = newToken;
          originalRequest._isRetry = true;
          return instance(originalRequest);
        } else {
          // refresh 接口返回非 0 code
          store.logout();
          sessionStorage.setItem("tokenValid", "true");
          window.location.replace("/login");
          return Promise.reject(res);
        }
      } catch (err) {
        // 网络错误等异常
        store.logout();
        sessionStorage.setItem("tokenValid", "true");
        window.location.replace("/login");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    if (res.code && res.code !== 0) {
      message.error(res.msg || res.message);
      return Promise.reject(new Error(res.msg || "Error"));
    }
    return res.data as any;
  };

  // 响应拦截器（错误回调）
  const onRejected = (error: any) => {
    const status = error.response?.status;
    let msg = "网络异常";
    switch (status) {
      case 400:
        msg = "请求错误(400)";
        break;
      case 401:
        msg = "未授权，请重新登录(401)";
        useAuth.getState().logout();
        sessionStorage.setItem("tokenValid", "true");
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
  };

  return { onFulfilled, onRejected };
};

// ---------- adminInstance（/api）----------

const adminInstance: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

adminInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token } = useAuth.getState();
    if (token) {
      config.headers.Authorization = token;
      config.headers["X-CSRFToken"] = getCookie("csrftoken") || "";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const adminInterceptor = createResponseInterceptor(adminInstance);
adminInstance.interceptors.response.use(
  adminInterceptor.onFulfilled,
  adminInterceptor.onRejected
);

// ---------- instance（/api/client）----------

const instance: AxiosInstance = axios.create({
  baseURL: "/api/client",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token } = useAuth.getState();
    if (token) {
      config.headers.Authorization = token;
      config.headers["X-CSRFToken"] = getCookie("csrftoken") || "";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const clientInterceptor = createResponseInterceptor(instance);
instance.interceptors.response.use(
  clientInterceptor.onFulfilled,
  clientInterceptor.onRejected
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

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserInfo {
  id: string;
  nickName: string;
  avatar: string | null;
  bgCover: string | null;
  sex: string;
  createTime: string;
  loginTime: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  csrfToken: string | null;
  userInfo: UserInfo;
  isLogin: boolean;
  login: (data: { token: string; refreshToken: string; csrfToken: string; userInfo: UserInfo }) => void;
  logout: () => void;
}

const defaultUserInfo: UserInfo = {
  id: "",
  nickName: "",
  avatar: null,
  bgCover: null,
  sex: "",
  createTime: "",
  loginTime: "",
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      csrfToken: null,
      userInfo: defaultUserInfo,
      isLogin: false,
      login: ({ token, refreshToken, csrfToken, userInfo }) =>
        set({ token, refreshToken, csrfToken, userInfo, isLogin: true }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          csrfToken: null,
          userInfo: defaultUserInfo,
          isLogin: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

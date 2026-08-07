// src/store/useTheme.ts
import { create } from "zustand";

type ThemeColor = "blue" | "purple" | "orange";
type ThemeMode = "light" | "dark";

interface ThemeState {
  color: ThemeColor;
  mode: ThemeMode;
  setColor: (color: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useTheme = create<ThemeState>((set) => ({
  color: "blue",
  mode: "light",
  setColor: (color) => {
    const { mode } = useTheme.getState();
    document.documentElement.setAttribute("data-theme-color", color);
    document.documentElement.setAttribute("data-theme-mode", mode);
    set({ color });
    localStorage.setItem("theme-color", color);
  },
  setMode: (mode) => {
    const { color } = useTheme.getState();
    document.documentElement.setAttribute("data-theme-mode", mode);
    document.documentElement.setAttribute("data-theme-color", color);
    set({ mode });
    localStorage.setItem("theme-mode", mode);
  },
  toggleMode: () => {
    const { mode } = useTheme.getState();
    const newMode = mode === "light" ? "dark" : "light";
    const { color } = useTheme.getState();
    document.documentElement.setAttribute("data-theme-mode", newMode);
    document.documentElement.setAttribute("data-theme-color", color);
    set({ mode: newMode });
    localStorage.setItem("theme-mode", newMode);
  },
}));

// 初始化
const savedColor = localStorage.getItem("theme-color") as ThemeColor;
const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
if (savedColor && savedMode) {
  document.documentElement.setAttribute("data-theme-color", savedColor);
  document.documentElement.setAttribute("data-theme-mode", savedMode);
  useTheme.getState().setColor(savedColor);
  useTheme.getState().setMode(savedMode);
}

import { defineConfig, presetUno, presetAttributify } from "unocss";

export default defineConfig({
  presets: [
    presetUno(), // 核心原子类
    presetAttributify(), // 支持属性模式，如 <div bg="red-500"/>
  ],
  theme: {
    colors: {
      primary: "var(--color-primary)",
      secondary: "var(--color-secondary)",
      bg: "var(--color-bg)",
      text: "var(--color-text)",
      container: "var(--color-container-bg)",
      border: "var(--color-border)",
      hover: "var(--color-hover)",
      shadow: "var(--color-shadow)",
      muted: "var(--color-muted)",
    },
  },
  shortcuts: {
    // 元素居中
    "center-flex": "flex justify-center items-center",
    "wh-full": "w-full h-full",
    "flex-between": "flex justify-between items-center",
    "text-hovers": "hover:text-primary transition-linear cursor-pointer",
    "text-hover-rotate": "hover:rotate-360 transition-linear",
    "border-bottom": "border-b border-border border-solid",
    "btn-primary":
      "px-4 py-2 bg-primary text-white rounded hover:bg-hover shadow",
    "btn-secondary":
      "px-4 py-2 bg-secondary text-white rounded hover:bg-hover shadow",
    card: "p-4 bg-container border border-border rounded shadow",
    "title-lg": "text-3xl font-bold",
    "title-md": "text-2xl font-semibold",
    "text-muted": "text-muted",
    "text-primary": "text-primary",
    "text-secondary": "text-secondary",
  },
  rules: [
    // 额外自定义规则（可选）: 例如固定宽高
    [
      "app-wrapper",
      {
        "background-color": "var(--color-bg)",
        color: "var(--color-text)",
        "padding-top": "60px",
      },
    ],
    ["transition-linear", { transition: "all 0.5s linear" }],
  ],
});

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
        // 由主色与页面底色混合出的柔和对角渐变，自动跟随主题色与明暗模式。
        // background-attachment: fixed 把绘制区域锚定到视口，页面滚动时背景不会跟着滚走。
        "background-image":
          "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 26%, var(--color-bg)) 0%, color-mix(in srgb, var(--color-primary) 12%, var(--color-bg)) 45%, color-mix(in srgb, var(--color-primary) 4%, var(--color-bg)) 100%)",
        "background-repeat": "no-repeat",
        "background-attachment": "fixed",
        "background-size": "100% 100%",
        color: "var(--color-text)",
        "padding-top": "60px",
      },
    ],
    // 浮在渐变背景之上的半透明面板（首页卡片、筛选栏、分页条）
    [
      "card-glass",
      {
        "background-color":
          "color-mix(in srgb, var(--color-container-bg) 92%, transparent)",
        "backdrop-filter": "blur(8px)",
      },
    ],
    ["transition-linear", { transition: "all 0.5s linear" }],
  ],
});

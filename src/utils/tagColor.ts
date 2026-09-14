/** 标签颜色字典键值（与后端字典 tag_color 保持一致） */
export type TagColorKey =
  | "skyblue"
  | "orange"
  | "pink"
  | "gold"
  | "blue"
  | "yellow"
  | "green"
  | "purple"
  | "red"
  | "gray";

export interface TagColorStyle {
  /** 标签底色 */
  background: string;
  /** 标签文字色，与底色成对挑选，保证文字清晰可读 */
  color: string;
}

/**
 * 标签配色表。
 * 底色统一取饱和度足够高的值，文字色则按底色明度取深色或白色：
 * 浅色底（天蓝色/金色/黄色）配深色文字，深色底配白色文字。
 */
const TAG_COLORS: Record<TagColorKey, TagColorStyle> = {
  skyblue: { background: "#38bdf8", color: "#083344" },
  orange: { background: "#c2410c", color: "#ffffff" },
  pink: { background: "#db2777", color: "#ffffff" },
  gold: { background: "#f59e0b", color: "#4a2503" },
  blue: { background: "#2563eb", color: "#ffffff" },
  yellow: { background: "#facc15", color: "#422006" },
  green: { background: "#15803d", color: "#ffffff" },
  purple: { background: "#7c3aed", color: "#ffffff" },
  red: { background: "#dc2626", color: "#ffffff" },
  gray: { background: "#6b7280", color: "#ffffff" },
};

/** 未设置颜色或字典值无法识别时的兜底色 */
const FALLBACK = TAG_COLORS.gray;

/** 按字典键值取标签配色 */
export function getTagColorStyle(color?: string): TagColorStyle {
  if (!color) return FALLBACK;
  return TAG_COLORS[color.toLowerCase() as TagColorKey] ?? FALLBACK;
}

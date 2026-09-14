import React from "react";
import { getTagColorStyle } from "@/utils/tagColor";

interface TagBadgeProps {
  /** 标签名 */
  name: string;
  /** 标签颜色字典键值 */
  color?: string;
  /** 数量，不传则不展示 */
  count?: number;
  /** 选中态（筛选场景） */
  active?: boolean;
  /** sm：列表卡片、侧边栏；md：筛选栏、详情头部 */
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
}

const SIZE_CLASS: Record<NonNullable<TagBadgeProps["size"]>, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2 py-1",
};

/**
 * 文章标签徽标：底色取自标签自身的颜色字典，文字自动配深色/白色。
 * 选中态用同色描边表示，避免与底色撞在一起看不清。
 */
const TagBadge: React.FC<TagBadgeProps> = ({
  name,
  color,
  count,
  active = false,
  size = "sm",
  className = "",
  onClick,
}) => {
  const { background, color: textColor } = getTagColorStyle(color);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium transition duration-200 ${SIZE_CLASS[size]} ${
        onClick ? "cursor-pointer hover:opacity-85" : ""
      } ${className}`}
      style={{
        backgroundColor: background,
        color: textColor,
        ...(active
          ? { outline: `2px solid ${background}`, outlineOffset: "2px" }
          : {}),
      }}
      onClick={onClick}
    >
      #{name}
      {count !== undefined && <span className="opacity-75">{count}</span>}
    </span>
  );
};

export default TagBadge;

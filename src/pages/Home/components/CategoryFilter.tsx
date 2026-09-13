import { useEffect, useState } from "react";
import { getAllCategoryTreeApi } from "@/api/article/category";

interface CategoryFilterProps {
  /** 当前选中的分类 id，空串表示「全部」 */
  value: string;
  onChange: (categoryId: string) => void;
}

/** 分类标签样式，active 为选中态，small 用于二级分类 */
const pillClass = (active: boolean, small = false) => {
  const size = small ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return `${size} rounded-full border cursor-pointer transition-all duration-200 ${
    active
      ? "bg-primary text-white border-primary"
      : "border-border text-muted hover:text-primary hover:border-primary"
  }`;
};

/**
 * 首页分类筛选：一级分类一行，选中后再展开该分类下的二级分类。
 * 选中一级分类时传其 id，后端会自动包含其子分类的文章。
 */
export default function CategoryFilter({
  value,
  onChange,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<ArticleCategoryItemType[]>([]);
  const [activeParentId, setActiveParentId] = useState("");

  useEffect(() => {
    getAllCategoryTreeApi()
      .then((res) => setCategories(res))
      .catch(() => {});
  }, []);

  if (!categories.length) return null;

  const activeParent = categories.find((cat) => cat.id === activeParentId);
  const childList = activeParent?.children || [];

  return (
    <div className="card-glass border border-border rounded-xl shadow p-4 mb-5">
      {/* 一级分类 */}
      <div className="flex flex-wrap gap-2">
        <span
          className={pillClass(value === "")}
          onClick={() => {
            setActiveParentId("");
            onChange("");
          }}
        >
          全部
        </span>
        {categories.map((cat) => {
          const active =
            cat.id === value || !!cat.children?.some((c) => c.id === value);
          return (
            <span
              key={cat.id}
              className={pillClass(active)}
              onClick={() => {
                setActiveParentId(cat.id);
                onChange(cat.id);
              }}
            >
              {cat.name}
            </span>
          );
        })}
      </div>

      {/* 二级分类：仅当前一级分类有子级时展示 */}
      {childList.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
          {childList.map((child) => (
            <span
              key={child.id}
              className={pillClass(value === child.id, true)}
              onClick={() => onChange(child.id)}
            >
              {child.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

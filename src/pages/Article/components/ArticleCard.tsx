import defaultCover from "@/assets/images/common-article-cover.png";
import TagBadge from "@/components/TagBadge";
import { formatDate } from "@/utils/tool";
import React from "react";

interface ArticleCardProps {
  article: ArticleItemType;
  onClick?: (id: string) => void;
  /** list：左文右图的横向卡片；grid：封面在上、信息在下的竖向卡片 */
  variant?: "list" | "grid";
}

/** 分类徽标，两种变体共用 */
const CategoryBadge: React.FC<{ category: ArticleItemType["category"] }> = ({
  category,
}) => {
  if (!category) return null;
  return (
    <span className="px-2 py-0.5 rounded border border-primary">
      {category.father ? `${category.father} / ` : ""}
      {category.name}
    </span>
  );
};

/** 分类 + 日期 + 阅读数，两种变体共用 */
const ArticleMeta: React.FC<{ article: ArticleItemType }> = ({ article }) => (
  <div className="flex items-center text-xs gap-4 text-muted mb-2">
    <CategoryBadge category={article.category} />
    <span>{formatDate(article.createTime)}</span>
    <span>{article.readCount} 阅读</span>
  </div>
);

/** 标签列表，两种变体共用 */
const TagList: React.FC<{ tags: ArticleItemType["tags"] }> = ({ tags }) => {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map((tag) => (
        <TagBadge key={tag.id} name={tag.name} color={tag.color} />
      ))}
    </div>
  );
};

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onClick,
  variant = "list",
}) => {
  if (variant === "grid") {
    return (
      <div
        className="group h-full flex flex-col cursor-pointer overflow-hidden rounded-xl border border-border card-glass shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        onClick={() => onClick?.(article.id)}
      >
        {/* 顶部封面 */}
        <div className="relative aspect-[16/9] overflow-hidden bg-container">
          <img
            src={article.cover || defaultCover}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* 下方信息 */}
        <div className="flex-1 flex flex-col p-4">
          <ArticleMeta article={article} />

          <h2 className="text-lg font-bold mb-2 line-clamp-2 transition-colors group-hover:text-primary">
            {article.title}
          </h2>

          <p className="text-sm text-muted line-clamp-2 leading-relaxed flex-1">
            {article.abstract}
          </p>

          <TagList tags={article.tags} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex gap-4 p-5 cursor-pointer hover:bg-hover/30 transition-all duration-300"
      onClick={() => onClick?.(article.id)}
    >
      {/* 左侧内容 */}
      <div className="flex-1 min-w-0">
        <ArticleMeta article={article} />

        {/* 标题 */}
        <h2 className="text-xl font-bold mb-2 line-clamp-1">{article.title}</h2>

        {/* 摘要 */}
        <p className="text-sm text-muted line-clamp-3 leading-relaxed">
          {article.abstract}
        </p>

        <TagList tags={article.tags} />
      </div>

      {/* 右侧封面 */}
      <img
        src={article.cover || defaultCover}
        alt={article.title}
        className="w-40 h-28 object-cover rounded-lg flex-shrink-0"
      />
    </div>
  );
};

export default ArticleCard;

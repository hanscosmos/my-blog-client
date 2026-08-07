import defaultCover from "@/assets/images/common-article-cover.png";
import { formatDate } from "@/utils/tool";
import React from "react";

interface ArticleCardProps {
  article: ArticleItemType;
  onClick?: (id: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  return (
    <div
      className="flex gap-4 p-5 cursor-pointer hover:bg-hover/30 transition-all duration-300"
      onClick={() => onClick?.(article.id)}
    >
      {/* 左侧内容 */}
      <div className="flex-1 min-w-0">
        {/* 分类 + 日期 + 阅读数 */}
        <div className="flex items-center text-xs gap-4 text-muted mb-2">
          {article.category && (
            <span className="px-2 py-0.5 rounded border border-primary text-primary">
              {article.category.father ? `${article.category.father} / ` : ""}
              {article.category.name}
            </span>
          )}
          <span>{formatDate(article.createTime)}</span>
          <span>{article.readCount} 阅读</span>
        </div>

        {/* 标题 */}
        <h2 className="text-xl font-bold mb-2 line-clamp-1">{article.title}</h2>

        {/* 摘要 */}
        <p className="text-sm text-muted line-clamp-3 leading-relaxed">
          {article.abstract}
        </p>

        {/* 标签 */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-0.5 rounded bg-container text-muted"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
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

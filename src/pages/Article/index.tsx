import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticleDetailApi, getArticleReadStatApi } from "@/api/article";
import ArticleDetail from "./components/ArticleDetail";
import { formatDate } from "@/utils/tool";

export default function Article() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayRead, setTodayRead] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getArticleDetailApi({ id })
      .then((res) => setArticle(res))
      .catch(() => {})
      .finally(() => setLoading(false));
    // 记录阅读
    getArticleReadStatApi({ id })
      .then((res) => setTodayRead(res.todayRead))
      .catch(() => {});
  }, [id]);

  if (loading) {
    return <div className="center-flex h-60 text-muted">加载中...</div>;
  }

  if (!article) {
    return (
      <div className="center-flex h-60 text-muted flex-col gap-4">
        <p>文章不存在</p>
        <span
          className="text-hovers text-primary"
          onClick={() => navigate("/")}
        >
          返回首页
        </span>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      {/* 文章头部信息 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{article.baseInfo.title}</h1>
        <div className="flex items-center text-sm text-muted gap-4">
          <span>{article.authorInfo.nickName}</span>
          <span>{formatDate(article.createTime)}</span>
          <span>
            {article.baseInfo.readCount} 阅读
            {todayRead > 0 && `，今日 +${todayRead}`}
          </span>
          {article.categoryInfo?.base && (
            <span className="px-2 py-0.5 rounded border border-primary text-primary">
              {article.categoryInfo.father}·{article.categoryInfo.base.name}
            </span>
          )}
          <span>最近更新 {formatDate(article.baseInfo.updateTime)}</span>
        </div>
        {article.tagList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tagList.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-0.5 rounded bg-container text-muted"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
        {article.baseInfo.cover && (
          <div className="mt-6">
            <img
              src={article.baseInfo.cover}
              className="w-full h-full object-cover rounded"
              alt="封面"
            />
          </div>
        )}
      </header>

      {/* 文章内容 */}
      <ArticleDetail content={article.detailInfo.content} />
    </div>
  );
}

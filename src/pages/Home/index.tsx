import { useCallback, useEffect, useState } from "react";
import { getArticleListApi } from "@/api/article";
import ArticleCard from "@/pages/Article/components/ArticleCard";
import Sidebar from "./components/Sidebar";
import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [list, setList] = useState<ArticleItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getArticleListApi({
        pageNumber: page,
        pageSize: 10,
        title: "",
      });
      setList(res.result);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <div className="flex gap-6 py-8 px-4">
      {/* 左侧文章列表 */}
      <main className="flex-1 min-w-0">
        {loading ? (
          <div className="center-flex h-60 text-muted">加载中...</div>
        ) : list.length === 0 ? (
          <div className="center-flex h-60 text-muted">暂无文章</div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {list.map((item) => (
                <div
                  key={item.id}
                  className="bg-container border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <ArticleCard
                    article={item}
                    onClick={(id) => navigate(`/article/${id}`)}
                  />
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 z-10 flex justify-center py-4 bg-bg border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <Pagination
                current={page}
                total={total}
                pageSize={10}
                onChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </>
        )}
      </main>

      {/* 右侧边栏 */}
      <Sidebar />
    </div>
  );
}

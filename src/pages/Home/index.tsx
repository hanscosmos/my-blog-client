import { useCallback, useEffect, useRef, useState } from "react";
import { getArticleListApi } from "@/api/article";
import ArticleCard from "@/pages/Article/components/ArticleCard";
import CategoryFilter from "./components/CategoryFilter";
import Sidebar from "./components/Sidebar";
import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

export default function Home() {
  const navigate = useNavigate();
  const [list, setList] = useState<ArticleItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  // 丢弃过期请求的结果，避免快速切换分类时旧响应覆盖新数据
  const requestIdRef = useRef(0);

  const fetchList = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await getArticleListApi({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        title: "",
        category: categoryId,
      });
      if (requestId !== requestIdRef.current) return;
      setList(res.result);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, categoryId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCategoryChange = (id: string) => {
    setCategoryId(id);
    setPage(1);
  };

  return (
    <div className="py-8 px-4">
      {/* 分类筛选 */}
      <CategoryFilter value={categoryId} onChange={handleCategoryChange} />

      <div className="flex gap-6">
        {/* 左侧文章列表 */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="center-flex h-60 text-muted">加载中...</div>
          ) : list.length === 0 ? (
            <div className="center-flex h-60 text-muted">暂无文章</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5">
                {list.map((item) => (
                  <ArticleCard
                    key={item.id}
                    variant="grid"
                    article={item}
                    onClick={(id) => navigate(`/article/${id}`)}
                  />
                ))}
              </div>
              <div className="card-glass sticky bottom-0 z-10 flex justify-center py-4 mt-5 border-t border-border">
                <Pagination
                  current={page}
                  total={total}
                  pageSize={PAGE_SIZE}
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
    </div>
  );
}

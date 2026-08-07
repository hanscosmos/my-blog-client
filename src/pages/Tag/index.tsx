import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticleListApi } from "@/api/article";
import ArticleCard from "@/pages/Article/components/ArticleCard";
import { Pagination } from "antd";

export default function TagPage() {
  const { alias } = useParams<{ alias: string }>();
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
    <div className="py-8 px-4">
      <h2 className="title-lg mb-6">
        标签：#{alias}
        <span className="text-sm text-muted font-normal ml-2">
          共 {total} 篇
        </span>
      </h2>

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
          <div className="flex justify-center mt-8">
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
    </div>
  );
}

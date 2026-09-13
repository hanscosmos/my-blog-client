import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "antd";
import { getArticleArchiveApi } from "@/api/article/archive";
import { getTagStatApi } from "@/api/article/tag";
import { formatDate } from "@/utils/tool";

export default function Archive() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tagStats, setTagStats] = useState<ArticleTagStatType[]>([]);
  const [list, setList] = useState<ArticleArchiveItemType[]>([]);
  const [loading, setLoading] = useState(false);

  // 标签筛选放在 URL 上：首页侧边栏「标签统计」可直接带 ?tag= 跳进来
  const activeTag = searchParams.get("tag") || "";

  const setActiveTag = (id: string) => {
    setSearchParams(id ? { tag: id } : {}, { replace: true });
  };

  const toggleTag = (id: string) => {
    setActiveTag(activeTag === id ? "" : id);
  };

  useEffect(() => {
    getTagStatApi()
      .then((res) => setTagStats(res))
      .catch(() => {
        // ignore
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    getArticleArchiveApi({ tag: activeTag })
      .then((res) => setList(res))
      .catch(() => {
        // ignore
      })
      .finally(() => setLoading(false));
  }, [activeTag]);

  // 接口已按时间倒序返回，分组后年份天然保持倒序
  const groups = useMemo(() => {
    const map = new Map<string, ArticleArchiveItemType[]>();
    list.forEach((item) => {
      const year = formatDate(item.createTime, "YYYY");
      const group = map.get(year);
      if (group) {
        group.push(item);
      } else {
        map.set(year, [item]);
      }
    });
    return Array.from(map, ([year, items]) => ({ year, items }));
  }, [list]);

  return (
    <div className="py-8 px-4">
      <h2 className="title-lg mb-6">
        归档
        <span className="text-sm text-muted font-normal ml-2">
          共 {list.length} 篇
        </span>
      </h2>

      {tagStats.length > 0 && (
        <div className="card mb-8">
          <div className="flex-between mb-4">
            <h3 className="title-md">标签统计</h3>
            {activeTag && (
              <span
                className="text-xs text-hovers"
                onClick={() => setActiveTag("")}
              >
                取消筛选
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {tagStats.map((tag) => {
              const active = activeTag === tag.id;
              return (
                <span
                  key={tag.id}
                  className={`text-sm px-2 py-1 rounded border border-solid cursor-pointer transition-linear ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "text-muted border-border hover:text-primary hover:border-primary"
                  }`}
                  onClick={() => toggleTag(tag.id)}
                >
                  #{tag.name}
                  <span className="ml-1">{tag.count}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : groups.length === 0 ? (
        <div className="center-flex h-60 text-muted">暂无文章</div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.year}>
              <div className="flex items-center gap-3 mb-3">
                <span className="title-md text-primary">{group.year}</span>
                <span className="flex-1 border-b border-border border-solid" />
                <span className="text-xs text-muted">
                  {group.items.length} 篇
                </span>
              </div>
              <ul className="flex flex-col">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 py-2 text-hovers"
                    onClick={() => navigate(`/article/${item.id}`)}
                  >
                    <span className="text-sm text-muted w-12 shrink-0">
                      {formatDate(item.createTime, "MM-DD")}
                    </span>
                    <span className="text-sm line-clamp-1">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

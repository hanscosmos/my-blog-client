import { useEffect, useState } from "react";
import { getArticleHotListApi } from "@/api/article";
import { getTagStatApi } from "@/api/article/tag";
import { useNavigate } from "react-router-dom";

/* ---------- 热门文章组件 ---------- */
function HotArticles() {
  const navigate = useNavigate();
  const [hotList, setHotList] = useState<ArticleItemType[]>([]);

  useEffect(() => {
    getArticleHotListApi()
      .then((res) => setHotList(res))
      .catch(() => {});
  }, []);

  if (!hotList.length) return null;

  return (
    <div className="card">
      <h3 className="title-md mb-4">热门文章</h3>
      <ul className="flex flex-col gap-3">
        {hotList.slice(0, 5).map((item, index) => (
          <li
            key={item.id}
            className="text-hovers text-sm cursor-pointer"
            onClick={() => navigate(`/article/${item.id}`)}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded center-flex text-xs text-white ${
                  index < 3 ? "bg-primary" : "bg-muted"
                }`}
              >
                {index + 1}
              </span>
              <span className="line-clamp-1 flex-1">{item.title}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 标签统计组件 ---------- */
function TagStat() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<ArticleTagStatType[]>([]);

  useEffect(() => {
    getTagStatApi()
      .then((res) => setTags(res))
      .catch(() => {});
  }, []);

  if (!tags.length) return null;

  return (
    <div className="card">
      <h3 className="title-md mb-4">标签统计</h3>
      {/* 标签较多时限高滚动，避免侧边栏 sticky 后内容超出视口无法触及 */}
      <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="text-xs px-2 py-1 rounded border border-solid border-border text-muted cursor-pointer transition-linear hover:text-primary hover:border-primary"
            onClick={() => navigate(`/archive?tag=${tag.id}`)}
          >
            #{tag.name}
            <span className="ml-1">{tag.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- 侧边栏 ---------- */
export default function Sidebar() {
  return (
    <aside className="w-72 flex flex-col gap-4 sticky top-24 h-fit">
      <HotArticles />
      <TagStat />
    </aside>
  );
}

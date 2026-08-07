import { useEffect, useState } from "react";
import { getAllCategoryTreeApi } from "@/api/article/category";
import { getArticleHotListApi } from "@/api/article";
import { useNavigate } from "react-router-dom";

/* ---------- 分类组件 ---------- */
function CategoryList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ArticleCategoryItemType[]>([]);

  useEffect(() => {
    getAllCategoryTreeApi().then((res) => setCategories(res)).catch(() => {});
  }, []);

  if (!categories.length) return null;

  return (
    <div className="card">
      <h3 className="title-md mb-4">分类</h3>
      <ul className="flex flex-col gap-1">
        {categories.map((cat) => (
          <li key={cat.id}>
            <span
              className="text-hovers text-sm py-1 block"
              onClick={() => navigate(`/category/${cat.alias}`)}
            >
              <span className="flex justify-between items-center">
                <span>{cat.name}</span>
                {cat.children && cat.children.length > 0 && (
                  <span className="text-muted text-xs">
                    {cat.children.length}
                  </span>
                )}
              </span>
            </span>
            {cat.children?.map((child) => (
              <span
                key={child.id}
                className="text-hovers text-sm py-1 ml-4 block text-muted"
                onClick={() => navigate(`/category/${child.alias}`)}
              >
                {child.name}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 热门文章组件 ---------- */
function HotArticles() {
  const navigate = useNavigate();
  const [hotList, setHotList] = useState<ArticleItemType[]>([]);

  useEffect(() => {
    getArticleHotListApi().then((res) => setHotList(res)).catch(() => {});
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

/* ---------- 标签云组件 ---------- */
function TagCloud() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<ArticleTagItem[]>([]);

  useEffect(() => {
    // 暂时展示空，后续从接口获取
    setTags([]);
  }, []);

  if (!tags.length) return null;

  return (
    <div className="card">
      <h3 className="title-md mb-4">标签</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="text-hovers text-xs px-2 py-1 rounded border border-border cursor-pointer"
            onClick={() => navigate(`/tag/${tag.alias}`)}
          >
            #{tag.name}
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
      <CategoryList />
      <HotArticles />
      <TagCloud />
    </aside>
  );
}

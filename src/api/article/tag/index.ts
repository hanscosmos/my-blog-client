import request from "@/services/request";

export const getTagListApi = (data: PageType) =>
  request.post<ResultPageType<ArticleTagItem>>("/article/tag/list", data);

// 标签统计：仅统计前台可见（已发布 + 公开）文章，无文章的标签不返回
export const getTagStatApi = () =>
  request.post<ArticleTagStatType[]>("/article/stat/tag");

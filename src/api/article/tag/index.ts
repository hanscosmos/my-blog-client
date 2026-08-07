import request from "@/services/request";

export const getTagListApi = (data: PageType) =>
  request.post<ResultPageType<ArticleTagItem>>("/article/tag/list", data);

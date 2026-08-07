import request from "@/services/request";

export const getColumnListApi = (data: PageType) =>
  request.post<ResultPageType<ArticleColumnItemType>>("/article/column/list", data);

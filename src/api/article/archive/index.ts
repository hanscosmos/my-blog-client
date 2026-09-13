import request from "@/services/request";

export const getArticleArchiveApi = (data: { tag?: string }) =>
  request.post<ArticleArchiveItemType[]>("/article/archive", data);

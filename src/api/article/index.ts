import request from "@/services/request";

export const getArticleListApi = (params: PageType & QueryType) =>
  request.post<ResultPageType<ArticleItemType>>("/article/list", params);

export const getArticleDetailApi = (data: { id: string }) =>
  request.post<ArticleDetailType>("/article/detail", data);

export const getArticleHotListApi = () =>
  request.post<ArticleItemType[]>("/article/hot");

export const getArticleReadStatApi = (data: { id: string }) =>
  request.post<{ todayRead: number; totalRead: number }>(
    "/article/read/stat",
    data,
  );

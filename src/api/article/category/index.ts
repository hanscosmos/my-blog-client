import request from "@/services/request";

export const getAllCategoryTreeApi = () =>
  request.post<ArticleCategoryItemType[]>("/article/category/tree");

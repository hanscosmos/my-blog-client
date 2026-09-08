import request from "@/services/request";

// 前台公开接口：只返回博主简介，不含手机/微信等隐私字段
export const getBloggerProfileApi = () =>
  request.post<BloggerProfileType>("/blogger/profile/get", {});

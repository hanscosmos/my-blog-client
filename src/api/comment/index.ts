import request from "@/services/request";

// 评论列表：顶层评论分页（最新在前），每条内嵌其下全部回复（最早在前）
export const getCommentListApi = (
  data: PageType & { targetType: CommentTargetType; targetId?: string },
) => request.post<CommentListResType>("/comment/list", data);

// 发表评论；带 rootId / replyUser 时为回复
export const addCommentApi = (data: CommentAddParams) =>
  request.post<CommentAddResType>("/comment/add", data);

// 删除评论：评论作者本人，或评论对象所属内容的作者（博主）
export const deleteCommentApi = (data: { id: string }) =>
  request.post<boolean>("/comment/delete", data);

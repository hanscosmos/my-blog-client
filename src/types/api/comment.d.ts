/** 评论对象类型：article 文章评论；message 留言板 */
type CommentTargetType = "article" | "message";

/** 评论人 / 被回复人的展示信息 */
interface CommentUserType {
  id: string;
  nickName: string;
  avatar: string | null;
}

/** 顶层评论下的回复项（扁平，两级结构） */
interface CommentReplyItemType {
  id: string;
  content: string;
  createTime: string;
  /** 后端算好的删除权限，前端直接用于控制删除按钮显隐 */
  canDelete: boolean;
  /** 所属顶层评论 id */
  rootId: string;
  user: CommentUserType;
  /** 被回复者，用于渲染「A 回复 B」 */
  replyUser: CommentUserType | null;
}

/** 顶层评论，内嵌其下全部回复 */
interface CommentItemType {
  id: string;
  content: string;
  createTime: string;
  /** 后端算好的删除权限，前端直接用于控制删除按钮显隐 */
  canDelete: boolean;
  user: CommentUserType;
  replies: CommentReplyItemType[];
}

interface CommentListResType {
  /** 顶层评论总数（分页依据） */
  total: number;
  /** 含回复的总条数（页面展示「N 条评论」） */
  totalCount: number;
  result: CommentItemType[];
}

interface CommentAddParams {
  targetType: CommentTargetType;
  /** 评论对象 id；留言板不传 */
  targetId?: string;
  content: string;
  /** 回复时传所属顶层评论 id */
  rootId?: string;
  /** 回复时传被回复人 id */
  replyUser?: string;
}

/** 新增评论的返回：扁平结构，rootId 为空表示这是一条顶层评论 */
interface CommentAddResType {
  id: string;
  content: string;
  createTime: string;
  canDelete: boolean;
  rootId: string | null;
  user: CommentUserType;
  replyUser: CommentUserType | null;
}

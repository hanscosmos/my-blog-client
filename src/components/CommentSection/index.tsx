import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Modal,
  Pagination,
  Skeleton,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  addCommentApi,
  deleteCommentApi,
  getCommentListApi,
} from "@/api/comment";
import MarkdownContent from "@/components/MarkdownContent";
import MarkdownEditor from "@/components/MarkdownEditor";
import { useAuth } from "@/store/useAuth";
import { formatDate } from "@/utils/tool";

const PAGE_SIZE = 10;
/** 评论正文是 markdown 源码，长度上限与后端 service/comment.py 保持一致 */
const MAX_CONTENT_LENGTH = 2000;

interface CommentSectionProps {
  targetType: CommentTargetType;
  /** 评论对象 id；留言板不传 */
  targetId?: string;
}

/** 当前正在回复的对象 */
interface ReplyTarget {
  rootId: string;
  replyUser: CommentUserType;
}

/* ---------- 单条回复 ---------- */

interface ReplyItemProps {
  reply: CommentReplyItemType;
  isLogin: boolean;
  onReply: (target: ReplyTarget) => void;
  onDelete: (id: string) => void;
}

function ReplyItem({ reply, isLogin, onReply, onDelete }: ReplyItemProps) {
  return (
    <div className="flex gap-2 py-2">
      <Avatar
        size={28}
        src={reply.user.avatar || undefined}
        icon={<UserOutlined />}
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{reply.user.nickName}</span>
          {reply.replyUser && (
            <span className="text-xs text-muted">
              回复{" "}
              <span className="text-primary">@{reply.replyUser.nickName}</span>
            </span>
          )}
          <span className="text-xs text-muted">
            {formatDate(reply.createTime, "YYYY-MM-DD HH:mm")}
          </span>
        </div>
        <div className="mt-1 break-words">
          <MarkdownContent content={reply.content} />
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted">
          {isLogin && (
            <span
              className="text-hovers"
              onClick={() =>
                onReply({ rootId: reply.rootId, replyUser: reply.user })
              }
            >
              回复
            </span>
          )}
          {reply.canDelete && (
            <span className="text-hovers" onClick={() => onDelete(reply.id)}>
              删除
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 单条顶层评论（内嵌其回复） ---------- */

interface CommentItemProps {
  comment: CommentItemType;
  isLogin: boolean;
  onReply: (target: ReplyTarget) => void;
  onDelete: (id: string) => void;
}

function CommentItem({
  comment,
  isLogin,
  onReply,
  onDelete,
}: CommentItemProps) {
  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-b-0">
      <Avatar
        size={40}
        src={comment.user.avatar || undefined}
        icon={<UserOutlined />}
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{comment.user.nickName}</span>
          <span className="text-xs text-muted">
            {formatDate(comment.createTime, "YYYY-MM-DD HH:mm")}
          </span>
        </div>
        <div className="mt-1 break-words">
          <MarkdownContent content={comment.content} />
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted">
          {isLogin && (
            <span
              className="text-hovers"
              onClick={() =>
                onReply({ rootId: comment.id, replyUser: comment.user })
              }
            >
              回复
            </span>
          )}
          {comment.canDelete && (
            <span className="text-hovers" onClick={() => onDelete(comment.id)}>
              删除
            </span>
          )}
        </div>

        {comment.replies.length > 0 && (
          <div className="mt-2 pl-3 border-l-2 border-border">
            {comment.replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                isLogin={isLogin}
                onReply={onReply}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 评论输入框 ---------- */

interface CommentFormProps {
  replyTarget: ReplyTarget | null;
  submitting: boolean;
  /** 返回 true 表示提交成功，输入框随之清空 */
  onSubmit: (content: string) => Promise<boolean>;
  onCancelReply: () => void;
}

function CommentForm({
  replyTarget,
  submitting,
  onSubmit,
  onCancelReply,
}: CommentFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    const value = content.trim();
    if (!value) {
      message.warning("评论内容不能为空");
      return;
    }
    if (await onSubmit(value)) {
      setContent("");
    }
  };

  return (
    <div className="card-glass border border-border rounded-xl p-4">
      {replyTarget && (
        <div className="flex-between mb-2">
          <span className="text-sm text-muted">
            正在回复{" "}
            <span className="text-primary">@{replyTarget.replyUser.nickName}</span>
          </span>
          <span className="text-hovers text-xs" onClick={onCancelReply}>
            取消回复
          </span>
        </div>
      )}
      <MarkdownEditor
        value={content}
        onChange={setContent}
        placeholder={
          replyTarget ? `回复 @${replyTarget.replyUser.nickName}：` : "说点什么吧～"
        }
        maxLength={MAX_CONTENT_LENGTH}
      />
      {/* 字数计数自己渲染在按钮左侧：antd 的 showCount 绝对定位在右下角，会和按钮重叠 */}
      <div className="flex-between mt-3">
        <span className="text-xs text-muted">
          {content.length}/{MAX_CONTENT_LENGTH}
        </span>
        <Button type="primary" loading={submitting} onClick={handleSubmit}>
          发表
        </Button>
      </div>
    </div>
  );
}

/* ---------- 评论区 ---------- */

/**
 * 通用评论区：文章评论与留言板共用，靠 targetType / targetId 区分。
 * 删除权限由后端逐条算好（canDelete），因此这里不需要判断「我是不是博主」。
 */
export default function CommentSection({
  targetType,
  targetId,
}: CommentSectionProps) {
  const navigate = useNavigate();
  const isLogin = useAuth((s) => s.isLogin);
  const [list, setList] = useState<CommentItemType[]>([]);
  const [total, setTotal] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchList = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const res = await getCommentListApi({
          targetType,
          targetId,
          pageNumber: page,
          pageSize: PAGE_SIZE,
        });
        // 该页被删空时回退一页（例如删掉了本页最后一条评论）
        if (res.result.length === 0 && res.total > 0 && page > 1) {
          setPageNumber(page - 1);
          return;
        }
        setList(res.result);
        setTotal(res.total);
        setTotalCount(res.totalCount);
      } catch {
        // 失败提示由响应拦截器统一处理
      } finally {
        setLoading(false);
      }
    },
    [targetType, targetId],
  );

  useEffect(() => {
    fetchList(pageNumber);
  }, [fetchList, pageNumber]);

  /** 把新增接口返回的扁平结果转成回复项 */
  const toReplyItem = (
    res: CommentAddResType,
    rootId: string,
  ): CommentReplyItemType => ({
    id: res.id,
    content: res.content,
    createTime: res.createTime,
    canDelete: res.canDelete,
    rootId,
    user: res.user,
    replyUser: res.replyUser,
  });

  const handleSubmit = async (content: string): Promise<boolean> => {
    setSubmitting(true);
    try {
      const res = await addCommentApi({
        targetType,
        targetId,
        content,
        rootId: replyTarget?.rootId,
        replyUser: replyTarget?.replyUser.id,
      });
      if (res.rootId) {
        // 回复：就地把新回复追加到对应顶层评论下，不必整页重拉
        const rootId = res.rootId;
        setList((prev) =>
          prev.map((item) =>
            item.id === rootId
              ? { ...item, replies: [...item.replies, toReplyItem(res, rootId)] }
              : item,
          ),
        );
        setTotalCount((count) => count + 1);
      } else if (pageNumber === 1) {
        // 顶层评论且已在第 1 页：直接重拉，total / totalCount 以接口为准
        await fetchList(1);
      } else {
        // 顶层评论：最新在最前，回到第 1 页重新拉取
        setPageNumber(1);
      }
      setReplyTarget(null);
      message.success("评论成功");
      return true;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (target: ReplyTarget) => {
    setReplyTarget(target);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "删除后该评论将不再展示，确定要删除吗？",
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          await deleteCommentApi({ id });
          message.success("删除成功");
          // 删除顶层评论会连带其回复，重拉当前页以拿到准确结果
          await fetchList(pageNumber);
        } catch {
          // 无权限等失败由响应拦截器统一提示
        }
      },
    });
  };

  return (
    <section className="mt-10">
      <h3 className="title-md mb-4">
        评论
        {totalCount > 0 && (
          <span className="text-sm font-normal text-muted ml-2">
            {totalCount}
          </span>
        )}
      </h3>

      <div ref={formRef} className="mb-6">
        {isLogin ? (
          <CommentForm
            replyTarget={replyTarget}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancelReply={() => setReplyTarget(null)}
          />
        ) : (
          <div className="card-glass border border-border rounded-xl p-4 flex-between">
            <span className="text-sm text-muted">登录后才可以发表评论</span>
            <span
              className="btn-primary text-sm"
              onClick={() => navigate("/login")}
            >
              去登录
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : total === 0 ? (
        <div className="center-flex h-32 text-sm text-muted">
          还没有评论，来说点什么吧～
        </div>
      ) : (
        <div className="card-glass border border-border rounded-xl px-5">
          {list.map((item) => (
            <CommentItem
              key={item.id}
              comment={item}
              isLogin={isLogin}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={pageNumber}
            pageSize={PAGE_SIZE}
            total={total}
            showSizeChanger={false}
            onChange={setPageNumber}
          />
        </div>
      )}
    </section>
  );
}

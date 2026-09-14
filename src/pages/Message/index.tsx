import { Card } from "antd";
import CommentSection from "@/components/CommentSection";

export default function Message() {
  return (
    <div className="py-8 px-4">
      <Card title="留言板" className="bg-container border border-border rounded-xl">
        <p className="text-sm leading-relaxed text-muted">
          欢迎在这里留下你的想法、建议，或者随便聊聊～
        </p>
      </Card>

      {/* 与文章评论共用同一套评论能力，仅 targetType 不同 */}
      <CommentSection targetType="message" />
    </div>
  );
}

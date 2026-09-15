import type { ChangeEvent, ClipboardEvent, ComponentRef } from "react";
import { useRef, useState } from "react";
import { Button, Input, Popover, message } from "antd";
import {
  BoldOutlined,
  EditOutlined,
  EyeOutlined,
  LinkOutlined,
  PictureOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import MarkdownContent from "@/components/MarkdownContent";
import { uploadImage, validateImage } from "@/utils/upload";
import { EMOJIS } from "./emojis";

type TextAreaRef = ComponentRef<typeof Input.TextArea>;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  minRows?: number;
  maxRows?: number;
}

/** 工具栏按钮的统一样式，图标按钮只靠原生 title 提示，避免 Tooltip 在禁用态下不显示 */
const TOOL_BUTTON_CLASS = "text-muted";

/**
 * 简易 markdown 编辑器：一排工具栏 + antd TextArea。
 *
 * 只覆盖评论需要的四件事：加粗、链接、图片、表情，外加编辑/预览切换。
 * 没有引入第三方编辑器库——需求太小，整套带预览和主题的编辑器
 * 反而会带来体积和样式割裂的代价。
 */
export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  minRows = 3,
  maxRows = 8,
}: MarkdownEditorProps) {
  const textareaRef = useRef<TextAreaRef>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  /** antd 把真实的 textarea 藏在 resizableTextArea 里，光标操作必须拿到原生节点 */
  const getTextarea = () => textareaRef.current?.resizableTextArea?.textArea;

  /**
   * 在光标处插入内容：有选区就包裹选区，没有选区就插入占位文字并选中它，
   * 这样用户可以直接接着改写。拿不到 textarea 时退化为追加到末尾。
   */
  const insertAtCursor = (before: string, after = "", hint = "") => {
    const textarea = getTextarea();
    if (!textarea) {
      const next = value + before + hint + after;
      if (next.length > maxLength) {
        message.warning(`评论内容不能超过 ${maxLength} 个字`);
        return;
      }
      onChange(next);
      return;
    }

    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const inner = selected || hint;
    const next =
      value.slice(0, selectionStart) + before + inner + after + value.slice(selectionEnd);

    if (next.length > maxLength) {
      message.warning(`评论内容不能超过 ${maxLength} 个字`);
      return;
    }
    onChange(next);

    // 受控组件要等新值写回 DOM 才能定位光标，否则会被这一次渲染覆盖掉
    requestAnimationFrame(() => {
      const el = getTextarea();
      if (!el) return;
      el.focus();
      const start = selectionStart + before.length;
      el.setSelectionRange(start, start + inner.length);
    });
  };

  /**
   * 插入图片语法，并让图片独立成段。
   *
   * 光标停在文字中间时不能直接插，否则会存下 `文字![图片](url)文字`
   * 这样夹在句子里的源码。补的必须是空行而不是单个换行——
   * markdown 里只有空行才是段落边界，单个换行会被 remarkBreaks 渲染成 <br>，
   * 那样反而会在图片前多出一个空行。
   */
  const insertImage = (url: string) => {
    const textarea = getTextarea();
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const after = value.slice(end);
    // 前后各补成「恰好一个空行」：已经是空行或行首就不补，刚换过行补一个，其余补两个
    const prefix =
      before === "" || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    const suffix =
      after === "" || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
    insertAtCursor(`${prefix}![`, `](${url})${suffix}`, "图片");
  };

  /** 上传成功后把 markdown 图片语法插到光标处 */
  const handleUpload = async (file: File) => {
    const error = validateImage(file);
    if (error) {
      message.warning(error);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      insertImage(url);
    } catch {
      // 失败提示由响应拦截器统一处理
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // 先清空再上传，否则连续选同一张图不会再触发 change
    e.target.value = "";
    if (file) {
      handleUpload(file);
    }
  };

  /** 支持直接粘贴剪贴板里的截图；剪贴板里同时有文字时不拦截，避免吃掉正常的文本粘贴 */
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.getData("text")) {
      return;
    }
    const file = Array.from(e.clipboardData.files).find((item) =>
      item.type.startsWith("image/"),
    );
    if (!file) {
      return;
    }
    e.preventDefault();
    handleUpload(file);
  };

  const emojiPanel = (
    <div className="grid grid-cols-8 gap-1 w-64 max-h-52 overflow-y-auto">
      {EMOJIS.map((emoji) => (
        <span
          key={emoji}
          className="text-lg text-center rounded cursor-pointer hover:bg-container"
          onClick={() => insertAtCursor(emoji)}
        >
          {emoji}
        </span>
      ))}
    </div>
  );

  return (
    <div className="border border-border border-solid rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1 border-bottom bg-container">
        <Button
          type="text"
          size="small"
          className={TOOL_BUTTON_CLASS}
          icon={<BoldOutlined />}
          title="加粗"
          disabled={preview}
          onClick={() => insertAtCursor("**", "**", "加粗文字")}
        />
        <Button
          type="text"
          size="small"
          className={TOOL_BUTTON_CLASS}
          icon={<LinkOutlined />}
          title="链接"
          disabled={preview}
          onClick={() => insertAtCursor("[", "](https://)", "链接文字")}
        />
        <Button
          type="text"
          size="small"
          className={TOOL_BUTTON_CLASS}
          icon={<PictureOutlined />}
          title="上传图片"
          disabled={preview}
          loading={uploading}
          onClick={() => fileRef.current?.click()}
        />
        <Popover content={emojiPanel} trigger="click" placement="bottomLeft">
          <Button
            type="text"
            size="small"
            className={TOOL_BUTTON_CLASS}
            icon={<SmileOutlined />}
            title="表情"
            disabled={preview}
          />
        </Popover>

        <span className="flex-1" />

        <Button
          type="text"
          size="small"
          className={TOOL_BUTTON_CLASS}
          icon={preview ? <EditOutlined /> : <EyeOutlined />}
          title={preview ? "返回编辑" : "预览"}
          onClick={() => setPreview((current) => !current)}
        />
      </div>

      {preview ? (
        <div className="px-3 py-2 min-h-24">
          {value.trim() ? (
            <MarkdownContent content={value} />
          ) : (
            <span className="text-sm text-muted">还没有内容</span>
          )}
        </div>
      ) : (
        <Input.TextArea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          placeholder={placeholder}
          maxLength={maxLength}
          autoSize={{ minRows, maxRows }}
          variant="borderless"
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

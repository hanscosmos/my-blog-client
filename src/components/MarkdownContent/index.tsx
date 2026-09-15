import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface MarkdownContentProps {
  content: string;
}

/**
 * 用户产出的 markdown 渲染（评论内容）。
 *
 * 与文章正文的区别：不做代码高亮、不加标题锚点——评论不需要，
 * 也避免为一小段文本额外引入整套插件。
 *
 * remarkBreaks 让单个换行也渲染成 <br>：历史评论是纯文本，
 * 当初靠 CSS 的 whitespace-pre-wrap 保留换行，改用 markdown 渲染后
 * 必须补上这个行为，否则所有老评论的换行都会塌掉。
 *
 * 安全说明：不启用 rehype-raw，markdown 里的原始 HTML 会被当作纯文本转义输出；
 * react-markdown 默认的 urlTransform 还会拦掉 javascript: 之类的危险协议，
 * 因此这里不需要额外的 sanitize 处理。
 */
export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="article-content comment-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // 属性逐个取用而不整体展开：react-markdown 会额外透传一个 node（AST 节点），
          // 展开到 DOM 上会变成非法属性
          img: ({ src, alt, title }) => (
            <img src={src} alt={alt} title={title} loading="lazy" />
          ),
          a: ({ href, title, children }) => (
            <a href={href} title={title} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

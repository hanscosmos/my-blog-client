# AI 协作记忆索引

`src/ai/memory/` 下按日期沉淀的对话纪要，由 `/log` skill 生成。每行一条，倒序排列。

| 日期 | 文档 | 摘要 |
| --- | --- | --- |
| 2026-09-15 | [富文本评论与上传鉴权](2026-09-15-富文本评论与上传鉴权.md) | 评论改用 markdown：自研 `MarkdownEditor` + `MarkdownContent`，后端字段放宽到 2000；排查上传图片被踢回登录页，定位为 `request.ts` 刷新逻辑误判（401 后无限登出） |
| 2026-09-14 | [评论功能](2026-09-14-评论功能.md) | 新增文章评论 + 留言板：后端 `modules/comment` 单表 + 3 个接口，前端通用 `CommentSection` 与 `/message` 页；含页面实测 4 个问题的修复与富文本遗留项 |
| 2026-09-13 | [归档页面](2026-09-13-归档页面.md) | 新增 `/archive` 归档页：按年分组时间线 + 标签统计筛选；后端新增 `POST /article/archive`、改造 `POST /article/stat/tag` |

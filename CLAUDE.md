# 项目概况

本项目是个人博客客户端（my-blog-client），是一个前端项目。

- **后台管理前端源代码**：同级目录 `my-blog-admin `

- **后端服务源代码**：同级目录 `my-blog-service`
- **技术栈**: React + TypeScript + Vite
- **包管理器**：pnpm
- **Node 版本**：24

---

# 技术细节

## 样式

- 使用 **UnoCSS**（原子化 CSS），配置了 `@unocss/preset-uno`、`@unocss/preset-attributify`、`@unocss/preset-icons`

## 路径别名

- `@` → `src/` 目录

## 主要依赖

| 用途      | 库      |
| --------- | ------- |
| UI 组件库 | antd    |
| 状态管理  | zustand |
| HTTP 请求 | Axios   |

## 开发命令

- `pnpm  dev` — 启动开发服务器（端口 8888 ）
- `pnpm build` — 类型检查 + 构建

## 代理配置

开发环境下 `/api` 路径代理到 `http://127.0.0.1:8000/`

# Skills

根据用户请求的主要意图，自动选择对应 Skill：

- **Plan**：需求分析、技术方案、影响范围、实现思路 → `.claude/skills/plan/SKILL.md`
- **Code**：编写、修改、增加、删除代码 → `.claude/skills/code/SKILL.md`
- **Log**：生成变更日志、记录重大需求或技术改动 → `.claude/skills/log/SKILL.md`

使用 Skill 前读取对应的 `SKILL.md`，并遵循其中的规则。

---

## Routing Rules

- “先分析一下 / 怎么做 / 制定方案” → Plan
- “按照方案实现 / 帮我写 / 修改代码” → Code
- “记录一下 / 生成日志 / 更新变更记录” → Log
- 如果用户明确指定 Skill，优先按用户指定执行。
- 一个任务可以连续使用多个 Skill，例如：`Plan → Code → Log`。
- 如果已有明确且确认过的方案，可以跳过 Plan 直接使用 Code。
- 仅进行技术知识问答时，不需要调用这些 Skill。

# 要求

- **编写代码前**，先参考本文档了解项目配置和约定
- 如果有需要新增或修改后端接口的地方，**先询问我**，然后根据我的意见进行修改
- 遵循项目已有的代码风格和目录结构
- 使用 TypeScript，确保类型安全
- 代码编写完之后不需要执行命令运行项目，因为项目一般来说都在运行着
- 后端涉及到迁移的时候保证迁移最小功能块，不要整个迁移

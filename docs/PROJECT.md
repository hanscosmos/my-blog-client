# my-blog-client 项目文档

> 个人博客**前台**（访客端）SPA。对应的后台管理前端在同级目录 `my-blog-admin`，后端服务在同级目录 `my-blog-service`。
>
> **本文件是项目的功能与技术基线文档，每次新增/修改功能后必须同步更新对应章节。**
>
> 维护规则：
>
> 1. 新增页面/路由 → 更新 [路由表](#路由表)、[功能清单](#功能清单)、[目录结构](#目录结构)
> 2. 新增/修改接口 → 更新 [后端接口清单](#后端接口清单)，并同步 `src/types/api/*.d.ts`
> 3. 新增目录或文件 → 更新 [目录结构](#目录结构)
> 4. 新增依赖 / 修改构建配置 → 更新 [技术栈](#技术栈)、[运行与构建](#运行与构建)
> 5. 完成某项待办 → 从 [占位与待完成项](#占位与待完成项) 中移除

---

## 项目概述

| 项目 | 说明                                                                    |
| ---- | ----------------------------------------------------------------------- |
| 名称 | my-blog-client                                                          |
| 定位 | 博客前台展示端（阅读文章、按分类/标签浏览、归档、评论与留言板、博主信息、登录） |
| 类型 | 单页应用（SPA），纯客户端渲染                                           |
| 后端 | 同仓库组内的 `my-blog-service`，开发期通过 Vite 代理 `/api`             |
| 鉴权 | JWT（access token + refresh token）+ CSRF cookie，持久化在 localStorage |

---

## 技术栈

### 核心

| 分类      | 技术             | 版本 | 用途                                   |
| --------- | ---------------- | ---- | -------------------------------------- |
| 框架      | React            | 19.1 | UI                                     |
| 语言      | TypeScript       | 5.8  | 类型安全（`strict` 开启）              |
| 构建      | Vite             | 7.1  | 开发服务器 + 打包                      |
| 路由      | react-router-dom | 7.8  | 路由（`createBrowserRouter` + 懒加载） |
| UI 组件库 | antd             | 5.27 | 表单、分页、消息提示、骨架屏等         |
| 状态管理  | zustand          | 5.0  | 全局状态（`persist` 中间件做持久化）   |
| HTTP      | axios            | 1.20 | 请求封装与拦截器                       |
| 样式      | UnoCSS           | 66.5 | 原子化 CSS                             |

### 其他依赖

| 库                                         | 用途                                             |
| ------------------------------------------ | ------------------------------------------------ |
| `react-markdown` + `remark-gfm`            | Markdown 渲染（支持 GFM 表格、任务列表等）       |
| `remark-breaks`                            | 单个换行渲染为 `<br>`（评论沿用纯文本时代的换行习惯，仅评论启用） |
| `rehype-slug` + `rehype-autolink-headings` | 标题生成锚点 id，供目录（TOC）跳转（仅文章正文） |
| `highlight.js`                             | 代码块语法高亮（主题：`github.css`）             |
| `dayjs`                                    | 日期格式化（`src/utils/tool.ts`）                |
| `crypto-js`                                | 登录密码 MD5 加密                                |
| `@ant-design/icons`                        | 图标                                             |
| `@ant-design/v5-patch-for-react-19`        | 兼容 React 19 的 antd 补丁（在 `main.tsx` 引入） |

### 工程配置

- 包管理器：**pnpm**
- 路径别名：`@` → `src/`（同时配置在 `vite.config.ts` 与 `tsconfig.app.json`）
- UnoCSS 预设：`presetUno`、`presetAttributify`
  （注：`@unocss/preset-icons` **未**配置，图标统一使用 antd icons）
- ESLint 9 flat config：`eslint.config.js`
- TS 相关严格项：`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`、`erasableSyntaxOnly`

### 语言/运行环境

- 目标：`ES2022`
- `moduleResolution: bundler`，`jsx: react-jsx`

---

## 运行与构建

```bash
pnpm dev      # 启动开发服务器
pnpm build    # tsc -b 类型检查 + vite build
pnpm lint     # ESLint 检查
pnpm preview  # 预览构建产物
```

开发服务器实际配置（`vite.config.ts`）：

| 项   | 值                                                                 |
| ---- | ------------------------------------------------------------------ |
| 端口 | **8888**                                                           |
| host | `0.0.0.0`（允许局域网访问）                                        |
| CORS | 开启                                                               |
| 代理 | `/api` → `http://127.0.0.1:8000/`，并 **rewrite 去掉 `/api` 前缀** |

> ⚠️ 代理会剥离 `/api` 前缀，因此后端实际收到的路径是 `/article/list` 这类裸路径。写接口时不要重复带 `/api`。

---

## 目录结构

```
my-blog-client/
├── docs/
│   └── PROJECT.md              # 本文档（功能 + 技术基线，需持续维护）
├── public/
│   └── vite.svg
├── src/
│   ├── ai/                     # AI 协作产物（不参与构建）
│   │   ├── plan/               # 方案/计划文档（login.md、self.md、comment.md）
│   │   └── memory/             # 对话沉淀文档（由 /log skill 生成）
│   ├── api/                    # 接口层：按业务模块拆分，一函数一接口
│   │   ├── article/
│   │   │   ├── index.ts        # 文章列表 / 详情 / 热门 / 阅读统计
│   │   │   ├── archive/        # 归档列表（支持按标签筛选）
│   │   │   ├── category/       # 分类树
│   │   │   ├── column/         # 专栏列表（已定义，暂未使用）
│   │   │   └── tag/            # 标签列表（暂未使用） / 标签统计
│   │   ├── blogger/            # 博主公开资料（关于页）
│   │   ├── comment/            # 评论列表 / 发表 / 删除
│   │   ├── upload/             # 上传图片到 COS（评论插图用）
│   │   └── user/               # 登录 / 刷新 token / 验证码 / 用户信息
│   ├── assets/                 # 静态资源（webpack/vite 处理，走 import）
│   │   ├── font/               # 自定义字体（roboto、NotoSansSC、zcool、ali、YouSheBiaoTiHei）
│   │   └── images/             # logo.jpg、common-article-cover.png（文章默认封面）
│   ├── components/             # 跨页面复用的业务组件（非 pages 私有）
│   │   ├── CommentSection/
│   │   │   └── index.tsx       # 通用评论区：文章评论与留言板共用，靠 targetType/targetId 区分
│   │   ├── MarkdownContent/
│   │   │   └── index.tsx       # 评论 markdown 渲染（GFM + 保留换行，不解析原始 HTML）
│   │   ├── MarkdownEditor/
│   │   │   ├── index.tsx       # 简易 markdown 编辑器：加粗/链接/图片/表情 + 编辑预览切换
│   │   │   └── emojis.ts       # 表情面板数据
│   │   └── TagBadge.tsx        # 标签胶囊（颜色取自 utils/tagColor）
│   ├── layout/
│   │   ├── MainLayout.tsx      # 主布局：顶部导航 + 1080px 居中内容区（<Outlet/>）
│   │   └── TopBar/
│   │       ├── index.tsx       # 顶栏：站名、导航（首页/归档/关于）、搜索、主题、登录态/头像下拉
│   │       └── components/
│   │           ├── SearchBtn.tsx      # 搜索入口（占位，无逻辑）
│   │           └── ThemeSwitcher.tsx  # 明暗切换 + 中控台入口（后者占位）
│   ├── pages/                  # 页面（每个目录一个页面，index.tsx 为入口）
│   │   ├── Home/
│   │   │   ├── index.tsx       # 首页：顶部分类筛选 + 两列卡片分页列表 + 右侧边栏
│   │   │   └── components/
│   │   │       ├── CategoryFilter.tsx  # 顶部分类筛选（一级 pill + 二级行，就地过滤不跳转）
│   │   │       └── Sidebar.tsx         # 侧边栏：热门文章 / 标签统计
│   │   ├── Article/
│   │   │   ├── index.tsx       # 文章详情页：头部元信息 + 正文 + 目录
│   │   │   └── components/
│   │   │       ├── ArticleCard.tsx    # 文章卡片（list 横向 / grid 竖向两种变体）
│   │   │       └── ArticleDetail.tsx  # Markdown 渲染 + TOC + 代码高亮/复制 + 回到顶部
│   │   ├── About/index.tsx     # 关于博主：拉取博主简介
│   │   ├── Archive/index.tsx   # 归档：按年分组的时间线 + 标签统计筛选
│   │   ├── Category/index.tsx  # 分类文章列表（alias → 分类 id → 文章列表）
│   │   ├── Tag/index.tsx       # 标签文章列表
│   │   ├── Login/index.tsx     # 登录页：用户名/密码/图形验证码，MD5 加密提交
│   │   ├── Message/index.tsx   # 留言板：引导文案 + 复用 CommentSection
│   │   └── NotFound/index.tsx  # 404 页
│   ├── routes/
│   │   ├── index.tsx           # 路由表（React.lazy 懒加载页面）
│   │   └── ProtextedRoute.tsx  # 路由守卫：ProtectedRoute（未使用）、PublicRoute（登录页使用）
│   ├── services/
│   │   └── request.ts          # axios 实例 + 请求/响应拦截器 + 401 refresh 重试
│   ├── store/                  # zustand 全局状态
│   │   ├── useAuth.ts          # 鉴权状态（token/refreshToken/csrfToken/userInfo/isLogin），persist
│   │   └── useTheme.ts         # 主题状态（color/mode），写 data-* 属性 + localStorage
│   ├── style/                  # 全局样式（在 main.tsx 统一引入 index.css）
│   │   ├── index.css           # 汇总入口：reset + theme + article + comment + @font-face
│   │   ├── reset.css           # 样式重置
│   │   ├── theme.css           # CSS 变量：多主题 × 明暗模式
│   │   ├── article.css         # 文章正文排版、代码块样式
│   │   └── comment.css         # 评论正文排版（复用 .article-content 并收紧字号间距）
│   ├── types/
│   │   ├── index.d.ts          # 全局通用类型（PageType/ResultPageType/IdType）
│   │   └── api/
│   │       ├── article.d.ts    # 文章、分类、专栏、标签相关类型
│   │       ├── blogger.d.ts    # 博主资料类型
│   │       └── comment.d.ts    # 评论相关类型
│   ├── utils/
│   │   ├── tagColor.ts         # 标签颜色字典（与后端 tag_color 一致）
│   │   ├── tool.ts             # 通用工具（formatDate）
│   │   └── upload.ts           # 图片校验 + 上传（uploadImage/validateImage）
│   ├── App.tsx                 # 挂载 RouterProvider
│   ├── main.tsx                # 应用入口：createRoot + 全局样式 + antd React19 补丁
│   └── vite-env.d.ts
├── .claude/                    # Claude Code 配置
│   ├── commands/log.md
│   └── skills/                 # code / log / plan 三个 skill
├── CLAUDE.md                   # 项目约定（供 AI 与开发者参考）
├── uno.config.ts               # UnoCSS：主题色、shortcuts、自定义 rules
├── vite.config.ts              # 别名、端口、代理
└── index.html                  # HTML 模板（标题：与君同的博客）
```

**分层约定**：`pages`（页面组装） → `api`（接口调用） → `services/request`（HTTP 基础设施）；跨页面共享状态放 `store`。视图组件按复用范围放置：

- **只被本页使用** → `pages/*/components`（如 `ArticleCard`、`ArticleDetail`、`CategoryFilter`）
- **被多个页面共用** → `src/components/*`（`CommentSection` 由文章详情页与留言板共用；`MarkdownEditor`/`MarkdownContent`/`TagBadge` 目前只被 `CommentSection` 及相关页面引用，但属通用组件）

---

## 路由表

定义于 `src/routes/index.tsx`，全部页面通过 `React.lazy` 懒加载。

| 路径               | 页面组件         | 布局       | 守卫          | 说明                              |
| ------------------ | ---------------- | ---------- | ------------- | --------------------------------- |
| `/`                | `pages/Home`     | MainLayout | 无            | 首页，文章分页列表                |
| `/article/:id`     | `pages/Article`  | MainLayout | 无            | 文章详情                          |
| `/about`           | `pages/About`    | MainLayout | 无            | 关于博主                          |
| `/archive`         | `pages/Archive`  | MainLayout | 无            | 归档：按年分组的时间线 + 标签筛选 |
| `/message`         | `pages/Message`  | MainLayout | 无            | 留言板（评论的一种 `targetType`） |
| `/category/:alias` | `pages/Category` | MainLayout | 无            | 分类文章列表（按 alias 定位分类） |
| `/tag/:alias`      | `pages/Tag`      | MainLayout | 无            | 标签文章列表                      |
| `/login`           | `pages/Login`    | 无         | `PublicRoute` | 已登录访问会重定向到 `/`          |
| `*`                | `pages/NotFound` | 无         | 无            | 404                               |

> `ProtectedRoute`（未登录跳 `/login`）已实现但**当前没有路由使用**——前台所有内容页均可匿名访问。

---

## 功能清单

### 1. 顶部导航栏（`layout/TopBar`）

- 站点名称「与君同的博客」
- 导航项：首页 `/`、归档 `/archive`、留言 `/message`、关于 `/about`；当前路径匹配时高亮（`text-primary`）
- 搜索图标：**占位，暂无交互**
- 主题切换：明/暗模式一键切换（`ThemeSwitcher`）
- 中控台图标：**占位，暂无交互**
- 登录态：
  - 已登录 → 显示用户头像（antd `Avatar`，无头像时回退 `UserOutlined`），下拉菜单仅「退出登录」；退出前 `Modal.confirm` 二次确认
  - 未登录 → 显示「登录」按钮，跳转 `/login`

### 2. 主布局（`layout/MainLayout`）

- 顶部固定 60px 导航栏
- 内容区最大宽度 1080px 居中，`app-wrapper` shortcut 预留 `padding-top: 60px`
- 底色/文字色跟随主题变量
- `app-wrapper` 叠了一层柔和对角渐变背景：由 `--color-primary` 与 `--color-bg` 用 `color-mix()` 按 26% → 12% → 4% 混出，因此**自动跟随主题色与明暗模式，无需新增 CSS 变量**。用 `background-attachment: fixed` + `background-size: 100% 100%` 把绘制区域锚定到视口，**页面滚动时背景不会跟着滚走**（注意：iOS Safari 对 `background-attachment: fixed` 支持不佳，如需移动端也固定，得改用 `position: fixed` 的伪元素承载背景）

### 3. 首页（`pages/Home`）

- 顶部**分类筛选** `CategoryFilter`：调 `POST /article/category/tree` 取树，一级分类一行 pill，选中后在其下方展开该分类的二级 pill（无子级则不占高度）
  - **就地过滤，不跳转**：点击「全部」传 `category=''`，点父分类传父分类 id（后端自动包含其子分类文章），点子分类传子分类 id
  - 切换分类时重置到第 1 页；两级高亮联动（选中子分类时其父分类也高亮）
  - 用 `requestIdRef` 丢弃过期响应，避免快速连点分类时旧结果覆盖新数据
- 文章列表：调 `POST /article/list`，每页 10 条，**两列网格**（`grid-cols-2`），卡片用 `variant="grid"`
- 翻页时平滑滚动回顶部
- 底部悬浮分页条（`sticky bottom-0`，半透明 `card-glass`）
- 加载中 / 空列表 有对应提示文案
- 右侧边栏 `Sidebar`（`w-72`，`sticky top-24`）：
  - **热门文章**：调 `POST /article/hot`，取前 5 条；前 3 名序号高亮为主色；点击跳 `/article/:id`
  - **标签统计** `TagStat`：调 `POST /article/stat/tag` 拿「有可见文章」的标签及数量，chip 显示 `#名称 数量`；点击跳 `/archive?tag=<id>`（归档页会按该标签直接筛上）；标签较多时该区块限高 `max-h-72` 内滚，避免侧边栏太长后 `sticky` 内容触不到

### 4. 文章列表卡片（`pages/Article/components/ArticleCard`）

首页 / 分类页 / 标签页共用的展示组件，通过 `variant` 切换两种布局（默认 `list`）：

- **`list`（横向，分类页 / 标签页使用）**：左侧分类标签（两级时显示「父 / 子」）、发布日期、阅读数、标题（单行截断）、摘要（3 行截断）、标签列表；右侧封面图
- **`grid`（竖向，首页使用）**：封面在上（`aspect-[16/9]`，悬浮时缓慢放大 `scale-105`），下方依次是元信息、标题（2 行截断）、摘要（2 行截断）、标签列表；卡片自身用 `h-full flex flex-col` + 摘要 `flex-1` 保证同行等高，悬浮时上浮 + 阴影 + 标题转主色
- 两种变体的元信息行与标签列表抽成文件内的 `ArticleMeta` / `TagList` 复用
- 无封面时回退到默认图 `assets/images/common-article-cover.png`
- 点击整卡触发 `onClick(id)` 跳转详情

### 5. 文章详情页（`pages/Article`）

- 进入页面并行发起两个请求：
  - `POST /article/detail` 拉正文
  - `POST /article/read/stat` 记录/查询阅读量（同时拿到 `todayRead`）
- 头部元信息：标题、作者昵称、发布日期、总阅读数（今日有增量时追加「今日 +N」）、分类（「父·子」样式徽标）、最近更新时间、标签列表、封面图
- 正文由 `ArticleDetail` 组件渲染：
  - `react-markdown` + `remark-gfm` 渲染 Markdown
  - `rehype-slug` + `rehype-autolink-headings` 为标题生成锚点
  - 图片统一 `loading="lazy"`
  - 代码块用 `highlight.js` 高亮（有语言标识按语言高亮，否则 `highlightAuto`），右上角 hover 出现「复制」按钮（复制后 2 秒内显示「已复制」）
  - 行内代码保持 `<code>` 内联样式
- 右侧目录（TOC）：
  - 从渲染后的 DOM 里提取 `h1~h6` 的 id 与文本
  - `IntersectionObserver` 滚动高亮当前章节
  - 点击平滑滚动定位
  - 按标题层级做字号/缩进区分，`lg` 断点以下隐藏
- 右下角 antd `FloatButton.BackTop` 回到顶部
- 文章不存在时显示占位文案 + 「返回首页」
- 正文下方为评论区 `CommentSection`（`key={baseInfo.id}`，切换文章时整体重置分页与回复态）

### 6. 分类页（`pages/Category`）

- 路由参数 `alias` → 拉分类树（组件内 `useRef` 缓存，避免重复请求）→ 递归查找匹配 `alias` 的分类拿到 `id`
- 用分类 `id` 作为 `category` 参数调 `POST /article/list`
- 标题显示「分类：{名称}　共 N 篇」，下方文章卡片列表 + 分页

### 7. 标签页（`pages/Tag`）

- 标题显示「标签：#{alias}　共 N 篇」，下方文章卡片列表 + 分页
- ⚠️ **当前未真正按标签过滤**：只把 `alias` 用于标题展示，`getArticleListApi` 的入参未传标签条件（`QueryType` 里也还没有 tag 字段），实际返回的是全部文章。需要按标签筛选时，需先与后端确认接口参数再改。

### 8. 关于页（`pages/About`）

- 调 `POST /blogger/profile/get` 获取博主简介（前台公开接口，仅返回 `introduction`，不含手机/微信等隐私字段）
- antd `Card` 包裹，加载中显示 `Skeleton`，无内容时显示「博主还没有填写简介～」
- 简介按原文换行展示（`whitespace-pre-wrap`）

### 9. 归档页（`pages/Archive`）

- 只展示 `status='publish'` 且 `visible='public'` 的文章——**草稿与「仅自己可见」都不出现**，登录状态下也一样（与首页 `/article/list` 的行为不同，后者允许作者看到自己的私有文章）
- 顶部「标签统计」卡片：调 `POST /article/stat/tag` 拿到「有可见文章」的标签及其数量，chip 显示 `#名称 数量`
  - 点击 chip → 按该标签筛选列表并高亮；再点同一个 chip，或点右上角「取消筛选」→ 恢复全量
  - 没有任何可见标签时，整张卡不渲染
  - 标签统计只在挂载时请求一次，切换标签只重新请求归档列表
  - **当前选中标签由 URL 承载**（`useSearchParams` 读 `?tag=<id>`，写入用 `replace: true`）：首页侧边栏「标签统计」可直接带 `?tag=` 跳进来并自动筛上，筛选结果也可分享/刷新保持
- 下方时间线：调 `POST /article/archive`（入参 `{ tag }`，不分页，后端已按 `createTime` 倒序）
  - 前端用 `Map` 按 `createTime` 的年份分组，因数据已倒序，年份天然倒序
  - 每年一行标题（年份 + 分隔线 + 该年篇数），条目为 `MM-DD` + 标题（单行截断），点击跳 `/article/:id`
  - 加载中显示 `Skeleton`，无数据显示「暂无文章」

### 10. 登录页（`pages/Login`）

- 表单字段：用户名、密码、图形验证码
- 验证码：进入页面时用 `crypto.randomUUID()` 生成 `key`，调 `POST /user/valid/code` 拿到验证码文本直接渲染（点击可刷新）
- 提交时密码经 `crypto-js` 做 **MD5** 后发送
- 登录成功后：写入 `useAuth`（token / refreshToken / csrfToken / userInfo）→ 调 `request.setCsrfCookie` 落 `csrftoken` cookie → 跳首页
- 已登录用户访问会被 `PublicRoute` 重定向到 `/`
- 视觉：渐变背景 + 6 个浮动圆形装饰动画（`float` keyframes）

### 11. 404 页（`pages/NotFound`）

- 极简实现，仅输出 `❌ 404 Not Found` 文本，暂无样式与返回首页入口

### 12. 评论与留言板（`components/CommentSection`、`pages/Message`）

文章评论与留言板共用同一个组件 `src/components/CommentSection/index.tsx`，靠 `targetType`（`article` / `message`）与 `targetId` 区分评论对象；留言板不传 `targetId`。

**结构与排序**

- **两级结构**：顶层评论 + 其下回复。回复**扁平存储**（不嵌套树），统一挂在所属顶层评论下
- 顶层评论按时间**倒序**（最新在前），每页 10 条；回复按时间**正序**（最早在前）
- 回复展示为「昵称 + 回复 @某人」（`replyUser`），顶层评论不显示该字段
- 顶层评论头像 40px，回复头像 28px，回复区整体以左侧竖线缩进，形成层级

**发表**

- **登录后才能发表**；未登录时输入框位置显示「登录后才可以发表评论」+ 「去登录」按钮
- 输入框为 markdown 编辑器（见下），`maxLength=2000`（与后端 `MAX_CONTENT_LENGTH` 一致），字数计数由组件自行渲染在按钮左侧（**不用 antd 的 `showCount`**——它绝对定位在文本框右下角，会与右对齐的发表按钮重叠）
- 点某条评论的「回复」→ 输入框上方出现「正在回复 @某人」（可取消），提交时带 `rootId`（楼层）与 `replyUser`（被回复者）
- 提交回复**不整页重拉**，按接口返回的 `rootId` 就地追加到对应楼层；提交顶层评论时回第 1 页重拉

**正文格式（markdown）**

评论正文存 markdown 源码，渲染与编辑分别由两个通用组件承担：

| 组件 | 说明 |
| --- | --- |
| `components/MarkdownContent` | 渲染。`remark-gfm` + `remark-breaks`，**不启用 `rehype-raw`**（原始 HTML 被转义输出，react-markdown 默认的 `urlTransform` 拦掉 `javascript:` 协议，因此后端无需额外的 XSS 过滤层） |
| `components/MarkdownEditor` | 编辑。工具栏（加粗 / 链接 / 上传图片 / 表情）+ 编辑预览切换，基于 antd `Input.TextArea` 自研，未引入第三方编辑器库 |
| `utils/upload.ts` + `api/upload` | 图片上传：`POST /sys/file/upload`，返回 CDN URL 后以 `![图片](url)` 插入 |

- `remark-breaks` **只给评论启用**：历史评论是纯文本、靠 `whitespace-pre-wrap` 保留换行，不补这个插件换行会塌掉；文章正文仍走原来的渲染器
- 副作用：**单个换行会被渲染成 `<br>`，只有空行才是段落边界**。因此 `insertImage` 按「前后各补成恰好一个空行」的规则补位，让图片独立成段（源码干净，不依赖 CSS 补救）
- 评论正文样式复用 `.article-content`，由 `style/comment.css` 覆盖为更紧凑的字号间距；覆盖**依赖 `index.css` 的引入顺序**（`comment.css` 在 `article.css` 之后），两者选择器特异性相同
- 图片为块级显示（`.comment-content img { display: block }`），无论源码中处于什么位置都独占一行
- 支持 Ctrl+V 粘贴剪贴板截图；剪贴板同时含文字时不拦截，避免吃掉正常文本粘贴

**删除**

- 每条评论是否可删由后端返回的 `canDelete` 决定（评论作者本人 或 该内容的作者/博主），前端不判断身份
- 删除前 `Modal.confirm` 二次确认；**删除顶层评论会连带删除其下所有回复**
- 删除后重拉当前页；若该页被删空，`fetchList` 检测到 `result.length === 0 && total > 0 && page > 1` 会**自动回退一页**
- 空状态判定用 `total === 0`（而非 `list.length === 0`），避免删空某一页时误显示「还没有评论」

**留言板（`pages/Message`）**

- 路由 `/message`，顶部导航「留言」进入
- 一张引导文案卡片 + `CommentSection`（`targetType="message"`，无 `targetId`）
- 留言板的「内容作者」（即有权删除任意留言的人）由后端取 `BloggerProfile` 的第一条记录

### 13. 需求沟通页（`src/ai`）

- 不参与构建，用于沉淀 AI 协作产物：`plan/` 存方案，`memory/` 存对话纪要（`/log` skill 生成）

---

## 公共能力层

### 请求层（`src/services/request.ts`）

导出两个 axios 实例 + 一套拦截器：

| 导出                   | baseURL       | 用途                                   |
| ---------------------- | ------------- | -------------------------------------- |
| `default`（`request`） | `/api/client` | 前台客户端接口                         |
| `adminRequest`         | `/api`        | 管理端接口（登录/刷新/验证码，以及评论配图上传） |

`request` 额外挂载 `setCsrfCookie(token)`。

**返回类型（`unwrapResponse`）**：响应拦截器成功回调返回的是 `res.data`（业务 payload），但 axios 的类型系统无法表达「拦截器改变了返回值形状」这件事。`createRequest` 里的 4 个方法通过 `unwrapResponse<T>(promise)` 做一次断言，因此调用方写 `request.post<ArticleItemType>(...)` 拿到的就是 `Promise<ArticleItemType>`，不需要 `.data.data`。

> ⚠️ 不要改回 `inst.post<any, T>(url, ...)` 的写法。axios 1.20 起第二个泛型参数 `R` 是条件类型分支（`AxiosResponseResult`），传入裸类型参数 `T` 时 TS 无法解析该条件，会报 `TS2322: 'AxiosResponseResult<any, T, any, any>' is not assignable to type 'T'`。

- **超时**：10s；默认 `Content-Type: application/json`
- **请求拦截器**：从 `useAuth` 取 token，写入 `Authorization` 头；同时从 cookie 读 `csrftoken` 写入 `X-CSRFToken` 头
- **响应拦截器（业务层）**：网关约定 `{ code, msg, message, data }`
  - `code === 0` → 直接返回 `data`（调用方拿到的就是业务数据，无需 `.data.data`）
  - `code === 401` → 见下方刷新流程
  - 其他非 0 → `message.error` 提示并 reject
- **401 → refresh → 重试**（参考 `my-blog-admin` 的实现）：
  1. 登录接口本身 401 / 刷新接口本身 401 / 已重试过的请求再次 401 → 直接登出并 `window.location.replace("/login")`（防死循环）
  2. 无 `refreshToken` → 直接登出
  3. 已有刷新请求在飞行中 → 把当前请求挂到 `subscribers` 队列，待新 token 到达后带新 token 重试
  4. 否则发起 `POST /user/refresh`，成功则更新 store 中的 `token`、唤醒队列、重试原请求；失败或异常则登出
  - 登出前会写 `sessionStorage.setItem("tokenValid", "true")`（标记「token 曾失效」，供后续可能的提示使用）
- **响应拦截器（HTTP 层）**：把 400/401/403/404/408/500/502/503/504 映射为中文提示；其中 HTTP 401 也会直接登出并跳登录

### 状态管理（zustand）

**`useAuth`**（`store/useAuth.ts`，`persist` → localStorage key `auth-storage`）

| 字段           | 类型             | 说明                                                              |
| -------------- | ---------------- | ----------------------------------------------------------------- |
| `token`        | `string \| null` | access token                                                      |
| `refreshToken` | `string \| null` | 刷新用 token                                                      |
| `csrfToken`    | `string \| null` | CSRF token                                                        |
| `userInfo`     | `UserInfo`       | `id / nickName / avatar / bgCover / sex / createTime / loginTime` |
| `isLogin`      | `boolean`        | 登录态                                                            |

方法：`login({token, refreshToken, csrfToken, userInfo})`、`logout()`（重置为默认值）。
拦截器中通过 `useAuth.getState()` / `useAuth.setState()` 在组件外读写。

**`useTheme`**（`store/useTheme.ts`，非 persist，手动读写 localStorage）

| 字段    | 类型                             | 说明     |
| ------- | -------------------------------- | -------- |
| `color` | `"blue" \| "purple" \| "orange"` | 主题色   |
| `mode`  | `"light" \| "dark"`              | 明暗模式 |

方法：`setColor`、`setMode`、`toggleMode`。
实现方式是把 `data-theme-color` / `data-theme-mode` 写到 `<html>` 上，并同步 `localStorage` 的 `theme-color` / `theme-mode`；模块加载时读取并恢复。

### 主题与样式

**CSS 变量**（`style/theme.css`）：`--color-primary`、`--color-secondary`、`--color-bg`、`--color-text`、`--color-container-bg`、`--color-border`、`--color-hover`、`--color-shadow`、`--color-muted`。
通过 `[data-theme-mode="..."][data-theme-color="..."]` 组合覆盖。

**UnoCSS 主题映射**（`uno.config.ts`）：把变量映射成颜色工具类，可直接写 `text-primary`、`bg-container`、`border-border`、`text-muted` 等。

**常用 shortcuts**：

| 名称                                             | 展开                                                   |
| ------------------------------------------------ | ------------------------------------------------------ |
| `center-flex`                                    | `flex justify-center items-center`                     |
| `flex-between`                                   | `flex justify-between items-center`                    |
| `wh-full`                                        | `w-full h-full`                                        |
| `text-hovers`                                    | `hover:text-primary transition-linear cursor-pointer`  |
| `text-hover-rotate`                              | `hover:rotate-360 transition-linear`                   |
| `border-bottom`                                  | `border-b border-border border-solid`                  |
| `card`                                           | `p-4 bg-container border border-border rounded shadow` |
| `btn-primary` / `btn-secondary`                  | 主/次按钮样式                                          |
| `title-lg` / `title-md`                          | `text-3xl font-bold` / `text-2xl font-semibold`        |
| `text-muted` / `text-primary` / `text-secondary` | 文字色                                                 |

**自定义 rules**：`app-wrapper`（页面底色 + 柔和对角渐变背景 + 文字色 + `padding-top: 60px`）、`top-bar-bg`（复用 `app-wrapper` 同一份视口锚定渐变，因此顶部导航栏与页面背景像素级衔接，不需要分隔线）、`card-glass`（`--color-container-bg` 80% 透明度 + `backdrop-filter: blur(8px)`，用于浮在渐变上的卡片/筛选栏/分页条）、`transition-linear`（`transition: all 0.5s linear`）。

> `app-wrapper` 与 `top-bar-bg` 的渐变由文件内的 `pageBackground` 常量统一提供，改背景只需改这一处。

**字体**（`style/index.css` 中 `@font-face`）：`roboto`、`NotoSansSC`、`ZCOOLKuaiLe`、`Ali FangYuan`、`YouSheBiaoTiHei`。目前仅在 CSS 中声明，尚未在任何页面的 `font-family` 中强制使用。

**文章排版**（`style/article.css`）：`.article-content` 下的标题层级、段落、链接、行内代码、引用、表格、代码块（`.code-block`）等完整排版规则。

### 类型定义

全局 `.d.ts`（免 import 直接使用）：

- `src/types/index.d.ts` — `PageType`（`pageNumber`/`pageSize`）、`ResultPageType<T>`（`total`/`result`）、`IdType`
- `src/types/api/article.d.ts` — `QueryType`、`ArticleTagItem`、`ArticleItemType`（列表项）、`ArticleDetailType`（含 `baseInfo`/`authorInfo`/`categoryInfo`/`tagList`/`detailInfo`）、`ArticleCategoryItemType`、`ArticleColumnItemType`、`ArticleArchiveItemType`（归档项）、`ArticleTagStatType`（标签统计项）
- `src/types/api/blogger.d.ts` — `BloggerProfileType`
- `src/types/api/comment.d.ts` — `CommentTargetType`（`"article" | "message"`）、`CommentUserType`、`CommentReplyItemType`（回复项，含定位楼层用的 `rootId`）、`CommentItemType`（顶层评论，内嵌 `replies`）、`CommentListResType`、`CommentAddParams`、`CommentAddResType`

### 工具函数

- `formatDate(date, format = "YYYY-MM-DD")` — dayjs 封装，`src/utils/tool.ts`
- `getTagColorStyle(color)` — 标签颜色字典查表，`src/utils/tagColor.ts`
- `validateImage(file)` / `uploadImage(file, dir)` — 图片格式与大小校验、组装 `FormData` 上传并返回 CDN URL，`src/utils/upload.ts`。**校验只是体验层的提前拦截，后端 `/sys/file/upload` 并不校验类型与大小，不能当作安全边界**

---

## 后端接口清单

所有接口在 `src/api/` 中定义。网关返回统一结构 `{ code, msg, message, data }`，`code === 0` 为成功。

### 前台客户端（`request`，baseURL `/api/client`）

| 方法 | 路径                     | 函数                    | 入参                                                                     | 返回                                                    |
| ---- | ------------------------ | ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- |
| POST | `/article/list`          | `getArticleListApi`     | `PageType & QueryType`（`pageNumber`、`pageSize`、`title`、`category?`） | `ResultPageType<ArticleItemType>`                       |
| POST | `/article/archive`       | `getArticleArchiveApi`  | `{ tag?: string }`（标签 id，空 = 全部）                                 | `ArticleArchiveItemType[]`（**不分页**，按 `createTime` 倒序） |
| POST | `/article/stat/tag`      | `getTagStatApi`         | —                                                                        | `ArticleTagStatType[]`（`{ id, name, alias, color, count }`） |
| POST | `/article/detail`        | `getArticleDetailApi`   | `{ id }`                                                                 | `ArticleDetailType`                                     |
| POST | `/article/hot`           | `getArticleHotListApi`  | —                                                                        | `ArticleItemType[]`                                     |
| POST | `/article/read/stat`     | `getArticleReadStatApi` | `{ id }`                                                                 | `{ todayRead, totalRead }`                              |
| POST | `/article/category/tree` | `getAllCategoryTreeApi` | —                                                                        | `ArticleCategoryItemType[]`                             |
| POST | `/article/column/list`   | `getColumnListApi`      | `PageType`                                                               | `ResultPageType<ArticleColumnItemType>`（**暂未使用**） |
| POST | `/article/tag/list`      | `getTagListApi`         | `PageType`                                                               | `ResultPageType<ArticleTagItem>`（**暂未使用**）        |
| POST | `/article/stat/category` | —                       | —                                                                        | `[{ id, name, count }]`（**前端暂未使用**）             |
| POST | `/article/stat/column`   | —                       | —                                                                        | `[{ id, name, count }]`（**前端暂未使用**）             |
| POST | `/blogger/profile/get`   | `getBloggerProfileApi`  | `{}`                                                                     | `BloggerProfileType`（仅 `introduction`）               |
| POST | `/comment/list`          | `getCommentListApi`     | `PageType & { targetType, targetId? }`                                   | `CommentListResType`（`{ total, totalCount, result }`） |
| POST | `/comment/add`           | `addCommentApi`         | `{ targetType, targetId?, content, rootId?, replyUser? }`                | `CommentAddResType`（扁平评论对象，含 `rootId`）        |
| POST | `/comment/delete`        | `deleteCommentApi`      | `{ id }`                                                                 | `true`                                                  |
| POST | `/user/info`             | `getUserInfoApi`        | `{}`                                                                     | `{ id, name, avatar }`（**暂未使用**）                  |

> **评论接口补充说明**
>
> - `targetType` 取值 `article` / `message`。`targetType="article"` 时 `targetId` 必传（文章 id）；`message` 时不需要
> - 三个接口都是 `POST`，匿名可访问（中间件对 `/client/` 不做 JWT 校验），但 `add` / `delete` 在视图内**要求登录**，未登录返回 `401` + 「请先登录后再评论」
> - `list` 返回的每条评论都带 **`canDelete`**（后端逐条算好：评论作者本人，或该内容的作者/博主），前端据此决定是否渲染「删除」，**不需要自己判断身份**
> - `add` 传 `rootId` 表示回复该楼层；此时 `replyUser` 必传（被回复者 id）。传 `replyUser` 等于自己会被拒（`501` + 「不能回复自己的评论」）
> - 列表本身**固定 4 条 SQL**（顶层分页 / 回复 / 用户 / 回复数），不会随评论条数增长

### 管理端（`adminRequest`，baseURL `/api`）

| 方法 | 路径               | 函数              | 入参                                     | 返回                                           |
| ---- | ------------------ | ----------------- | ---------------------------------------- | ---------------------------------------------- |
| POST | `/user/login`      | `loginApi`        | `{ username, password(MD5), key, code }` | `{ userInfo, token, refreshToken, csrfToken }` |
| POST | `/user/refresh`    | `refreshTokenApi` | `{ refreshToken }`                       | `{ token }`                                    |
| POST | `/user/valid/code` | `getValidCodeApi` | `{ key }`                                | `string`（验证码文本）                         |
| POST | `/sys/file/upload` | `uploadFileApi`   | `FormData{ file, name, type }`（`type` 为 COS 目录，如 `comment`） | `string`（CDN 完整 URL）（前台评论配图复用此接口） |

> 注意：`request.ts` 内部刷新 token 时直接调用 `instance.post("/user/refresh", ...)`，与已导出的 `refreshTokenApi` 是两条路径；如需调整刷新逻辑，改 `request.ts` 里的那份。
>
> ⚠️ `/sys/file/upload` 挂在 `/sys` 下，**不走 `/client/*` 的免鉴权分支，需要登录态**（token 过期会返回 `401`）。前台评论配图直接复用它，没有单独的 `/client/file/upload`。后端对该接口**不校验文件类型与大小**，且后台的文章封面、头像等也共用它——若要收紧，改动点在后端 `modules/system/views/other.py` 与 `config/permission.py`；一旦它被登记进权限码映射表，前台也会受影响。

---

## 占位与待完成项

以下为代码中已存在但**尚未接通**或**行为不完整**的部分，实现时请一并更新本文档对应章节：

| #   | 位置                                                               | 现状                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `layout/TopBar/components/SearchBtn.tsx`                           | 只有图标，无搜索弹窗/跳转逻辑                                                                                                                                                             |
| 2   | `layout/TopBar/components/ThemeSwitcher.tsx`                       | 中控台图标（`AppstoreOutlined`）无点击行为                                                                                                                                                |
| 3   | `pages/Tag/index.tsx`                                              | 未按标签过滤，实际展示全部文章（接口无 tag 参数）                                                                                                                                         |
| 4   | `store/useTheme.ts`                                                | `ThemeColor` 为 `blue \| purple \| orange`，但 `theme.css` 里只有 blue / purple / green——**orange 无对应 CSS 变量，green 无法通过类型选中**；且目前没有任何主题色切换 UI，只能用默认 blue |
| 5   | `pages/NotFound/index.tsx`                                         | 无样式、无返回首页入口                                                                                                                                                                    |
| 6   | `routes/ProtextedRoute.tsx`                                        | `ProtectedRoute` 已实现但未被任何路由引用                                                                                                                                                 |
| 7   | `api/article/column`、`api/article/tag` 的 `getTagListApi`、`api/user.getUserInfoApi` | 已定义但无调用方（同文件的 `getTagStatApi` 已用于归档页与首页侧边栏）                                                                                                                     |
| 8   | `CLAUDE.md`                                                        | 提到的 `@unocss/preset-icons` 实际未配置                                                                                                                                                  |
| 9   | `store/useAuth.ts` 的 `csrfToken`                                  | 已存储但请求时实际是从 cookie 读 `csrftoken`，字段本身未被读取                                                                                                                            |
| 10  | `src/ai/plan/self.md`                                              | 空文件                                                                                                                                                                                    |
| 11  | 文章详情页                                                         | 无「上一篇/下一篇」「相关文章」等能力                                                                                                                                                     |
| 12  | `uno.config.ts` 的 `app-wrapper` 背景                              | 用 `background-attachment: fixed` 固定渐变，**iOS Safari 支持不佳**（会退化成随页面滚动）；移动端要做到背景固定需改用 `position: fixed` 伪元素承载                                          |
| 13  | 评论消息提醒                                                       | **未实现**。被回复/被评论时通知对方；后端当前没有通知模型，`my-blog-admin` 的 `MessageBtn` 也只是图标占位（无点击无接口）                                                                  |
| 14  | 前台注册入口                                                       | **未实现**。前台没有注册页，用户只能由后台添加；因此「登录后才能评论」目前依赖博主先在后台开号。后端 `/user/add` 是管理端接口（需 JWT + 权限码），不能给前台复用                       |
| 15  | 评论审核                                                           | `Comment.status` 默认 `visible`，即**先发后审**；但两个前端都没有评论管理界面，被置为非 `visible` 的评论目前没有操作入口                                                                  |

---

## 变更记录

| 日期       | 变更                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| 2026-09-12 | 首次生成：梳理项目概述、技术栈、目录结构、路由、功能、公共能力层、接口清单与待完成项 |
| 2026-09-13 | 新增归档页：路由 `/archive` + 顶部导航项；新增接口 `POST /article/archive`（不分页、支持标签筛选）；改造 `POST /article/stat/tag`（补 `status`/`visible` 过滤、返回补 `alias`/`color`、去掉逐标签 N+1 查询）；新增 `pages/Archive`、`api/article/archive`、类型 `ArticleArchiveItemType`/`ArticleTagStatType`；补充 `/article/stat/category`、`/article/stat/column` 两个此前漏记的接口 |
| 2026-09-13 | 修复 `services/request.ts`：`createRequest` 4 个方法改用 `unwrapResponse<T>` 断言（axios 1.20 的 `AxiosResponseResult` 条件类型无法用裸类型参数解析，此前 `pnpm build` 因 4 个 TS2322 失败）；修掉 `getCookie` 正则里的 `no-useless-escape`（此前 `pnpm lint` 失败）；技术栈 axios 版本由 1.11 修正为 1.20 |
| 2026-09-13 | 首页改版：新增 `pages/Home/components/CategoryFilter.tsx`（顶部分类就地筛选，两级树，不跳转，切换重置页码 + `requestIdRef` 丢弃过期响应）；文章列表改两列网格；`ArticleCard` 增加 `variant` 属性（`list` 横向 / `grid` 竖向封面在上），元信息与标签抽成 `ArticleMeta`/`TagList`；`Sidebar` 移除分类模块；`uno.config.ts` 的 `app-wrapper` 叠加随主题色变化的柔和对角渐变、新增 `card-glass` 规则。**未改后端**（`/article/list` 早已支持 `category` 参数且父分类自动含子分类） |
| 2026-09-13 | 首页视觉修正：`app-wrapper` 渐变改用 `background-attachment: fixed`（此前 `background-size: 100% 100vh` 会把渐变画在元素首屏位置，滚动时背景跟着滚走），混色比例由 16/6/0 提高到 26/12/4 以拉开背景与卡片的对比；`card-glass` 不透明度 80% → 92%；首页网格卡片与分类筛选栏补静态 `shadow`；`Sidebar` 的 `TagCloud` 占位改为真实的 `TagStat`（调 `POST /article/stat/tag`，chip 带数量、点击跳 `/archive?tag=<id>`，限高内滚）；`pages/Archive` 的标签筛选改由 URL `?tag=` 承载（`useSearchParams`），使首页侧边栏可直接带标签跳入 |
| 2026-09-14 | **新增评论功能与留言板**。后端：新建 `modules/comment`（`Comment` 单表，靠 `targetType`/`targetId` 区分评论对象、`rootId` 表达两级结构）与 `modules/client/comment_views.py`，新增 3 个接口 `POST /comment/list`（顶层分页 + 内嵌全部回复，固定 4 条 SQL）、`POST /comment/add`、`POST /comment/delete`（顶层删除连带软删回复）；`BloggerProfile` 提供留言板的内容作者。前端：新增通用组件 `src/components/CommentSection`（文章详情页与留言板共用）、`src/pages/Message`、路由 `/message` 与导航项「留言」、`api/comment`、`types/api/comment.d.ts`；`canDelete` 由后端逐条下发，前端不判断身份。**未做前台注册入口**（用户明确本次跳过，用户由后台添加） |
| 2026-09-14 | 评论功能页面实测问题修复：① 回复补头像（`ReplyItem` 改 flex 行，回复 28px / 顶层 40px 形成层级）；② **修后端真 bug**——「不能回复自己的评论」原本拿**顶层评论作者**与当前用户比对，导致自己的评论一旦被人回复就整个楼层锁死，改为比对**被回复者** `replyUser`；③ 发表按钮遮挡字数计数——去掉 antd `showCount`（绝对定位在右下角必然重叠），改为组件自行在按钮左侧渲染；④ 富文本评论（表情/图片）按用户要求仅记录未实现，已列入「占位与待完成项」第 13 项 |
| 2026-09-14 | 顶部导航栏背景与页面渐变对齐：`uno.config.ts` 抽出 `pageBackground` 常量供 `app-wrapper` 与新增的 `top-bar-bg` shortcut 共用，使导航栏画出的正是视口顶部那一段渐变，与页面像素级衔接，故不再需要分隔线 |
| 2026-09-15 | **评论改 markdown 富文本**（完成「占位与待完成项」原第 13 项）。前端新增 `components/MarkdownEditor`（工具栏：加粗/链接/上传图片/表情 + 编辑预览切换，基于 antd `Input.TextArea` 自研，未引入第三方编辑器库）、`components/MarkdownContent`（渲染，`remark-gfm` + `remark-breaks`，**不启用 `rehype-raw`**，故后端无需 XSS 过滤层）、`api/upload`、`utils/upload.ts`（图片校验 + 上传）、`style/comment.css`（复用 `.article-content` 并收紧字号间距，图片改块级独占一行）；`CommentSection` 的输入框与两处正文渲染接入上述组件，`maxLength` 500 → 2000；新增依赖 `remark-breaks`。后端（`my-blog-service`）：`modules/comment/models.py` 的 `Comment.content` 由 `CharField(500)` 改为 `TextField`，`service/comment.py` 的 `MAX_CONTENT_LENGTH` 改为 2000；因 `modules/comment` 无 `migrations/` 目录，**未生成迁移文件**，改为手工执行 `ALTER TABLE blog_comment MODIFY COLUMN comment_content LONGTEXT NOT NULL;`（已执行，重启后端服务后生效）。前台评论配图复用管理端已有的 `POST /sys/file/upload`（需要登录，未新增 `/client/file/upload`） |

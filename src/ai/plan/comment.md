# 博客评论功能方案

> 状态：**已实施（评论核心 + 富文本评论）**
> 涉及三端：`my-blog-client`（前台）、`my-blog-service`（后端）、`my-blog-admin`（后台，本方案不涉及）

## 实施说明（2026-09-15）：富文本评论已落地

§8「遗留项」中的**富文本评论**已实施完毕，实施记录见 `src/ai/memory/2026-09-15-富文本评论与上传鉴权.md`。与上述方案规划时的差异：

| 项 | 规划时设想 | 实际实施 |
| --- | --- | --- |
| 编辑器 | 「前端引入编辑器（表情选择器 + 图片上传）」 | **未引入第三方库**，基于 antd `Input.TextArea` 自研 `components/MarkdownEditor`（加粗/链接/图片/表情 + 编辑预览切换） |
| 存储格式 | 「是否允许 Markdown」待定；或「存结构化 JSON」 | 存 **markdown 源码**，新增 `components/MarkdownContent` 渲染 |
| XSS | 「后端必须做 XSS 过滤」 | **后端零改动**。渲染侧不启用 `rehype-raw`（原始 HTML 转义输出）+ react-markdown 默认 `urlTransform` 拦危险协议，实测验证通过 |
| 图片上传 | 「接入 `resource` 模块 + 考虑引用计数」 | 直接复用管理端已有的 `POST /sys/file/upload`（**需要登录**，未新增 `/client/file/upload`）；**不做引用计数** |
| 长度口径 | 「从字符数改为渲染后长度，或放宽上限」 | 放宽上限：`content` → `TextField`，`MAX_CONTENT_LENGTH` 500 → **2000**（仍按 markdown 源码字符数计） |
| 字段迁移 | 「迁移时要兼容历史数据」 | `modules/comment` **无 `migrations/` 目录**，未生成迁移文件，改为手工执行 `ALTER TABLE blog_comment MODIFY COLUMN comment_content LONGTEXT NOT NULL;`（**用户已执行**）。历史纯文本数据原样保留 |

**统一修正正文中的过时数字**：本方案下文凡出现 `CharField(500)`、`maxLength=500`、`长度 ≤ 500` 的地方，实际已为 `TextField` + 2000。下文其余章节保留 2026-09-14 的原始规划原文，不再逐处改写。

## 实施说明（2026-09-14）

按用户要求调整了范围，**实际交付与下列方案的差异**：

| 项             | 方案原定              | 实际实施                                                       |
| -------------- | --------------------- | -------------------------------------------------------------- |
| 前台注册       | 新增 `/register` 页 + `/client/user/register` | **未做**（由后台管理系统添加用户，首期不做注册） |
| 评论核心       | 文章评论 + 留言板     | **已做**，与方案一致                                            |
| `docs/PROJECT.md` | 同步更新           | **已更新**（2026-09-15 随富文本评论一并补齐，原计划「等后续功能调整后一并更新」） |

方案中其余内容（数据模型、接口契约、`canDelete` 由后端下发、两级 + @提及、排序规则）均已按原文实现。

以下章节保留原始规划，供后续迭代（注册、消息提醒、后台评论管理）参考。

---

## 0. 前置事实核查（重要）

规划前对三个仓库做了全量核查，有两个前提需要纠正：

| 核查项                        | 实际结论                                                                 |
| ----------------------------- | ------------------------------------------------------------------------ |
| 前台是否已有评论代码          | **完全没有**。grep `comment/reply/留言/评论` 只命中 antd 的 `message` 组件 |
| 后端是否已有评论模型/接口     | **完全没有**。只有 `UserActivitySummary.comments` 计数字段和注释里的字样 |
| 后台是否已有评论管理          | **完全没有**                                                             |
| 后台是否已有「消息提醒」      | **没有**。`MessageBtn` 是纯占位组件（`<script setup>` 为空，无逻辑无接口）|

即：**该功能需要前台、后端从零新建**（后台不在首期范围）。

---

## 1. 需求理解

### 目标

为博客提供评论能力，且架构上要能承载后续更多评论类型（随笔等）与后续迭代（消息提醒）。

### 验收标准

1. 文章详情页底部有评论区，可发表评论、回复他人评论
2. 有独立的留言板页面 `/message`，复用同一套评论能力
3. 访客可通过前台注册页获得账号
4. 未登录状态下可浏览评论，但评论/回复需登录
5. 评论提交后立即展示（先发后审）
6. 评论作者、以及内容作者（博主）可以删除评论
7. 「评论」在数据模型与接口层面是**通用能力**，新增一种评论类型只需加一个 `targetType` 枚举值

### 已确认的决策

| 决策点       | 结论                                              |
| ------------ | ------------------------------------------------- |
| 身份体系     | 登录后才能评论；**同时补一个前台注册页**（后端无注册接口） |
| 评论层级     | 两级（顶层评论 + 扁平回复），回复可 @ 具体某人     |
| 审核策略     | 先发后审——提交后立即可见，保留 `status` 字段供后续后台隐藏 |
| 首期范围     | 只做评论本身；消息提醒、@ 通知、邮件通知、点赞、表情均不做 |
| 留言板入口   | 独立页面 `/message` + 顶部导航项                  |
| 删除权限     | 评论作者本人 + 内容作者（博主）都可删             |
| 排序         | 顶层按时间倒序（最新在前）；每条下的回复按时间正序 |
| 删除按钮判定 | **后端为每条评论算好 `canDelete` 返回**，前端直接使用（文章页与留言板行为一致） |
| @提及范围    | 只做「回复谁」——记录 `replyUser` 并展示「A 回复 B」；**不做**输入框内真 @ 选人 |
| 后端接口     | **已确认**，按 §4.2 实施（新建 `modules/comment` app + `/client/*` 接口） |

---

## 2. 现有实现（作为设计依据）

### 前台技术约定

- 接口层：`src/api/<模块>/index.ts`，具名导出箭头函数，`import request from "@/services/request"`，`request.post<T>("/path", params)`
- `request` 的 baseURL 是 `/api/client`，Vite 代理把 `/api` 前缀 rewrite 掉 → **后端实际收到 `/client/xxx`**
- `request.ts` 已自动注入 `Authorization`（JWT）与 `X-CSRFToken`
- 响应拦截器已把 `{ code, msg, data }` 解包成 `data`，调用方不需要 `.data.data`
- 类型放 `src/types/api/*.d.ts`，**全局 ambient 声明（不 export），免 import 直接用**
- 通用类型已有：`PageType`、`ResultPageType<T>`、`IdType`
- 样式以 UnoCSS 原子类为主，antd 只用于需要交互能力的组件（Form/Input/Button/Avatar/Pagination/Skeleton/message）
- 组件惯用写法：一个文件内含多个内部子组件（参考 `Sidebar.tsx`），`export default function Xxx()`
- 跨页面共享组件放 `src/components/`（先例：`TagBadge.tsx`）
- TS 严格：`verbatimModuleSyntax` → **类型导入必须用 `import type`**

### 后端技术约定（Django 5.0.6 + DRF 3.15.2）

- 路由：`BlogServer/urls.py` 把各模块挂在裸路径下；**前台接口统一在 `/client/` 前缀**（`modules/client/urls.py`），中间件对 `/client/` 直接放行不校验 JWT
- 鉴权：`utils/auth.py` 的 `get_user_id(request)` 按需解析 `Authorization` 头，未登录返回 `None`（前台接口靠它区分游客）
- 视图：**普通函数视图** + `@require_POST`，不用 DRF 的 ViewSet
- 入参：`post_handle(request)`；分页：`limit_queryset(params, sql)` → `{result, total}`
- 返回：`utils/response.py` 的 `res_handle(code, msg, data)` / `res_search(data)`，结构 `{code, msg, data}`，成功 `code=0`
- 模型：UUID 主键；**关联一律用裸 UUID 字段，不用 ForeignKey**；字段 camelCase + `db_column` snake_case；软删除用 `isDelete`
- 密码：前端发 MD5，后端 `check_password(md5, stored)`，存储值为 `make_password(md5)`
- 验证码：`cache.get(key) == code`（Redis）

---

## 3. 影响范围

### 必须修改

**后端 `my-blog-service`**

| 文件                                        | 改动                                                     |
| ------------------------------------------- | -------------------------------------------------------- |
| `modules/comment/`（新建 app）              | models / serializers / service / apps / migrations       |
| `modules/client/comment_views.py`（新建）   | 4 个前台接口的视图                                        |
| `modules/client/urls.py`                    | 挂 4 条 path + 一行 `from .comment_views import *`        |
| `modules/client/register_views.py`（新建）  | 前台注册接口                                             |
| `BlogServer/settings.py`                    | `INSTALLED_APPS` 加 `modules.comment`                     |
| `modules/comment/migrations/0001_initial.py`| 新建 Comment 表（单模型单迁移，最小功能块）               |

**前台 `my-blog-client`**

| 文件                                          | 改动                                        |
| --------------------------------------------- | ------------------------------------------- |
| `src/types/api/comment.d.ts`（新建）          | 评论全局类型                                 |
| `src/api/comment/index.ts`（新建）            | 3 个评论接口函数                             |
| `src/api/user/index.ts`                       | 加 `registerApi`                             |
| `src/components/CommentSection/index.tsx`（新建） | 评论区组件（列表 + 表单 + 单条 + 回复）  |
| `src/pages/Article/index.tsx`                 | `<ArticleDetail/>` 下方插入评论区            |
| `src/pages/Message/index.tsx`（新建）         | 留言板页面                                   |
| `src/pages/Register/index.tsx`（新建）        | 注册页                                       |
| `src/routes/index.tsx`                        | 加 `/message`、`/register` 路由              |
| `src/layout/TopBar/index.tsx`                 | `navList` 插入「留言」；未登录时加「注册」入口 |
| `docs/PROJECT.md`                             | 同步路由表 / 功能清单 / 目录结构 / 接口清单 / 变更记录 |

### 无需修改

- `src/services/request.ts`：JWT 与 CSRF 头已自动注入，无需改动
- `src/store/useAuth.ts`：`isLogin` / `userInfo` 已够用
- `src/pages/Login/index.tsx`：仅在「支持登录后回跳」时小改（见 §7 步骤 9）
- `my-blog-admin`：完全不动

---

## 4. 技术方案

### 4.1 数据模型（核心设计）

单一 `Comment` 表承载所有评论类型，靠 `targetType + targetId` 区分目标，靠 `rootId` 表达两级结构。

```python
class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, db_column='comment_id')
    # 评论目标：'article' 文章评论 / 'message' 留言板；未来加 'essay' 随笔等
    targetType = models.CharField(max_length=32, db_column='target_type')
    # 目标 id；留言板无具体目标，为 None
    targetId = models.UUIDField(null=True, blank=True, db_column='target_id')
    # 顶层评论为 None；回复时指向所属顶层评论，实现「两级」
    rootId = models.UUIDField(null=True, blank=True, db_column='root_id')
    content = models.CharField(max_length=500, db_column='comment_content')
    user = models.UUIDField(db_column='user_id')
    # 被 @ 的用户（即被回复者），用于展示「A 回复 B」
    replyUser = models.UUIDField(null=True, blank=True, db_column='reply_user_id')
    # 先发后审：默认 visible，后续后台可改 hidden
    status = models.CharField(max_length=32, default='visible', db_column='status')
    ip = models.GenericIPAddressField(null=True, blank=True)
    createTime = models.DateTimeField(auto_now_add=True, db_column='create_time')
    isDelete = models.BooleanField(default=False, db_column='is_delete')

    class Meta:
        db_table = 'blog_comment'
        ordering = ['createTime']
        indexes = [models.Index(fields=['targetType', 'targetId', 'rootId'])]
```

**设计说明**

- **不用 `parentId`**：两级结构下回复是扁平的，全部挂在 `rootId` 下，`replyUser` 已能表达「回复谁」。省一列，且渲染只需一层循环。
- **@提及的实现**：点「回复」时记录 `replyUser`，展示时渲染「A 回复 B」。**不做任意用户搜索式 @**——那需要用户检索接口 + 富文本 @ 选择器，首期不做。因此正文里出现 `@昵称` 只是普通文本，后端不解析、不产生额外关联。
- **`status` 字段现在就建**：虽然首期不做后台，但加上它零成本，避免后续为「隐藏评论」再开一次迁移。

### 4.2 后端接口（首期，全部 POST）

**A. 评论（新建，挂在 `/client/comment/*`）**

| 方法 | 路径                   | 入参                                                                 | 返回                                       |
| ---- | ---------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| POST | `/client/comment/list` | `{ targetType, targetId?, pageNumber, pageSize }`                    | `{ total, totalCount, result }`            |
| POST | `/client/comment/add`  | `{ targetType, targetId?, content, rootId?, replyUser? }`            | 新评论对象（含 `user`/`canDelete`，供前端直接插入） |
| POST | `/client/comment/delete` | `{ id }`                                                           | `true`                                     |

`/client/comment/list` 返回结构：

```jsonc
{
  "total": 12,       // 顶层评论总数（分页依据）
  "totalCount": 30,  // 含回复的总条数（页面展示「共 30 条评论」）
  "result": [
    {
      "id": "...", "content": "...", "createTime": "...",
      "canDelete": true,
      "user": { "id": "...", "nickName": "...", "avatar": "..." },
      "replies": [
        {
          "id": "...", "content": "...", "createTime": "...",
          "canDelete": false,
          "user": { "id": "...", "nickName": "...", "avatar": "..." },
          "replyUser": { "id": "...", "nickName": "...", "avatar": "..." }
        }
      ]
    }
  ]
}
```

**`canDelete` 的语义**：由后端按当前登录用户逐条算出（未登录时恒为 `false`）。规则见下方 `delete` 的权限判定，`list` 与 `delete` 必须共用同一个判定函数，避免两处规则漂移。

**性能要求（重要）**：`list` 必须只用固定次数的查询，禁止 N+1。

1. 查顶层评论分页 → 拿 `ids`
2. 一次查出这些 root 下的全部回复
3. 一次查出涉及的所有用户（顶层 + 回复 + replyUser 三处 id 去重合并）
4. 在 Python 里组装

**`add` 的校验与规则**

- `get_user_id(request)` 为 `None` → `res_handle(401, '请先登录', None)`
- `content` 去空后不能为空，长度 ≤ 500
- `targetType` 必须是白名单值，且 `article` 时 `targetId` 必填并校验文章存在
- 传了 `rootId` 时：校验该 root 存在、属于同一 `targetType/targetId`、且自身是顶层评论（`rootId is None`）；同时不允许自己回复自己
- 写入 `ip = request.META.get('REMOTE_ADDR')`

**`delete` 的权限判定**（抽成 `service/comment.py` 的 `can_delete_comment(comment, user_id, target_author_id)`，**`list` 与 `delete` 共用**）

```
允许删除的条件（满足其一）：
1. 评论作者本人：comment.user == 当前 user_id
2. 内容作者（博主）：当前 user_id == target_author_id
```
其中 `target_author_id` 按目标类型取：
- `targetType = 'article'` → `Article.objects.get(id=targetId).author`
- `targetType = 'message'` → 博主 userId（沿用 `get_client_blogger_profile` 的写法：`BloggerProfile.objects.order_by('createdAt').first().userId`）

> 该值在 `list` 里只需查一次（不是每条评论查一次），再对页内每条评论套用判定。

删除顶层评论时，其下所有回复一并软删（`rootId = 该 id` 的全置 `isDelete=True`）。

**B. 前台注册（新建，挂 `/client/user/register`）**

| 方法 | 路径                    | 入参                                                     | 返回                          |
| ---- | ----------------------- | -------------------------------------------------------- | ----------------------------- |
| POST | `/client/user/register` | `{ username, nickName, email, password, key, code }`     | 与登录一致（自动登录）        |

- `password` 是前端 MD5 后的值（与登录页一致）
- 校验验证码 `cache.get(key) == code`
- 用户名 8–20 位、昵称 ≤32、邮箱格式合法（复用/参照 `validate_add_user_params`）
- 用户名、邮箱查重（`Users.username` / `UserProfile.email`）
- 存储 `make_password(收到的MD5)`，与 `user_login_admin_system` 的校验方式对齐
- 创建 `Users` + `UserProfile(id=user.id, email=...)`，**不分配任何角色**（前台用户不需要权限，且 `/client/` 接口不走权限校验）
- 返回结构与登录接口一致：`{ userInfo, token, refreshToken, csrfToken }`，前端直接写入 `useAuth` 完成自动登录

> 为什么不复用 `/user/login` 而是新建：`/user/login` 属于管理端路径（非 `/client/`，不在 `WHITE_PATH_LIST` 里靠白名单放行）。前台注册走 `/client/` 前缀既符合现有分层，也不会给管理端引入匿名可达的写接口。

### 4.3 前台类型定义

新建 `src/types/api/comment.d.ts`：

```ts
/** 评论目标类型：article 文章评论；message 留言板 */
type CommentTargetType = "article" | "message";

interface CommentUserType {
  id: string;
  nickName: string;
  avatar: string | null;
}

interface CommentReplyItemType {
  id: string;
  content: string;
  createTime: string;
  /** 后端算好的删除权限，前端直接用于控制删除按钮显隐 */
  canDelete: boolean;
  /** 所属顶层评论 id（回复他人回复时需要它） */
  rootId: string;
  user: CommentUserType;
  /** 被回复者，用于渲染「A 回复 B」 */
  replyUser: CommentUserType | null;
}

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
  total: number;
  totalCount: number;
  result: CommentItemType[];
}

interface CommentAddParams {
  targetType: CommentTargetType;
  targetId?: string;
  content: string;
  rootId?: string;
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
```

> 前端拿到 `CommentAddResType` 后：`rootId` 有值 → 就地把新回复追加到对应顶层评论下；`rootId` 为 `null` → 顶层评论，回到第 1 页重拉（最新在最前）。

### 4.4 前台接口层

新建 `src/api/comment/index.ts`：

```ts
import request from "@/services/request";

export const getCommentListApi = (
  data: PageType & { targetType: CommentTargetType; targetId?: string },
) => request.post<CommentListResType>("/comment/list", data);

export const addCommentApi = (data: CommentAddParams) =>
  request.post<CommentAddResType>("/comment/add", data);

export const deleteCommentApi = (data: { id: string }) =>
  request.post<boolean>("/comment/delete", data);
```

`src/api/user/index.ts` 追加：

```ts
export const registerApi = (data: {
  username: string;
  nickName: string;
  email: string;
  password: string;
  key: string;
  code: string;
}) => request.post<LoginRes>("/user/register", data);
```

> 注册走前台实例 `request`（baseURL `/api/client`）→ 后端收到 `/client/user/register`。

### 4.5 前台组件设计

新建 `src/components/CommentSection/index.tsx`，对外只暴露一个组件：

```tsx
<CommentSection targetType="article" targetId={id} />
<CommentSection targetType="message" />
```

文件内部拆成 4 个子组件（沿用 `Sidebar.tsx` 的「一个文件多个内部组件」写法）：

| 内部组件       | 职责                                                                 |
| -------------- | -------------------------------------------------------------------- |
| `CommentSection` | 容器。持有列表/分页/loading；拉数据；乐观插入新评论；删除后局部更新  |
| `CommentForm`    | 输入框。受控 `value`；登录态判断；`@某人` 提示条 + 取消回复；字数计数 |
| `CommentItem`    | 单条顶层评论。头像/昵称/时间/内容/操作栏；内嵌其 `replies`           |
| `ReplyItem`      | 单条回复。多渲染一行「A 回复 B」                                     |

**关键交互**

- **未登录**：`CommentForm` 位置替换为一行提示 +「去登录」按钮（跳 `/login`），已发布评论照常展示
- **回复**：点某条评论/回复的「回复」→ 表单滚动到可见位置、聚焦，显示「正在回复 @昵称」并可取消；提交时带 `rootId` 与 `replyUser`
- **提交**：成功后清空表单与回复态。顶层评论 → 重置到第 1 页并刷新（新评论在最前）；回复 → 就地把返回值追加到对应 root 的 `replies` 末尾，并同步 `totalCount`
- **删除**：antd `Modal.confirm` 二次确认（沿用顶栏退出登录的写法）→ 成功后就地移除
  - 顶层评论整块移除并 `total-1`
  - 回复移除并 `totalCount-1`
- **删除按钮可见性**：直接用后端返回的 `canDelete`，前端不做任何身份判断。因此 `CommentSection` 的 props **只需 `targetType` 与 `targetId`**，文章页与留言板页完全一致
- **分页**：antd `Pagination`，每页 10 条顶层评论，只在 `total > pageSize` 时渲染
- **空态 / 加载态**：`Skeleton` / 「还没有评论，来说点什么吧」

### 4.6 页面接入

**文章详情页**（`src/pages/Article/index.tsx`）：在 `<ArticleDetail content={...} />` 之后追加

```tsx
<CommentSection targetType="article" targetId={article.baseInfo.id} />
```

> `ArticleDetail` 返回的是 Fragment（含正文 + 右侧目录 + BackTop），评论区放在它之后即为页面全宽，与正文左列不强制对齐。这与首页/归档页的「卡片块」观感一致，无需改动 `ArticleDetail`。

**留言板页**（`src/pages/Message/index.tsx`）：沿用 `About` 页的骨架（外层 `py-8 px-4` + 标题），下半部分挂 `<CommentSection targetType="message" />`。

**路由**（`src/routes/index.tsx`）：`React.lazy` 加 `Message`、`Register`；`MainLayout` children 加 `{ path: "message" }`；`/register` 与 `/login` 一样用 `PublicRoute` 包裹。

**导航**（`src/layout/TopBar/index.tsx`）：`navList` 插入 `{ name: "留言", path: "/message" }`（顺序：首页 / 归档 / 留言 / 关于）；未登录时在「登录」旁加「注册」入口。

---

## 5. 风险与边界

| # | 风险                                                                                             | 应对                                                                 |
| - | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| 1 | **回复数无上限**：某条顶层评论下若有几百条回复，一次性内嵌返回会让响应变大                          | 首期接受（个人博客量级）。若后期出现长回复串，再改为「回复分页/展开加载」的独立接口 |
| 2 | **`limit_queryset` 的分页参数**：需确认它读的是 `pageNumber/pageSize` 还是别的键名                  | 实施第一步先读该函数确认                                             |
| 3 | **注册接口是匿名可达的写接口**：可能被脚本刷号                                                   | 复用图形验证码；可再加 IP 频控（Redis 计数）。首期先靠验证码         |
| 4 | **先发后审但首期无后台**：垃圾评论只能靠「博主在前台删」处理                                       | 已确认「本人 + 博主都可删」，博主登录前台即可处置                     |
| 5 | **`canDelete` 需与 `delete` 的实际校验保持一致**：两处规则各写一份会漂移 | 抽成一个共用函数，`list` 与 `delete` 都调它（见 §4.2） |
| 6 | **博主账号与普通账号共用登录接口**：`/user/login` 是管理端登录，前台也在用                          | 不改动，保持现状；注册不加角色，不影响权限体系                        |
| 7 | **`status` 字段首期无写入方**：只建不用                                                        | 属预期，为「先发后审」的后续后台预留；前端列表只展示 `status='visible'` 且未软删的评论 |
| 8 | **登录后回跳丢失**：`PublicRoute` 登录成功后固定跳 `/`，从文章页去登录再回来会丢位置              | 见 §7 步骤 9（小改动，建议一起做）                                   |

---

## 6. 实施计划

> 顺序：后端先行（前台依赖真实接口），再类型/接口层，再组件，最后页面接入与文档。

**后端（`my-blog-service`）**

1. 读 `utils/tools.py` 的 `limit_queryset` / `post_handle`，确认分页键名与入参读取方式
2. 新建 `modules/comment/`：`__init__.py`、`apps.py`、`models.py`(Comment)、`serializers/comment.py`、`service/comment.py`
3. `BlogServer/settings.py` 的 `INSTALLED_APPS` 注册 `modules.comment`
4. `makemigrations comment` 生成 `0001_initial.py`（单模型单迁移）
5. 新建 `modules/client/comment_views.py`：`get_client_comment_list` / `add_client_comment` / `delete_client_comment`
6. 新建 `modules/client/register_views.py`：`client_user_register`
7. `modules/client/urls.py` 挂 4 条 path（`comment/list`、`comment/add`、`comment/delete`、`user/register`）

**前台（`my-blog-client`）**

8. 新建 `src/types/api/comment.d.ts`
9. 新建 `src/api/comment/index.ts`；`src/api/user/index.ts` 加 `registerApi`
10. 新建 `src/components/CommentSection/index.tsx`（容器 + Form + Item + Reply 四个内部组件）
11. 改 `src/pages/Article/index.tsx`：追加 `<CommentSection targetType="article" targetId={...}/>`
12. 新建 `src/pages/Message/index.tsx`（留言板）
13. 新建 `src/pages/Register/index.tsx`（参照 `Login` 页：用户名/昵称/邮箱/密码/图形验证码，密码 MD5，成功后 `login()` 写入 `useAuth` 并跳首页）
14. 改 `src/routes/index.tsx` 加 `/message`、`/register`；改 `src/layout/TopBar/index.tsx` 加导航项与注册入口
15. （建议）登录后回跳：`Login` 读 `useSearchParams` 的 `redirect`，成功后 `navigate(redirect || "/")`；评论区的「去登录」按钮带 `?redirect=<当前路径>`
16. 更新 `docs/PROJECT.md`：路由表、功能清单、目录结构、后端接口清单、待完成项（移除第 11 条中的「评论」）、变更记录

---

## 7. 验证方案

**功能验证**

1. 未登录访问文章详情 → 评论区展示已有评论，表单位置显示「登录后可评论」
2. 注册新账号 → 自动登录并跳回文章页 → 表单可用
3. 发顶层评论 → 立即出现在列表最前，`total` +1
4. 回复某条评论 → 该 root 下追加一条，展示「我 回复 某人」，`totalCount` +1
5. 回复自己 → 被拦截并提示
6. 删除自己的评论 → 二次确认后消失；删除顶层评论 → 其下回复一并消失
7. 用博主账号删除他人评论 → 成功，且「删除」按钮对博主可见（文章页与留言板都验证）
8. 留言板 `/message`：发评论、回复、删除均正常，与文章评论互不串数据
9. 空内容 / 超 500 字 → 前端与后端都拦截
10. 分页：超过 10 条顶层评论时出现分页，翻页正常

**工程验证**

11. `pnpm build` 通过（`tsc -b` 严格类型检查，注意 `import type`）
12. `pnpm lint` 通过
13. 后端 `python manage.py makemigrations --check --dry-run` 无遗漏迁移
14. 接口调用次数检查：评论列表只发 1 次 HTTP 请求；后端日志确认 SQL 为固定次数（无 N+1）
15. 明暗模式 / 三种主题色下评论区样式正常（用 `card` / `card-glass` / `text-muted` 等既有工具类）

---

## 8. 已确认结论 & 遗留项

### 已确认

| # | 问题                  | 结论                                                                 |
| - | --------------------- | -------------------------------------------------------------------- |
| 1 | 后端接口              | 按 §4.2 实施                                                          |
| 2 | @提及范围             | 只做「回复谁」（`replyUser` + 展示「A 回复 B」），不做输入框内真 @ 选人 |
| 3 | 删除按钮权限判定      | 后端为每条评论返回 `canDelete`，前端不做身份判断                       |
| 4 | 评论层级              | 两级 + 扁平回复                                                       |
| 5 | 审核策略              | 先发后审（立即展示），保留 `status` 字段                              |
| 6 | 留言板入口            | 独立页面 `/message` + 顶部导航项                                      |
| 7 | 注册缺口              | 补一个前台注册页 `/register` + `/client/user/register`                |
| 8 | 首期范围              | 只做评论本身；消息提醒等一律不做                                      |

### 遗留项（明确不在首期范围，记录备查）

- ~~**富文本评论（表情 / 图片 / 加粗等）**~~ —— 用户 2026-09-14 试用后提出，明确「后面再改」。
  **✅ 已于 2026-09-15 实施完毕**，见本文档开头的「实施说明（2026-09-15）」。规划时预判的 5 个待办，逐条结论如下：
  1. 前端引入编辑器 → **自研 `MarkdownEditor`**，未引入第三方库；决定**允许 Markdown**
  2. `content` 改 `TextField` + XSS 过滤 → 字段已改；**XSS 改为在渲染侧根治**（不启用 `rehype-raw`），后端未加过滤层
  3. 图片走 `resource` 模块 + 引用计数 → 改用已有的 `/sys/file/upload`；**明确不做引用计数**（评论删除后 COS 图片保留）
  4. 长度口径 → 未改口径，直接放宽上限到 2000（仍计 markdown 源码字符数）
  5. 兼容历史数据 → 历史纯文本按 markdown 解析，换行靠 `remark-breaks` 保住；以 `#`、`-`、`*` 开头的行会被当作语法，属已知代价
  - 另注：`validate_add_comment_params` 的调用链未变，仅 `MAX_CONTENT_LENGTH` 常量值调整（`modules/comment/service/comment.py`）

- **邮箱验证 / 邮件通知**：注册只做格式校验 + 图形验证码，不做邮件激活；评论不做邮件通知
- **消息提醒**：后台的 `MessageBtn` 仍为占位；评论回复的站内通知需后端新建 message 模块 + 后台页面，属下一迭代
- **后台评论管理**：`my-blog-admin` 完全不动。首期的治理手段只有「博主登录前台删评论」（`canDelete` 已覆盖）
- **评论数展示**：不做在文章卡片 / 侧边栏 / TOC，仅文章详情页评论区内部展示 `totalCount`
- **`status` 字段的写入方**：首期只建不用（恒为 `visible`），为后续后台「隐藏评论」预留
- **回复数上限**：某条顶层评论回复过多时仍是全量内嵌返回（见 §5 风险 1）

## 博客客户端登录功能开发 ✅ 2026-08-12

1. ✅ 登录界面请保持相对简洁的风格（已实现，antd + 动画背景）
2. ✅ 登录接口调用和交互参考 my-blog-admin（已添加 refreshToken + 自动刷新机制）
3. ✅ 用户相关信息的持久化存储（Zustand + persist middleware → localStorage）
4. ✅ 登录之后的接口调用等（已参考 my-blog-admin，request.ts 添加完整 refresh token 队列机制）
5. ✅ 退出的时候需要添加提示（TopBar 中 Modal.confirm 确认退出）

## 升级记录（2026-08-12）
- 参考 my-blog-admin 的登录方案，在 client 中新增了 refreshToken 自动刷新机制
- 改动文件：store/useAuth.ts、api/user/index.ts、services/request.ts、pages/Login/index.tsx
- 详见 memory/login-refresh-token-upgrade.md

# 测试报告

日期：2026-10-21

## 已验证

- API 单元测试：32/32 通过，覆盖认证、钱包并发与幂等、内容审核、支付、直播、外部适配器。
- API 集成测试：24/24 通过，覆盖四类账号、领域接口、管理接口和上传安全。
- Vue 组件测试：移动端 7/7、管理端 2/2 通过。
- Playwright Chrome 流程：5/5 场景功能断言通过，覆盖用户、主播、审核员、管理员和直播交易展示。
- `pnpm -r typecheck` 与 `pnpm -r build` 通过。
- Prisma Schema 校验、固定身份种子测试、Windows 部署清单及 PowerShell 语法检查通过。

浏览器流程使用真实构建页面与路由，网络响应采用确定性模拟；相同业务规则另由 Nest E2E 对真实控制器和内存测试存储验证。这种分层避免浏览器测试依赖外部数据库，同时保留 API 行为验证。

## 验证命令

```powershell
pnpm -r test
pnpm --filter api test:e2e
pnpm test:browser
pnpm lint
pnpm typecheck
pnpm build
powershell -ExecutionPolicy Bypass -File scripts/test-deployment.ps1
```

## 安全断言

- 密码使用 Argon2id；刷新令牌只存哈希且轮换后不可复用。
- 管理 API 不返回密码或令牌字段，支付/直播密钥只显示遮罩。
- 上传检查真实文件魔数、10 MiB 限额、UUID 路径、所有权和目录边界。
- 钱包调整、内容审核和账户变更可审计。

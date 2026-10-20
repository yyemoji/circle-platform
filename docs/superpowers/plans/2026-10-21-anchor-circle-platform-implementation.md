# 主播圈直播社交平台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一套包含移动端、主播能力、管理员后台、直播、交易、测试数据及 Windows/Linux 部署的单机可运行直播社交平台。

**Architecture:** pnpm monorepo，两个 Vue 3 前端和一个 NestJS 模块化单体 API，共享 TypeScript 契约。PostgreSQL 保存业务数据，Redis 保存会话与实时状态，MinIO/本地目录保存媒体，MediaMTX 提供本地直播链路；所有外部支付和腾讯云能力均通过可替换适配器接入。

**Tech Stack:** Node.js 22、pnpm 10、TypeScript 5、Vue 3、Vant、Element Plus、NestJS、Prisma、PostgreSQL 16、Redis 7、Socket.IO、MinIO、MediaMTX、Vitest、Supertest、Playwright、Docker Compose。

**Spec:** `docs/superpowers/specs/2026-10-21-anchor-circle-platform-design.md`

## Global Constraints

- 手机端优先但不得阻断桌面浏览器。
- Windows 与 Linux 使用同一业务源码、迁移和种子数据。
- 金额与金币使用整数最小单位；余额只能由账本汇总。
- 密码使用 Argon2id；数据库不得保存明文密码。
- 原站素材、生产数据、生产密钥不得进入仓库。
- 所有写接口必须进行鉴权、输入校验和审计；交易写接口必须支持幂等。
- 未配置外部服务时，本地沙箱仍须完成全部核心演示。
- 每个生产功能严格执行 RED → GREEN → REFACTOR。

## Review Focus

- 重复支付回调或重复点击不得重复扣款、发放权益或创建订单。
- 用户、主播、审核员和管理员越权访问必须返回 403，且前端不显示无权入口。
- 上传伪造扩展名、超限文件或非本人文件引用必须被拒绝。
- 直播断线、浏览器无摄像头和 MediaMTX 不可用时必须显示可恢复状态，并允许示例媒体回退。
- Windows 路径、CRLF、Docker Desktop 未启动等环境差异必须给出可操作错误信息。

---

## 阶段 A：可运行骨架与身份系统

### Task 1: Monorepo、配置与健康检查

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.env.example`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/health/health.controller.ts`
- Test: `apps/api/test/health.e2e-spec.ts`

**Interfaces:**
- Produces: `GET /api/health -> { status: "ok", database: string, redis: string, storage: string }`

- [ ] **Step 1: 写失败的健康检查 E2E 测试**，断言 API 进程可启动且响应结构固定。
- [ ] **Step 2: 运行 `pnpm --filter api test:e2e -- health.e2e-spec.ts`**，确认因应用未实现而失败。
- [ ] **Step 3: 创建最小 NestJS 应用、环境配置校验和健康检查。**
- [ ] **Step 4: 运行目标测试与 `pnpm -r typecheck`**，确认通过且无警告。
- [ ] **Step 5: 提交 `chore: scaffold platform workspace`。**

### Task 2: Prisma 数据库、迁移与种子账号

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/seed.ts`
- Create: `apps/api/src/database/database.module.ts`
- Create: `apps/api/src/database/prisma.service.ts`
- Test: `apps/api/test/seed.e2e-spec.ts`

**Interfaces:**
- Produces: `PrismaService`；种子账号 `姜姜668`、`anchor_demo`、`reviewer`、`admin`。

- [ ] **Step 1: 写失败测试**，验证四类账号、角色、初始钱包和示例内容存在，密码字段不是明文。
- [ ] **Step 2: 运行种子测试**，确认因 schema/seed 缺失而失败。
- [ ] **Step 3: 实现用户、角色、权限、刷新令牌、审计和基础配置模型及首个迁移。**
- [ ] **Step 4: 实现幂等种子脚本并运行迁移、种子和测试。**
- [ ] **Step 5: 提交 `feat: add database schema and seed identities`。**

### Task 3: 认证、刷新令牌与 RBAC

**Files:**
- Create: `apps/api/src/auth/*`
- Create: `apps/api/src/rbac/*`
- Create: `packages/contracts/src/auth.ts`
- Test: `apps/api/src/auth/auth.service.spec.ts`
- Test: `apps/api/test/auth.e2e-spec.ts`
- Test: `apps/api/test/rbac.e2e-spec.ts`

**Interfaces:**
- Produces: `POST /api/auth/login`、`POST /api/auth/refresh`、`POST /api/auth/logout`、`GET /api/auth/me`；`@RequirePermissions(...permissions)`。

- [ ] **Step 1: 写失败测试**，覆盖正确/错误密码、锁定、刷新令牌轮换、退出和四角色越权矩阵。
- [ ] **Step 2: 运行测试并确认预期失败。**
- [ ] **Step 3: 实现 Argon2id、JWT、刷新令牌撤销、速率限制和 RBAC Guard。**
- [ ] **Step 4: 运行认证、RBAC、全 API 测试。**
- [ ] **Step 5: 提交 `feat: add authentication and role permissions`。**

## 阶段 B：领域模型与业务 API

### Task 4: 用户、主播、设备、举报与审计

**Files:**
- Create: `apps/api/src/users/*`
- Create: `apps/api/src/anchors/*`
- Create: `apps/api/src/devices/*`
- Create: `apps/api/src/reports/*`
- Create: `apps/api/src/audit/*`
- Create: `packages/contracts/src/account.ts`
- Test: `apps/api/test/account-domain.e2e-spec.ts`

**Interfaces:**
- Produces: 个人资料、展示图、设备绑定、举报进度、账号合并申请、加入我们申请和审计查询 API。

- [ ] **Step 1: 写失败测试**，覆盖资料校验、设备归属、举报状态、越权和审计前后值。
- [ ] **Step 2: 确认测试因路由缺失而失败。**
- [ ] **Step 3: 实现模块、DTO、事务和审计拦截器。**
- [ ] **Step 4: 运行领域测试及全量 API 测试。**
- [ ] **Step 5: 提交 `feat: add account device report and audit domains`。**

### Task 5: 圈子、动态、素材、评论与审核状态机

**Files:**
- Create: `apps/api/src/circles/*`
- Create: `apps/api/src/content/*`
- Create: `apps/api/src/comments/*`
- Create: `apps/api/src/moderation/*`
- Create: `packages/contracts/src/content.ts`
- Test: `apps/api/src/moderation/content-state-machine.spec.ts`
- Test: `apps/api/test/content-domain.e2e-spec.ts`

**Interfaces:**
- Produces: 圈子 CRUD、邀请码、动态/圈子动态、素材、收藏、评论回复、审核与批量审核 API。

- [ ] **Step 1: 写失败测试**，固定草稿→待审核→通过/驳回→下架状态转换和权限边界。
- [ ] **Step 2: 运行测试确认状态机尚不存在。**
- [ ] **Step 3: 实现状态机、查询分页、标签、收藏、评论树和驳回原因。**
- [ ] **Step 4: 运行模块与全量 API 测试。**
- [ ] **Step 5: 提交 `feat: add circles content and moderation`。**

### Task 6: 钱包、会员、权益、商品、订单与沙箱支付

**Files:**
- Create: `apps/api/src/wallet/*`
- Create: `apps/api/src/membership/*`
- Create: `apps/api/src/catalog/*`
- Create: `apps/api/src/orders/*`
- Create: `apps/api/src/payments/*`
- Create: `packages/contracts/src/commerce.ts`
- Test: `apps/api/src/wallet/wallet.service.spec.ts`
- Test: `apps/api/src/payments/payment-state-machine.spec.ts`
- Test: `apps/api/test/commerce.e2e-spec.ts`

**Interfaces:**
- Produces: `WalletService.postEntry(input, idempotencyKey)`；套餐、权益、商品、地址、订单、支付和退款 API。

- [ ] **Step 1: 写失败测试**，覆盖余额不足、并发扣款、重复回调、权益重复发放、退款和整数金额。
- [ ] **Step 2: 运行测试确认失败原因来自缺失业务实现。**
- [ ] **Step 3: 实现追加式账本、事务锁、订单/支付状态机和沙箱渠道。**
- [ ] **Step 4: 运行并发、幂等、回滚和全 API 测试。**
- [ ] **Step 5: 提交 `feat: add wallet membership orders and sandbox payments`。**

### Task 7: 直播、第二视角、聊天、预约与对聊

**Files:**
- Create: `apps/api/src/live/*`
- Create: `apps/api/src/chat/*`
- Create: `apps/api/src/appointments/*`
- Create: `apps/api/src/media/*`
- Create: `packages/contracts/src/realtime.ts`
- Test: `apps/api/src/live/live-state-machine.spec.ts`
- Test: `apps/api/test/realtime.e2e-spec.ts`

**Interfaces:**
- Produces: `MediaProvider` 接口；直播创建/开始/重连/结束、第二视角、邀请码、历史统计、Socket.IO 消息与预约呼叫 API。

- [ ] **Step 1: 写失败测试**，覆盖直播状态机、断线、邀请码、无摄像头回退、预约状态和消息权限。
- [ ] **Step 2: 运行测试确认失败。**
- [ ] **Step 3: 实现 MediaMTX 与示例媒体适配器、Socket.IO 房间、预约和对聊配置。**
- [ ] **Step 4: 运行实时模块、API 集成和断线恢复测试。**
- [ ] **Step 5: 提交 `feat: add live second-view chat and appointments`。**

## 阶段 C：移动端与管理后台

### Task 8: 移动端基础、登录、首页与个人中心

**Files:**
- Create: `apps/mobile-web/src/main.ts`
- Create: `apps/mobile-web/src/router/*`
- Create: `apps/mobile-web/src/stores/*`
- Create: `apps/mobile-web/src/views/auth/*`
- Create: `apps/mobile-web/src/views/home/*`
- Create: `apps/mobile-web/src/views/profile/*`
- Test: `apps/mobile-web/src/**/*.spec.ts`

**Interfaces:**
- Consumes: Task 3、4、7 API。
- Produces: 响应式移动壳、登录、首页主播卡片、金币确认弹层、我的和主播中心。

- [ ] **Step 1: 写失败组件测试**，覆盖 390px/桌面断点、错误登录、菜单权限和付费确认不自动扣款。
- [ ] **Step 2: 运行 Vitest 确认失败。**
- [ ] **Step 3: 实现真实页面风格的移动端基础流程与 API 客户端。**
- [ ] **Step 4: 运行组件测试、类型检查和可访问性检查。**
- [ ] **Step 5: 提交 `feat: add mobile auth home and profile`。**

### Task 9: 移动端圈子、内容、交易、消息与直播页面

**Files:**
- Create: `apps/mobile-web/src/views/circles/*`
- Create: `apps/mobile-web/src/views/content/*`
- Create: `apps/mobile-web/src/views/commerce/*`
- Create: `apps/mobile-web/src/views/chat/*`
- Create: `apps/mobile-web/src/views/live/*`
- Create: `apps/mobile-web/src/views/settings/*`
- Test: `apps/mobile-web/src/views/**/*.spec.ts`

**Interfaces:**
- Consumes: Task 4-7 API。
- Produces: 规格中全部普通用户与主播页面。

- [ ] **Step 1: 按页面组写失败测试**，覆盖表单校验、审核状态、权益门槛、订单状态、直播回退和设置弹窗。
- [ ] **Step 2: 逐组运行并确认 RED。**
- [ ] **Step 3: 逐组实现圈子/内容、交易、消息/预约、直播和设置页面。**
- [ ] **Step 4: 运行移动端全量测试和类型检查。**
- [ ] **Step 5: 提交 `feat: complete mobile user and anchor flows`。**

### Task 10: 管理后台、运营闭环与报表

**Files:**
- Create: `apps/admin-web/src/main.ts`
- Create: `apps/admin-web/src/router/*`
- Create: `apps/admin-web/src/views/dashboard/*`
- Create: `apps/admin-web/src/views/users/*`
- Create: `apps/admin-web/src/views/moderation/*`
- Create: `apps/admin-web/src/views/commerce/*`
- Create: `apps/admin-web/src/views/operations/*`
- Create: `apps/admin-web/src/views/system/*`
- Create: `apps/api/src/analytics/*`
- Test: `apps/admin-web/src/**/*.spec.ts`
- Test: `apps/api/test/admin.e2e-spec.ts`

**Interfaces:**
- Produces: RBAC 菜单、仪表盘、用户主播、审核、直播、交易、支付配置、风控、配置、报表 CSV 和审计界面。

- [ ] **Step 1: 写失败测试**，覆盖菜单权限、秘密字段不回显、批量审核、金币调整审计和 CSV 导出。
- [ ] **Step 2: 运行前后端测试确认 RED。**
- [ ] **Step 3: 实现管理 API、聚合报表和 Element Plus 页面。**
- [ ] **Step 4: 运行管理端组件、API 集成和权限测试。**
- [ ] **Step 5: 提交 `feat: add complete administration console`。**

## 阶段 D：媒体、部署与全链路验收

### Task 11: 文件存储、上传安全与第三方适配器

**Files:**
- Create: `apps/api/src/storage/*`
- Create: `apps/api/src/integrations/tencent/*`
- Create: `apps/api/src/integrations/payment/*`
- Create: `THIRD_PARTY_NOTICES.md`
- Test: `apps/api/test/storage-security.e2e-spec.ts`
- Test: `apps/api/src/integrations/*.spec.ts`

**Interfaces:**
- Produces: `StorageProvider`、`TencentLiveProvider`、`PaymentProvider`；本地默认实现和关闭状态。

- [ ] **Step 1: 写失败测试**，覆盖 MIME 伪造、大小限制、路径穿越、越权引用、缺密钥和日志脱敏。
- [ ] **Step 2: 运行测试确认失败。**
- [ ] **Step 3: 实现本地/MinIO 存储和外部服务适配器。**
- [ ] **Step 4: 运行安全测试与全 API 测试。**
- [ ] **Step 5: 提交 `feat: secure media storage and integration adapters`。**

### Task 12: Linux/Windows 部署与可重复种子数据

**Files:**
- Create: `compose.yaml`
- Create: `infra/mediamtx/mediamtx.yml`
- Create: `infra/nginx/*`
- Create: `scripts/linux/*.sh`
- Create: `scripts/windows/*.ps1`
- Create: `scripts/windows/*.cmd`
- Create: `scripts/seed-demo-data.ts`
- Test: `scripts/test-deployment.ps1`
- Test: `scripts/test-deployment.sh`

**Interfaces:**
- Produces: Linux `docker compose up -d --build`；Windows 开发与 Docker 启动命令；健康检查和演示数据。

- [ ] **Step 1: 写失败部署检查**，验证端口、健康状态、迁移、种子账号和幂等重跑。
- [ ] **Step 2: 在当前 Windows 环境运行检查并确认 RED。**
- [ ] **Step 3: 实现镜像、Compose、脚本、健康检查和备份/恢复命令。**
- [ ] **Step 4: 验证 Windows 路径；验证 Compose 配置并记录 Linux 可移植性检查结果。**
- [ ] **Step 5: 提交 `ops: add cross-platform deployment and demo data`。**

### Task 13: Playwright 全流程、覆盖矩阵与最终文档

**Files:**
- Create: `tests/e2e/user-flow.spec.ts`
- Create: `tests/e2e/anchor-flow.spec.ts`
- Create: `tests/e2e/reviewer-flow.spec.ts`
- Create: `tests/e2e/admin-flow.spec.ts`
- Create: `tests/e2e/live-commerce-flow.spec.ts`
- Create: `docs/FEATURE_MATRIX.md`
- Create: `docs/TEST_REPORT.md`
- Create: `docs/KNOWN_LIMITATIONS.md`
- Create: `README.md`

**Interfaces:**
- Consumes: 全部前置任务。
- Produces: 可复现的四角色数据流程、完整报告和操作说明。

- [ ] **Step 1: 写失败 E2E**，覆盖登录、浏览、圈子/内容、钱包支付、预约聊天、主播开播、审核、管理配置和报表。
- [ ] **Step 2: 运行 E2E，记录每个真实失败而非跳过。**
- [ ] **Step 3: 只通过生产代码修复失败，补充原站采集与教程最终差异核对。**
- [ ] **Step 4: 运行 `pnpm test`、`pnpm test:e2e`、`pnpm lint`、`pnpm typecheck`、`pnpm build` 和部署冒烟测试。**
- [ ] **Step 5: 生成覆盖矩阵、测试报告、已知限制、账号和一键启动说明。**
- [ ] **Step 6: 提交 `test: verify complete platform workflows`。**

## 执行顺序与停止条件

按 Task 1 → 13 顺序执行。每个任务必须先看到对应测试因缺失功能失败，再写最小实现使其通过，并在提交前运行相关子项目全量测试。任何外部服务、浏览器权限或当前主机缺失造成的限制都必须保留可复现的本地回退路径并写入最终报告；不得用静态页面或跳过测试冒充完成。

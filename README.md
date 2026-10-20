# 主播圈独立研究平台

一套可本地部署、源码完整的移动直播社交平台研究实现，包括移动端、主播工作台、运营管理后台、NestJS API、PostgreSQL 数据模型、实时聊天、MediaMTX 直播、沙箱支付和 Windows/Linux 运维脚本。

## 演示账号

| 角色 | 账号 | 密码 |
|---|---|---|
| 用户/主播 | `姜姜668` | `abc321` |
| 主播 | `anchor_demo` | `Anchor123!` |
| 审核员 | `reviewer` | `Reviewer123!` |
| 管理员 | `admin` | `Admin123!` |

首次启动会幂等写入这些账号。生产部署必须立即更换演示密码和 `.env` 中的 JWT 密钥。

## 推荐：Docker 一键启动

Windows：

```powershell
Copy-Item .env.example .env
.\scripts\windows\start-docker.ps1
```

也可双击 `scripts\windows\start-docker.cmd`。Linux：

```sh
cp .env.example .env
sh scripts/linux/start.sh
```

入口：移动端 `http://localhost:8080/`，管理端 `http://localhost:8080/admin/`，API 健康检查 `http://localhost:8080/api/health`，HLS 服务端口 `8888`，RTMP 推流端口 `1935`。

## Windows 源码开发

需要 Node.js 22、pnpm 10 和 PostgreSQL 16。复制 `.env.example` 后执行：

```powershell
pnpm install
$env:DATABASE_URL='postgresql://anchor:anchor@localhost:5432/anchor_circle'
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api db:seed
pnpm --filter api start:dev
pnpm --filter mobile-web dev
pnpm --filter admin-web dev
```

开发端口：API `3000`、移动端 `5173`、管理端 `5174/admin/`。

## 目录

- `apps/api`：NestJS、Prisma、Socket.IO、领域状态机与适配器。
- `apps/mobile-web`：Vue 3 + Vant，390px 移动优先并支持桌面预览。
- `apps/admin-web`：Vue 3 + Element Plus 运营后台。
- `infra`：Nginx 与 MediaMTX 配置。
- `scripts/windows`、`scripts/linux`：启动、备份和恢复。
- `docs`：功能矩阵、测试报告和限制说明。

## 备份与恢复

```powershell
.\scripts\windows\backup.ps1 -Output backup.sql
.\scripts\windows\restore.ps1 -InputFile backup.sql
```

Linux 使用 `sh scripts/linux/backup.sh` 和 `sh scripts/linux/restore.sh backup.sql`。

## 测试

```powershell
pnpm test
pnpm test:e2e
pnpm test:browser
pnpm lint
pnpm build
```

完整覆盖见 [功能矩阵](docs/FEATURE_MATRIX.md)、[测试报告](docs/TEST_REPORT.md) 和 [已知限制](docs/KNOWN_LIMITATIONS.md)。

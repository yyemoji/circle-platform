# 主播圈独立研究平台

这是一个源码完整、可独立部署的移动直播社交平台研究实现。项目包括移动用户端、主播工作台、运营管理后台、NestJS API、PostgreSQL 数据库、Socket.IO 实时聊天、MediaMTX 直播、沙箱支付、安全文件上传，以及 Windows/Linux 运维脚本。

## 1. 项目组成

- `apps/mobile-web`：Vue 3 + Vant 移动端，包含登录、直播、圈子、内容发布、钱包订单、消息预约、主播中心和设置。
- `apps/admin-web`：Vue 3 + Element Plus 管理后台，包含用户主播、内容审核、交易、直播运营、审计、报表和系统配置。
- `apps/api`：NestJS + Prisma API，包含认证、RBAC、内容、钱包、订单、支付、直播、聊天、预约、上传和管理接口。
- `infra`：Nginx 与 MediaMTX 配置。
- `scripts/windows`、`scripts/linux`：启动、部署检查、备份和恢复脚本。
- `tests/e2e`：Playwright 浏览器角色流程。

## 2. 演示账号

| 角色 | 账号 | 密码 |
|---|---|---|
| 用户/主播 | `姜姜668` | `abc321` |
| 主播 | `anchor_demo` | `Anchor123!` |
| 审核员 | `reviewer` | `Reviewer123!` |
| 管理员 | `admin` | `Admin123!` |

数据库种子可重复执行，不会重复创建这些账号。用于正式环境时，请立即修改演示密码及 JWT 密钥。

## 3. 推荐部署：Docker Compose

### 3.1 环境要求

- Windows 10/11：Docker Desktop，启用 Compose v2。
- Linux：Docker Engine 24+ 与 Docker Compose v2。
- 建议至少 4 GB 可用内存、10 GB 磁盘空间。
- 首次构建需要访问 Docker Hub 和 npm registry。

### 3.2 配置环境变量

进入项目根目录并复制配置：

```powershell
cd D:\Code\机械九院\anchor-circle-platform
Copy-Item .env.example .env
```

Linux：

```sh
cd /path/to/anchor-circle-platform
cp .env.example .env
```

部署前至少修改 `.env` 中以下值：

```dotenv
POSTGRES_PASSWORD=替换为高强度数据库密码
JWT_ACCESS_SECRET=替换为至少32字符的随机字符串
JWT_REFRESH_SECRET=替换为另一段至少32字符的随机字符串
HTTP_PORT=8080
```

不要把 `.env` 提交到 Git。

### 3.3 Windows 一键启动

```powershell
.\scripts\windows\start-docker.ps1
```

也可以双击：

```text
scripts\windows\start-docker.cmd
```

### 3.4 Linux 一键启动

```sh
chmod +x scripts/linux/*.sh scripts/test-deployment.sh
./scripts/linux/start.sh
```

底层等价命令为：

```sh
docker compose up -d --build
```

API 容器会等待 PostgreSQL 和 Redis 健康，然后自动执行数据库迁移和幂等种子。

### 3.5 访问地址

| 服务 | 地址 |
|---|---|
| 移动端 | `http://localhost:8080/` |
| 管理后台 | `http://localhost:8080/admin/` |
| API 健康检查 | `http://localhost:8080/api/health` |
| HLS 播放服务 | `http://localhost:8888/` |
| RTMP 推流端口 | `rtmp://localhost:1935/` |

如果修改了 `HTTP_PORT`，请同步替换上述 Web 端口。

### 3.6 查看运行状态和日志

```powershell
docker compose ps
docker compose logs -f api
docker compose logs -f nginx
```

停止服务但保留数据：

```powershell
docker compose down
```

更新代码后重新构建：

```powershell
docker compose up -d --build
```

`docker compose down -v` 会删除数据库、Redis 和上传文件卷，不要在有用数据时执行。

## 4. Windows 源码开发运行

### 4.1 环境要求

- Node.js 22+
- pnpm 10+
- PostgreSQL 16+
- 可选：Redis 7、MediaMTX

启用 pnpm：

```powershell
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

### 4.2 创建本地数据库

使用 PostgreSQL 管理员账号执行：

```sql
CREATE USER anchor WITH PASSWORD 'anchor';
CREATE DATABASE anchor_circle OWNER anchor;
```

复制环境文件并确认连接串：

```powershell
Copy-Item .env.example .env
$env:DATABASE_URL='postgresql://anchor:anchor@localhost:5432/anchor_circle'
$env:JWT_ACCESS_SECRET='development-access-secret-change-before-production'
$env:JWT_REFRESH_SECRET='development-refresh-secret-change-before-production'
```

### 4.3 安装、迁移和初始化

```powershell
pnpm install
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

### 4.4 启动三个开发服务

分别打开三个 PowerShell 窗口，均进入项目根目录并设置 `DATABASE_URL`。

窗口 1——API：

```powershell
$env:DATABASE_URL='postgresql://anchor:anchor@localhost:5432/anchor_circle'
pnpm --filter api start:dev
```

窗口 2——移动端：

```powershell
pnpm --filter mobile-web dev
```

窗口 3——管理后台：

```powershell
pnpm --filter admin-web dev
```

开发地址：API `http://localhost:3000/api`，移动端 `http://localhost:5173/`，管理端 `http://localhost:5174/admin/`。

也可先执行 `.\scripts\windows\start-dev.ps1` 完成依赖和 Prisma 客户端准备，再按照脚本提示开启三个窗口。

## 5. Linux 非 Docker 源码运行

安装 Node.js 22、pnpm 10 和 PostgreSQL 16 后：

```sh
cp .env.example .env
export DATABASE_URL='postgresql://anchor:anchor@localhost:5432/anchor_circle'
pnpm install
pnpm --filter api db:generate
pnpm --filter api db:migrate
pnpm --filter api db:seed
pnpm --filter api start:dev
```

移动端和管理端分别在另外两个终端执行：

```sh
pnpm --filter mobile-web dev
pnpm --filter admin-web dev
```

正式环境建议使用前述 Docker Compose 方式，由 Nginx 统一提供入口。

## 6. 测试和构建

```powershell
pnpm test
pnpm test:e2e
pnpm test:browser -- --workers=1
pnpm lint
pnpm typecheck
pnpm build
powershell -ExecutionPolicy Bypass -File scripts/test-deployment.ps1
```

Linux 部署清单检查：

```sh
sh scripts/test-deployment.sh
```

Playwright 在 Windows 上使用已安装的 Chrome。Linux 首次运行浏览器测试前可执行 `pnpm exec playwright install chromium`，并按需要调整 `playwright.config.ts` 的浏览器启动配置。

## 7. 备份与恢复

Windows 备份：

```powershell
.\scripts\windows\backup.ps1 -Output backup.sql
```

Windows 恢复：

```powershell
.\scripts\windows\restore.ps1 -InputFile backup.sql
```

Linux：

```sh
./scripts/linux/backup.sh backup.sql
./scripts/linux/restore.sh backup.sql
```

上传文件保存在 Docker 卷 `uploads` 中；数据库 SQL 备份不包含上传文件，应另外备份该卷。

## 8. 常见问题

### API 无法启动或提示连接数据库失败

确认 PostgreSQL 已运行、数据库已创建，并检查 `DATABASE_URL`。Docker 环境可执行：

```powershell
docker compose ps
docker compose logs postgres
docker compose logs api
```

### 管理后台打开后跳到登录页

这是正常行为。使用管理员账号 `admin / Admin123!` 登录。管理后台必须通过 `/admin/` 路径访问。

### 无摄像头如何测试直播

进入主播工作台，勾选“使用演示视频”后创建直播间。系统会使用本地演示播放地址，不要求摄像头或真实推流服务。

### 端口冲突

- Docker Web 端口：修改 `.env` 的 `HTTP_PORT`。
- 开发端口：API `3000`、移动端 `5173`、管理端 `5174`。
- MediaMTX：RTMP `1935`、HLS `8888`。

## 9. 上线前检查

- 修改全部演示账号密码。
- 使用随机且不同的 JWT Access/Refresh 密钥。
- 将数据库密码替换为高强度值。
- 配置 HTTPS、域名、防火墙和备份策略。
- 真实支付接入前完成回调验签；默认沙箱不会真实扣款。
- 腾讯云直播凭证不完整时适配器会保持关闭，默认使用 MediaMTX。
- 多实例部署时，将本地上传存储替换为 MinIO/S3，并增加病毒扫描。

更多信息参见 [功能矩阵](docs/FEATURE_MATRIX.md)、[测试报告](docs/TEST_REPORT.md)、[已知限制](docs/KNOWN_LIMITATIONS.md) 和 [第三方服务说明](THIRD_PARTY_NOTICES.md)。

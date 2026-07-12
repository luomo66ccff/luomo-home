# Luomo Home

<div align="center">

![Luomo Home](https://luomo.moe/assets/hero/hero-witch-journey-generated.webp)

**个人云服务的首页，也是一个可交互的角色与项目陈列空间。**

[Website](https://luomo.moe) · [Deployment](docs/DEPLOYMENT.md) · [Assets](ASSETS_ATTRIBUTION.md) · [MIT License](LICENSE)

</div>

Luomo Home 用 Next.js 16 把项目入口、服务状态、视觉世界和 Live2D 伙伴收进同一个响应式页面。它不是一张静态导航页：状态卡会读取后端探针，角色系统有独立触摸区域、语音队列和全局聊天锁，移动端则会收束成更轻的浏览体验。

## Current experience

- **Project showcase**：展示 LuomoOps、LuomoFile、LuomoTerminal 等项目的定位、技术栈和入口。
- **Service signals**：服务端聚合健康状态并做短时缓存，浏览器不直接接触内部地址。
- **Companion dock**：ATRI、Murasame、Allium 可切换，支持触摸反应、文本气泡与浏览器语音。
- **One chat at a time**：共享聊天锁避免多个角色面板同时占用输入焦点和语音通道。
- **Accessible motion**：动画层尊重 `prefers-reduced-motion`，核心内容不依赖特效才能使用。
- **Responsive navigation**：桌面项目轨道与移动端导航使用同一份内容模型。

## Run it

```bash
git clone https://github.com/luomo66ccff/luomo-home.git
cd luomo-home
cp .env.example .env.local
npm ci
npm run dev
```

开发服务器监听 `http://localhost:7891`。生产构建：

```bash
npm run check:no-secrets
npm test
npm run build
npm run start
```

也可以使用 Docker；Compose 默认只发布到回环地址，并加入已有的 `luomocore_default` 网络：

```bash
docker network inspect luomocore_default >/dev/null 2>&1 || docker network create luomocore_default
cp .env.example .env
docker compose up -d --build
curl http://127.0.0.1:7891/health
```

## Configuration

| Variable | Role |
| --- | --- |
| `NEXT_PUBLIC_SITE_NAME` | 页面品牌名 |
| `NEXT_PUBLIC_SITE_URL` | canonical、站点地图和分享地址 |
| `LUOMO_OPS_URL` | 状态与运维入口 |
| `LUOMO_FILE_URL` | 文件服务入口 |
| `LUOMO_API_URL` | API Hub 入口 |
| `LUOMO_TERMINAL_URL` | 私人终端入口 |
| `LUOMO_ATRI_API_URL` | 可选角色对话后端 |
| `ATRI_BRAIN_PROVIDER` | `scripted`（默认）或显式配置的 `atri-api` |
| `ATRI_API_TOKEN` | 仅服务端读取的可选桥接 token，不得公开 |
| `STATUS_FETCH_TIMEOUT_SECONDS` | 单个健康探针超时 |
| `STATUS_CACHE_SECONDS` | 服务端状态缓存时间 |

以 `NEXT_PUBLIC_` 开头的值会进入客户端包；不要把 token、密码或内部凭据放进这些变量。

## Repository map

```text
app/                 App Router 页面、健康检查和状态 API
components/          首页区块、导航、视觉层与角色 UI
content/             伙伴图谱、文案与页面区块定义
hooks/               偏好、语音、动画与 Brain 状态
lib/                 服务注册、Live2D 控制和对话适配
public/assets/       生成素材及已标注的开放素材
public/live2d/       本地 Live2D 运行时资源区
scripts/             秘密扫描、模型检查和 smoke test
```

## Live2D assets are separate

MIT 许可证覆盖代码，不自动覆盖 `public/live2d` 中的模型、纹理、动作或角色形象。仅使用你原创、委托制作或明确获得 Web 分发授权的模型。素材来源与适用许可证记录在 [ASSETS_ATTRIBUTION.md](ASSETS_ATTRIBUTION.md)。

模型缺失时界面应回退到静态体验；贡献代码时不要在 PR 中附带未授权角色资源。

## Quality checks

```bash
npm run check:no-secrets
npm test
npm run build
npm run smoke
node scripts/inspect-live2d-models.mjs
```

`smoke` 需要已启动的服务。视觉改动应同时检查宽屏、窄屏、减少动态效果模式和角色面板互斥。

## Contributing

这里保留 Luomo 的内容与品牌取向，但可复用的状态聚合、角色交互和可访问性改进欢迎提交。请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## License

源代码采用 [MIT License](LICENSE)。图片、第三方字体、Live2D SDK 与模型按各自条款处理，详见素材说明。

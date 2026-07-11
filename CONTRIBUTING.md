# Contributing

Luomo Home 同时是个人站点和可阅读的前端实现。贡献应改善可复用机制，而不是替换站点所有者的身份、角色或项目内容。

## Before a pull request

1. 从 `main` 创建短分支，保持改动主题单一。
2. 不提交 `.env`、会话文件、构建输出或未授权媒体。
3. 新增素材时更新 `ASSETS_ATTRIBUTION.md`，写明来源、作者、许可证与本地路径。
4. 保持桌面和移动端均可使用；文字不能依靠动画出现。
5. 运行 `npm run check:no-secrets` 和 `npm run build`。

角色交互改动还应验证：触摸区不会遮挡导航、多个聊天面板不能同时打开、语音可被停止、减少动态效果模式不产生闪烁。

提交信息建议描述用户可见结果，例如 `fix: keep companion chat exclusive on mobile`。


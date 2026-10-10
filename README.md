# 电子姬舞台 SDK

电子姬平台「舞台」（卡片的网页游戏界面）的官方 SDK。舞台跑在网站页面的 iframe 里，只通过 SDK 和网站说话。

| 包 | 用途 |
|---|---|
| `@dianziji/stage` | 核心：客户端（读这一局 / 发一句话收流 / 存档）+ 会话引擎 + React 外壳 |
| `@dianziji/stage-settings` | 播放设置：文本速度、字号、动效、自动播放（只依赖 react） |
| `@dianziji/stage-panel` | 每个舞台都带的「本局」面板 |
| `@dianziji/stage-voice` | 角色配音（需要网站支持 `stage.speak`） |
| `@dianziji/stage-sfx` | 界面音效（WebAudio 现场合成） |

完整用法和开发手册见官方例子 [dzj-stage-example](https://github.com/dianziji-ai/dzj-stage-example)。

## 开发

```bash
npm install
npm run check   # 类型检查 + 编译 + 全部测试（带覆盖率门槛）
```

- 包之间按依赖顺序编译：stage → stage-settings → stage-panel / stage-voice / stage-sfx。
- 样式文件是 Tailwind 源文件，编译时原样复制进 `dist/`；它的 `@source './'` 扫的是同目录下编译好的 JS。

## 许可

专有软件，见 [LICENSE](./LICENSE)。

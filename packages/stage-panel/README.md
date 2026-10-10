# @dianziji/stage-panel · 本局面板

每个舞台都带的「本局」面板：概览、初始设定、图册、存档、分区、指南（换模型 / MOD / 记忆 / 改删回溯记录去网站哪里做）。**上线也给玩家看。**

> 从 npm 装：`npm i @dianziji/stage-panel`。用参数和配色变量定制；**别改 `node_modules` 里的代码**（重装、升级就被覆盖），不够用到 [dzj-stage-sdk 的 Issues](https://github.com/dianziji-ai/dzj-stage-sdk/issues) 提需求。

用法、参数、六个标签、全部配色变量（含深色写法）：[docs/panel.md](https://github.com/dianziji-ai/dzj-stage-example/blob/main/docs/panel.md)。

```tsx
import { StagePanel, openStagePanel } from '@dianziji/stage-panel'
<StagePanel stage={stage} button={false} />   // 入口放进自己的菜单，调 openStagePanel()
```

## 测试（官方维护用）

```bash
npm test            # 在本包目录；或在 SDK 仓库根目录 npm test（先 npm run build：包之间的测试从 dist 互引）
```

`test/` 和 `src/` 一一对应，`test/structure.test.ts` 守着「只依赖 react 和 SDK」「每个模块都有测试」；带覆盖率门槛。

版权见 [LICENSE](./LICENSE)（专有，非开源）。

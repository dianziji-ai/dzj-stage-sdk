# @dianziji/stage-voice

舞台的**角色配音**：网站用作者在角色包里给角色配的声音（声音工坊）念台词，舞台拿到音频自己播。
一个 hook 管完检查（写完没有 / 这个角色有没有声音 / 字数 / 本轮上限）、排队（同时只请求一句、最多预取后面几句）、播放（翻页、暂停就停）、出错一次就停。

- 依赖 `@dianziji/stage` ≥0.4.0（`stage.speak`）和 `@dianziji/stage-settings` ≥0.2.0（设置里的「配音」一节）。
- ★网站要先支持 `stage.speak` 才能用；角色没配声音（快照里 `characters[].voice` 为 false）的句子自动跳过，不算出错。
- 按字数扣玩家能量；同一句同情绪重听不扣。

## 怎么接

```tsx
import { useVoice, VoiceButton } from '@dianziji/stage-voice'
// 样式入口（src/index.css）：@import '@dianziji/stage-voice/styles.css';

const voice = useVoice({ stage, lines, index, streaming, paused })
// 自动播放跟配音联动：要念的句子等它念完再翻，不念的照旧按字数
const auto = useAutoPlay({ text: voice.voiced ? '' : 这一句, ready: tw.done && !voice.busy, … })

<VoiceButton voice={voice} />                  // 标题栏的「配音」开关
<SettingsPanel sections={[…, 'voice']} />      // 设置面板里的「配音」一节（音量 / 一句上限 / 一轮上限）
```

- `lines`：这一轮的台词（按顺序），`{ who, text, emotion? }`；不是角色台词的位置给 `{ who: '', text: '' }` 占位。
- `auto: false`：只念玩家点的那一句，不自动念、不预取（人多时防限流）。

完整例子见官方例子 [dzj-stage-example](https://github.com/dianziji-ai/dzj-stage-example)。

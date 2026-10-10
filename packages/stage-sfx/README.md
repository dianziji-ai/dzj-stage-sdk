# @dianziji/stage-sfx

舞台的**界面音效**：悬停 / 点击 / 确认 / 取消 / 打开 / 开关 / 翻页 / 出错，WebAudio 现场合成——零素材、零请求。
所有看起来能点的东西自动有声；设置（开关 + 音量）在 `@dianziji/stage-settings` ≥0.2.0 的「音效」一节。

## 怎么接

```tsx
import { useSfxRoot, sfx, duck } from '@dianziji/stage-sfx'

useSfxRoot()                               // App 顶层调一次：能点的都自动有声（悬停「嘀」、点击「嗒」，开关自动开 / 关声）

<button data-sfx="confirm">                // 要特别的声音就写 data-sfx：confirm / cancel / open / page / error / on / off / none
sfx('confirm')                             // 不是点出来的（发送成功、出错）在代码里放
duck(voice.playing)                        // 配音在念的时候把音效压低一半

<SettingsPanel sections={[…, 'sfx']} />    // 设置面板里的「音效」一节
```

- `data-sfx="none"`：这个元素不响；`data-sfx-hover="none"`：只是悬停不响。

完整例子见官方例子 [dzj-stage-example](https://github.com/dianziji-ai/dzj-stage-example)。

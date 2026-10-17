---
"@dianziji/stage": minor
---

配音字数：快照的玩家多一项 `user.voice_chars`（语音包还剩多少字，配音按字数扣），舞台开配音前能看够不够；不够就 `stage.open('voice')` 让网站弹「购买语音包」，买完网站推新字数过来。桥协议只加不改：`open` 多一个工具 `voice`。**需要网站 2026-10-17 之后的部署**（老网站没有 `voice_chars`＝undefined，`open('voice')` 回不认识的工具）。

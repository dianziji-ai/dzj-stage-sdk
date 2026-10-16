---
"@dianziji/stage": minor
---

发话可以带「分区白名单」：`stage.send(text, { zones })` / `session.send(text, { zones })`（React 的 `useStageActions().send` 同样）。网站拼提示词时只拼这几个区的说明和骨架，其余区整段不拼、模型写不出来——舞台按玩家所在的场景 / 幕决定这一轮要哪些区（白天不写日记、情愫低不写心声），不用在提示词里绕。不传＝全部区，和以前一样；写错的 id 网站忽略，一个都对不上按全部区走。「再说一次」沿用同一份白名单。桥协议只加字段不改：`send` 的 args 多一个可选 `zones: string[]`。

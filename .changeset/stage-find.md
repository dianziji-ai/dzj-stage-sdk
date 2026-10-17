---
"@dianziji/stage": minor
---

按分区找回复：`stage.find(zone, { before?, limit? })` 请网站在库里查「这一局里写了某个分区的 AI 回复」，从新到旧一页一页给（每页 `messages` 正序，`hasMore`，第一页带 `total`；每页默认 10、最多 50）。日记、某个事件这类零零散散夹在几百轮里的分区不用再 `older()` 把整局历史翻到头自己解析（800 多条的局一页约 3ms）。删掉 / 回溯 / 重写过的回复查不到，自然不在里面。React 里用 `useZoneHits(zone, { limit, enabled })`：一挂上取最新一页，`more()` 往前翻、`refresh()` 重取，这一局又写了这个区（新写完一轮、重写、回溯）自动重取最新一页；出错给 `error`，界面给「重试」。区 id 只能是字母数字下划线横线（写错 → `StageError('invalid')`，不发请求）。桥协议只加不改：新请求 `find`（args `{ zone, before?, limit? }`）。**需要网站 2026-10-18 之后的部署**（旧网站回 `invalid`「不认识的请求」或超时 `network`，舞台可以退回 `older()`）。

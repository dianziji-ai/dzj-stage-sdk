# @dianziji/stage-voice

官方维护的版本记录，发布在 npm。升级：`npm update @dianziji/stage`（或对应包名）。新版本由 Changesets 自动生成在最上面。

## 0.1.2

### Patch Changes

- 3e5b1a7: useVoice：外面盖了浮层（paused）只是停一下，念过的那句关上浮层后不再从头重念；关掉配音 / 跳过才算没念过。

## 0.1.1

### Patch Changes

- 629fc59: 补上 README（怎么接、注意事项）。

## 0.1.0 — 2026-10-09

首个版本：角色配音。
- `planLines`：写完没有 / 有没有声音 / 字数 / 本轮上限，不过的不请求不扣钱。
- `useVoice`：同时只请求一句，排队往前看最近 2 句；缓存按「谁 + 字 + 情绪」；出错一次关掉配音；玩家在念时手动翻页＝暂停（`interrupt`，点配音按钮恢复）；单句 `lineState` / `speakNow` / `replay`。
- `<VoiceButton>`：标题栏配音开关（关 / 开 / 生成中 / 念 / 暂停 / 出错）。

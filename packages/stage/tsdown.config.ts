import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {"index":"src/index.ts","client":"src/client/index.ts","react":"src/react/index.ts"},
  format: 'esm',
  dts: true,
  platform: 'browser',
  fixedExtension: false,
  sourcemap: true,
  // Tailwind 源样式原样放进 dist：它的 @source './' 扫的是同目录下编译好的 JS 里的类名
  copy: [{"from":"src/styles.css","to":"dist"}, {"from":"src/react/mascot-hop.webp","to":"dist/react"}],
  // 开屏小鸡图：不内联、不改名，import 原样留给作者的 Vite 处理（和以前一样单独成一个文件）；图复制进 dist 同目录
  external: [/\.webp$/],
})

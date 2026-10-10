import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {"index":"src/index.ts"},
  format: 'esm',
  dts: true,
  platform: 'browser',
  fixedExtension: false,
  sourcemap: true,
  // Tailwind 源样式原样放进 dist：它的 @source './' 扫的是同目录下编译好的 JS 里的类名
  copy: [{"from":"src/styles.css","to":"dist"}],
})

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { readZones, zoneRows } from '../../src/index'
import { liveText } from '../../src/session/zonetrack'

/*
 * 剧本式正文（正文区是一个 YAML 列表，旁白和台词按先后排）：用模型真实写出来的一轮回复（柳月儿）验
 * 「写完 → 一条不少」「流式一个字一个字喂 → 条目只增不减」「模型写坏（同一条两次同一个键）→ 照样能读」。
 */
const slots = [
  { zone: 'scene', kind: 'yaml' },
  { zone: 'narrative', kind: 'yaml', role: 'content', schema: "- 谁: 【旁白 / 柳月儿 / 我】\n  动作: 【小动作】\n  说: 【这一句】" },
  { zone: 'thought', kind: 'markdown', role: 'content' },
  { zone: 'action' },
]
const snap = { slots }
const turn = readFileSync(new URL('./__fixtures__/script-turn.txt', import.meta.url), 'utf8')
const rowsOf = (raw: string, closed = true) => zoneRows(readZones(raw, snap), 'narrative', closed)

describe('剧本式正文', () => {
  it('写完：每一条「- 谁:」都读成一条', () => {
    const n = (turn.match(/^\s*-\s*谁\s*:/gm) ?? []).length
    expect(n).toBeGreaterThan(3)
    expect(rowsOf(turn)).toHaveLength(n)
  })

  it('流式一个字一个字喂：条目只增不减，写完＝全部', () => {
    let shown = 0
    const drops: number[] = []
    for (let i = 1; i <= turn.length; i++) {
      const raw = turn.slice(0, i)
      const n = rowsOf(liveText(raw, slots), raw.includes('</narrative>')).length
      if (n < shown) drops.push(i)
      shown = Math.max(shown, n)
    }
    expect(drops).toEqual([])
    expect(shown).toBe(rowsOf(turn).length)
  })

  it('模型写坏：同一条写了两次同一个键，严格 YAML 会整区失败——按卡的骨架装配（和聊天页同一套救援），一个字不丢', () => {
    const raw = "<narrative>\n- 谁: '旁白'\n  说: '夜深了。'\n- 谁: '柳月儿'\n  动作: '先'\n  动作: '后'\n  说: '嗯'\n</narrative>"
    const rows = rowsOf(raw)
    expect(rows[0]).toEqual({ 谁: '旁白', 说: '夜深了。' })
    const text = JSON.stringify(rows)
    for (const w of ['夜深了。', '先', '后', '嗯']) expect(text).toContain(w)
  })
})

describe('liveText：生成中拿去解析的原文', () => {
  it('正在写数据区：去掉没写完的最后一行', () => {
    expect(liveText("<narrative>\n- 谁: '旁白'\n  说: '夜", slots)).toBe("<narrative>\n- 谁: '旁白'\n")
  })
  it('正在写 markdown 区 / 数据区已关上：原样（正文照样一个字一个字出）', () => {
    expect(liveText('<thought>\n好想', slots)).toBe('<thought>\n好想')
    expect(liveText('<scene>\n地点: 家\n</scene>\n<thought>\n好', slots)).toBe('<scene>\n地点: 家\n</scene>\n<thought>\n好')
  })
})

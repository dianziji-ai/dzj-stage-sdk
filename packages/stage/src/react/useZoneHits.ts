import { useCallback, useEffect, useRef, useState } from 'react'
import { StageError, type StageMessage } from '../client'
import type { SessionState } from '../session/session'
import { useSession, useStage } from './useStage'

/**
 * useZoneHits 拿到的（0.7.0）：这一局里写了某个分区的 AI 回复，已经取到的那几页。
 *   messages＝正序（旧→新）；total＝这一局一共几条（第一页带回来的，没取到＝null）
 *   more()＝再往前取一页；refresh()＝重新取最新一页（已经往前翻过的留着）
 *   error＝上一次没取到（StageError），界面给「重试」：再调 more() / refresh() 就行
 */
export type ZoneHits = {
  messages: StageMessage[]
  total: number | null
  hasMore: boolean
  loading: boolean
  error: StageError | null
  more: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * 按分区找回复（stage.find 的 React 版，0.7.0）：日记、某个事件这类零零散散夹在几百轮里的分区。
 *
 *   const diary = useZoneHits('diary', { limit: 10 })
 *   diary.messages.map((m) => readZones(m.content)…)   // 解析交给舞台自己
 *   diary.hasMore && <button onClick={diary.more}>更早的</button>
 *
 * 一挂上就取最新一页；之后这一局又写了这个区（AI 新写完一轮、重写、回溯删掉了）自动重新取最新一页。
 * enabled＝false 时先不取（比如面板没打开）。网站还没支持 find：error.code 是 invalid / network，舞台自己决定退回 older()。
 */
export function useZoneHits(zone: string, opts: { limit?: number; enabled?: boolean } = {}): ZoneHits {
  const { limit, enabled = true } = opts
  const session = useSession()
  const [st, setSt] = useState<Omit<ZoneHits, 'more' | 'refresh'>>({ messages: [], total: null, hasMore: false, loading: false, error: null })
  const cur = useRef(st)
  cur.current = st
  // 每次取都记一个号：换了分区 / 卸载 / 又取了一次，晚回来的旧结果不要
  const seq = useRef(0)

  const refresh = useCallback(async () => {
    const n = ++seq.current
    setSt((s) => ({ ...s, loading: true, error: null }))
    try {
      const r = await session.stage.find(zone, { limit })
      if (n !== seq.current) return
      setSt((s) => {
        // 已经往前翻过的那几页留着：只留比这一页最早那条还早的（这一页里有的以这一页为准）
        const first = r.messages[0]?.id
        const older = first === undefined ? [] : s.messages.filter((m) => m.id < first)
        const keepMore = older.length > 0 ? s.hasMore : r.hasMore
        return { messages: [...older, ...r.messages], total: r.total ?? s.total, hasMore: keepMore, loading: false, error: null }
      })
    } catch (e) {
      if (n !== seq.current) return
      setSt((s) => ({ ...s, loading: false, error: e instanceof StageError ? e : new StageError('error', String(e)) }))
    }
  }, [session, zone, limit])

  const more = useCallback(async () => {
    const s = cur.current
    if (s.loading || !s.hasMore || !s.messages.length) return
    const n = ++seq.current
    setSt((x) => ({ ...x, loading: true, error: null }))
    try {
      const r = await session.stage.find(zone, { before: s.messages[0].id, limit })
      if (n !== seq.current) return
      setSt((x) => {
        const have = new Set(x.messages.map((m) => m.id))
        return { ...x, messages: [...r.messages.filter((m) => !have.has(m.id)), ...x.messages], hasMore: r.hasMore, loading: false, error: null }
      })
    } catch (e) {
      if (n !== seq.current) return
      setSt((x) => ({ ...x, loading: false, error: e instanceof StageError ? e : new StageError('error', String(e)) }))
    }
  }, [session, zone, limit])

  // 历史里最新一条写了这个区的回复：AI 新写完一轮 / 重写 / 回溯删掉了，它就变了 → 重新取最新一页
  const tag = `<${zone}>`
  const newest = useStage((s: SessionState<unknown>) => newestWith(s.history, tag))
  useEffect(() => {
    if (enabled) void refresh()
    return () => {
      seq.current++ // 卸载 / 换区：还没回来的结果作废
    }
  }, [enabled, refresh, newest])

  return { ...st, more, refresh }
}

/** 历史里最新一条写了 tag 的 AI 回复的 id（没有＝0）。history 只在写完 / 翻页 / 换了的时候换数组，按数组缓存，流式每帧不重扫 */
const cache = new WeakMap<StageMessage[], Map<string, number>>()
function newestWith(history: StageMessage[], tag: string): number {
  let m = cache.get(history)
  if (!m) cache.set(history, (m = new Map()))
  const hit = m.get(tag)
  if (hit !== undefined) return hit
  let id = 0
  for (let i = history.length - 1; i >= 0; i--) {
    const x = history[i]
    if (x.role === 'assistant' && x.content.includes(tag)) {
      id = x.id
      break
    }
  }
  m.set(tag, id)
  return id
}

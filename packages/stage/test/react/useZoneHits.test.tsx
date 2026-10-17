// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StageError, type StageFound, type StageMessage } from '../../src/index'
import { useZoneHits } from '../../src/react'
import { msg, snapOf, withSession, setupReactTests } from './helpers'

setupReactTests()

/** 已取到的 id|total|hasMore|loading|error + 两个按钮 */
function View({ zone = 'diary', enabled = true }: { zone?: string; enabled?: boolean }) {
  const h = useZoneHits(zone, { limit: 2, enabled })
  return (
    <>
      <p data-testid="v">
        {h.messages.map((m) => m.id).join(',')}|{String(h.total)}|{String(h.hasMore)}|{String(h.loading)}|{h.error?.code ?? ''}
      </p>
      <button onClick={() => void h.more()}>more</button>
      <button onClick={() => void h.refresh()}>refresh</button>
    </>
  )
}
const text = () => screen.getByTestId('v').textContent
const flush = () => act(async () => {})
const click = async (name: string) => {
  await act(async () => {
    fireEvent.click(screen.getByText(name))
  })
}
const d = (id: number): StageMessage => msg(id, 'assistant', `<diary>\n第${id}篇\n</diary>`)

/** 假网站上的「库」：这一局写了日记的回复（id 升序）；find 照后端规矩从新到旧分页、正序返回 */
function withFind(db: number[], snap = snapOf()) {
  const s = withSession(snap)
  const find = vi.fn(async (_zone: string, o?: { before?: number; limit?: number }): Promise<StageFound> => {
    const lim = o?.limit ?? 10
    const pool = db.filter((id) => !o?.before || id < o.before)
    const page = pool.slice(-lim)
    return { messages: page.map(d), hasMore: pool.length > lim, ...(o?.before ? {} : { total: db.length }) }
  })
  ;(s.stage as unknown as { find: typeof find }).find = find
  return { ...s, find }
}

describe('useZoneHits：按分区找回复', () => {
  it('一挂上取最新一页（正序）+ 总数；more 往前翻、翻到头 hasMore=false', async () => {
    const { wrap, find } = withFind([3, 8, 12, 20, 31])
    render(<View />, { wrapper: wrap })
    await flush()
    expect(text()).toBe('20,31|5|true|false|')
    expect(find).toHaveBeenLastCalledWith('diary', { limit: 2 })

    await click('more')
    expect(find).toHaveBeenLastCalledWith('diary', { before: 20, limit: 2 })
    expect(text()).toBe('8,12,20,31|5|true|false|')

    await click('more')
    expect(text()).toBe('3,8,12,20,31|5|false|false|')

    await click('more') // 到头了：不再请求
    expect(find).toHaveBeenCalledTimes(3)
  })

  it('一条都没写过：空、total 0、不能往前翻', async () => {
    const { wrap } = withFind([])
    render(<View />, { wrapper: wrap })
    await flush()
    expect(text()).toBe('|0|false|false|')
  })

  it('AI 新写完一轮、写了这个区：自动重新取最新一页，往前翻过的留着', async () => {
    const db = [3, 8, 12, 20]
    const { wrap, find, done } = withFind(db)
    render(<View />, { wrapper: wrap })
    await flush()
    await click('more')
    expect(text()).toBe('3,8,12,20|4|false|false|')

    db.push(101) // 新的一轮写了日记（fakeStage 的 done 给的 id 从 101 起）
    await act(async () => done('<narrative>\n夜里\n</narrative>\n<diary>\n新的一页\n</diary>'))
    await flush()
    expect(find).toHaveBeenLastCalledWith('diary', { limit: 2 })
    expect(text()).toBe('3,8,12,20,101|5|false|false|')
  })

  it('AI 这一轮没写这个区：不重取', async () => {
    const { wrap, find, done } = withFind([3, 8])
    render(<View />, { wrapper: wrap })
    await flush()
    const n = find.mock.calls.length
    await act(async () => done('<narrative>\n白天\n</narrative>'))
    await flush()
    expect(find).toHaveBeenCalledTimes(n)
  })

  it('没取到：给 error，loading 收起；refresh 重试成功就清掉', async () => {
    const { wrap, find } = withFind([1, 2])
    find.mockRejectedValueOnce(new StageError('network', '没取到'))
    render(<View />, { wrapper: wrap })
    await flush()
    expect(text()).toBe('|null|false|false|network')
    await click('refresh')
    expect(text()).toBe('1,2|2|false|false|')
  })

  it('老网站不认识 find（invalid）：error 交给舞台决定退回 older()', async () => {
    const { wrap, find } = withFind([1])
    find.mockRejectedValue(new StageError('invalid', '不认识的请求：find'))
    render(<View />, { wrapper: wrap })
    await flush()
    expect(text()).toBe('|null|false|false|invalid')
  })

  it('enabled=false 先不取；打开才取', async () => {
    const { wrap, find } = withFind([5])
    const { rerender } = render(<View enabled={false} />, { wrapper: wrap })
    await flush()
    expect(find).not.toHaveBeenCalled()
    rerender(<View enabled />)
    await flush()
    expect(text()).toBe('5|1|false|false|')
  })

  it('换了分区：晚回来的旧结果不要', async () => {
    const { wrap, find } = withFind([1, 2])
    let late: (v: StageFound) => void = () => {}
    find.mockImplementationOnce(() => new Promise<StageFound>((r) => (late = r)))
    const { rerender } = render(<View zone="diary" />, { wrapper: wrap })
    rerender(<View zone="scene" />)
    await flush()
    const now = text()
    await act(async () => late({ messages: [d(999)], hasMore: false, total: 1 }))
    expect(text()).toBe(now)
    expect(text()).not.toContain('999')
  })

  it('历史里已经有写了这个区的回复：挂上时只取一次（不因为扫到它再取一次）', async () => {
    const { wrap, find } = withFind([1], snapOf({ history: [msg(1, 'assistant', '<diary>\n旧\n</diary>')] }))
    render(<View />, { wrapper: wrap })
    await flush()
    await flush()
    expect(find).toHaveBeenCalledTimes(1)
  })
})

import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.resetModules()
})

it('retira los enlaces de una búsqueda cuando se desactivan los botones', async () => {
  vi.useFakeTimers()
  let actualizar!: () => Promise<void>
  let botones = true
  const publicar = vi.fn()
  vi.stubGlobal('Presence', class {
    on(_evento: string, fn: typeof actualizar) { actualizar = fn }
    getSetting(id: string) { return id === 'browsing' || (id === 'buttons' && botones) }
    getStrings() { return { searching: 'Buscando', viewSearch: 'Ver búsqueda' } }
    setActivity = publicar
  })
  vi.stubGlobal('MutationObserver', class {})
  vi.stubGlobal('navigator', {})
  vi.stubGlobal('document', {
    location: new URL('https://music.youtube.com/search?q=ejemplo'),
    querySelector: () => null,
    querySelectorAll: () => [],
  })
  await import('../activity/presence.js')
  await actualizar()
  await vi.runOnlyPendingTimersAsync()
  expect(publicar.mock.lastCall?.[0].buttons).toHaveLength(1)
  botones = false
  await actualizar()
  await vi.runOnlyPendingTimersAsync()
  expect(publicar.mock.lastCall?.[0]).not.toHaveProperty('buttons')
})

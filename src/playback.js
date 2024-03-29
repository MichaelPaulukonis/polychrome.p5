import { mergeAll, path } from 'ramda'

const fromPathOrOriginal = (val, pct) => (typeof val === 'string' && path(val.split('.'), pct)) || val

const vivify = pchrome => params => {
  const liveParams = mergeAll(Object.keys(params).map(key => ({ [key]: fromPathOrOriginal(params[key], pchrome) })))
  return liveParams
}

const unroll = script => {
  const longified = script.map(cmd => {
    return (cmd.action === 'repeat')
      ? Array.from({ length: cmd.count }).map(i => Array.from(cmd.actions)).flat()
      : cmd
  })
  return longified.flat()
}

const playback = function * ({ script, pct }) {
  let prevConfig = {}
  const hydrate = vivify(pct)
  const origCapturing = pct.params.capturing
  const origParams = { ...pct.params }
  let localParams = JSON.parse(JSON.stringify(origParams))

  const scriptUnrolled = unroll(script)

  for (let i = 0; i < scriptUnrolled.length; i++) {
    const cmd = scriptUnrolled[i]
    switch (cmd.action) {
      case 'paint':
        pct.draw({ x: cmd.params.x, y: cmd.params.y, override: true, params: localParams })
        yield
        break

      case 'config': {
        const newConf = { ...prevConfig, ...cmd.params }
        prevConfig = newConf
        localParams = { ...localParams, ...newConf }
        yield
        break
      }

      case 'macro':
        pct.macros[cmd.params.macro](pct)
        yield
        break

      case 'save':
        console.log('saving')
        pct.params.playbackSave = true
        yield
        break

      case 'text':
        pct.textManager.setText(cmd.params.text || undefined)
        yield
        break

      default: {
        const newParams = hydrate(cmd.params || {})
        pct[cmd.action]({ ...newParams, params: localParams })
        yield
      }
    }
  }
  pct.stop()
  pct.params.capturing = origCapturing
}

export {
  playback
}

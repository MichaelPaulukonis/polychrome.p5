import { mergeAll, path } from 'ramda'

// const print = obj => console.log(JSON.stringify(obj))

var fromPathOrOriginal = (val, pct) => (typeof val === 'string' && path(val.split('.'), pct)) || val

const vivify = pchrome => params => {
  const liveParams = mergeAll(Object.keys(params).map(key => ({ [key]: fromPathOrOriginal(params[key], pchrome) })))
  return liveParams
}

const playScript = (script, pct) => {
  let prevConfig = {}
  const hydrate = vivify(pct)
  const origParams = { ...pct.params }
  let localParams = JSON.parse(JSON.stringify(origParams))
  script.forEach((cmd) => {
    switch (cmd.action) {
      case 'paint':
        pct.draw({ x: cmd.params.x, y: cmd.params.y, override: true, params: localParams })
        break

      case 'config':
        const newConf = { ...prevConfig, ...cmd.params }
        prevConfig = newConf
        localParams = { ...localParams, ...newConf }
        break

      case 'macro':
        pct.macros[cmd.params.macro](pct)
        break

      default:
        // ah, but if the params require a layer or layers....
        // they ARE available in pct, we just have to parse & alias.....
        const newParams = hydrate(cmd.params)
        pct[cmd.action](newParams || {})
    }
  })
  // pct.params = { ...origParams }
}

export {
  playScript
}

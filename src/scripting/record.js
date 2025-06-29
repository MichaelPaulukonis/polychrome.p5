import diff from './diff'
import { mergeAll, clone, is, map, pipe } from 'ramda'

let recs = []

const dehydrate = val => typeof (val) === 'object' ? val.constructor.name : val

// Ramda-based deep clone
const deepClone = (val) => {
  if (is(Array, val)) {
    return map(deepClone, val)
  }
  if (is(Object, val)) {
    return pipe(
      Object.entries,
      map(([k, v]) => [k, deepClone(v)]),
      Object.fromEntries
    )(val)
  }
  return clone(val)
}

const store = ({ action, config, params: props }) => {
  let params
  if (props) {
    try {
      params = deepClone(props)
    } catch (_) {
      // Fallback for edge cases (circular refs, exotic objects)
      params = mergeAll(Object.keys(props).map(key => ({ [key]: dehydrate(props[key]) })))
    }
  }
  recs.push({ action, config, params })
}

const isDifferent = diff => Object.keys(diff).length > 0

const recordAction = (props, bypass) => {
  if (bypass) return
  const { action, ...params } = props
  store({ action, params })
}

let prevConfig = {}
const recordConfig = (parms, bypass) => {
  if (bypass) return
  const changes = diff(prevConfig, parms)
  prevConfig = { ...parms }
  const notSame = isDifferent(changes)
  if (notSame) store({ action: 'config', params: changes })
}

const output = () => [...recs]

const clear = () => {
  recs = []
  return recs
}

export {
  recordAction,
  recordConfig,
  output,
  clear
}

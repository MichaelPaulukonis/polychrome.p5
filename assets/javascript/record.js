import diff from './diff'
import { mergeAll } from 'ramda'

let recs = []

const dry = val => typeof (val) === 'object' ? val.constructor.name : val

const store = ({ action, config, params: props }) => {
  let params
  if (props) {
    try {
      params = JSON.parse(JSON.stringify(props))
    } catch (_) {
      params = mergeAll(Object.keys(props).map(key => ({ [key]: dry(props[key]) })))
    }
  }
  recs.push({ action, config, params })
}

const isDifferent = diff => Object.keys(diff).length > 0

const recordAction = (props, bypass) => {
  if (bypass) return
  let { action, ...params } = props
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

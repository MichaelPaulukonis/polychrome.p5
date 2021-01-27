import diff from './diff'

let recs = []

const store = (obj) => {
  recs.push(obj)
  print(obj)
}

const print = obj => console.log(JSON.stringify(obj))
const isDifferent = diff => Object.keys(diff).length > 0

const recordAction = ({ x, y, action = 'paint' }, bypass) => {
  if (bypass) return
  store({ x, y, action })
}

let prevConfig = {}
const recordConfig = (parms, bypass) => {
  if (bypass) return
  const changes = diff(prevConfig, parms)
  prevConfig = { ...parms }
  const notSame = isDifferent(changes)
  if (notSame) store({ action: 'config', config: changes })
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

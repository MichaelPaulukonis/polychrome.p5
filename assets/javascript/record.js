import diff from './diff'

const print = obj => console.log(JSON.stringify(obj))
const isDifferent = diff => Object.keys(diff).length > 0

const recordAction = ({ x, y, action = 'paint' }, bypass) => {
  if (bypass) return
  print({ x, y, action })
}

let prevConfig = {}
const recordConfig = (parms, bypass) => {
  if (bypass) return
  const changes = diff(prevConfig, parms)
  prevConfig = { ...parms }
  const notSame = isDifferent(changes)
  if (notSame) print({ action: 'config', config: changes })
}

export {
  recordAction,
  recordConfig
}

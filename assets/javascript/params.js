const randomColor = () => '#' + (Math.random().toString(16) + '0000000').slice(2, 8)

const fourRandoms = (prefix = '') => {
  const pfx = prefix ? `${prefix}_` : ''
  return {
    [pfx + 'lq1']: randomColor(),
    [pfx + 'lq2']: randomColor(),
    [pfx + 'lq3']: randomColor(),
    [pfx + 'lq4']: randomColor()
  }
}

const colorParams = () => ({
  ...{
    paintMode: Object.keys(paintModes),
    transparency: 50,
    transparent: false,
    color: '#fff000',
    scheme: 'ffffff-000000',
    curCycle: 0,
    donePainting: false,
    randomizeQuads: () => { }
  },
  ...fourRandoms()
})

const paintModes = {
  'Rainbow1': 0,
  'Rainbow2': 1,
  'Rainbow3': 2,
  'Rainbow4': 3,
  'Black': 4,
  'White': 5,
  'Gray1': 6,
  'Gray2': 7,
  'solid': 9,
  'lerp-scheme': 13,
  'lerp-quad': 14
}

const nextCharModes = {
  'Sequential': 0,
  'Random': 1,
  'Word': 2
}
const drawModes = { 'Grid': 0, 'Circle': 1, 'Grid2': 2 }

const bindFunctionLater = () => { }

const fillParams = { ...colorParams() }
const outlineParams = { ...colorParams(), ...{ strokeWeight: 1, strokeJoin: 'round' } }

const paramsInitial = {
  name: 'polychrome.text',
  width: 900,
  height: 900,
  // bind after defined in sketch
  save: bindFunctionLater,
  clear: bindFunctionLater,
  swap: bindFunctionLater,
  fixedWidth: true,
  font: 'Copperplate',
  rotation: 0,
  cumulativeRotation: false,
  drawMode: Object.keys(drawModes),
  invert: false,
  useOutline: true,
  nextCharMode: Object.keys(nextCharModes),
  maxrows: 100,
  rows: 10,
  columns: 10,
  rowmax: 100,
  colmax: 100,
  hardEdge: true,
  useShadow: false,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: '#000000',
  gamma: 0.8
}

// fake-name-spaces
// so it can be flat. ugh. naming things.
// const prefixObj = (obj, prefix) => {
//   const flatObj = {}
//   Object.keys(obj).forEach(key => (flatObj[`${prefix}_${key}`] = obj[key]))
//   return flatObj
// }

// const allParams = Object.assign({}, paramsInitial, prefixObj(fillParams, 'fill'), prefixObj(outlineParams, 'outline'))
const allParams = { ...paramsInitial, fill: fillParams, outline: outlineParams }

export {
  allParams,
  fillParams,
  outlineParams,
  paramsInitial,
  fourRandoms,
  drawModes,
  paintModes,
  nextCharModes
}

import fontList from '@/assets/javascript/fonts'

const randomColor = () => '#' + (Math.random().toString(16) + '0000000').slice(2, 8)

const getRandomColors = i => [...Array(i).keys()].map(randomColor)

const colorParams = () => ({
  paintModes,
  paintMode: paintModes[0],
  transparency: 50,
  transparent: false,
  color: '#fff000',
  scheme: 'ffffff-000000',
  curCycle: 0,
  randomizeQuads: () => { },
  lerps: []
})

const paintModes = [
  'Rainbow1',
  'Rainbow2',
  'Rainbow3',
  'Rainbow4',
  'Black',
  'White',
  'Gray1',
  'Gray2',
  'solid',
  'lerp-scheme',
  'lerp-quad'
]

const nextCharModes = [
  'Sequential',
  'Random',
  'Word'
]
const drawModes = ['Grid', 'Circle', 'Grid2']
const joins = ['miter', 'bevel', 'round']

const fillParams = { ...colorParams() }
const outlineParams = { ...colorParams(), ...{ strokeWeight: 1, strokeJoin: joins[0], joins, paintMode: 'Black' } }

const paramsInitial = {
  name: 'polychrome.text',
  width: 900,
  height: 900,
  frameRate: 30,
  fixedWidth: true,
  fontList,
  font: fontList[0],
  rotation: 0,
  cumulativeRotation: false,
  autoPaint: false,
  drawModes,
  drawMode: drawModes[0],
  inset: 0,
  invert: false,
  useOutline: true,
  useFill: true,
  nextCharModes,
  nextCharMode: nextCharModes[0],
  maxrows: 100,
  rows: 10,
  columns: 10,
  rowmax: 100,
  colmax: 100,
  hardEdge: true,
  useShadow: false,
  shadowOffsetX: 5,
  shadowOffsetY: 5,
  shadowBlur: 5,
  shadowColor: '#000000',
  gamma: 0.8,
  capturing: false,
  captureOverride: false,
  captureLimit: 200
}

const globals = {
  updatedCanvas: false,
  captureCount: 0
}

const allParams = { ...paramsInitial, fill: fillParams, outline: outlineParams }

export {
  allParams,
  fillParams,
  outlineParams,
  paramsInitial,
  getRandomColors,
  drawModes,
  paintModes,
  nextCharModes,
  colorParams,
  globals
}

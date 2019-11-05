import { QuickSettings } from '@/assets/javascript/quicksettings'
import {
  fourRandoms,
  drawModes
} from '@/assets/javascript/params'

const assignRandoms = (p, g) => {
  const qs = fourRandoms()
  p.lq1 = qs.lq1
  p.lq2 = qs.lq2
  p.lq3 = qs.lq3
  p.lq4 = qs.lq4
  g.setValue('lq1', qs.lq1)
  g.setValue('lq2', qs.lq2)
  g.setValue('lq3', qs.lq3)
  g.setValue('lq4', qs.lq4)
}

const _ = null

const setupGui = ({ p5, sketch, params, fillParams, outlineParams }) => {
  const mainGui = QuickSettings.create(p5.windowWidth - 220, 20, 'PolychromeText', p5.canvas.parentElement)
    .bindNumber('width', _, _, params.width, _, params)
    .bindNumber('height', _, _, params.height, _, params)
    .addButton('save', sketch.save_sketch)
    .addButton('clear', sketch.clearCanvas)
    .bindDropDown('drawMode', drawModes, params)
    .bindBoolean('invert', params.invert, params)
    .bindNumber('rows', _, _, params.rows, _, params)
    .bindNumber('columns', _, _, params.columns, _, params)
    .bindBoolean('hardEdge', params.hardEdge, params)
    .bindBoolean('useShadow', params.useShadow, params)
    .bindRange('gamma', 0, 1.0, params.gamma, 0.01, params)
    .bindBoolean('useOutline', params.useOutline, params)
  mainGui.collapse()

  const fontGui = QuickSettings.create(p5.windowWidth - 220, 60, 'Font', p5.canvas.parentElement)
    .bindBoolean('fixedWidth', params.fixedWidth, params)
    .bindDropDown('font', params.fontList, params)
    .bindRange('rotation', -180, 180, params.rotation, 1, params)
    .bindBoolean('cumulativeRotation', params.cumulativeRotation, params)
    .bindDropDown('nextCharMode', params.nextCharModes, params)
  fontGui.collapse()

  const shadowGui = QuickSettings.create(p5.windowWidth - 220, 100, 'Shadow', p5.canvas.parentElement)
    .bindRange('shadowOffsetX', 0, 100, params.shadowOffsetX, 1, params)
    .bindRange('shadowOffsetY', 0, 100, params.shadowOffsetY, 1, params)
    .bindRange('shadowBlur', 0, 100, params.shadowBlur, 1, params)
    .bindColor('shadowColor', params.shadowColor, params)
  shadowGui.collapse()

  const fillGui = QuickSettings.create(p5.windowWidth - 220, 140, 'Fill', p5.canvas.parentElement)
  fillGui.bindDropDown('paintMode', fillParams.paintModes, fillParams)
    .bindRange('transparency', 0, 100, fillParams.transparency, 1, fillParams)
    .bindBoolean('transparent', fillParams.transparent, fillParams)
    .bindColor('color', fillParams.color, fillParams)
    .bindText('scheme', fillParams.scheme, fillParams)
    .addButton('randomize', () => assignRandoms(fillParams, fillGui))
    .bindColor('lq1', fillParams.lq1, fillParams)
    .bindColor('lq2', fillParams.lq2, fillParams)
    .bindColor('lq3', fillParams.lq3, fillParams)
    .bindColor('lq4', fillParams.lq4, fillParams)
  fillGui.collapse()

  const outlineGui = QuickSettings.create(p5.windowWidth - 220, 180, 'Outline', p5.canvas.parentElement)
  outlineGui.bindDropDown('paintMode', outlineParams.paintModes, outlineParams)
    .bindRange('strokeWeight', 0, 400, outlineParams.strokeWeight, 1, outlineParams)
    .bindDropDown('strokeJoin', outlineParams.joins, outlineParams)
    .bindBoolean('transparent', outlineParams.transparent, outlineParams)
    .bindRange('transparency', 0, 100, outlineParams.transparency, 1, outlineParams)
    .bindColor('color', outlineParams.color, outlineParams)
    .bindText('scheme', outlineParams.scheme, outlineParams)
    .addButton('randomize', () => assignRandoms(outlineParams, outlineGui))
    .bindColor('lq1', outlineParams.lq1, outlineParams)
    .bindColor('lq2', outlineParams.lq2, outlineParams)
    .bindColor('lq3', outlineParams.lq3, outlineParams)
    .bindColor('lq4', outlineParams.lq4, outlineParams)
  outlineGui.collapse()
}

export { setupGui }

import { QuickSettings } from '@/assets/javascript/quicksettings'
import {
  fourRandoms,
  drawModes
} from '@/assets/javascript/params'
import { lerpList } from '@/assets/javascript/lerplist'
import { hexStringToColors } from '@/assets/javascript/gui.color.control'

const createElement = (type, id, className) => {
  const element = document.createElement(type)
  if (!element) { return }
  element.id = id
  if (className) {
    element.className = className
  }
  return element
}

const assignRandoms = (p, g) => {
  const length = p.lerps.length
  const qs = fourRandoms() // TODO: get the exact number we want
  p.lerps = qs.slice(0, length)
  for (let i = 0; i < length; i++) {
    g.setValue(`lq${i}`, qs[i])
  }
}

const shift = arr => [ ...arr.slice(1, arr.length), arr[0] ]
const shiftColors = (p, g) => {
  const length = p.lerps.length
  p.lerps = shift(p.lerps)
  for (let i = 0; i < length; i++) {
    g.setValue(`lq${i}`, p.lerps[i])
  }
}

const updateColors = (panel, lerps, prefix, params) => (selection) => {
  // remove current color selectors
  lerps.forEach((_, i) => {
    panel.removeControl(`${prefix}${i}`)
  })
  lerps = hexStringToColors(selection.value)
  params.lerps = lerps
  lerps.forEach((hexString, i) => {
    const ref = `${prefix}${i}`
    panel.bindColor(ref, hexString, params)
  })
}

const addMultiColor = ({ gui, prefix, params }) => {
  const lerps = []
  const mcUpdater = updateColors(gui, lerps, prefix, params)
  gui.addDropDown('multi-color', lerpList, mcUpdater)
  const selectedColor = gui.getValue('multi-color')
  mcUpdater(selectedColor)
}

const _ = null

const setupGui = ({ p5, sketch, params, fillParams, outlineParams }) => {
  const pDoc = p5.canvas.parentElement

  const mainGui = QuickSettings.create(p5.windowWidth - 220, 20, 'PolychromeText', pDoc)
    // bindNumber, despite the README notes, has the same signature as binRange
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

  const fontGui = QuickSettings.create(p5.windowWidth - 220, 60, 'Font', pDoc)
    .bindBoolean('fixedWidth', params.fixedWidth, params)
    .bindDropDown('font', params.fontList, params)
    .bindRange('rotation', -180, 180, params.rotation, 1, params)
    .bindBoolean('cumulativeRotation', params.cumulativeRotation, params)
    .bindDropDown('nextCharMode', params.nextCharModes, params)
  fontGui.collapse()

  const shadowGui = QuickSettings.create(p5.windowWidth - 220, 100, 'Shadow', pDoc)
    .bindBoolean('useShadow', params.useShadow, params)
    .bindRange('shadowOffsetX', 0, 100, params.shadowOffsetX, 1, params)
    .bindRange('shadowOffsetY', 0, 100, params.shadowOffsetY, 1, params)
    .bindRange('shadowBlur', 0, 100, params.shadowBlur, 1, params)
    .bindColor('shadowColor', params.shadowColor, params)
  shadowGui.collapse()

  const fillGui = QuickSettings.create(p5.windowWidth - 440, 140, 'Fill', pDoc)
  fillGui.bindDropDown('paintMode', fillParams.paintModes, fillParams)
    .bindRange('transparency', 0, 100, fillParams.transparency, 1, fillParams)
    .bindBoolean('transparent', fillParams.transparent, fillParams)
    .bindColor('color', fillParams.color, fillParams)
    .addButton('randomize', () => assignRandoms(fillParams, fillGui))
    .addButton('shift', () => shiftColors(fillParams, fillGui))
  addMultiColor({ gui: fillGui, prefix: 'lq', params: fillParams })
  fillGui.collapse()

  const outlineGui = QuickSettings.create(p5.windowWidth - 220, 140, 'Outline', pDoc)
  outlineGui.bindBoolean('useOutline', params.useOutline, params) // NOTE: both do not update when one is changed
    .bindDropDown('paintMode', outlineParams.paintModes, outlineParams)
    .bindRange('strokeWeight', 0, 400, outlineParams.strokeWeight, 1, outlineParams)
    .bindDropDown('strokeJoin', outlineParams.joins, outlineParams)
    .bindBoolean('transparent', outlineParams.transparent, outlineParams)
    .bindRange('transparency', 0, 100, outlineParams.transparency, 1, outlineParams)
    .bindColor('color', outlineParams.color, outlineParams)
    .addButton('randomize', () => assignRandoms(outlineParams, outlineGui))
  addMultiColor({ gui: outlineGui, prefix: 'lq', params: outlineParams })
  outlineGui.collapse()

  const panels = [mainGui, fontGui, shadowGui, fillGui, outlineGui]
  let presets = {}
  const prefix = 'polychrometext'

  const saveAll = (name) => {
    const allPanels = {}
    const asString = true
    panels.forEach((panel) => {
      allPanels[panel._titleBar.textContent] = panel.getValuesAsJSON(asString)
    })
    presets[name] = allPanels
    localStorage.setItem(prefix, JSON.stringify(presets))
    updateNames()
    const newSelect = buildSelect()
    const oldSelect = document.getElementById(presetsID)
    const parent = oldSelect.parentElement
    parent.removeChild(oldSelect)
    parent.appendChild(newSelect)
    return newSelect
  }

  const getAllSettings = () => {
    const blobs = localStorage.getItem(prefix)
    return JSON.parse(blobs)
  }

  const getSetting = (name) => {
    const blob = presets[name]
    if (blob) {
      panels.forEach((panel) => {
        const values = blob[panel._titleBar.textContent]
        panel.setValuesFromJSON(values)
      })
    }
  }

  const saveNew = () => {
    const presetName = prompt('Enter a new preset name.')
    if (presetName) {
      saveAll(presetName)
    }
  }

  const update = () => {
    const index = document.getElementById('preset_select').selectedIndex
    const name = presetNames[index]
    const select = saveAll(name)
    select.selectedIndex = index
  }

  let presetNames = []
  const updateNames = () => {
    presetNames = Object.keys(presets)
  }
  const startup = () => {
    const allSets = getAllSettings()
    if (allSets) {
      presets = allSets
      updateNames()
    }
  }

  startup()

  const buildSelect = () => {
    const select = createElement('select', presetsID, 'qs_select')
    for (let i = 0; i < presetNames.length; i++) {
      const option = createElement('option')
      const item = presetNames[i]
      if (item.label) {
        option.value = item.value
        option.textContent = item.label
      } else {
        option.label = item
        option.textContent = item
      }
      select.add(option)
    }
    select.addEventListener('change', function () {
      const index = select.selectedIndex
      getSetting(presetNames[index])
    })
    return select
  }
  const presetsID = 'preset_select'
  const select = buildSelect()

  const rememberPanel = QuickSettings.create(p5.windowWidth - 440, 20, 'SettingsArchive', pDoc)
    .addElement('preset', select)
    .addButton('update', update)
    .addButton('new', saveNew)
  rememberPanel.collapse()

  if (presetNames[0]) {
    getSetting(presetNames[0])
  }
}

export { setupGui }

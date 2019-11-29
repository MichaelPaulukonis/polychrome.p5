import { QuickSettings } from '@/assets/javascript/quicksettings'
import {
  getRandomColors,
  drawModes
} from '@/assets/javascript/params'
import { lerpList } from '@/assets/javascript/lerplist'
import { hexStringToColors } from '@/assets/javascript/gui.color.control'

const setFocus = (title) => {
  console.log(JSON.stringify(title))
  window.setFocus() /* eslint-disable-line no-undef */
}

const createElement = (type, id, className) => {
  const element = document.createElement(type)
  if (!element) { return }
  element.id = id
  if (className) {
    element.className = className
  }
  return element
}

const shuffle = arr => arr.map(a => ({ sort: Math.random(), value: a }))
  .sort((a, b) => a.sort - b.sort)
  .map(a => a.value)

const shift = arr => [...arr.slice(1, arr.length), arr[0]]

const assignRandoms = (params, gui) => {
  const length = params.lerps.length
  params.lerps = getRandomColors(length)
  for (let i = 0; i < length; i++) {
    gui.setValue(`lq${i}`, params.lerps[i])
  }
}

const shiftColors = (params, guiPanel) => () => {
  const length = params.lerps.length
  params.lerps = shift(params.lerps)
  for (let i = 0; i < length; i++) {
    guiPanel.setValue(`lq${i}`, params.lerps[i])
  }
}

const colorSync = (params, prefix, index) => (color) => {
  params.lerps[index] = color
  params[`${prefix}${index}`] = color
}

const populateColorThings = (panel, lerps, prefix, params) => (selection) => {
  lerps.forEach((_, i) => {
    panel.removeControl(`${prefix}${i}`)
  })
  lerps = hexStringToColors(selection.value)
  params.lerps = lerps
  lerps.forEach((hexString, i) => {
    const ref = `${prefix}${i}`
    panel.addColor(ref, hexString, colorSync(params, prefix, i))
  })
}

const removeColor = ({ panel, prefix, params }) => {
  const last = params.lerps.length - 1
  panel.removeControl(`${prefix}${last}`)
  params.lerps = params.lerps.slice(0, last)
}

const addColor = ({ panel, lerps, prefix, params }) => {
  const i = lerps.length
  lerps[i] = getRandomColors(1)[0]
  const ref = `${prefix}${i}`
  panel.addColor(ref, lerps[i], colorSync(params, prefix, i))
}

const addMultiColor = ({ gui, prefix, params }) => {
  const lerps = []
  const mcUpdater = populateColorThings(gui, lerps, prefix, params)
  gui.addDropDown('multi-color', lerpList, mcUpdater)
  const selectedColor = gui.getValue('multi-color')
  mcUpdater(selectedColor)
}

const setFrameRate = p5 => (value) => {
  p5.frameRate(value)
}

const _ = null

const setupGui = ({ p5, sketch, params, fillParams, outlineParams }) => {
  const pDoc = p5.canvas.parentElement

  const mainGui = QuickSettings.create(p5.windowWidth - 220, 20, 'PolychromeText', pDoc)
    // bindNumber, despite the README notes, has the same signature as binRange
    .bindNumber('width', _, _, params.width, _, params)
    .bindNumber('height', _, _, params.height, _, params)
    .addButton('clear', sketch.clearCanvas)
    .addButton('save', sketch.save_sketch)
    .addRange('frameRate', 1, 30, params.frameRate, 1, setFrameRate(p5))
    .bindBoolean('autoPaint', params.autoPaint, params)
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
    .bindRange('rotation', -180, 180, params.rotation, 0.01, params)
    .bindBoolean('cumulativeRotation', params.cumulativeRotation, params)
    .bindDropDown('nextCharMode', params.nextCharModes, params)
    .setGlobalChangeHandler(setFocus)
  fontGui.collapse()

  const shadowGui = QuickSettings.create(p5.windowWidth - 220, 100, 'Shadow', pDoc)
    .bindBoolean('useShadow', params.useShadow, params)
    .bindRange('shadowOffsetX', 0, 100, params.shadowOffsetX, 1, params)
    .bindRange('shadowOffsetY', 0, 100, params.shadowOffsetY, 1, params)
    .bindRange('shadowBlur', 0, 100, params.shadowBlur, 1, params)
    .bindColor('shadowColor', params.shadowColor, params)
    .setGlobalChangeHandler(setFocus)
  shadowGui.collapse()

  const getLerpNames = panel => Object.keys(panel._controls).filter(x => x.startsWith('lq'))

  const hideColorControls = (panel) => {
    const controls = controlMapper(panel)['lerp-quad']
    controls.forEach(c => panel.hideControl(c))
  }

  const controlMapper = panel => ({
    'lerp-quad': ['randomize', 'shift', 'addColor', 'removeColor', 'multi-color'].concat(getLerpNames(panel))
  })

  const handleModeChange = (params, key, panel) => (selected) => {
    params[key] = selected.value
    hideColorControls(panel)
    const controlMap = controlMapper(panel)
    if (Object.keys(controlMap).includes(selected.value)) {
      controlMap[selected.value].map(c => panel.showControl(c))
    }
  }

  const fillGui = QuickSettings.create(p5.windowWidth - 440, 140, 'Fill', pDoc)
  const shiftFillColors = shiftColors(fillParams, fillGui)
  fillGui.addDropDown('paintMode', fillParams.paintModes, handleModeChange(fillParams, 'paintMode', fillGui))
    .bindBoolean('transparent', fillParams.transparent, fillParams)
    .bindRange('transparency', 0, 100, fillParams.transparency, 1, fillParams)
    .bindColor('color', fillParams.color, fillParams)
    .addButton('randomize', () => assignRandoms(fillParams, fillGui))
    .addButton('shift', shiftFillColors)
    .addButton('addColor', () => addColor({ panel: fillGui, lerps: fillParams.lerps, prefix: 'lq', params: fillParams }))
    .addButton('removeColor', () => removeColor({ panel: fillGui, prefix: 'lq', params: fillParams }))
    .setGlobalChangeHandler(setFocus)
  addMultiColor({ gui: fillGui, prefix: 'lq', params: fillParams })
  fillGui.collapse()

  const outlineGui = QuickSettings.create(p5.windowWidth - 220, 140, 'Outline', pDoc)
  const shiftOutlineColors = shiftColors(outlineParams, outlineGui)
  outlineGui.bindBoolean('useOutline', params.useOutline, params) // NOTE: both do not update when one is changed
  outlineGui.addDropDown('paintMode', outlineParams.paintModes, handleModeChange(outlineParams, 'paintMode', outlineGui))
    .bindRange('strokeWeight', 0, 400, outlineParams.strokeWeight, 1, outlineParams)
    .bindDropDown('strokeJoin', outlineParams.joins, outlineParams)
    .bindBoolean('transparent', outlineParams.transparent, outlineParams)
    .bindRange('transparency', 0, 100, outlineParams.transparency, 1, outlineParams)
    .bindColor('color', outlineParams.color, outlineParams)
    .addButton('randomize', () => assignRandoms(outlineParams, outlineGui))
    .addButton('shift', shiftOutlineColors)
    .addButton('addColor', () => addColor({ panel: outlineGui, lerps: outlineParams.lerps, prefix: 'lq', params: outlineParams }))
    .addButton('removeColor', () => removeColor({ panel: outlineGui, prefix: 'lq', params: outlineParams }))
    .setGlobalChangeHandler(setFocus)
  addMultiColor({ gui: outlineGui, prefix: 'lq', params: outlineParams })
  outlineGui.collapse()

  const panels = [mainGui, fontGui, shadowGui, fillGui, outlineGui]
  let presets = {}
  const prefix = 'polychrometext'

  const saveAll = (name) => {
    let panelName = 'unknown'
    try {
      const allPanels = {}
      const asString = true
      panels.forEach((panel) => {
        panelName = panel._titleBar.textContent
        allPanels[panelName] = panel.getValuesAsJSON(asString)
      })
      presets[name] = allPanels
      localStorage.setItem(prefix, JSON.stringify(presets))
      updateNames(presets)
      const newSelect = buildSelect({ values: presetNames, id: presetsID, callback: getSetting })
      const oldSelect = document.getElementById(presetsID)
      const parent = oldSelect.parentElement
      parent.removeChild(oldSelect)
      parent.appendChild(newSelect)
      return newSelect
    } catch (err) {
      console.log(`'potential error saving panel: '${panelName}'`)
      console.log(err)
    }
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
    const name = prompt('Enter a new preset name.')
    if (presetNames.includes(name)) {
      alert(`Setting '${name}' already exists; Did you mean to use 'update'?`)
      return
    }
    if (name) {
      saveAll(name)
    }
  }

  const update = () => {
    const index = document.getElementById('preset_select').selectedIndex
    const name = presetNames[index]
    const select = saveAll(name)
    select.selectedIndex = index
  }

  let presetNames = []
  const updateNames = (list) => {
    presetNames = Object.keys(list)
  }
  const setupPresets = () => {
    const allSets = getAllSettings()
    if (allSets) {
      presets = allSets
      presetNames = shuffle(Object.keys(presets))
      // presetNames = Object.keys(presets)
    }
  }

  const buildSelect = ({ values, id, callback }) => {
    const select = createElement('select', id, 'qs_select')
    for (let i = 0; i < values.length; i++) {
      const option = createElement('option')
      const item = values[i]
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
      callback(values[index])
    })
    return select
  }

  setupPresets()
  const presetsID = 'preset_select'
  const select = buildSelect({ values: presetNames, id: presetsID, callback: getSetting })

  const rememberPanel = QuickSettings.create(p5.windowWidth - 440, 20, 'SettingsArchive', pDoc)
    .addElement('preset', select)
    .addButton('update', update)
    .addButton('new', saveNew)
    .setGlobalChangeHandler(setFocus)
  rememberPanel.collapse()

  if (presetNames[0]) {
    getSetting(presetNames[0])
  }

  // hack to allow setting focus
  document.getElementsByTagName('canvas')[0].tabIndex = 0

  return {
    shiftFillColors,
    shiftOutlineColors
  }
}

export { setupGui }

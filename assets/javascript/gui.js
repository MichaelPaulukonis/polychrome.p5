import { contains } from 'ramda'
import * as dat from 'dat.gui'
// TODO: pass in allParams, pre-defined ?
import { allParams, paramsInitial, fourRandoms, drawModes } from '~/assets/javascript/params.js'
import fontList from '@/assets/javascript/fonts'
import { lerpList } from '@/assets/javascript/lerplist'
import { hexStringToColors, colorLabel, selectToRadios } from '@/assets/javascript/gui.color.control.js'
const presets = require('@/assets/default.gui.settings.json')

export default class GuiControl {
  constructor () {
    const setupGui = (sketch) => {
      allParams.save = sketch.save_sketch
      allParams.clear = sketch.clearCanvas
      allParams.swap = () => swapParams(allParams)
      sketch.defaultParams = { ...(paramsInitial) }
      fontPicker.onFinishChange(font => sketch.setFont(font))

      // TODO: uh.... need both fill and stroke. so... hrmph. stupid flat params and prefixes
      allParams.fill_randomizeQuads = () => rqPrefix('fill')
      allParams.outline_randomizeQuads = () => rqPrefix('outline')

      const rqPrefix = (prefix) => {
        const qs = fourRandoms(prefix)
        allParams[prefix + '_lq1'] = qs[prefix + '_lq1']
        allParams[prefix + '_lq2'] = qs[prefix + '_lq2']
        allParams[prefix + '_lq3'] = qs[prefix + '_lq3']
        allParams[prefix + '_lq4'] = qs[prefix + '_lq4']
      }
    }

    // TODO: is this working for all things? like the nestd folders with action-buttons?
    const swapParams = (params) => {
      const swapped = swapPrefixParams(params, 'outline', 'fill')
      Object.keys(swapped)
        .forEach(key => (params[key] = swapped[key]))
    }

    // http://www.jstips.co/en/javascript/picking-and-rejecting-object-properties/
    function pick (obj, keys) {
      return keys.map(k => k in obj ? { [k]: obj[k] } : {})
        .reduce((res, o) => Object.assign(res, o), {})
    }

    // this seems overly complicated
    const swapPrefixParams = (params, prefix1, prefix2) => {
      const newParams = Object.assign({}, params)
      const p1keys = Object.keys(newParams).filter(k => k.startsWith(prefix1) && !contains('randomize', k))
      const p2keys = Object.keys(newParams).filter(k => k.startsWith(prefix2) && !contains('randomize', k))
      const p2bak = pick(newParams, p2keys)
      p1keys.forEach((key) => {
        const p2key = key.replace(prefix1, prefix2)
        newParams[p2key] = newParams.hasOwnProperty(key) ? newParams[key] : newParams[p2key]
      })
      p1keys.forEach((p1key) => {
        const p2key = p1key.replace(prefix1, prefix2)
        newParams[p1key] = p2bak.hasOwnProperty(p2key) ? p2bak[p2key] : newParams[p1key]
      })
      return newParams
    }

    const gui = new dat.GUI({
      load: presets,
      preset: 'nice palette'
    })
    gui.remember(allParams)

    const f1 = gui.addFolder('stuff')
    f1.add(allParams, 'width')
    f1.add(allParams, 'height')
    f1.add(allParams, 'name')
    f1.add(allParams, 'save')
    f1.add(allParams, 'clear')
    f1.add(allParams, 'swap')
    const f2 = gui.addFolder('misc')
    f2.add(allParams, 'hardEdge').listen()
    f2.add(allParams, 'useShadow').listen()
    f2.add(allParams, 'shadowOffsetX').min(-100).max(100).step(1)
    f2.add(allParams, 'shadowOffsetY').min(-100).max(100).step(1)
    f2.add(allParams, 'shadowBlur').min(1).max(100).step(1)
    f2.addColor(allParams, 'shadowColor').listen()
    f2.add(allParams, 'gamma').min(0.01).max(9.99).step(0.01)

    gui.add(allParams, 'invert').listen()
    gui.add(allParams, 'nextCharMode', allParams.nextCharModes).listen()
    gui.add(allParams, 'fixedWidth')
    const fontPicker = gui.add(allParams, 'font', fontList).listen()
    gui.add(allParams, 'rotation').min(-360).max(360).step(1).listen()
    gui.add(allParams, 'cumulativeRotation').listen()
    const dm = gui.add(allParams, 'drawMode', allParams.drawModes).listen()

    const rowColFolder = gui.addFolder('RowCol Settings')
    rowColFolder.add(allParams, 'rows').min(1).max(allParams.rowmax).step(1).listen()
    rowColFolder.add(allParams, 'columns').min(1).max(allParams.colmax).step(1).listen()
    rowColFolder.close()

    dm.onChange((m) => {
      (parseInt(m, 10) === drawModes.Grid2)
        ? rowColFolder.open()
        : rowColFolder.close()
    })

    const addFlatParams = (gui, params, prefix) => {
      gui.add(params, `${prefix}_paintMode`, allParams.paintModes).listen() // work in-progress....
      gui.add(params, `${prefix}_transparent`).listen()
      gui.add(params, `${prefix}_transparency`).min(0).max(100).step(1)
      gui.addColor(params, `${prefix}_color`)
      // NOTE: creating a "new" setting triggers this. hunh.
      // cm.onChange((m) => { params[`${prefix}_paintMode`] = 9 }) // auto-set to solid color mode
      const radioFolder = gui.addFolder('palettes')
      const ccm = radioFolder.add(params, `${prefix}_scheme`, lerpList).name(prefix)
      const c = selectToRadios(ccm)
      c.__radios.map(colorLabel)
      gui.add(params, `${prefix}_randomizeQuads`) // TODO: needs to take a params
      gui.addColor(params, `${prefix}_lq1`).listen()
      gui.addColor(params, `${prefix}_lq2`).listen()
      gui.addColor(params, `${prefix}_lq3`).listen()
      gui.addColor(params, `${prefix}_lq4`).listen()
    }

    const fpGui = gui.addFolder('fillControls')
    addFlatParams(fpGui, allParams, 'fill')
    gui.add(allParams, 'useOutline').listen()
    const olGui = gui.addFolder('outlineControls')
    olGui.add(allParams, 'outline_strokeWeight').min(1).max(800).step(1)
    olGui.add(allParams, 'outline_strokeJoin', { 'MITER': 'miter', 'BEVEL': 'bevel', 'ROUND': 'round' })
    addFlatParams(olGui, allParams, 'outline')

    dat.GUI.toggleHide()

    return {
      setupGui,
      params: allParams,
      hexStringToColors,
      swapParams,
      fontPicker,
      gui
    }
  }
}

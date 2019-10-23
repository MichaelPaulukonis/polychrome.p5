import { contains } from 'ramda'
// import * as dat from 'dat.gui'
import { allParams, paramsInitial, fourRandoms, drawModes } from '../params'
import corpus from './corpus.js'
// import fontList from './fonts'
let dat
let fontList

export default class GuiControl {
  constructor () {
    let cnvs
    dat = require('dat.gui')
    fontList = require('./fonts')
    const randElem = arr => arr[Math.floor(Math.random() * arr.length)]

    const setupGui = (sketch) => {
      cnvs = document.getElementsByTagName('canvas')
      if (cnvs && cnvs[0]) {
        cnvs = cnvs[0]
      }
      setfocus()
      allParams.open = openCanvasInNewTab
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

      setBodyCopy(randElem(corpus))

      document.getElementById('applytext')
        .addEventListener('click', () => {
          sketch.textManager.setText(getBodyCopy())
        })
    }

    const setfocus = () => cnvs.focus()

    const openCanvasInNewTab = () => {
      // if (cnvs) {
      //   const img = cnvs.toDataURL('image/jpg')
      //   // https://ourcodeworld.com/articles/read/682/what-does-the-not-allowed-to-navigate-top-frame-to-data-url-javascript-exception-means-in-google-chrome
      //   const win = window.open()
      //   win.document.write('<iframe src="' + img +
      //     '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>')
      // }
    }

    const fc = document.getElementById('focus')
    if (fc) { fc.onclick = setfocus }

    const textInputBox = document.getElementById('bodycopy')
    const getBodyCopy = () => textInputBox.value
    const setBodyCopy = (text) => {
      textInputBox.value = text
    }

    // eh, maybe some other way of doing/naming this
    const hexStringToColors = (lerp) => {
      // based on https://bl.ocks.org/mootari/bfbf01320da6c14f9cba186c581d507d
      return lerp.split('-').map(c => '#' + c)
    }

    const colorLabel = (label) => {
      const stops = (color, i, colors) => {
        return color + ' ' + (i * 100 / colors.length) + '%' +
          ',' + color + ' ' + ((i + 1) * 100 / colors.length) + '%'
      }
      const gradient = colors => 'linear-gradient(90deg,' + colors.map(stops) + ')'

      label.style.display = 'inline-block'
      const radio = label.children[0]
      radio.nextSibling.remove()
      const span = document.createElement('span')
      span.style.background = gradient(hexStringToColors(radio.value))
      span.style.paddingRight = '4em'
      span.style.marginRight = '.5em'
      label.appendChild(span)
    }

    // Adds and links labeled radios to select controller, hides select.
    // Radios are wrapped inside labels and stored in controller.__radios.
    const selectToRadios = (controller) => {
      const wrapper = controller.domElement
      const select = wrapper.children[0]
      // TODO: needs to be 0 when hidden; auto if not
      // wrapper.parentNode.parentNode.style.height = 'auto'
      wrapper.parentNode.parentNode.classList.add('radio-select')
      controller.__radios = Array.prototype.map.call(select.children, function (option, i) {
        const radio = document.createElement('input')
        radio.type = 'radio'
        radio.name = option.name
        radio.value = option.value
        radio.checked = option.selected
        radio.addEventListener('change', (e) => {
          option.selected = true
          // ouch! a reference that doesn't exist yet!
          controller.__select.dispatchEvent(new e.constructor(e.type, e))
        })
        const label = document.createElement('label')
        label.appendChild(radio)
        label.appendChild(document.createTextNode(option.textContent))
        wrapper.appendChild(label)
        return label
      })
      wrapper.removeChild(select)
      return controller
    }

    // developed with the help of https://coolors.co/
    // we only process 2..4 of the colors, so we can dispose of some
    // NOTE: some of these combos are awful
    const lerpList = [
      'ffffff-000000',
      '002626-0e4749-95c623-e55812-efe7da',
      '003049-d62828-f77f00-fcbf49-eae2b7',
      '20bf55-0b4f6c-01baef-fbfbff-757575',
      '1a535c-4ecdc4-f7fff7-ff6b6b-ffe66d',
      'cc211a-234ec3-f6dc28-e8ebf7-acbed8',
      'cc211a-234ec3-f6dc28-e8ebf7',
      '5d737e-64b6ac-c0fdfb-daffef',
      'ff9f1c-ffbf69-ffffff-cbf3f0-2ec4b6',
      '50514f-f25f5c-ffe066-247ba0-70c1b3',
      'edadc7-643173-7d5ba6-89ce94',
      '74b3ce-f18805-0e1428-ef3054',
      'ffff00-ff00ff-800080-00ffaa',
      'ffff00-ff00ff',
      '800080-00ffaa'
    ]

    const swapParams = (params) => {
      const swapped = swapPrefixParams(params, 'outline', 'fill')
      Object.keys(swapped)
        .forEach(key => (params[key] = swapped[key]))
      // const getProps = pickBy((val, key) => !contains('randomize', key))
      // const somerKeys = getProps(swapped)
      // params = {...somerKeys}
    }
    // http://www.jstips.co/en/javascript/picking-and-rejecting-object-properties/
    function pick (obj, keys) {
      return keys.map(k => k in obj ? { [k]: obj[k] } : {})
        .reduce((res, o) => Object.assign(res, o), {})
    }
    // this seems overly complicated
    const swapPrefixParams = (params, prefix1, prefix2) => {
      const newParams = Object.assign({}, params)
      // const getProps = prefix => pickBy((val, key) => key.startsWith(prefix) && !contains('randomize', key))
      // let p1keys = getProps(prefix1)(newParams)
      // let p2keys = getProps(prefix2)(newParams)
      // let p2bak = {...p2keys}

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

    const gui = new dat.GUI()
    gui.remember(allParams)

    const f1 = gui.addFolder('stuff')
    f1.add(allParams, 'width')
    f1.add(allParams, 'height')
    f1.add(allParams, 'name')
    f1.add(allParams, 'open')
    f1.add(allParams, 'save')
    f1.add(allParams, 'clear')
    f1.add(allParams, 'swap')
    f1.add(allParams, 'fixedWidth')
    const fontPicker = f1.add(allParams, 'font', fontList).listen()
    const sc = f1.add(allParams, 'scale').min(0.1).max(3).step(0.1).listen()

    const f2 = gui.addFolder('misc')
    f2.add(allParams, 'hardEdge').listen()
    f2.add(allParams, 'useShadow').listen()
    f2.add(allParams, 'shadowOffsetX').min(-100).max(100).step(1)
    f2.add(allParams, 'shadowOffsetY').min(-100).max(100).step(1)
    f2.add(allParams, 'shadowBlur').min(1).max(100).step(1)
    f2.addColor(allParams, 'shadowColor').listen()
    f2.add(allParams, 'gamma').min(0.01).max(9.99).step(0.01)

    sc.onChange((m) => {
      const scale = parseFloat(m, 10)
      // this is... not quite right
      cnvs = document.getElementsByTagName('canvas')[0]
      cnvs.style.transform = `scale(${scale})`
    })

    gui.add(allParams, 'invert').listen()
    gui.add(allParams, 'nextCharMode', allParams.nextCharModes).listen()
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

    return {
      setupGui,
      params: allParams,
      openCanvasInNewTab,
      getBodyCopy,
      setBodyCopy,
      hexStringToColors,
      swapParams,
      fontPicker
    }
  }
}

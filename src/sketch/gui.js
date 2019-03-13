import * as dat from './dat.gui.js'
import corpus from './corpus.js'
import fonts from './fonts'

export default class GuiControl {
  constructor () {
    var cnvs

    var randElem = (arr) => arr[Math.floor(Math.random() * arr.length)]

    const setupGui = function (sketch) {
      cnvs = document.getElementsByTagName('canvas')
      if (cnvs && cnvs[0]) {
        cnvs = cnvs[0]
      }
      setfocus()
      allParams.save = sketch.save_sketch
      allParams.clear = sketch.clearCanvas
      sketch.defaultParams = { ...(paramsInitial) }

      setBodyCopy(randElem(corpus))

      document.getElementById('applytext')
        .addEventListener('click', () => {
          sketch.textManager.setText(getBodyCopy())
        })
    }

    var setfocus = function () {
      cnvs.focus()
    }

    const openCanvasInNewTab = function () {
      if (cnvs) {
        const img = cnvs.toDataURL('image/jpg')
        // https://ourcodeworld.com/articles/read/682/what-does-the-not-allowed-to-navigate-top-frame-to-data-url-javascript-exception-means-in-google-chrome
        var win = window.open()
        win.document.write('<iframe src="' + img +
          '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>')
      }
    }

    let fc = document.getElementById('focus')
    if (fc) fc.onclick = setfocus

    const textInputBox = document.getElementById('bodycopy')
    const getBodyCopy = () => {
      return textInputBox.value
    }
    const setBodyCopy = (text) => {
      textInputBox.value = text
    }

    // eh, maybe some other way of doing/naming this
    const hexStringToColors = (lerp) => {
      // based on https://bl.ocks.org/mootari/bfbf01320da6c14f9cba186c581d507d
      return lerp.split('-').map((c) => '#' + c)
    }

    const colorLabel = (label) => {
      function gradient (colors) {
        function stops (color, i, colors) {
          return color + ' ' + (i * 100 / colors.length) + '%' +
            ',' + color + ' ' + ((i + 1) * 100 / colors.length) + '%'
        }
        return 'linear-gradient(90deg,' + colors.map(stops) + ')'
      }
      label.style.display = 'inline-block'
      var radio = label.children[0]
      radio.nextSibling.remove()
      var span = document.createElement('span')
      span.style.background = gradient(hexStringToColors(radio.value))
      span.style.paddingRight = '4em'
      span.style.marginRight = '.5em'
      label.appendChild(span)
    }

    // Adds and links labeled radios to select controller, hides select.
    // Radios are wrapped inside labels and stored in controller.__radios.
    function selectToRadios (controller) {
      var wrapper = controller.domElement
      var select = wrapper.children[0]
      // TODO: needs to be 0 when hidden; auto if not
      // wrapper.parentNode.parentNode.style.height = 'auto'
      wrapper.parentNode.parentNode.classList.add('radio-select')
      controller.__radios = Array.prototype.map.call(select.children, function (option, i) {
        var radio = document.createElement('input')
        radio.type = 'radio'
        radio.name = option.name
        radio.value = option.value
        radio.checked = option.selected
        radio.addEventListener('change', (e) => {
          option.selected = true
          // ouch! a reference that doesn't exist yet!
          controller.__select.dispatchEvent(new e.constructor(e.type, e))
        })
        var label = document.createElement('label')
        label.appendChild(radio)
        label.appendChild(document.createTextNode(option.innerText))
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

    let colorParams = () => ({
      paintMode: 0,
      transparency: 50,
      transparent: false,
      color: '#fff000',
      scheme: 'ffffff-000000',
      curCycle: 0,
      donePainting: false,
      lq1: '#fff000',
      lq2: '#fff000',
      lq3: '#fff000',
      lq4: '#fff000'
    })

    const swapParams = () => {
      let swapped = swapPrefixParams(allParams, 'outline', 'fill')
      Object.keys(swapped).map((key) => (allParams[key] = swapped[key]))
    }
    // http://www.jstips.co/en/javascript/picking-and-rejecting-object-properties/
    function pick (obj, keys) {
      return keys.map(k => k in obj ? { [k]: obj[k] } : {})
        .reduce((res, o) => Object.assign(res, o), {})
    }
    // this seems overly complicated
    const swapPrefixParams = (params, prefix1, prefix2) => {
      let newParams = Object.assign({}, params)
      let p1keys = Object.keys(newParams).filter((k) => k.startsWith(prefix1))
      let p2keys = Object.keys(newParams).filter((k) => k.startsWith(prefix2))
      let p2bak = pick(newParams, p2keys)
      p1keys.forEach((p1key) => {
        let p2key = p1key.replace(prefix1, prefix2)
        newParams[p2key] = newParams.hasOwnProperty(p1key) ? newParams[p1key] : newParams[p2key]
      })
      p1keys.forEach((p1key) => {
        let p2key = p1key.replace(prefix1, prefix2)
        newParams[p1key] = p2bak.hasOwnProperty(p2key) ? p2bak[p2key] : newParams[p1key]
      })
      return newParams
    }
    // it doesn't actually flatten, it fake-name-spaces
    // so it can be flat. ugh. naming things.
    const flattenObj = (obj, prefix) => {
      let flatObj = {}
      Object.keys(obj).forEach((key) => (flatObj[`${prefix}_${key}`] = obj[key]))
      return flatObj
    }
    let fillParams = colorParams()
    let outlineParams = Object.assign({}, colorParams(), { strokeWeight: 1, strokeJoin: 'round', paintMode: 4 })
    let paramsInitial = {
      name: 'polychrome.text',
      open: openCanvasInNewTab,
      width: 900,
      height: 900,
      // bind after defined in sketch
      save: () => { },
      clear: () => { },
      swap: swapParams,
      fixedWidth: true,
      font: fonts[0],
      scale: 1.0,
      rotation: 0,
      cumulativeRotation: false,
      drawModes: { 'Grid': 0, 'Circle': 1, 'Grid2': 2 },
      drawMode: 0,
      invert: false,
      useOutline: true,
      nextCharMode: 0,
      maxrows: 100,
      rows: 10,
      columns: 10,
      rowmax: 100,
      colmax: 100,
      paintModes: {
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
      },
      nextCharModes: {
        'Sequential': 0,
        'Random': 1,
        'Word': 2
      }
    }

    let allParams = Object.assign({}, paramsInitial, flattenObj(fillParams, 'fill'), flattenObj(outlineParams, 'outline'))

    var gui = new dat.GUI()
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
    f1.add(allParams, 'font', fonts).listen()
    const sc = f1.add(allParams, 'scale').min(0.1).max(3).step(0.1).listen()

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
      (parseInt(m, 10) === paramsInitial.drawModes['Grid2'])
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
      let c = selectToRadios(ccm)
      c.__radios.map(colorLabel)
      gui.addColor(params, `${prefix}_lq1`)
      gui.addColor(params, `${prefix}_lq2`)
      gui.addColor(params, `${prefix}_lq3`)
      gui.addColor(params, `${prefix}_lq4`)
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
      swapParams
    }
  }
}

import * as dat from './dat.gui.js'

export default class GuiControl {
  constructor () {
    var cnvs
    this.setupGui = function (sketch) {
      cnvs = document.getElementsByTagName('canvas')
      if (cnvs && cnvs[0]) {
        cnvs = cnvs[0]
      }
      setfocus()
      this.params.save = sketch.save_sketch
      this.params.clear = sketch.clearCanvas
    }
    var setfocus = function () {
      cnvs.focus()
    }
    this.openCanvasInNewTab = function () {
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
    this.urlToColors = (url) => {
      // based on https://bl.ocks.org/mootari/bfbf01320da6c14f9cba186c581d507d
      return url.split('/').pop().split('-').map((c) => '#' + c)
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
      span.style.background = gradient(this.urlToColors(radio.value))
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
    // Only the part after the last slash will be parsed. Slash is optional.
    const schemeList = [
      'ffffff-000000',
      'https://coolors.co/002626-0e4749-95c623-e55812-efe7da',
      'https://coolors.co/003049-d62828-f77f00-fcbf49-eae2b7',
      'https://coolors.co/20bf55-0b4f6c-01baef-fbfbff-757575',
      'https://coolors.co/1a535c-4ecdc4-f7fff7-ff6b6b-ffe66d',
      'https://coolors.co/cc211a-234ec3-f6dc28-e8ebf7-acbed8',
      'https://coolors.co/5d737e-64b6ac-c0fdfb-daffef-fcfffd',
      'https://coolors.co/ff9f1c-ffbf69-ffffff-cbf3f0-2ec4b6',
      'https://coolors.co/50514f-f25f5c-ffe066-247ba0-70c1b3',
      'https://coolors.co/edadc7-643173-7d5ba6-86a59c-89ce94'
    ]
    let colorParams = () => ({
      paintMode: 0,
      transparency: 50,
      transparent: false,
      color: '#fff000',
      scheme: 'ffffff-000000',
      curCycle: 0,
      donePainting: false
    })
    this.swapParams = () => {
      let swapped = swapPrefixParams(params, 'outline', 'fill')
      Object.keys(swapped).map((key) => (params[key] = swapped[key]))
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
    var paramsInitial = {
      name: 'polychrome.text',
      open: this.openCanvasInNewTab,
      // bind after defined in sketch
      save: () => { },
      clear: () => { },
      swap: this.swapParams,
      rotation: 0,
      cumulativeRotation: false,
      drawMode: 1,
      fadeBackground: false,
      invert: false,
      useOutline: true,
      nextCharMode: 0,
      maxrows: 100,
      rows: 10,
      columns: 10,
      rowmax: 100,
      colmax: 100
    }
    let params = Object.assign({}, paramsInitial, flattenObj(fillParams, 'fill'), flattenObj(outlineParams, 'outline'))
    var gui = new dat.GUI()
    gui.remember(params)
    gui.add(params, 'name')
    gui.add(params, 'open')
    gui.add(params, 'save')
    gui.add(params, 'clear')
    gui.add(params, 'swap')
    gui.add(params, 'fadeBackground').listen()
    gui.add(params, 'invert').listen()
    gui.add(params, 'nextCharMode', {
      'Sequential': 0,
      'Random': 1,
      'Word': 2
    }).listen()
    gui.add(params, 'rotation').min(-360).max(360).step(1).listen()
    gui.add(params, 'cumulativeRotation').listen()
    gui.add(params, 'drawMode', { 'Grid': 0, 'Circle': 1, 'Grid2': 2 }).listen()
    gui.add(params, 'rows').min(1).max(params.rowmax).listen()
    gui.add(params, 'columns').min(1).max(params.colmax).listen()
    const addFlatParams = (gui, params, prefix) => {
      gui.add(params, `${prefix}_paintMode`, {
        'Rainbow1': 0,
        'Rainbow2': 1,
        'Rainbow3': 2,
        'Rainbow4': 3,
        'Black': 4,
        'White': 5,
        'Gray1': 6,
        'Gray2': 7,
        'cycle': 8,
        'solid': 9
      }).listen() // work in-progress....
      gui.add(params, `${prefix}_transparent`).listen()
      gui.add(params, `${prefix}_transparency`).min(0).max(100).step(1).listen()
      const cm = gui.addColor(params, `${prefix}_color`).listen()
      // NOTE: creating a "new" setting triggers this. hunh.
      // cm.onChange((m) => { params[`${prefix}_paintMode`] = 9 }) // auto-set to solid color mode
      const ccm = gui.add(params, `${prefix}_scheme`, schemeList).name(prefix)
      // NOTE: creating a "new" setting triggers this. hunh.
      // ccm.onChange((m) => { params[`${prefix}_paintMode`] = 8 }) // auto-set to cycle-mode
      let c = selectToRadios(ccm)
      c.__radios.map(colorLabel)
    }
    const fpGui = gui.addFolder('fillControls')
    addFlatParams(fpGui, params, 'fill')
    gui.add(params, 'useOutline').listen()
    const olGui = gui.addFolder('outlineControls')
    olGui.add(params, 'outline_strokeWeight').min(0).max(100).step(1).listen()
    olGui.add(params, 'outline_strokeJoin', { 'MITER': 'miter', 'BEVEL': 'bevel', 'ROUND': 'round' })
    addFlatParams(olGui, params, 'outline')
    this.params = params
  }
}

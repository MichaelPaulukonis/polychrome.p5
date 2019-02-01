import * as dat from './dat.gui.js'

export default class GuiControl {
  constructor () {
    var cnvs

    var randElem = (arr) => arr[Math.floor(Math.random() * arr.length)]

    this.setupGui = function (sketch) {
      cnvs = document.getElementsByTagName('canvas')
      if (cnvs && cnvs[0]) {
        cnvs = cnvs[0]
      }
      setfocus()
      this.params.save = sketch.save_sketch
      this.params.clear = sketch.clearCanvas
      sketch.defaultParams = { ...(this.params) }
      setBodyCopy(randElem(corpus))
    }

    var corpus = ['An sketch a day keeps the doctor away........*****xxx                                 ',
      `riverrun, past Eve and Adam's, from swerve of shore to bend 
  of bay, brings us by a commodius vicus of recirculation back to 
  Howth Castle and Environs. 
  
  Sir Tristram, violer d'amores, fr'over the short sea, had passen- 
  core rearrived from North Armorica on this side the scraggy 
  isthmus of Europe Minor to wielderfight his penisolate war: nor 
  had topsawyer's rocks by the stream Oconee exaggerated themselse 
  to Laurens County's gorgios while they went doublin their mumper 
  all the time: nor avoice from afire bellowsed mishe mishe to 
  tauftauf thuartpeatrick: not yet, though venissoon after, had a 
  kidscad buttended a bland old isaac: not yet, though all's fair in 
  vanessy, were sosie sesthers wroth with twone nathandjoe. Rot a 
  peck of pa's malt had Jhem or Shen brewed by arclight and rory 
  end to the regginbrow was to be seen ringsome on the aquaface. 
  
  The fall (bababadalgharaghtakamminarronnkonnbronntqnner- 
  ronntuonnthunntrovarrhounawnskawntoohoohoordenenthur- 
  nuk!) of a once wallstrait oldparr is retaled early in bed and later 
  on life down through all christian minstrelsy. The great fall of the 
  offwall entailed at such short notice the pftjschute of Finnegan, 
  erse solid man, that the humptyhillhead of humself prumptly sends 
  an unquiring one well to the west in quest of his tumptytumtoes: 
  and their upturapikepointandplace is at the knock out in the park 
  where oranges have been laid to rust upon the green since dev- 
  linsfirst loved livvy. `]

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

    const textInputBox = document.getElementById('bodycopy')
    const getBodyCopy = () => {
      return textInputBox.value
    }
    const setBodyCopy = (text) => {
      textInputBox.value = text
    }
    this.getBodyCopy = getBodyCopy
    this.setBodyCopy = setBodyCopy

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
      open: this.openCanvasInNewTab,
      // bind after defined in sketch
      save: () => { },
      clear: () => { },
      swap: this.swapParams,
      fixedWidth: true,
      rotation: 0,
      cumulativeRotation: false,
      drawModes: { 'Grid': 0, 'Circle': 1, 'Grid2': 2 },
      drawMode: 0,
      fadeBackground: false,
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
        'cycle': 8,
        'solid': 9
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
    gui.add(allParams, 'name')
    gui.add(allParams, 'open')
    gui.add(allParams, 'save')
    gui.add(allParams, 'clear')
    gui.add(allParams, 'swap')
    gui.add(allParams, 'fixedWidth')
    gui.add(allParams, 'fadeBackground').listen()
    gui.add(allParams, 'invert').listen()
    gui.add(allParams, 'nextCharMode', allParams.nextCharModes).listen()
    gui.add(allParams, 'rotation').min(-360).max(360).step(1).listen()
    gui.add(allParams, 'cumulativeRotation').listen()
    gui.add(allParams, 'drawMode', allParams.drawModes).listen()
    gui.add(allParams, 'rows').min(1).max(allParams.rowmax).step(1).listen()
    gui.add(allParams, 'columns').min(1).max(allParams.colmax).step(1).listen()

    const addFlatParams = (gui, params, prefix) => {
      gui.add(params, `${prefix}_paintMode`, allParams.paintModes).listen() // work in-progress....
      gui.add(params, `${prefix}_transparent`).listen()
      gui.add(params, `${prefix}_transparency`).min(0).max(100).step(1)
      gui.addColor(params, `${prefix}_color`).listen()
      // NOTE: creating a "new" setting triggers this. hunh.
      // cm.onChange((m) => { params[`${prefix}_paintMode`] = 9 }) // auto-set to solid color mode
      const ccm = gui.add(params, `${prefix}_scheme`, schemeList).name(prefix)
      // NOTE: creating a "new" setting triggers this. hunh.
      // ccm.onChange((m) => { params[`${prefix}_paintMode`] = 8 }) // auto-set to cycle-mode
      let c = selectToRadios(ccm)
      c.__radios.map(colorLabel)
    }

    const fpGui = gui.addFolder('fillControls')
    addFlatParams(fpGui, allParams, 'fill')
    gui.add(allParams, 'useOutline').listen()
    const olGui = gui.addFolder('outlineControls')
    olGui.add(allParams, 'outline_strokeWeight').min(1).max(800).step(1)
    olGui.add(allParams, 'outline_strokeJoin', { 'MITER': 'miter', 'BEVEL': 'bevel', 'ROUND': 'round' })
    addFlatParams(olGui, allParams, 'outline')
    this.params = allParams
  }
}

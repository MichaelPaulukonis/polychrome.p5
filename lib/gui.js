var cvs
var setupGui = function () {
  cvs = document.getElementsByTagName('canvas')
  if (cvs && cvs[0]) {
    cvs = cvs[0]
  }
  setfocus()
}

var setfocus = function () {
  cvs.focus()
}

var openCanvasInNewTab = function () {
  if (cvs) {
    const img = cvs.toDataURL('image/jpg')
    // https://ourcodeworld.com/articles/read/682/what-does-the-not-allowed-to-navigate-top-frame-to-data-url-javascript-exception-means-in-google-chrome
    var win = window.open()
    win.document.write('<iframe src="' + img +
      '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>')
  }
}

var fc = document.getElementById('focus')
fc.onclick = setfocus

function colorLabel (label) {
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
  span.style.background = gradient(urlToColors(radio.value))
  span.style.paddingRight = '4em'
  span.style.marginRight = '.5em'
  label.appendChild(span)
}

// Adds and links labeled radios to select controller, hides select.
// Radios are wrapped inside labels and stored in controller.__radios.
function selectToRadios (controller) {
  var wrapper = controller.domElement
  var select = wrapper.children[0]

  wrapper.parentNode.parentNode.style.height = 'auto'
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

var currentColor
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

var params = {
  name: 'polychrome.text',
  open: openCanvasInNewTab,
  save: save_sketch,
  clear: clearCanvas,
  rotation: 0,
  paintMode: 0,
  drawMode: 0,
  transparent: false,
  transparency: 50,
  fadeBackground: false,
  invert: false,
  useOutline: false,
  nextCharMode: 0,
  color: '#fff000',
  scheme: 'ffffff-000000',
  curCycle: 0,
  donePainting: false,
  // outline
  outline: {
    paintMode: 0,
    transparency: 50,
    transparent: false,
    color: '#fff000',
    scheme: 'ffffff-000000',
    curCycle: 0,
    donePainting: false,
    strokeWeight: 0
  }
}
var gui = new dat.GUI()

gui.remember(params)
gui.add(params, 'name') // TODO: use for saving? eh, probably not.....

gui.add(params, 'open')
gui.add(params, 'save')
gui.add(params, 'clear')

gui.add(params, 'fadeBackground').listen()
gui.add(params, 'invert').listen()
gui.add(params, 'nextCharMode', {
  'Random': 0,
  'Sequential': 1
}).listen()
gui.add(params, 'rotation').min(0).max(360).step(15).listen()

gui.add(params, 'paintMode', {
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

gui.add(params, 'drawMode', { 'Grid': 0, 'Circle': 1 }).listen()

gui.add(params, 'transparent').listen()
gui.add(params, 'transparency').min(0).max(100).step(1).listen()

const cm = gui.addColor(params, 'color').listen()
cm.onChange((m) => {
  params.paintMode = 9
})

gui.add(params, 'useOutline').listen()

var olGui = gui.addFolder('outlineControls')
olGui.add(params.outline, 'strokeWeight').min(0).max(100).listen()

olGui.add(params.outline, 'paintMode', {
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
const ocm = olGui.addColor(params.outline, 'color').listen()
ocm.onChange((m) => {
  params.outline.paintMode = 9
})
olGui.add(params.outline, 'transparent').listen()
olGui.add(params.outline, 'transparency').min(0).max(100).step(1).listen()

const ccm = gui.add(params, 'scheme', schemeList).name('fill')
ccm.onChange((m) => { params.paintMode = 8 })

let c = selectToRadios(ccm)
c.__radios.map(colorLabel)

const occm = olGui.add(params.outline, 'scheme', schemeList).name('outline')
occm.onChange((m) => { params.outline.paintMode = 8 })
var oc = selectToRadios(occm)
oc.__radios.map(colorLabel)

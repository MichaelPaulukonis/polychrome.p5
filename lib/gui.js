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

var params = {
  name: 'polychrome.text',
  num: 23,
  winner: true,
  open: openCanvasInNewTab,
  save: save_sketch,
  clear: clearCanvas,
  rotation: 0,
  paintMode: 0,
  drawMode: 0,
  fadeBackground: true,
  invert: false,
  nextCharMode: 0,
  color0: [ 250, 100, 100 ]

}
var gui = new dat.GUI()

// String field
gui.add(params, 'name') // TODO: use for saving? eh, probably not.....

// Number field with slider
gui.add(params, 'rotation').min(0).max(360).step(15).listen()

gui.add(params, 'open')
gui.add(params, 'save')
gui.add(params, 'clear')
gui.add(params, 'paintMode', {
  'Rainbow1': 0,
  'Rainbow2': 1,
  'Rainbow3': 2,
  'Rainbow4': 3,
  'Black': 4,
  'White': 5,
  'Gray1': 6,
  'Gray2': 7,
  'test': 8,
  'solid': 9
}).listen() // work in-progress....

gui.add(params, 'drawMode', { 'Grid': 0, 'Circle': 1 }).listen()

gui.add(params, 'fadeBackground').listen()
gui.add(params, 'invert').listen()
gui.add(params, 'nextCharMode', {
  'Random': 0,
  'Sequential': 1
}).listen()
gui.addColor(params, 'color0').listen()
gui.remember(params)

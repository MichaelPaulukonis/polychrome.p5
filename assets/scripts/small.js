module.exports = {
  meta: 'recorded actions captured from the console so it is a start',
  script: [
    // { 'action': 'clearCanvas' }, // POC that commands works
    // { 'x': 762, 'y': 177.859375, 'action': 'paint' },
    // { 'x': 337, 'y': 289.859375, 'action': 'paint' },
    // { 'x': 340, 'y': 289.859375, 'action': 'paint' },
    // { 'x': 363, 'y': 289.859375, 'action': 'paint' },
    // { 'action': 'rotateCanvas', params: { direction: 1 } },
    // { 'x': 398, 'y': 285.859375, 'action': 'paint' },
    // { 'x': 432, 'y': 283.859375, 'action': 'paint' },
    // { 'x': 443, 'y': 282.859375, 'action': 'paint' },
    { 'action': 'text', 'params': { 'text': 'This is the text that was there when she called' } },
    { 'params': { 'x': 16, 'y': 19.859375 }, 'action': 'paint' },
    { 'action': 'config', 'params': { 'drawMode': 'Circle' } },

    { 'params': { 'x': 20, 'y': 30 }, 'action': 'paint' },
    // { 'action': 'save' },
    { 'params': { 'x': 100, 'y': 100 }, 'action': 'paint' },
    { params: { 'axis': 1, 'layer': 'layers.p5' }, 'action': 'flip' },
    // { 'action': 'save' },

    // { 'action': 'mirror', params: { axis: 1, layer: 'layers.p5' } },
    // TODO: record will only store 'p5' and we need the parent object blarg
    // we could something (at some point) parse through params for props, if not found, check child objects?
    { params: { 'axis': 0, 'layer': 'layers.p5' }, 'action': 'flip' }
    // { 'action': 'save' }
  ]
}

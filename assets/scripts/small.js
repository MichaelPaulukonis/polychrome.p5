module.exports = {
  meta: 'Sample of scriptable actions',
  script: [
    { action: 'clearCanvas', params: { layers: 'layers' } },

    { action: 'text', params: { text: 'This is the text that was there when she called' } },

    { action: 'config', params: { drawMode: 'Circle' } },

    { action: 'config', params: { capturing: true } },

    { action: 'config', params: { fixedWidth: true, font: 'AtariClassic-Regular' } },

    { params: { x: 16, y: 19.859375 }, action: 'paint' },

    { action: 'rotateCanvas', params: { direction: 1, layers: 'layers' } },

    { action: 'paint', params: { x: 20, y: 30 } },

    { action: 'paint', params: { x: 100, y: 100 } },

    // { 'action': 'mirror', params: { axis: 1, layer: 'layers.p5' } },
    // TODO: record will only store 'p5' and we need the parent object blarg
    // we could something (at some point) parse through params for props, if not found, check child objects?
    { action: 'flip', params: { axis: 0, layer: 'layers.p5' } },

    { action: 'macro', params: { macro: 'gridHere' } },

    { action: 'save' }
  ]
}

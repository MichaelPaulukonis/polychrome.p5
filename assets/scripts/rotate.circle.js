module.exports = {
  meta: 'Sample of scriptable actions',
  script: [
    { action: 'clearCanvas', params: { layers: 'layers' } },

    { action: 'text', params: { text: 'This is the text that was there when she called' } },

    {
      action: 'config',
      params: {
        drawMode: 'Circle',
        capturing: true,
        fixedWidth: true,
        Ffont: 'AtariClassic-Regular',
        arcOffset: 0,
        useOutline: false
      }
    },

    { action: 'paint', params: { x: 40, y: 30 } },

    { action: 'save' },

    {
      action: 'config',
      params: {
        arcOffset: 5
      }
    },

    { action: 'clearCanvas', params: { layers: 'layers' } },

    { action: 'paint', params: { x: 40, y: 30 } },

    { action: 'save' },

    {
      action: 'config',
      params: {
        arcOffset: 10
      }
    },

    { action: 'clearCanvas', params: { layers: 'layers' } },

    { action: 'paint', params: { x: 40, y: 30 } },

    { action: 'save' }

  ]
}

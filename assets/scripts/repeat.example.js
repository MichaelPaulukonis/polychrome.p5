module.exports = {
  meta: 'example of proposed loop',
  script: [
    { action: 'clearCanvas', params: { layers: 'layers' } },

    { action: 'text', params: { text: 'again again again again ' } },

    { action: 'config', params: { drawMode: 'Grid2' } },

    {
      action: 'repeat',
      count: 5,
      actions: [
        { action: 'paint', params: { x: 20, y: 30 } },
        { action: 'rotateCanvas', params: { direction: 1, layers: 'layers' } },
        { action: 'macro', params: { macro: 'gridHere' } }
      ]
    },

    { action: 'save' }
  ]
}

export const meta = 'example of proposed loop'
export const script = [
  { action: 'clearCanvas', params: { layers: 'layers' } },

  { action: 'text', params: { text: 'again again again again ' } },

  { action: 'config', params: { drawMode: 'Grid2' } },

  {
    action: 'repeat',
    count: 5,
    func: '', // something, who knows. ugh.
    actions: [
      { action: 'paint', params: { x: 20, y: 30 } },
      { action: 'rotateCanvas', params: { direction: 1, layers: 'layers' } },
      { action: 'macro', params: { macro: 'gridHere' } }
    ]
  },

  { action: 'save' }
]

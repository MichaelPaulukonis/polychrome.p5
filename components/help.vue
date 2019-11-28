<template lang="pug">
    div#helpbox
        p Mouse click and drag to paint with text.
        p Color and size are based on mouse position.
        p Edit canvas size, fill color, outlines, font choice etc. with panels to the right
        h3 Keys
        #keys(v-for="key in keymap" v-bind:key='key.key')
            span #[span.key {{ key.keys.join(', ') }} ] {{ key.note }}

</template>

<script>
const keymap = [
  {
    keys: ['t'],
    note: 'Mirror left-side to right'
  },
  {
    keys: ['T'],
    note: 'Mirror top to bottom'
  },
  {
    keys: ['DEL', 'BACKSPACE'],
    note: 'Clear canvas. Will repaint with default fill color, and resize to width/height'
  },
  {
    keys: ['LEFT, RIGHT'],
    note: 'Shift canvas left or right. Shift increases size.'
  },
  {
    keys: ['UP, DOWN'],
    note: 'Shift canvas up or down. Shift increases size.'
  },
  {
    keys: ['a'],
    note: 'Rotate paint origin to new corner (works weirdly unless canvas is a square.'
  },
  {
    keys: ['alt+e'],
    note: 'Switch hardEdge (for history paste) on/off'
  },
  {
    keys: ['command+s'],
    note: 'save sketch'
  },
  {
    keys: ['alt+g'],
    note: 'adjust gamma (amount in PolychromeText panel)'
  },
  {
    keys: ['f', 'shift+f'],
    note: 'Flip vertical or horizontal (shift)'
  },
  {
    keys: ['space'],
    note: 'draw once at mouse location'
  },
  {
    keys: ['o', 'shift+o'],
    note: 'Switch outline on/off'
  },
  {
    keys: ['q', 'Q'],
    note: 'Rotate canvas clockwise or counter-clockwise'
  },
  {
    keys: ['u', 'U'],
    note: 'undo, re-do'
  },
  {
    keys: ['g'],
    note: 'Overlay random history snapshot at random location, random rotation, random transparency (no snapshot taken)'
  },
  {
    keys: ['G'],
    note: 'Manual snapshot for history (for actions that don\'t take snapshots'
  }
]

export default {
  data () {
    return { keymap }
  }
}
</script>

<style scoped>
#helpbox {
    margin: 10px;
}

.key {
  font-family: monospace;
}
</style>

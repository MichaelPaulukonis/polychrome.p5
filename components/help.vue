<template lang="pug">
div#helpbox
    p.intro-paragraph Mouse click and drag to paint with text.
    p.intro-paragraph Color and size are based on mouse position.
    p.intro-paragraph Edit canvas size, fill color, outlines, font choice etc. with panels to the right
    h3.section-header Keys
    #keys(v-for="key in keymap" v-bind:key='key.key')
        span #[span.key {{ key.keys.join(', ') }} ] {{ key.note }}

</template>

<script setup>
const keymap = [
  {
    keys: ['t'],
    note: 'Mirror canvas vertically'
  },
  {
    keys: ['SHIFT+T'],
    note: 'Mirror canvas horizontally'
  },
  {
    keys: ['DEL', 'BACKSPACE'],
    note: 'Clear canvas. Will repaint with default fill color, and resize to width/height'
  },
  {
    keys: ['LEFT', 'SHIFT+LEFT', 'RIGHT', 'SHIFT+RIGHT'],
    note: 'Shift canvas left or right. Shift increases size.'
  },
  {
    keys: ['UP', 'SHIFT+UP', 'DOWN', 'SHIFT+DOWN'],
    note: 'Shift canvas up or down. Shift increases size.'
  },
  {
    keys: ['z'],
    note: 'Shift canvas left (small increment)'
  },
  {
    keys: ['SHIFT+Z'],
    note: 'Shift canvas right (small increment)'
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
    note: 'Save sketch'
  },
  {
    keys: ['SHIFT+COMMAND+S'],
    note: 'Toggle capturing'
  },
  {
    keys: ['alt+s'],
    note: 'Shift fill colors'
  },
  {
    keys: ['alt+shift+s'],
    note: 'Shift outline colors'
  },
  {
    keys: ['alt+g'],
    note: 'Adjust gamma (amount in PolychromeText panel)'
  },
  {
    keys: ['f', 'shift+f'],
    note: 'Flip vertical or horizontal (shift)'
  },
  {
    keys: ['space'],
    note: 'Draw once at mouse location'
  },
  {
    keys: ['m'],
    note: 'Next drawing mode'
  },
  {
    keys: ['SHIFT+M'],
    note: 'Previous drawing mode'
  },
  {
    keys: ['o', 'shift+o'],
    note: 'Switch outline on/off'
  },
  {
    keys: ['q', 'SHIFT+Q'],
    note: 'Rotate canvas clockwise or counter-clockwise'
  },
  {
    keys: ['r', 'SHIFT+R'],
    note: 'Reset parameters'
  },
  {
    keys: ['u', 'SHIFT+U'],
    note: 'Undo, re-do'
  },
  {
    keys: ['g'],
    note: 'Overlay random history snapshot at random location, random rotation, random transparency (no snapshot taken)'
  },
  {
    keys: ['SHIFT+G'],
    note: 'Manual snapshot for history (for actions that don\'t take snapshots'
  },
  {
    keys: ['alt+1'],
    note: 'Macro: gridHere'
  },
  {
    keys: ['alt+2'],
    note: 'Macro: manyRandoms'
  },
  {
    keys: ['alt+3'],
    note: 'Macro: smallRandomAtSomePlace'
  },
  {
    keys: ['alt+4'],
    note: 'Macro: largestCircleWidth'
  },
  {
    keys: ['alt+5'],
    note: 'Macro: thoseCircles'
  },
  {
    keys: ['alt+6'],
    note: 'Macro: thoseCirclesBig'
  },
  {
    keys: ['alt+7'],
    note: 'Macro: bigCircleLowerRightCenter'
  }
]
</script>

<style scoped>
#helpbox {
  margin: 10px;
}

.key {
  font-family: monospace;
}

.intro-paragraph {
  margin: 0;
}

.section-header {
  margin-top: 1rem;
}
</style>

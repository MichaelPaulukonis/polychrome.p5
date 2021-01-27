<template lang="pug">
#playback
  textarea#script(placeholder="[script goes here]", v-model="editableScript")

  #buttons
    button(@click="playback") Playback
    button(@click="output") Output recording
</template>

<script>
import { playScript } from '@/assets/javascript/playback'
import recording from '@/assets/scripts/small.js'

export default {
  props: {
    pchrome: {
      type: Object,
      default () {
        return {}
      }
    },
    script: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      defaultScript: recording.script,
      editableScript: ''
    }
  },
  mounted () {
    const s = (this.script && this.script.length > 0) || this.defaultScript
    this.editableScript = this.formatDisplay(s)
  },
  methods: {
    output () {
      const pScript = this.pchrome.output()
      this.editableScript = this.formatDisplay(pScript)
    },
    playback () {
      this.pchrome.appMode = this.pchrome.APP_MODES.PLAYBACK
      playScript(this.defaultScript, this.pchrome)
      this.pchrome.appMode = this.pchrome.APP_MODES.STANDARD_DRAW
    },
    formatDisplay (lines) {
      return lines.map(JSON.stringify).join('\n')
    }
  }
}
</script>

<style scoped>
#script {
  box-sizing: border-box;
  padding: 1rem;
  margin: auto;
  /* min-height: 50vh;
  max-height: 50vh; */
  height: 50vh;
  width: 100%;
  border: 1px solid #000;
}

#playback {
  margin: 1rem;
  padding: 1rem;
}
</style>

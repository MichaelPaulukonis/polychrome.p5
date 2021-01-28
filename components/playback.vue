<template lang="pug">
#playback
  textarea#script(
    placeholder="[script goes here]",
    v-model="editableScript"
  )

  #buttons
    button(@click="playback") Playback
    button(@click="output") Output recording
    button(@click="keep") Keep script

  #error(v-if="errorMessage" @click="clearMessages")
    p {{ errorMessage }}
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
      editableScript: '',
      errorMessage: ''
    }
  },
  mounted () {
    const s = (this.script && this.script.length > 0) ? this.script : this.defaultScript
    this.editableScript = this.stringify(s)
  },
  methods: {
    output () {
      const pScript = this.pchrome.output()
      this.editableScript = this.stringify(pScript)
    },
    playback () {
      try {
        this.pchrome.appMode = this.pchrome.APP_MODES.PLAYBACK
        playScript(this.jsonify(), this.pchrome)
        this.pchrome.appMode = this.pchrome.APP_MODES.STANDARD_DRAW
        this.pchrome.stop()
      } catch (err) {
        this.errorMessage = err
      }
    },
    keep () {
      this.$emit('scriptUpdated', this.jsonify())
    },
    stringify (lines) {
      return lines.map(JSON.stringify).join('\n')
    },
    jsonify () {
      try {
        const stringyArray = this.editableScript.split('\n').filter(l => l.trim().length > 0).map(JSON.parse)
        return stringyArray
      } catch (err) {
        this.errorMessage = err
        return []
      }
    },
    clearMessages () {
      this.errorMessage = ''
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

#error {
  background: red;
}
</style>

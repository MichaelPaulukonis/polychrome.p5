<template lang="pug">
  dat-gui(
    closetext='Close controls'
    opentext='Open controls'
    closeposition='bottom'
    @onchange="$emit('paramChange', params)"
  )
    dat-number(v-model='width' label='width')
    dat-number(v-model='height' label='height')
    dat-button(@click='save' label='save sketch')
    dat-button(@click='clear' label='clear sketch')
    dat-button(@click='swap' label='swap params')
    dat-string(v-model='title' label='Title')
    dat-folder(label='misc')
      dat-boolean(v-model='hardEdge' label='hardEdge')
      dat-boolean(v-model='useShadow' label='shadow')
      dat-number(v-model='shadowOffsetX' :min='-100' :max='100' :step='1' label='Offset X')
      dat-number(v-model='shadowOffsetY' :min='-100' :max='100' :step='1' label='Offset Y')
      dat-number(v-model='shadowBlur' :min='1' :max='100' :step='1' label='shadowBlur')
      dat-color(v-model='shadowColor' label='Color')
      dat-number(v-model='gamma' :min='0.01' :max='9.99' :step='0.01' label='gamma')
      // put the invert etc stuff that not in folder in misc folder (ugh!)
      dat-boolean(v-model='invert' label='invert XY')
      dat-select(v-model='nextCharMode' :items='characterModes' label="charMode")
      dat-boolean(v-model='fixedWidth' label='fixedWidth')
      dat-select(v-model='font' :items='fonts' label="font")
      dat-button(@click='triggerAlert' label='alert')
</template>

<script>
import Vue from 'vue'
import DatGui from '@cyrilf/vue-dat-gui'
// import { allParams, paramsInitial, fourRandoms, drawModes } from '@/assets/javascript/params.js'
import { paramsInitial, drawModes } from '@/assets/javascript/params.js'
import fontList from '@/assets/javascript/fonts'

Vue.use(DatGui)

const params = { ...paramsInitial }

export default {
  data: () => ({
    ...paramsInitial,
    drawModes,
    fontList,
    params: paramsInitial
  }),
  computed: {
    fonts () {
      return fontList.map(f => ({ name: f, value: f }))
    },
    characterModes () {
      return Object.keys(paramsInitial.nextCharModes).map(k => ({
        name: k,
        value: paramsInitial.nextCharModes[k]
      }))
    }
  },
  methods: {
    triggerAlert () {
      alert(JSON.stringify(params))
    }
  }
}
</script>

<style>
.vue-dat-gui .group.group--main > ul {
  max-height: 75vh;
}
</style>

<template lang="pug">
  dat-gui(
    closetext='Close controls'
    opentext='Open controls'
    closeposition='bottom'
  )
    dat-number(v-model='params.width' label='width')
    dat-number(v-model='params.height' label='height')
    dat-button(@click='save' label='save sketch')
    dat-button(@click='clear' label='clear sketch')
    dat-button(@click='swap' label='swap params')
    dat-string(v-model='params.name' label='Title')
    dat-folder(label='misc')
      dat-boolean(v-model='params.hardEdge' label='hardEdge')
      dat-boolean(v-model='params.useShadow' label='shadow')
      dat-number(v-model='params.shadowOffsetX' :min='-100' :max='100' :step='1' label='Offset X')
      dat-number(v-model='params.shadowOffsetY' :min='-100' :max='100' :step='1' label='Offset Y')
      dat-number(v-model='params.shadowBlur' :min='1' :max='100' :step='1' label='shadowBlur')
      dat-color(v-model='params.shadowColor' label='Color')
      dat-number(v-model='params.gamma' :min='0.01' :max='9.99' :step='0.01' label='gamma')
      // put the invert etc stuff that not in folder in misc folder (ugh!)
      dat-boolean(v-model='params.invert' label='invert XY')
      dat-select(v-model='params.nextCharMode' :items='characterModes' label="charMode")
      dat-boolean(v-model='params.fixedWidth' label='fixedWidth')
      dat-select(v-model='params.font' :items='fonts' label="font")
      dat-number(v-model='params.rotation' :min='-360' :max='360' :step='1' label='rotation')
      dat-boolean(v-model="params.cumulativeRotation" label="cumulativeRotation")
    dat-folder(label='RowCol')
      dat-number(v-model='params.rows' :min='1' :max='rowmax' :step='1' label='rows')
      dat-number(v-model='params.columns' :min='1' :max='rowmax' :step='1' label='columns')
    dat-folder(label='fillControls')

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
    params
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
  watch: {
    params: {
      deep: true,
      handler () {
        this.$emit('paramChange', params)
      }
    }
  },
  methods: {
    triggerAlert () {
      this.$emit('paramChange', params)
    }
  }
}
</script>

<style>
.vue-dat-gui .group.group--main > ul {
  max-height: 75vh;
}
</style>

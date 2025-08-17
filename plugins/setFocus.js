export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('setFocus', () => {
    document.getElementsByTagName('canvas')[0].focus()
  })
})
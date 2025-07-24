<template lang="pug">
  div#about
    h1 A multi-color (polychrome) text-painter by
    h2 #[a(href='http://michaelpaulukonis.github.io') Michael Paulukonis]

    h1#sources Source code: #[a(href='https://github.com/MichaelPaulukonis/polychrome.p5') GitHub]

    h1(style='margin-top:-10px;')  Version: {{ appVersion }}

    h3 More #[a(href='https://michaelpaulukonis.github.io/sketches/') Web Sketches]

    h1 Built with #[a(href='https://p5js.org/') P5] and #[a(href='https://nuxtjs.org') Nuxt]

</template>

<script>
export default {
  computed: {
    appVersion() {
      return process.env.appVersion
    }
  }
}
</script>

<style scoped>
#about {
  margin: 10px;
}
</style>

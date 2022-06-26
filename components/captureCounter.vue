<template lang="pug">
#counter {{ count }} / {{ total }}
</template>

<script>

export default {
  props: {
    total: 0,
    count: 0
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
#counter {
  display: inline-block;
  padding: 1rem 2rem;
  margin: 0 1rem 1rem 0;
  height: 3rem;
  background-color: $primary;
  text-decoration: none;
  color: #ffffff;
  cursor: pointer;
  border: 0;
  text-align: center;
}
</style>

<template>

</template>

<script>
  export default {
    name: 'index_skip',
    data () {
      return {}
    },
    mounted() {
      this.$router.replace({
        path: '/show/index',
        name: 'show'
      })
    }
  }
</script>

<style scoped>

</style>

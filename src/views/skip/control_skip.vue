<template>

</template>

<script>
  export default {
    name: 'control_skip',
    data () {
      return {}
    },
    mounted() {
      this.$router.replace({
        path: '/remote_control',
        name: 'remote_control'
      })
    }
  }
</script>

<style scoped>

</style>

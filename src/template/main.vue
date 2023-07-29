<script>
import App from './App.vue'
import { setupOpenTiny } from './opentiny.js'

export default {
  mounted() {
    setupOpenTiny()
  },
  components: {
    App
  }
}
</script>

<template>
  <App />
</template>

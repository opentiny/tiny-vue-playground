<script>
import App from './App.vue'

export default {
  components: {
    App
  },
  methods: {
    loadStyle() {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/@opentiny/vue-theme/index.css'
        link.addEventListener('load', resolve)
        link.addEventListener('error', reject)
        document.body.append(link)
      })
    }
  },
  created() {
    this.loadStyle()
  }
}
</script>

<template>
  <App />
</template>

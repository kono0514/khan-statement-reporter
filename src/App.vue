<template>
  <div id="app">
    <router-view/>

    <app-version></app-version>
  </div>
</template>

<script>
import AppVersion from './components/AppVersion.vue'

export default {
  components: {
    AppVersion,
  },
  created() {
    let shell = require('electron').shell
    document.addEventListener('click', function (event) {
      var a = event.target.closest('a');

      if (a && a.className.includes('external')) {
        event.preventDefault()
        shell.openExternal(a.href)
      }
    })
  }
}
</script>

<style>
</style>

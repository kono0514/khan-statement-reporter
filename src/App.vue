<template>
  <div id="app" class="min-h-screen">
    <router-view/>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['darkModeEnabled']),
  },
  watch: {
    darkModeEnabled: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          document.querySelector('html').classList.add('dark');
        } else {
          document.querySelector('html').classList.remove('dark');
        }
      }
    }
  },
  created() {
    let shell = require('electron').shell;
    document.addEventListener('click', function (event) {
      var a = event.target.closest('a');

      if (a && a.className.includes('external')) {
        event.preventDefault();
        shell.openExternal(a.href);
      }
    });
  }
}
</script>

<style>
</style>

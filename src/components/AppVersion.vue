<template>
  <div class="fixed right-0 bottom-0 bg-gray-400 py-1 px-2 text-xs">
    <a class="external" href="https://github.com/kono0514/khan-statement-reporter/releases">
      <span>Current version: {{ appVersion }}</span>
      <span class="ml-1" v-show="updateMessage != ''">({{ updateMessage }})</span>
    </a>
  </div>
</template>

<script>
import { remote } from 'electron'
const { ipcRenderer } = require('electron')

export default {
  name: 'app-version',
  data() {
    return {
      updateMessage: ''
    };
  },
  created() {
    this.appVersion = remote.app.getVersion();

    ipcRenderer.on('update', (event, message) => {
      this.updateMessage = message;
    });
  }
}
</script>

<style>

</style>
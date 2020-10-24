<template>
  <div class="h-screen flex justify-center items-center flex-col px-4">
    <h1 class="text-gray-300">{{ status }}</h1>
    <t-button v-show="enableRestartButton" @click="restart" class="mt-2">Restart</t-button>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');

export default {
  name: 'update-checker',
  data() {
    return {
      status: 'Checking for update... Please wait',
      enableRestartButton: false
    }
  },
  methods: {
    restart() {
      ipcRenderer.send('restart');
    }
  },
  created() {
    if (process.env.NODE_ENV === 'development') {
      return this.$router.replace('/home');
    }

    setTimeout(() => {
      ipcRenderer.send('checkForUpdate');
    }, 1000);

    ipcRenderer.on('update', (event, message) => {
      this.status = message;

      if (message.includes('Up to date')) {
        this.$router.replace('/home');
      } else if (message.includes('Update downloaded')) {
        this.enableRestartButton = true;
      }
    });
  }
}
</script>

<style>

</style>
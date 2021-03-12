<template>
  <div class="h-screen flex justify-center items-center flex-col px-4 space-y-6">
    <svg v-show="updateInProgress" class="animate-spin h-12 w-12 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <h1 class="dark:text-gray-300">{{ updateMessage }}</h1>
    <t-button v-show="successful" @click="restart()" class="mt-2">Restart</t-button>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');

export default {
  name: 'update-checker',
  data() {
    return {
      updateMessage: 'Checking for update... Please wait',
      updateInProgress: true,
    };
  },
  computed: {
    successful() {
      return !this.updateInProgress && this.updateMessage.includes('Update downloaded');
    },
  },
  methods: {
    restart() {
      ipcRenderer.send('restart');
    },
    proceed() {
      this.$router.replace('/home').catch(() => {});
    },
  },
  created() {
    if (process.env.NODE_ENV === 'development' || process.platform !== 'win32') {
      return this.proceed();
    }

    setTimeout(() => {
      ipcRenderer.send('checkForUpdate');
    }, 1000);

    ipcRenderer.on('update', (event, message) => {
      if (message.status.includes('Up to date')) {
        this.proceed();
      }

      this.updateInProgress = !message.finished;
      this.updateMessage = message.status;
    });
  },
};
</script>

<style>

</style>

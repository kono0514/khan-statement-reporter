<template>
  <round-button
    v-tippy
    :content="tooltip"
    @click="checkForUpdate()"
  >
    <div v-show="updating" class="absolute inset-0 flex justify-center items-center">
      <svg class="animate-spin h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    <svg :class="{invisible: updating}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
  </round-button>
</template>

<script>
const { ipcRenderer } = require('electron')

export default {
  name: 'updater-info',
  data() {
    return {
      updateMessage: '',
    }
  },
  computed: {
    updating() {
      return this.updateMessage !== '';
    },
    tooltip() {
      return this.updating ? this.updateMessage : 'Update';
    }
  },
  methods: {
    checkForUpdate() {
      ipcRenderer.send('checkForUpdate');
    }
  },
  created() {
    ipcRenderer.on('update', (event, message) => {
      this.updateMessage = message;
    });
  },
}
</script>

<style>

</style>

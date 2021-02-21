<template>
  <div :class="backgroundClass" class="flex self-start space-x-1.5 py-1 px-2 mb-1 rounded-md">
    <div :class="iconClass">
      <svg v-if="error" class="self-start flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 20px;">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <svg v-else-if="running" class="animate-spin self-start flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width: 20px;">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <svg v-else class="self-start flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 20px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div :class="textClass" class="text-sm leading-5">
      <span v-if="error" v-html="error"></span>
      <span v-else-if="running">Running...</span>
      <span v-else>Idle</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'app-status',
  computed: {
    backgroundClass() {
      return {
        'bg-green-300': this.running,
        'bg-red-300': this.error !== null,
        'bg-blue-300': !this.running && this.error === null,
      };
    },
    iconClass() {
      return {
        'text-green-600': this.running,
        'text-red-600': this.error !== null,
        'text-blue-600': !this.running && this.error === null,
      };
    },
    textClass() {
      return {
        'text-green-800': this.running,
        'text-red-800': this.error !== null,
        'text-blue-800': !this.running && this.error === null,
      };
    },
    ...mapState(['running', 'error']),
  },
};
</script>

<style>

</style>

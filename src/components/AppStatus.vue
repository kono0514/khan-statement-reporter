<template>
  <t-alert :variant="variant" show :dismissible="false">
    <div v-html="text"></div>
  </t-alert>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'app-status',
  computed: {
    variant() {
      return this.running ? 'success' : 'danger';
    },
    text() {
      let text = '';
      text += this.running ? 'RUNNING' : 'STOPPED';
      text += this.error === null ? '' : `: ${this.error}`;
      return text;
    },
    ...mapState(['running', 'error']),
  }
}
</script>

<style>

</style>
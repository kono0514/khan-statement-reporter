<template>
  <div>
    <nav-bar></nav-bar>

    <div class="mt-4 px-3">
      <app-status></app-status>
      <t-button @click="start" class="my-4 mr-2">Start</t-button>
      <t-button @click="stop" class="my-4">Stop</t-button>

      <t-card class="w-full">
        <template v-slot:header>
          <div>
            <span class="font-semibold text-gray-900 dark:text-gray-200 text-base">Request Log</span>
            <div class="text-sm dark:text-gray-400">Банкнаас хуулга татсан түүх</div>
          </div>
        </template>

        <t-textarea :value="logs" rows="7" placeholder="Request log" readonly class="w-full text-sm select-auto dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200" />
      </t-card>
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import AppStatus from '../components/AppStatus.vue'
const { ipcRenderer } = require('electron')

export default {
  name: 'Home',
  components: {
    NavBar,
    AppStatus,
  },
  computed: {
    logs() {
      return this.$store.state.logs.slice(0).reverse().join('\n');
    },
  },
  methods: {
    start() {
      this.$store.dispatch('start');
    },
    stop() {
      if (this.$store.state.running) {
        this.$store.dispatch('stop');
      }
    }
  },
  created() {
    ipcRenderer.send('validateNow');
    ipcRenderer.on('logout', () => {
      this.$auth.logout();
    });
  }
}
</script>

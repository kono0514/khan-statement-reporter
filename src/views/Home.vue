<template>
  <div>
    <nav-bar></nav-bar>

    <div class="mt-4 px-3">
      <app-status></app-status>
      <div class="flex flex-col my-4 items-start">
        <div class="flex mb-2">
          <t-button @click="start" class="mr-4" :disabled="running">Start</t-button>
          <label class="flex items-center" :class="{'opacity-25': running}">
            <input type="checkbox" class="form-checkbox transition duration-150 ease-in-out" :checked="recoverMissedAtStart" :disabled="running" @change="toggleRecoverMissedAtStart()">
            <span class="ml-2 text-xs text-gray-400">Өмнөх 3 өдрийн бүртгэгдээгүй орлогыг Donation Goal-д нэмэх (Alert явуулахгүйгээр)</span>
          </label>
        </div>
        <t-button @click="stop" :disabled="!running">Stop</t-button>
      </div>

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
import { mapState, mapActions } from 'vuex'
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
    ...mapState(['running', 'recoverMissedAtStart'])
  },
  methods: {
    start() {
      this.$store.dispatch('start');
    },
    stop() {
      if (this.$store.state.running) {
        this.$store.dispatch('stop');
      }
    },
    ...mapActions(['toggleRecoverMissedAtStart']),
  },
  created() {
    ipcRenderer.send('validateNow');
    ipcRenderer.on('logout', () => {
      this.$auth.logout();
    });
  }
}
</script>

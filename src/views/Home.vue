<template>
  <div>
    <nav-bar></nav-bar>

    <div class="flex flex-col mt-8 px-4 space-y-6 text-black dark:text-gray-200">
      <div class="rounded-md shadow-md p-4 bg-gray-200 dark:bg-gray-700 flex items-center space-x-2">
        <round-button
          backgroundClass="bg-gray-700 dark:bg-gray-300 hover:bg-gray-800 dark:hover:bg-gray-400"
          v-tippy
          :content="running ? 'Stop' : 'Start'"
          @click="running ? stop() : start()"
        >
          <svg v-show="!running" class="text-gray-200 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="6 6 12 12" stroke="currentColor" style="width: 36px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="0.7" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
          <svg v-show="running" class="text-gray-200 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="7.6 5 14 14" stroke="currentColor" style="width: 36px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M 13 9 v 6 m 4 -6 v 6 z" />
          </svg>
        </round-button>
        <span></span>
        <div class="flex flex-col">
          <app-status></app-status>
          <span
            class="text-sm"
          >
            Сүүлд шалгасан:
            <time-ago
              v-if="lastLogTimestamp"
              v-tippy
              :content="lastLogTimestampTooltip"
              :datetime="lastLogTimestamp"
              :interval="1000"
              :with-suffix="true"
            ></time-ago>
            <span v-else>N/A</span>
          </span>
        </div>
        <div class="flex-1"></div>
        <router-link
          tag="round-button"
          backgroundClass="hover:bg-gray-300 dark:hover:bg-gray-800"
          class="dark:hover:bg-gray-800"
          :to="{name: 'Config'}"
          v-tippy
          content="Config"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </router-link>
        <round-button
          class="hover:bg-gray-300 dark:hover:bg-gray-800"
          v-tippy
          content="Open Logs Window"
          @click="openDownloadLog()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </round-button>
        <round-button
          class="hover:bg-gray-300 dark:hover:bg-gray-800"
          v-tippy
          :content="copyTooltipText"
          @hidden="onCopyLogTooltipHide()"
          @click="copyLogFilePath()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </round-button>
      </div>

      <support-links class="flex justify-end space-x-2"></support-links>
    </div>

    <router-view></router-view>
  </div>
</template>

<script>
import AppStatus from '@/components/AppStatus.vue';
import NavBar from '@/components/NavBar.vue';
import TimeAgo from '@/components/TimeAgo.vue';
import SupportLinks from '@/components/SupportLinks.vue';
import { mapState } from 'vuex';
import { logout } from '@/helpers/auth';
const { ipcRenderer, clipboard } = require('electron');

export default {
  name: 'Home',
  components: {
    AppStatus,
    NavBar,
    TimeAgo,
    SupportLinks,
  },
  data() {
    return {
      copyTooltipText: 'Copy Log Path',
    };
  },
  computed: {
    logs() {
      return this.$store.state.logs.logs.slice(0).reverse().join('\n');
    },
    ...mapState({
      running: state => state.scraper.running,
      error: state => state.scraper.error,
      lastLogTimestamp: state => state.logs.lastLogTimestamp,
    }),
    lastLogTimestampTooltip() {
      if (this.lastLogTimestamp) {
        return this.lastLogTimestamp.toFormat('yyyy/MM/dd HH:mm:ss');
      }
      return 'N/A';
    },
  },
  methods: {
    start() {
      this.$store.dispatch('start');
    },
    stop() {
      if (this.$store.state.scraper.running) {
        this.$store.dispatch('stop');
      }
    },
    copyLogFilePath() {
      const logPath = ipcRenderer.sendSync('getMainLogPath');
      clipboard.writeText(logPath);
      this.copyTooltipText = 'Copied!';
    },
    onCopyLogTooltipHide() {
      this.copyTooltipText = 'Copy Log Path';
    },
    openDownloadLog() {
      ipcRenderer.send('openDownloadLogWindow');
    },
  },
  created() {
    ipcRenderer.send('validateNow');
    ipcRenderer.on('logout', () => {
      logout();
    });
  },
};
</script>

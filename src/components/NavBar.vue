<template>
  <header class="z-30 w-full bg-white dark:bg-gray-800 px-4 py-2 shadow">
    <div class="mx-auto flex justify-between items-center">
      <div class="flex items-center">
        <img src="@/assets/logo.png" alt="" width="36" class="mr-2">
        <span class="flex items-center dark:text-gray-100">
          Khan Statement Reporter
          <a href="https://github.com/kono0514/khan-statement-reporter/releases" class="external ml-1 text-blue-500 underline hover:text-blue-600">{{ appVersion }}</a>
        </span>
      </div>
      <div class="flex items-center space-x-1">
        <template v-if="$auth.check()">
          <user-info></user-info>
          <span></span>
          <updater-info></updater-info>
          <theme-switcher></theme-switcher>
          <round-button
            v-tippy
            content="Logout"
            @click="logout()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 24px;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </round-button>
        </template>
        <template v-else>
          <theme-switcher></theme-switcher>
        </template>
      </div>
    </div>
  </header>
</template>

<script>
import UserInfo from '@/components/UserInfo.vue';
import UpdaterInfo from '@/components/UpdaterInfo.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import { logout } from '@/helpers/auth';
import { remote } from 'electron';

export default {
  name: 'navbar',
  components: {
    UserInfo,
    UpdaterInfo,
    ThemeSwitcher,
  },
  methods: {
    logout() {
      logout();
    },
  },
  created() {
    this.appVersion = remote.app.getVersion();
  },
};
</script>

<style>

</style>

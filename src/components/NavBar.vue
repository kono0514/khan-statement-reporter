<template>
  <header class="z-30 w-full bg-white dark:bg-gray-800 px-4 py-2 shadow">
    <div class="mx-auto flex justify-between items-center">
      <div class="flex items-center">
        <img src="@/assets/logo.png" alt="" width="36" class="mr-2">
        <span class="flex items-center dark:text-gray-100">
          Khan Statement Reporter
        </span>
      </div>
      <div class="flex items-center space-x-3">
        <t-dropdown>
          <div
            slot="trigger"
            slot-scope="{
              mousedownHandler,
              focusHandler,
              blurHandler,
              keydownHandler,
            }"
          >
            <button
              class="rounded-full border-2 border-solid border-white bg-white focus:shadow-outline focus:outline-none"
              @mousedown="mousedownHandler"
              @focus="focusHandler"
              @blur="blurHandler"
              @keydown="keydownHandler"
            >
              <img :src="$auth.user().profile_photo_url" class="w-8 h-8 rounded-full bg-primary-light" />
            </button>
          </div>
          <div class="py-1 rounded-md shadow-xs" slot-scope="{ hide }">
            <p class="px-2 py-2 text-gray-600 text-xs w-full uppercase tracking-wider font-bold leading-none dark:text-gray-500">
                {{ $auth.user().name }}
            </p>
            <router-link tag="span" class="dropdown-item" :to="{name: 'Modal'}">Bank Credentials</router-link>
            <span class="dropdown-item" role="menuitem" @click="checkForUpdate(); hide();">Check Update</span>
            <span
              class="dropdown-item"
              role="menuitem"
              @click="logout"
            >
              Log out
            </span>
          </div>
        </t-dropdown>
      </div>
    </div>
  </header>
</template>

<script>
const { ipcRenderer } = require('electron');
import ElectronStore from 'electron-store';
const electronStore = new ElectronStore();

export default {
  name: 'navbar',
  methods: {
    logout() {
      electronStore.clear();
      this.$auth.logout();
    },
    checkForUpdate() {
      ipcRenderer.send('checkForUpdate');
    }
  }
}
</script>

<style>

</style>
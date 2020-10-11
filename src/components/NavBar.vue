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
          <div class="py-1 rounded-md shadow-xs">
            <p class="px-2 py-2 text-gray-600 text-xs w-full uppercase tracking-wider font-bold leading-none dark:text-gray-500">
                {{ $auth.user().name }}
            </p>
            <router-link tag="span" class="dropdown-item" :to="{name: 'Modal'}">Bank Credentials</router-link>
            <span
              class="dropdown-item"
              role="menuitem"
              @click="logout"
            >
              Log out
            </span>
          </div>
        </t-dropdown>
        <!-- <div>
          <button class="btn btn-white rounded-full p-0" @click="showDropdown = !showDropdown">
            <div class="avatar avatar-sm">
              <img :src="$auth.user().profile_photo_url" />
            </div>
          </button>
          <transition
            enter-active-class="transition-all transition-fastest east-out-quad"
            leave-active-class="transition-all transition-faster east-in-quad"
            enter-class="opacity-0"
            enter-to-class="opacity-100"
            leave-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div class="dropdown-list right-0 dark:bg-gray-800 dark:border-gray-700" id="color-menu" v-if="showDropdown" v-click-outside="hideDropdown">
              <p class="dropdown-header dark:text-gray-500">
                {{ $auth.user().name }}
              </p>
              <change-bank-credentials></change-bank-credentials>
              <span class="dropdown-item cursor-pointer dark:text-gray-300 dark:hover:bg-gray-700" @click="logout">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  class="mr-2 dark:text-gray-500"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Log out
              </span>
            </div>
          </transition>
        </div> -->
      </div>
    </div>
  </header>
</template>

<script>
import ElectronStore from 'electron-store';
const electronStore = new ElectronStore();

export default {
  name: 'navbar',
  data() {
    return {
      showDropdown: false,
    };
  },
  methods: {
    logout() {
      electronStore.clear();
      this.$auth.logout();
    },
    hideDropdown() {
      this.showDropdown = false;
    }
  }
}
</script>

<style>

</style>
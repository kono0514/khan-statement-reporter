<template>
  <div id="app" class="min-h-screen">
    <router-view/>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { clearBankUsername, clearBankPassword } from '@/helpers/credentials';

export default {
  computed: {
    ...mapState({
      darkModeEnabled: state => state.preferences.darkModeEnabled,
    }),
    authenticated() {
      return this.$auth.check();
    },
  },
  watch: {
    darkModeEnabled: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          document.querySelector('html').classList.add('dark');
        } else {
          document.querySelector('html').classList.remove('dark');
        }
      },
    },
    authenticated(newValue) {
      // Automatically logged out (token expired etc...)
      if (!newValue) {
        clearBankUsername();
        clearBankPassword();
        this.setCurrentUserEmail(null);
      } else {
        /// Authenticated, store/update the current user's email
        /// for error reporting in both main & renderer processes
        this.setCurrentUserEmail(this.$auth.user().email || '');
      }
    },
  },
  methods: {
    ...mapMutations([
      'setCurrentUserEmail',
    ]),
  },
  created() {
    let shell = require('electron').shell;
    document.addEventListener('click', function (event) {
      var a = event.target.closest('a');

      if (a && a.className.includes('external')) {
        event.preventDefault();
        shell.openExternal(a.href);
      }
    });
  },
};
</script>

<style>

</style>

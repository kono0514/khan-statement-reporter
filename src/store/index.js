import Vue from 'vue';
import Vuex from 'vuex';
import logsModule from './modules/logs';
import preferencesModule from './modules/preferences';
import scraperModule from './modules/scraper';
import { createSharedMutations } from 'vuex-electron';
import createPersistedState from 'vuex-persistedstate';
import ElectronStore from 'electron-store';
const electronStore = new ElectronStore();
const electronDownloadLogStore = new ElectronStore({ name: 'downloadLogs' });

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    logs: logsModule,
    preferences: preferencesModule,
    scraper: scraperModule,
  },
  plugins: [
    createPersistedState({
      paths: [
        'preferences.recoverMissedAtStart',
        'preferences.recoverMissedDays',
        'preferences.darkModeEnabled',
        'preferences.rememberedEmail',
      ],
      filter: (mutation) => {
        return [
          'toggleRecoverMissedAtStart',
          'setRecoverMissedDays',
          'toggleDarkMode',
          'setRememberedEmail',
        ].includes(mutation.type);
      },
      storage: {
        getItem: key => electronStore.get(key),
        setItem: (key, value) => electronStore.set(key, value),
        removeItem: key => electronStore.delete(key),
      },
    }),
    // Persist logs in localStorage to make it easily accessible across multiple browser windows
    createPersistedState({
      key: 'Logs',
      paths: ['logs.logs'],
      filter: (mutation) => {
        return ['_appendLog'].includes(mutation.type);
      },
      storage: {
        getItem: key => electronDownloadLogStore.get(key),
        setItem: (key, value) => electronDownloadLogStore.set(key, value),
        removeItem: key => electronDownloadLogStore.delete(key),
      },
    }),
    createSharedMutations(),
  ],
});

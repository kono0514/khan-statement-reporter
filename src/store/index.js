import Vue from 'vue';
import Vuex from 'vuex';
import { createSharedMutations } from 'vuex-electron';
import createPersistedState from 'vuex-persistedstate';
import { DateTime } from 'luxon';
import ElectronStore from 'electron-store';
const electronStore = new ElectronStore();
const electronDownloadLogStore = new ElectronStore({ name: 'downloadLogs' });

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    logs: [],
    lastLogTimestamp: null,
    running: false,
    recoverMissedAtStart: false,
    recoverMissedDays: 3,
    error: null,
    failedScraperTries: 0,
    failedApiTries: 0,
    sentStatements: [],
    darkModeEnabled: false,
    rememberedEmail: '',
  },
  mutations: {
    appendLog(state, payload) {
      if (state.logs.length >= 100) {
        state.logs.splice(0, state.logs.length - 99);
      }
      state.logs.push(payload);
      state.lastLogTimestamp = DateTime.local();
    },
    setStatus(state, running) {
      state.running = running;
    },
    setError(state, payload) {
      state.error = payload;
    },
    setApiFailCount(state, payload) {
      state.failedApiTries = payload;
    },
    setScraperFailCount(state, payload) {
      state.failedScraperTries = payload;
    },
    setDarkModeEnabled(state, payload) {
      state.darkModeEnabled = payload;
    },
    setRecoverMissedAtStart(state, payload) {
      state.recoverMissedAtStart = payload;
    },
    setRecoverMissedDays(state, payload) {
      state.recoverMissedDays = payload;
    },
    setRememberedEmail(state, payload) {
      state.rememberedEmail = payload;
    },
    appendStatement(state, payload) {
      state.sentStatements.push(payload);
    },
  },
  actions: {
    appendLog({ commit }, payload) {
      commit('appendLog', `${payload.timestamp}: ${payload.message}`);
    },
    appendErrorLog({ commit }, payload) {
      commit('appendLog', `${payload.timestamp}: Алдаа - ${payload.message}`);
    },
    incrementScraperFailCount({ commit, state, dispatch }) {
      commit('setScraperFailCount', state.failedScraperTries + 1);
      if (state.failedScraperTries > 3) {
        dispatch('stop', 'Max tries reached (Scraper)');
      }
    },
    incrementApiFailCount({ commit, state, dispatch }) {
      commit('setApiFailCount', state.failedApiTries + 1);
      if (state.failedApiTries > 3) {
        dispatch('stop', 'Max tries reached (API)');
      }
    },
    resetScraperFailCount({ commit }) {
      commit('setScraperFailCount', 0);
    },
    resetApiFailCount({ commit }) {
      commit('setApiFailCount', 0);
    },
    start({ commit, dispatch }) {
      commit('setStatus', true);
      commit('setError', null);
      dispatch('resetScraperFailCount');
      dispatch('resetApiFailCount');
    },
    stop({ commit }, error = null) {
      commit('setStatus', false);
      commit('setError', error);
    },
    toggleDarkMode({ commit, state }) {
      commit('setDarkModeEnabled', !state.darkModeEnabled);
    },
    toggleRecoverMissedAtStart({ commit, state }) {
      commit('setRecoverMissedAtStart', !state.recoverMissedAtStart);
    },
    modifyRecoverMissedDays({ commit }, payload) {
      commit('setRecoverMissedDays', payload);
    },
    rememberEmail({ commit }, payload) {
      commit('setRememberedEmail', payload);
    },
    appendStatements({ commit }, payload) {
      for (const statement of payload) {
        commit('appendStatement', statement);
      }
    },
  },
  modules: {
  },
  plugins: [
    createPersistedState({
      paths: ['recoverMissedAtStart', 'recoverMissedDays', 'darkModeEnabled', 'rememberedEmail'],
      filter: (mutation) => {
        return ['setRecoverMissedAtStart', 'setRecoverMissedDays', 'setDarkModeEnabled', 'setRememberedEmail'].includes(mutation.type);
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
      paths: ['logs'],
      filter: (mutation) => {
        return ['appendLog'].includes(mutation.type);
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

import Vue from 'vue'
import Vuex from 'vuex'
// eslint-disable-next-line no-unused-vars
import { createSharedMutations } from 'vuex-electron'
import createPersistedState from 'vuex-persistedstate'
import ElectronStore from 'electron-store'
const electronStore = new ElectronStore()

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    logs: [],
    running: false,
    recoverMissedAtStart: false,
    error: null,
    failedScraperTries: 0,
    failedApiTries: 0,
    sentStatements: [],
  },
  mutations: {
    appendLog(state, payload) {
      if (state.logs.length >= 100) {
        state.logs.splice(0, state.logs.length - 99);
      }
      state.logs.push(payload);
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
    setRecoverMissedAtStart(state, payload) {
      state.recoverMissedAtStart = payload;
    },
    appendStatement(state, payload) {
      state.sentStatements.push(payload);
    }
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
    toggleRecoverMissedAtStart({ commit, state }) {
      commit('setRecoverMissedAtStart', !state.recoverMissedAtStart);
    },
    appendStatements({ commit }, payload) {
      for (const statement of payload) {
        commit('appendStatement', statement);
      }
    }
  },
  modules: {
  },
  plugins: [
    createPersistedState({
      paths: ['recoverMissedAtStart'],
      storage: {
        getItem: (key) => electronStore.get(key),
        setItem: (key, value) => electronStore.set(key, value),
        removeItem: key => electronStore.delete(key),
      }
    }),
    createSharedMutations(),
  ]
})

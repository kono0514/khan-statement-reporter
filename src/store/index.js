import Vue from 'vue'
import Vuex from 'vuex'
// eslint-disable-next-line no-unused-vars
import { createPersistedState, createSharedMutations } from 'vuex-electron'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    logs: [],
    running: false,
    error: null,
    failedScraperTries: 0,
    failedApiTries: 0,
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
      if (state.failedScraperTries >= 3) {
        dispatch('stop', 'Max tries reached (Scraper)');
      }
    },
    incrementApiFailCount({ commit, state, dispatch }) {
      commit('setApiFailCount', state.failedApiTries + 1);
      if (state.failedApiTries >= 3) {
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
  },
  modules: {
  },
  plugins: [
    // createPersistedState(),
    createSharedMutations(),
  ]
})

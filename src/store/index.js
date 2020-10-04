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
    }
  },
  actions: {
    appendLog({ commit }, payload) {
      commit('appendLog', payload);
    },
    start({ commit }) {
      commit('setStatus', true);
      commit('setError', null);
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

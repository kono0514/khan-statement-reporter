export default {
  state: {
    running: false,
    error: null,
    failedScraperTries: 0,
    failedApiTries: 0,
    sentStatements: [],
  },

  mutations: {
    _setStatus(state, payload) {
      state.running = payload;
    },
    _setError(state, payload) {
      state.error = payload;
    },
    setScraperFailCount(state, payload) {
      state.failedScraperTries = payload;
    },
    setApiFailCount(state, payload) {
      state.failedApiTries = payload;
    },
    appendStatements(state, payload) {
      for (const statement of payload) {
        state.sentStatements.push(statement);
      }
    },
  },

  actions: {
    start({ commit }) {
      commit('_setStatus', true);
      commit('_setError', null);
      commit('setScraperFailCount', 0);
      commit('setApiFailCount', 0);
    },
    stop({ commit }, error = null) {
      commit('_setStatus', false);
      commit('_setError', error);
    },
    incrementScraperFailCount({ commit, state, dispatch }) {
      commit('setScraperFailCount', state.failedScraperTries + 1);
      if (state.failedScraperTries >= 5) {
        dispatch('stop', 'Max retries reached (Scraper)');
      }
    },
    incrementApiFailCount({ commit, state, dispatch }) {
      commit('setApiFailCount', state.failedApiTries + 1);
      if (state.failedApiTries >= 5) {
        dispatch('stop', 'Max retries reached (API)');
      }
    },
  },
};

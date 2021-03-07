import { DateTime } from 'luxon';

export default {
  state: {
    logs: [],
    lastLogTimestamp: null,
  },

  mutations: {
    _appendLog(state, payload) {
      if (state.logs.length >= 100) {
        state.logs.splice(0, state.logs.length - 99);
      }
      state.logs.push(payload);
      state.lastLogTimestamp = DateTime.local();
    },
  },

  actions: {
    appendLog({ commit }, payload) {
      commit('_appendLog', `${payload.timestamp}: ${payload.message}`);
    },
    appendErrorLog({ commit }, payload) {
      commit('_appendLog', `${payload.timestamp}: Алдаа - ${payload.message}`);
    },
  },
};

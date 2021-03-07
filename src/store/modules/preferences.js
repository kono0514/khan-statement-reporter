export default {
  state: {
    darkModeEnabled: false,
    rememberedEmail: '',
    recoverMissedAtStart: false,
    recoverMissedDays: 3,
  },

  mutations: {
    toggleDarkMode(state) {
      state.darkModeEnabled = !state.darkModeEnabled;
    },
    toggleRecoverMissedAtStart(state) {
      state.recoverMissedAtStart = !state.recoverMissedAtStart;
    },
    setRecoverMissedDays(state, payload) {
      state.recoverMissedDays = payload;
    },
    setRememberedEmail(state, payload) {
      state.rememberedEmail = payload;
    },
  },

  actions: {},
};

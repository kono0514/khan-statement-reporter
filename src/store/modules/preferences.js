export default {
  state: {
    darkModeEnabled: false,
    rememberedEmail: '',
    recoverMissedAtStart: false,
    recoverMissedDays: 3,
    currentUserEmail: null,
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
    setCurrentUserEmail(state, payload) {
      state.currentUserEmail = payload;
    },
  },

  actions: {},
};

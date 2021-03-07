import Vue from 'vue';
import store from '../store';
import { clearBankUsername, clearBankPassword } from './credentials';

const login = async (email, password) => {
  await Vue.auth.login({
    data: {
      email: email,
      password: password,
    },
  });

  store.commit('setRememberedEmail', email);
};

const logout = () => {
  Vue.auth.logout();
  clearBankUsername();
  clearBankPassword();
  store.commit('setCurrentUserEmail', null);
};

export {
  login,
  logout,
};

import ElectronStore from 'electron-store';

const electronStore = new ElectronStore();

const BANK_USERNAME_KEY = 'b_uname';
const BANK_PASSWORD_KEY = 'pwd';

const getBankUsername = () => electronStore.get(BANK_USERNAME_KEY, '');
const getBankPassword = () => electronStore.get(BANK_PASSWORD_KEY, '');
const setBankUsername = (payload) => electronStore.set(BANK_USERNAME_KEY, payload);
const setBankPassword = (payload) => electronStore.set(BANK_PASSWORD_KEY, payload);
const clearBankUsername = () => electronStore.delete(BANK_USERNAME_KEY);
const clearBankPassword = () => electronStore.delete(BANK_PASSWORD_KEY);

export {
  getBankUsername,
  getBankPassword,
  setBankUsername,
  setBankPassword,
  clearBankUsername,
  clearBankPassword,
};

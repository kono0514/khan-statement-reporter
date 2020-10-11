// eslint-disable-next-line no-unused-vars
import { ipcMain } from 'electron';
import store from './store';
import ElectronStore from 'electron-store';
import constants from './constants';
import axios from 'axios';
import { Scraper } from './scraper';
const log = require('electron-log');

console.log = log.log;

export class AppMain {
  constructor(win) {
    this.win = win;
    this.electronStore = new ElectronStore();
    this.lastSuccessfulCheckTime = this.now();
    this.scraper = new Scraper(this.win);
    this.listen()
    this.init()
  }

  async init() {
    await this.scraper.init();
    this.checkContinously();
  }

  async listen() {
    // eslint-disable-next-line no-unused-vars
    ipcMain.on('validateNow', async (event) => {
      this.validate();
    });

    store.watch(
      (state) => state.running,
      (newValue) => {
        if (newValue === true) {
          this.validate();
        } else {
          this.win.once('focus', () => {
            this.win.flashFrame(false);
          });
          this.win.flashFrame(true);
        }
      },
    );
  }

  now() {
    // Substract 1 minute to allow for some leeway
    let now = new Date();
    const ms = 1000 * 60 * 1; // 1 minute
    return new Date(now.getTime() - ms);
  }

  async checkContinously() {
    await this.check();
    setTimeout(this.checkContinously.bind(this), 10000);
  }

  async validate() {
    const access_token = await this.win.webContents.executeJavaScript(`window.localStorage.getItem('access_token')`);
    // Logged out
    if (access_token === null) {
      store.dispatch('stop', 'Logged out');
      return false;
    }

    const username = this.electronStore.get(constants.BANK_USERNAME_KEY, '');
    const password = this.electronStore.get(constants.BANK_PASSWORD_KEY, '');
    if (username === '' || password === '') {
      store.dispatch('stop', 'Интернет банкны нэр нууц үгээ тохируулна уу <a class="text-black" href="#/modal">Change</a>');
      return false;
    }

    let accountNumber = '';
    // Дансны дугаарыг API-с авах
    try {
      const response = await axios.get(
        '/api/user/account_number?bank=khan_internet_bank_client',
        {
          baseURL: process.env.VUE_APP_URL,
          headers: {
            'Authorization': `Bearer ${access_token}`,
          }
        }
      );
      accountNumber = response.data['account_number'];
      if (!accountNumber || accountNumber === '') {
        store.dispatch('stop', `Банк нэмээгүй байна <a class="text-black external" href="${process.env.VUE_APP_URL}/dashboard">Нэмэх</a>`);
        return false;
      }
    } catch (error) {
      if (error.response.status === 401) {
        this.win.webContents.send('logout');
      } else if (error.response.status === 403) {
        store.dispatch('stop', error.response.data.message);
      } else {
        console.error(error);
        store.dispatch('stop', 'API failure');
      }
      return false;
    }

    return {
      accessToken: access_token,
      username: username,
      password: password,
      accountNumber: accountNumber,
    }
  }

  async check() {
    if (!store.state.running) return;

    const checkStartTime = (new Date()).toLocaleTimeString();

    const validated = await this.validate();
    if (validated === false) return;

    // Хуулга татах
    const newDonations = [];
    try {
      const statements = await this.scraper.fetchStatement(validated['username'], validated['password'], validated['accountNumber']);
      console.log(statements);
      for (const statement of statements) {
        if (this.lastSuccessfulCheckTime > statement.timestamp) continue;
        newDonations.push(statement);
      }
      this.lastSuccessfulCheckTime = this.now();
    } catch (error) {
      console.log('Statement result error', error);
      if (error !== 'SOFT_ERR_STATEMENT_DOWNLOAD') {
        store.dispatch('stop', `Khanbank: ${error}`);
      }
      store.dispatch('appendLog', `${checkStartTime}: Хуулга алдаа!`);
      return;
    }

    try {
      let insertedCount = 0;
      if (newDonations.length > 0) {
        const response = await axios.post(
          '/api/user/create_donations',
          {
            donation: newDonations,
            account_number: validated['accountNumber'],
          },
          {
            baseURL: process.env.VUE_APP_URL,
            headers: {
              'Authorization': `Bearer ${validated['accessToken']}`,
            }
          }
        );
        if (response.data['inserted']) {
          insertedCount = response.data['inserted'];
        }
      }
      store.dispatch('appendLog', `${checkStartTime}: Шинэ орлого -> ${insertedCount}`);
    } catch (error) {
      if (error.response.status === 401) {
        this.win.webContents.send('logout');
      } else if (error.response.status === 403) {
        store.dispatch('stop', error.response.data.message);
        store.dispatch('appendLog', `${checkStartTime}: ${error.response.data.message}`);
      } else {
        console.error(error);
        store.dispatch('stop', 'API failure');
        store.dispatch('appendLog', `${checkStartTime}: API failure`);
      }
    }
  }
}

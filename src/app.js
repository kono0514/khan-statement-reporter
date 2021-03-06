// eslint-disable-next-line no-unused-vars
import { ipcMain, app, BrowserWindow } from 'electron';
import store from './store';
import ElectronStore from 'electron-store';
import axios from './axios';
import { Scraper } from './scraper';
import puppeteer from 'puppeteer-core';
import { isRetryableError } from './retryable_error';
import { reportError, reportRetryableError } from './helpers/sentry';
import { getBankUsername, getBankPassword } from './helpers/credentials';
const log = require('electron-log');
const { DateTime } = require('luxon');
const windowStateKeeper = require('electron-window-state');

Object.assign(console, log.functions);

export class AppMain {
  constructor(win) {
    this.win = win;
    this.electronStore = new ElectronStore();
    this.electronDownloadLogStore = new ElectronStore({ name: 'downloadLogs' });
    this.startDate = this.now();
    this.scraper = new Scraper(this.win);
    this.listen();
    this.init();
  }

  async init() {
    // Start with a fresh download logs
    this.electronDownloadLogStore.clear();

    await this.scraper.init();
    this.checkContinously();
  }

  async listen() {
    ipcMain.on('openDownloadLogWindow', () => {
      let url;
      if (process.env.WEBPACK_DEV_SERVER_URL) {
        url = `${process.env.WEBPACK_DEV_SERVER_URL}#downloadLog`;
      } else {
        url = 'app://./index.html/#downloadLog';
      }

      let logWinState = windowStateKeeper({
        file: 'log-window-state.json',
        defaultWidth: 600,
        defaultHeight: 400,
      });
      const logWin = new BrowserWindow({
        parent: this.win,
        width: logWinState.width,
        height: logWinState.height,
        x: logWinState.x,
        y: logWinState.y,
        webPreferences: {
          nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
          enableRemoteModule: true,
        },
        backgroundColor: '#1a202c',
      });
      logWinState.manage(logWin);
      logWin.loadURL(url);
    });

    // eslint-disable-next-line no-unused-vars
    ipcMain.on('validateNow', async (event) => {
      this.validate();
    });

    ipcMain.on('getMainLogPath', (event) => {
      event.returnValue = log.transports.file.getFile().path;
    });

    store.watch(
      (state) => state.scraper.running,
      (newValue) => {
        if (newValue === true) {
          this.validate();
          if (store.state.preferences.recoverMissedAtStart) {
            this.startDate = this.now(store.state.preferences.recoverMissedDays * 24 * 60);
          } else {
            this.startDate = this.now(30);
          }
        } else {
          this.win.once('focus', () => {
            this.win.flashFrame(false);
          });
          this.win.flashFrame(true);
        }
      },
    );
  }

  now(minutes = 1) {
    // Substract minutes to allow for some leeway
    const now = DateTime.local().setZone('Asia/Ulaanbaatar').minus({ minutes: minutes });
    return now;
  }

  async checkContinously() {
    await this.check();
    setTimeout(this.checkContinously.bind(this), 10000);
  }

  async validate() {
    const access_token = await this.win.webContents.executeJavaScript('window.localStorage.getItem("access_token")');

    // Logged out
    if (access_token === null) {
      store.dispatch('stop', 'Logged out');
      return false;
    }

    const username = getBankUsername();
    const password = getBankPassword();
    if (username === '' || password === '') {
      store.dispatch('stop', 'Интернет банкны нэр нууц үгээ тохируулна уу');
      return false;
    }

    let accountNumber = '';
    // Дансны дугаарыг API-с авах
    try {
      const response = await axios.get(
        '/api/user/account_number?bank=khan_internet_bank_client',
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        },
      );
      accountNumber = response.data['account_number'];
      if (!accountNumber || accountNumber === '') {
        store.dispatch('stop', `Банк нэмээгүй байна. <a class="external text-blue-600 underline hover:text-blue-700" href="${process.env.VUE_APP_URL}/dashboard">Энд дарж нэмнэ үү</a>`);
        return false;
      }
    } catch (error) {
      console.error('Get account number error', error);
      if (error.response) {
        if (error.response.status === 401) {
          store.dispatch('stop');
          this.win.webContents.send('logout');
        } else if (error.response.status === 403) {
          store.dispatch('stop', `API: ${error.response.data.message || '403 Forbidden'}`);
        } else {
          store.dispatch('stop', 'API: Unexpected response');
          reportError(error);
        }
      } else if (isRetryableError(error)) {
        store.dispatch('appendErrorLog', { timestamp: (new Date()).toLocaleTimeString(), message: error.message });
        store.dispatch('incrementApiFailCount');
        reportRetryableError(error);
      } else {
        store.dispatch('stop', 'Connection problem');
        reportError(error);
      }

      return false;
    }

    return {
      accessToken: access_token,
      username: username,
      password: password,
      accountNumber: accountNumber,
    };
  }

  async check() {
    if (!store.state.scraper.running) return;

    const checkStartTime = (new Date()).toLocaleTimeString();

    const validated = await this.validate();
    if (validated === false) return;

    // Хуулга татах
    const newDonations = [];
    try {
      const statements = await this.scraper.fetchStatement(
        validated['username'],
        validated['password'],
        validated['accountNumber'],
        this.startDate,
      );
      for (const statement of statements) {
        if (!store.state.scraper.sentStatements.find(s => s.hash === statement.hash)) {
          newDonations.push(statement);
        }
      }
      this.startDate = this.now();
      store.commit('setScraperFailCount', 0);
    } catch (error) {
      console.error('Statement result error', error);
      if (error instanceof puppeteer.errors.TimeoutError || isRetryableError(error)) {
        store.dispatch('appendErrorLog', { timestamp: checkStartTime, message: error.message });
        store.dispatch('incrementScraperFailCount');
        reportRetryableError(error);
      } else {
        store.dispatch('appendErrorLog', { timestamp: checkStartTime, message: error.message });
        store.dispatch('stop', `Khanbank алдаа: ${error.message}`);
        reportError(error);
      }
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
            headers: {
              'Authorization': `Bearer ${validated['accessToken']}`,
            },
          },
        );
        if (response.data['inserted']) {
          insertedCount = response.data['inserted'];
        }
        store.commit('appendStatements', newDonations);
      }
      store.commit('setApiFailCount', 0);
      store.dispatch('appendLog', { timestamp: checkStartTime, message: `New Donations = ${insertedCount}`});
    } catch (error) {
      console.error('Upload error', error);
      if (error.response) {
        if (error.response.status === 401) {
          store.dispatch('stop');
          this.win.webContents.send('logout');
        } else if (error.response.status === 403) {
          store.dispatch('stop', `API: ${error.response.data.message || '403 Forbidden'}`);
        } else {
          store.dispatch('stop', 'API: Unexpected response');
          reportError(error);
        }
      } else if (isRetryableError(error)) {
        store.dispatch('appendErrorLog', { timestamp: checkStartTime, message: error.message });
        store.dispatch('incrementApiFailCount');
        reportRetryableError(error);
      } else {
        store.dispatch('stop', 'Connection problem');
        reportError(error);
      }
    }
  }
}

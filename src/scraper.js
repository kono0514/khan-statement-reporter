/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
"use strict";
import { app, BrowserWindow } from 'electron';
import pie from 'puppeteer-in-electron';
import puppeteer from 'puppeteer-core';
import crypto from 'crypto';
import { exception } from 'console';
const log = require('electron-log');
const { dialog } = require('electron');
import { RetryableError } from './retryable_error';

Object.assign(console, log.functions);

export class Scraper {
  constructor(win) {
    this.browser = null;
    this.window = null;
    this.page = null;
    this.client = null;
    this.parentWindow = win;
  }

  async init() {
    let isDevelopment = process.env.NODE_ENV !== 'production';
    this.browser = await pie.connect(app, puppeteer);
    let options = {
      show: isDevelopment,
      frame: isDevelopment,
      closable: isDevelopment,
    };
    this.window = new BrowserWindow({ title: 'Scraper DO NOT CLOSE', ...options, parent: this.parentWindow });
    if (isDevelopment) {
      this.window.webContents.openDevTools();
    }
    this.page = await pie.getPage(this.browser, this.window);
    this.page.setDefaultNavigationTimeout(15000);
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36');
  }

  async fetchStatement(username, password, accountNumber) {
    console.log('fetchStatement');
    this.page.removeAllListeners();
    await this.page.setRequestInterception(false);

    /// Try to download in case the previous session is still alive
    try {
      await this.page.goto('about:blank');
      const statements = await this._getTodaysIncomeStatement(accountNumber);
      console.log('Statement downloaded. Successfully used previous session without logging in...');
      return statements;
    } catch (error) {
      console.error('Statement download re-use session error', error);
    }

    /// Logged out. Login again
    console.log('Logging in...');
    const LOGIN_PAGE_URL = 'https://e.khanbank.com/pageLoginMini';
    await this.page.goto(LOGIN_PAGE_URL);
    console.log('Login page loaded');
    this.page.$eval('#txtCustNo', (el, value) => el.value = value, username);
    this.page.$eval('#txtPassword', (el, value) => el.value = value, password);

    const body = await this.page.evaluate(() => document.querySelector('body').innerHTML);

    console.log('Body evaluated');

    // Captcha required on initial page load
    if (body.includes('pnlCaptcha')) {
      console.log('captcha');
      this._grabAttention('Captcha needed. Captcha-г бөглөөд "Нэвтрэх" дарна уу.');
    } else {
      try {
        await new Promise(r => setTimeout(r, 1000));
        await this.page.evaluate((button) => {
          document.querySelector(button).click();
        }, 'input[type=submit]');
        console.log('clicked');
      } catch (error) {
        if (error.includes('No node found for selector')) {
          throw new RetryableError('Couldn\'t find the submit button');
        } else {
          throw error;
        }
      }
    }

    console.log('detach');
    if (this.client !== null) {
      await this.client.detach();
    }
    this.client = await this.page.target().createCDPSession();
    await this.client.send('Network.enable');
    console.log('Enable');

    // Capture additional headers (set-cookie)
    const responseCookieHeaders = {};
    this.client.on('Network.responseReceivedExtraInfo', (response) => {
      if (response && response.headers) {
        const cookieHeader = response.headers[Object.keys(response.headers).find(key => key.toLowerCase() === 'set-cookie')];
        if (cookieHeader) {
          responseCookieHeaders[response.requestId] = cookieHeader;
        }
      }
    });    

    // Disable successful login form redirection
    this.page.on('request', request => {
      if (request.isNavigationRequest() && request.frame() === this.page.mainFrame() && request.url().startsWith('https://e.khanbank.com/pageMain?content=ucMain_Welcome')) {
        console.log('aborted');
        request.abort('aborted');
      } else {
        request.continue();
      }
    });
    console.log('reqinter');
    await this.page.setRequestInterception(true);
    console.log('done');

    return new Promise((resolve, reject) => {
      console.log('promise');
      this.page.on('requestfinished', async (request) => {
        const response = request.response();
        // Login ajax response
        if (response.url().startsWith(LOGIN_PAGE_URL) && request.method() === 'POST') {
          console.log('Processing login ajax response...');
          const data = await response.text();
  
          const cookies = responseCookieHeaders[request._requestId];
          // Successfully logged in
          if (cookies && cookies.includes('ASPXAUTH')) {
            console.log('Logged in successfully...');

            try {
              // Stop further redirections. We don't care about them
              await this.page.goto('about:blank');
              const statements = await this._getTodaysIncomeStatement(accountNumber);
              console.log('Statement downloaded...');
              resolve(statements);
            } catch (error) {
              console.error('Statement download error', error);
              reject(new RetryableError(error.message));
            }
            this.window.hide();
            return;
          }
  
          // Captcha required or entered wrong captcha
          if (data.includes('pnlCaptcha')) {
            this._grabAttention('Captcha needed. Captcha-г бөглөөд "Нэвтрэх" дарна уу.');
            return;
          }
    
          // Error message
          const errorMatch = /Info1_warningMsg1".*?>(.*?)</gmsi.exec(data);
          if (errorMatch != null && errorMatch.length >= 1) {
            console.error('Login failed with error', errorMatch[1]);
            reject(new Error(errorMatch[1]));
            this.window.hide();
            return;
          }
  
          // Unknown error
          this._grabAttention('Unknown error???');
        }
      });
    });
  }

  _grabAttention(message) {
    console.warn(message);
    this.window.show();
    dialog.showMessageBox(this.window, {
      type: 'warning',
      title: 'Attention',
      message: message,
    });
  }

  async _getTodaysIncomeStatement(accountNumber) {
    const now = new Date();
    const today = new Date(now.getTime() - (now.getTimezoneOffset()*60*1000)).toISOString().substring(0, 10).replace(/-/g, '.');
    const statementPageUrl = `https://e.khanbank.com/pagePrint?content=ucAcnt_Statement2&ID=0000000${accountNumber}&CUR=MNT&MD=D&ST=${today}&ED=${today}`;
    await this.page.goto(statementPageUrl);

    // Logged out
    if (this.page.url().includes('pageLoginMini')) {
      throw new Error('Logged out');
    }

    const rows = await this.page.$$eval('#cphMain_ctl00_gridList tbody tr', rows => {
      return Array.from(rows, row => {
        return Array.from(row.querySelectorAll('td'), td => td.innerText);
      });
    });

    /*
      [0] - Гүйлгээний огноо
      [1] - Салбар
      [2] - Эхний үлдэгдэл
      [3] - Зарлага
      [4] - Орлого
      [5] - Эцсийн үлдэгдэл
      [6] - Гүйлгээний утга
      [7] - Харьцсан данс
    */
    const statements = [];
    for (const row of rows) {
      // Орлогын гүйлгээ
      const amount = parseFloat(row[4].replace(/,/g, ''));
      if (amount > 0.0) {
        let timestamp = new Date(row[0]);
        timestamp = new Date(timestamp.getTime() - (timestamp.getTimezoneOffset()*60*1000));
        statements.push({
          'amount': parseInt(amount).toString(),
          'timestamp': timestamp,
          'message': row[6],
          'hash': crypto.createHash('sha256').update(row.join(), 'binary').digest('hex'),
        });
      }
    }
  
    return statements;
  }
}

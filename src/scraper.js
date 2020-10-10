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

export class Scraper {
  constructor() {
    this.browser = null;
    this.window = null;
  }

  async init() {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    this.browser = await pie.connect(app, puppeteer);
    let options = {
      show: isDevelopment,
      frame: isDevelopment,
      closable: isDevelopment,
    };
    this.window = new BrowserWindow({ title: 'Scraper DO NOT CLOSE', ...options });
    if (isDevelopment) {
      this.window.webContents.openDevTools();
    }
  }

  async fetchStatement(username, password, accountNumber) {  
    const page = await pie.getPage(this.browser, this.window);

    /// Try to download in case the previous session is still alive
    try {
      await page.goto('about:blank');
      const statements = await this._getTodaysIncomeStatement(page, accountNumber);
      console.log('Statement downloaded. Successfully used previous session without logging in...');
      return statements;
    } catch (error) {
      console.log(error);
    }

    /// Logged out. Login again
    console.log('Logging in...');
    const LOGIN_PAGE_URL = 'https://e.khanbank.com/pageLoginMini';
    await page.goto(LOGIN_PAGE_URL);
    page.$eval('#txtCustNo', (el, value) => el.value = value, username);
    page.$eval('#txtPassword', (el, value) => el.value = value, password);

    const body = await page.evaluate(() => document.querySelector('body').innerHTML);

    // Captcha required on initial page load
    if (body.includes('pnlCaptcha')) {
      this._grabAttention('Captcha needed. Captcha-г бөглөөд "Нэвтрэх" дарна уу.');
    } else {
      await page.click("input[type=submit]");
    }

    // Capture additional headers (set-cookie)
    const responseCookieHeaders = {};
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    client.on('Network.responseReceivedExtraInfo', (response) => {
      if (response && response.headers) {
        const cookieHeader = response.headers[Object.keys(response.headers).find(key => key.toLowerCase() === 'set-cookie')];
        if (cookieHeader) {
          responseCookieHeaders[response.requestId] = cookieHeader;
        }
      }
    });
    
    return new Promise((resolve, reject) => {
      page.on('response', async (response) => {
        // Login ajax response
        if (response.url().startsWith(LOGIN_PAGE_URL) && response.request().method() === 'POST') {
          console.log('Processing login ajax response...');
          const data = await response.text();
  
          const cookies = responseCookieHeaders[response.request()._requestId];
          // Successfully logged in
          if (cookies && cookies.includes('ASPXAUTH')) {
            console.log('Logged in successfully...');
            // Stop further redirections. We don't care about them
            await page.goto('about:blank');

            try {
              const statements = await this._getTodaysIncomeStatement(page, accountNumber);
              console.log('Statement downloaded...');
              resolve(statements);
            } catch (error) {
              console.log(error);
              reject('SOFT_ERR_STATEMENT_DOWNLOAD');
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
            console.log('Login failed with error');
            reject(errorMatch[1]);
            this.window.hide();
            return;
          }
  
          // Unknown error
          this._grabAttention('Unknown error???');
        }
      });
  
      this.window.on('closed', () => {
        reject('Closed');
      });
    });
  }

  _grabAttention(message) {
    console.log(message);
    this.window.show();
    dialog.showMessageBox(this.window, {
      type: 'warning',
      title: 'Attention',
      message: message,
    });
  }

  async _getTodaysIncomeStatement(page, accountNumber) {
    const today = (new Date()).toISOString().substring(0, 10).replace(/-/g, '.');
    const statementPageUrl = `https://e.khanbank.com/pagePrint?content=ucAcnt_Statement2&ID=0000000${accountNumber}&CUR=MNT&MD=D&ST=${today}&ED=${today}`;
    await page.goto(statementPageUrl);

    // Logged out
    if (page.url().includes('pageLoginMini')) {
      throw 'Logged out';
    }

    const rows = await page.$$eval('#cphMain_ctl00_gridList tbody tr', rows => {
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
        statements.push({
          'amount': parseInt(amount).toString(),
          'timestamp': new Date(Date.parse(row[0])),
          'message': row[6],
          'hash': crypto.createHash('sha256').update(row.join(), 'binary').digest('hex'),
        });
      }
    }
  
    return statements;
  }
}

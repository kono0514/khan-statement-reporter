/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
'use strict';
import { app, BrowserWindow } from 'electron';
import pie from 'puppeteer-in-electron';
import puppeteer from 'puppeteer-core';
import { exception } from 'console';
const log = require('electron-log');
const { dialog } = require('electron');
import { RetryableError } from './retryable_error';
import { rowsToStatements } from './scraper_utils';
const { DateTime } = require('luxon');

Object.assign(console, log.functions);

export class Scraper {
  constructor(win) {
    this.browser = null;
    this.window = null;
    this.page = null;
    this.client = null;
    this.parentWindow = win;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  async init() {
    this.browser = await pie.connect(app, puppeteer);
    this.window = new BrowserWindow({
      title: 'Scraper DO NOT CLOSE',
      parent: this.parentWindow,
      show: this.isDevelopment,
      closable: this.isDevelopment,
      minimizable: this.isDevelopment,
    });
    if (this.isDevelopment) {
      this.window.webContents.openDevTools();
    }
    this.page = await pie.getPage(this.browser, this.window, true);
    this.page.setDefaultNavigationTimeout(30000);
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36');
  }

  async fetchStatement(username, password, accountNumber, startDate) {
    if (!this.isDevelopment) this.window.hide();

    /// Try to download in case the previous session is still alive
    try {
      await this.page.goto('about:blank');
      const statements = await this._getIncomeStatement(accountNumber, startDate);
      console.log('Statement downloaded. Successfully used previous session without logging in...');
      return statements;
    } catch (error) {
      console.error('Statement download re-use session error', error);
    }

    /// Logged out. Login again
    console.log('Logging in...');
    const LOGIN_PAGE_URL = 'https://e.khanbank.com/pageLoginMini';
    await this.page.goto(LOGIN_PAGE_URL);

    await new Promise(r => setTimeout(r, 1000));
    try {
      await this.page.$eval('#txtCustNo', (el, value) => el.value = value, username);
      await this.page.$eval('#txtPassword', (el, value) => el.value = value, password);
    } catch (error) {
      console.error('Failed to find login fields. Slow connection?', error);
      throw new RetryableError('Failed to find form fields. Slow connection?');
    }

    const body = await this.page.evaluate(() => document.querySelector('body').innerHTML);

    // Captcha required on initial page load
    if (body.includes('pnlCaptcha')) {
      this._grabAttention('Captcha detected. Captcha-г бөглөөд нэвтэрнэ үү. Нэвтэрсний дараа дахин "Start" дарж эхлүүлээрэй.');
      throw new Error('Captcha detected');
    }

    // Click submit then wait for either successful login redirect or failed error message to appear
    await new Promise(r => setTimeout(r, 1000));
    await this.page.waitForSelector('input[type=submit]');
    await Promise.all([
      this.page.evaluate((button) => {
        document.querySelector(button).click();
      }, 'input[type=submit]'),
      Promise.race([
        this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        Promise.race([
          this.page.waitForSelector('#pnlCaptcha'),
          this.page.waitForSelector('#Info1_warningMsg1'),
        ]),
      ]),
    ]);

    let captchaError = false;
    let warningError = false;
    let successfullyRedirected = false;
    try {
      const captcha = await this.page.$('#pnlCaptcha');
      const warning = await this.page.$('#Info1_warningMsg1');
      if (captcha) {
        captchaError = true;
      } else if (warning) {
        warningError = await this.page.evaluate(e => e.textContent, warning);
      } else {
        successfullyRedirected = true;
      }
    } catch (error) {
      // Couldn't check for an element presence on the page.
      // The page probably got unexpectedly navigated to another page.
      // Flow of the observed cause:
      // 1. Logged in and redirected to dashboard
      // 2. On dashboard, some AJAX call returned 401 Unauthorized
      // 3. System logs us out and navigates to home page
      // 4. This error is triggered because we navigated away to home page
      throw new RetryableError(`E99 ${error.message}`);
    }

    if (successfullyRedirected) {
      try {
        await this.page.goto('about:blank');
        const statements = await this._getIncomeStatement(accountNumber, startDate);
        console.log('Statement downloaded...');
        return statements;
      } catch (error) {
        console.error('Statement download error', error);
        throw new RetryableError(error.message);
      }
    }

    if (captchaError) {
      this._grabAttention('Captcha detected. Captcha-г бөглөөд нэвтэрнэ үү. Нэвтэрсний дараа "Start" дарж эхлүүлээрэй.');
      throw new Error('Captcha detected');
    } else if (warningError !== false) {
      throw new Error(warningError);
    }
  }

  _grabAttention(message) {
    this.window.show();
    dialog.showMessageBox(this.window, {
      type: 'warning',
      title: 'Attention',
      message: message,
    });
  }

  async _getIncomeStatement(accountNumber, startDate) {
    let st;
    const ed = DateTime.local().setZone('Asia/Ulaanbaatar').toFormat('yyyy.LL.dd');
    if (startDate) {
      st = startDate.toFormat('yyyy.LL.dd');
    } else {
      st = ed;
    }
    const statementPageUrl = `https://e.khanbank.com/pagePrint?content=ucAcnt_Statement2&ID=0000000${accountNumber}&CUR=MNT&MD=D&ST=${st}&ED=${ed}`;
    await this.page.goto(statementPageUrl);

    // Logged out
    if (this.page.url().includes('pageLoginMini')) {
      throw new Error('Logged out');
    }

    const body = await this.page.evaluate(() => document.querySelector('body').innerHTML);

    if (body.includes('Систем оффлайн байгаа тул гүйлгээ хийх боломжгүй')) {
      throw new Error('Систем оффлайн байгаа тул гүйлгээ хийх боломжгүй');
    }

    const rows = await this.page.$$eval('#cphMain_ctl00_gridList tbody tr', rows => {
      return Array.from(rows, row => {
        return Array.from(row.querySelectorAll('td'), td => td.innerText);
      });
    });

    const filteredStatements = rowsToStatements(rows, startDate);
    console.log(`Account: ******${accountNumber.slice(-4)}, St: ${st}, Ed: ${ed}, Rows: ${rows.length}, Filtered: ${filteredStatements.length}`);
    return filteredStatements;
  }
}

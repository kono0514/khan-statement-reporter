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
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  async init() {
    this.browser = await pie.connect(app, puppeteer);
    let options = {
      show: this.isDevelopment,
      closable: this.isDevelopment,
      minimizable: this.isDevelopment,
    };
    this.window = new BrowserWindow({ title: 'Scraper DO NOT CLOSE', ...options, parent: this.parentWindow });
    if (this.isDevelopment) {
      this.window.webContents.openDevTools();
    }
    this.page = await pie.getPage(this.browser, this.window, true);
    this.page.setDefaultNavigationTimeout(30000);
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36');
  }

  async fetchStatement(username, password, accountNumber) {
    if (!this.isDevelopment) this.window.hide();
    console.log('fetchStatement');

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
      this._grabAttention('Captcha detected. Captcha-г бөглөөд нэвтэрнэ үү. Нэвтэрсний дараа дахин "Start" дарж эхлүүлээрэй.');
      throw new Error('Captcha detected');
    }

    // Click submit then wait for either successful login redirect or failed error message to appear
    await new Promise(r => setTimeout(r, 1000));
    try {
      await Promise.all([
        this.page.evaluate((button) => {
          document.querySelector(button).click();
        }, 'input[type=submit]'),
        Promise.race([
          this.page.waitForNavigation({ waitUntil: "domcontentloaded" }),
          Promise.race([
            this.page.waitForSelector("#pnlCaptcha"),
            this.page.waitForSelector("#Info1_warningMsg1"),
          ]),
        ]),
      ]);
    } catch (error) {
      console.log('Promise error', error);
      throw error;
    }

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
      console.error('This error', error);
      throw new RetryableError(error.message);
    }

    if (successfullyRedirected) {
      console.log('Redirected!');
      try {
        await this.page.goto('about:blank');
        console.log('about:blank');
        const statements = await this._getTodaysIncomeStatement(accountNumber);
        console.log('Statement downloaded...');
        return statements;
      } catch (error) {
        console.error('Statement download error', error);
        throw new RetryableError(error.message);
      }
    }

    if (captchaError) {
      console.log('Captcha!');
      this._grabAttention('Captcha detected. Captcha-г бөглөөд нэвтэрнэ үү. Нэвтэрсний дараа "Start" дарж эхлүүлээрэй.');
      throw new Error('Captcha detected');
    } else if (warningError !== false) {
      console.log('Login warning', warningError)
      throw new Error(warningError);
    }
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

    const body = await this.page.evaluate(() => document.querySelector('body').innerHTML);

    if (body.includes('Систем оффлайн байгаа тул гүйлгээ хийх боломжгүй')) {
      throw new Error('Систем оффлайн байгаа тул гүйлгээ хийх боломжгүй');
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

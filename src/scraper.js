"use strict";
import { app, BrowserWindow } from 'electron';
import pie from 'puppeteer-in-electron';
import puppeteer from 'puppeteer-core';
import crypto from 'crypto';
const log = require('electron-log');
const { dialog } = require('electron');

async function _getTodaysIncomeStatement(page, accountNumber) {
  const today = (new Date()).toISOString().substring(0, 10).replace(/-/g, '.');
  const statementPageUrl = `https://e.khanbank.com/pagePrint?content=ucAcnt_Statement2&ID=0000000${accountNumber}&CUR=MNT&MD=D&ST=${today}&ED=${today}`;
  await page.goto(statementPageUrl);

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

async function fetchStatement(username, password, accountNumber) {
  const browser = await pie.connect(app, puppeteer);
  const window = new BrowserWindow({ show: false });
  
  await window.webContents.session.clearStorageData({ origin: 'https://e.khanbank.com' });

  const url = "https://e.khanbank.com/pageLoginMini";
  await window.loadURL(url);
  const page = await pie.getPage(browser, window);

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

  const body = await page.evaluate(() => {
    return document.querySelector('body').innerHTML;
  });

  page.$eval('#txtCustNo', (el, value) => el.value = value, username);
  page.$eval('#txtPassword', (el, value) => el.value = value, password);
  
  return new Promise((resolve, reject) => {
    page.on('response', async (response) => {
      // Login ajax response
      if (response.url().startsWith('https://e.khanbank.com/pageLoginMini') && response.request().method() === 'POST') {
        const data = await response.text();

        log.info(responseCookieHeaders[response.request()._requestId])
        const cookies = responseCookieHeaders[response.request()._requestId];
        // Successfully logged in
        if (cookies && cookies.includes('ASPXAUTH')) {
          await new Promise(r => setTimeout(r, 5000));
          try {
            const statements = await _getTodaysIncomeStatement(page, accountNumber);
            resolve(statements);
          } catch (error) {
            console.log(error);
            reject('SOFT_ERR_STATEMENT_DOWNLOAD');
          }
          window.close();
          return;
        }

        // Captcha required or entered wrong captcha
        if (data.includes('pnlCaptcha')) {
          window.show();
          grabAttention(window, 'Captcha needed. Captcha-г бөглөөд "Нэвтрэх" дарна уу.');
          return;
        }
  
        // Error message
        const errorMatch = /Info1_warningMsg1".*?>(.*?)</gmsi.exec(data);
        if (errorMatch != null && errorMatch.length >= 1) {
          reject(errorMatch[1]);
          window.close();
          return;
        }

        // Unknown error
        window.show();
        grabAttention(window, 'Unknown error???');
      }
    });

    window.on('closed', () => {
      reject('Closed');
    });

    // Captcha required on initial page load
    if (body.includes('pnlCaptcha')) {
      window.show();
      // window.flashFrame(true);
      grabAttention(window, 'Captcha needed. Captcha-г бөглөөд "Нэвтрэх" дарна уу.');
    } else {
      page.click("input[type=submit]");
    }
  });
}

function grabAttention(window, message) {
  dialog.showMessageBox(window, {
    type: 'warning',
    title: 'Attention',
    message: message,
  });
}

export { fetchStatement };


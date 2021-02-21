'use strict'

// eslint-disable-next-line no-unused-vars
import { app, protocol, BrowserWindow, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import pie from 'puppeteer-in-electron';
import { AppMain } from './app';
import updater from './updater';
import * as Sentry from "@sentry/electron";
const windowStateKeeper = require('electron-window-state');

(async () => {
  Sentry.init({
    dsn: "https://93e668898a53443d8025ff7f7b56f2d2@o465414.ingest.sentry.io/5478000",
  });

  const isDevelopment = process.env.NODE_ENV !== 'production'

  // Ignore weak Khanbank certificate on MacOS
  app.commandLine.appendSwitch('ignore-certificate-errors')

  await pie.initialize(app);

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win

  // Scheme must be registered before the app is ready
  protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
  ])

  function createWindow() {
    let mainWindowState = windowStateKeeper();

    // Create the browser window.
    win = new BrowserWindow({
      width: 650,
      height: 270,
      x: mainWindowState.x,
      y: mainWindowState.y,
      webPreferences: {
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        enableRemoteModule: true,
      },
      show: false,
      backgroundColor: '#1a202c'
    })

    mainWindowState.manage(win);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
      if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      // Load the index.html when not in development
      win.loadURL('app://./index.html')
      updater(win)
    }

    win.on('closed', () => {
      win = null
    })

    win.once('ready-to-show', () => {
      win.show()
    })

    win.removeMenu()
  }

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      try {
        await installExtension(VUEJS_DEVTOOLS)
      } catch (e) {
        console.error('Vue Devtools failed to install:', e.toString())
      }
    }
    createWindow()
    globalShortcut.register('Alt+CommandOrControl+I', () => {
      win.webContents.toggleDevTools()
    })

    new AppMain(win);
  })

  // Exit cleanly on request from parent process in development mode.
  if (isDevelopment) {
    if (process.platform === 'win32') {
      process.on('message', (data) => {
        if (data === 'graceful-exit') {
          app.quit()
        }
      })
    } else {
      process.on('SIGTERM', () => {
        app.quit()
      })
    }
  }
})();

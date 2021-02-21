import { autoUpdater } from 'electron-updater';
import { ipcMain } from 'electron';

export default function(win) {
  ipcMain.on('checkForUpdate', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  ipcMain.on('restart', () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('checking-for-update', () => {
    win.webContents.send('update', {
      finished: false,
      status: 'Checking for update...',
    });
  });
  autoUpdater.on('update-available', () => {
    win.webContents.send('update', {
      finished: false,
      status: 'Update available. Starting...',
    });
  });
  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update', {
      finished: true,
      status: 'Up to date.',
    });
  });
  autoUpdater.on('error', (err) => {
    console.error('Update error', err);
    win.webContents.send('update', {
      finished: true,
      status: 'Update failed.',
    });
  });
  autoUpdater.on('download-progress', (progressObj) => {
    win.webContents.send('update', {
      finished: false,
      status: `Downloading... ${progressObj.percent.toFixed(2)}%`,
    });
  });
  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update', {
      finished: true,
      status: 'Update downloaded. Restart now to install it.',
    });
  });
}

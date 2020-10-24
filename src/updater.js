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
    win.webContents.send('update', 'Checking for update...');
  });
  autoUpdater.on('update-available', () => {
    win.webContents.send('update', 'Update available. Starting...');
  });
  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update', 'Up to date.');
  });
  autoUpdater.on('error', (err) => {
    win.webContents.send('update', `Update error. ${err}`);
  });
  autoUpdater.on('download-progress', (progressObj) => {
    win.webContents.send('update', `Downloading... ${progressObj.percent.toFixed(2)}%`);
  });
  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update', 'Update downloaded. Restart now to install it.');
  });
}

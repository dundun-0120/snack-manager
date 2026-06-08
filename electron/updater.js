const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');

let mainWindow = null;

function initUpdater(win) {
  mainWindow = win;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox(mainWindow, {
      type: 'info', title: '发现新版本',
      message: `发现新版本 v${info.version}，正在后台下载...`,
      buttons: ['好的'],
    });
  });

  autoUpdater.on('download-progress', (progress) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-progress', progress.percent);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox(mainWindow, {
      type: 'info', title: '更新就绪',
      message: `新版本 v${info.version} 已下载完成，是否立即安装？`,
      buttons: ['立即安装', '稍后'], defaultId: 0,
    }).then((result) => { if (result.response === 0) autoUpdater.quitAndInstall(); });
  });

  autoUpdater.on('error', (err) => { console.error('Update error:', err); });
}

function checkForUpdates() { autoUpdater.checkForUpdates(); }

module.exports = { initUpdater, checkForUpdates };

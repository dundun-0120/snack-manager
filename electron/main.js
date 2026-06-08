const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { initUpdater, checkForUpdates } = require('./updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: '家庭零食管理系统',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => { mainWindow = null; });

  if (process.env.NODE_ENV !== 'development') {
    initUpdater(mainWindow);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('get-app-version', () => app.getVersion());

const VERSION_HISTORY = [
  { version: '3.0.4', date: '2026-06-08', notes: '修复按钮文字显示、更新逻辑优化' },
  { version: '3.0.3', date: '2026-06-08', notes: '修复设置页面按钮样式、更新按钮功能、添加版本库回退功能' },
  { version: '3.0.2', date: '2026-06-08', notes: '修复设置页面按钮样式' },
  { version: '3.0.1', date: '2026-06-07', notes: '修复推荐页面图片和外部浏览器跳转' },
  { version: '3.0.0', date: '2026-06-07', notes: '新增用户系统、家庭管理、云端同步、自动更新' },
  { version: '2.0.0', date: '2026-05-30', notes: '新增零食推荐、AI识图、数据统计' },
  { version: '1.0.0', date: '2026-05-20', notes: '初始版本，基础零食管理功能' },
];

ipcMain.handle('check-update', async () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const currentVersion = pkg.version;

  try {
    const https = require('https');
    const githubApiUrl = 'https://api.github.com/repos/dundun-0120/snack-manager/releases/latest';

    const latestRelease = await new Promise((resolve, reject) => {
      https.get(githubApiUrl, {
        headers: {
          'User-Agent': 'snack-manager-app',
          'Accept': 'application/vnd.github.v3+json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else if (res.statusCode === 404) {
            resolve({ tag_name: 'v' + currentVersion, body: '暂无更新说明', html_url: '' });
          } else {
            reject(new Error(`GitHub API 返回 ${res.statusCode}`));
          }
        });
      }).on('error', reject);
    });

    const latestVersion = latestRelease.tag_name.replace(/^v/, '');
    const releaseNotes = latestRelease.body || '暂无更新说明';
    const htmlUrl = latestRelease.html_url || '';

    const assets = latestRelease.assets || [];
    const dmgAsset = assets.find(a => a.name && a.name.endsWith('.dmg'));
    const hasDmg = !!dmgAsset;
    const downloadUrl = dmgAsset ? dmgAsset.browser_download_url : htmlUrl;

    const latestParts = latestVersion.split('.').map(Number);
    const currentParts = currentVersion.split('.').map(Number);
    let isNewer = false;
    for (let i = 0; i < 3; i++) {
      if ((latestParts[i] || 0) > (currentParts[i] || 0)) {
        isNewer = true;
        break;
      } else if ((latestParts[i] || 0) < (currentParts[i] || 0)) {
        break;
      }
    }

    return {
      currentVersion,
      latestVersion,
      hasUpdate: isNewer,
      hasDmg,
      releaseNotes,
      downloadUrl,
      versionHistory: VERSION_HISTORY,
    };
  } catch (err) {
    console.error('检查更新失败:', err);
    return {
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
      releaseNotes: '检查更新失败：' + err.message,
      downloadUrl: '',
      versionHistory: VERSION_HISTORY,
      error: err.message,
    };
  }
});

ipcMain.handle('open-version-history', () => {
  const { shell } = require('electron');
  shell.openExternal('https://github.com/dundun-0120/snack-manager/releases');
});

ipcMain.handle('rollback-version', async (event, targetVersion) => {
  const { shell } = require('electron');
  const url = `https://github.com/dundun-0120/snack-manager/releases/tag/v${targetVersion}`;
  await shell.openExternal(url);
  return { success: true, message: `已打开 v${targetVersion} 下载页面，请下载后覆盖安装` };
});

ipcMain.handle('open-external', async (event, url) => {
  const { shell } = require('electron');
  await shell.openExternal(url);
});

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openVersionHistory: () => ipcRenderer.invoke('open-version-history'),
  rollbackVersion: (version) => ipcRenderer.invoke('rollback-version', version),
  platform: process.platform,
});

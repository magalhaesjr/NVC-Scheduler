// Exposes necessary functionality from the main process using context isolation
const { contextBridge, ipcRenderer } = require('electron');
// Expose interfaces for scheduler
contextBridge.exposeInMainWorld('toolApi', {
  loadTemplates: (callback) => ipcRenderer.on('load-Templates', callback),
  importFile: (callback) => ipcRenderer.on('templateTool:importFile', callback),
  writeTemplate: (template) =>
    ipcRenderer.invoke('templateTool:writeTemplate', template),
  readSheet: (sheet) => ipcRenderer.invoke('templateTool:readSheet', sheet),
});

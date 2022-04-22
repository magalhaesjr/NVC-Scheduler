// Exposes necessary functionality from the main process using context isolation
const {contextBridge, ipcRenderer} = require('electron');
// Expose interfaces for scheduler
contextBridge.exposeInMainWorld('toolApi', {
    readExcelFile: (filename)=>ipcRenderer.invoke('templateTool:readExcelFile', filename
});
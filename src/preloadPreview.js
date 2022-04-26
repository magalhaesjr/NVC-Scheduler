// Exposes necessary functionality from the main process using context isolation
const {contextBridge, ipcRenderer} = require('electron');
// Expose interfaces for scheduler
contextBridge.exposeInMainWorld('previewApi', {
    updateTeamPreview: (callback)=>ipcRenderer.on('preview:updatePreview', callback),
    initTeamPreview: (callback)=>ipcRenderer.on('preview:initPreview', callback)
});
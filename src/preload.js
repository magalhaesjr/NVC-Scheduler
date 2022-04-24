// Exposes necessary functionality from the main process using context isolation
const {contextBridge, ipcRenderer} = require('electron');
// Expose interfaces for scheduler
contextBridge.exposeInMainWorld('api', {
    onStart: (callback)=>ipcRenderer.on('start-template-schedule', callback),
    assignTeams: (costMatrix)=>ipcRenderer.invoke('scheduler:assignTeams', costMatrix),
    importTeamInfo: ()=>ipcRenderer.invoke('scheduler:importTeamInfo'),
    importTemplates: async ()=> {return await ipcRenderer.invoke('scheduler:importTemplates')},
    launchTeamPreview: (teamPreview, teamNum)=>ipcRenderer.invoke('scheduler:launchTeamPreview', teamPreview, teamNum),
    saveSchedule: (outputData, byeData)=>ipcRenderer.invoke('scheduler:saveSchedule', outputData, byeData),
});
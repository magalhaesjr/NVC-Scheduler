import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  onStart: (callback: () => void) =>
    ipcRenderer.on('start-template-schedule', callback),
  assignTeams: (costMatrix: number[]) =>
    ipcRenderer.invoke('scheduler:assignTeams', costMatrix),
  importTeamInfo: () => ipcRenderer.invoke('scheduler:importTeamInfo'),
  importTemplates: async () => {
    return ipcRenderer.invoke('scheduler:importTemplates');
  },
  launchTeamPreview: (channel: string, msg: unknown) =>
    ipcRenderer.invoke('scheduler:launchTeamPreview', channel, msg),
  saveSchedule: (channel: string, msg: unknown) =>
    ipcRenderer.invoke('scheduler:saveSchedule', channel, msg),
});

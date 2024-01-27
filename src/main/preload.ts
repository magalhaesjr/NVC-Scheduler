import { Season } from 'domain/template';
import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  onSeasonChange: (
    callback: (event: IpcRendererEvent, season: Season) => void
  ) => ipcRenderer.on('scheduler:changeSeason', callback),
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

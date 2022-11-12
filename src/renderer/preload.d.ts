declare global {
  interface Window {
    electron: {
      onStart: (callback: () => void) => void;
      assignTeams: (costMatrix: number[]) => void;
      importTeamInfo: () => void;
      importTemplates: () => Promise<void>;
      launchTeamPreview: (channel: string, msg: unknown) => void;
      saveSchedule: (channel: string, msg: unknown) => void;
    };
  }
}

export {};

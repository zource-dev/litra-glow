import { contextBridge, ipcRenderer, shell } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  saveConfig: (config: any) => ipcRenderer.send('config-save', config),
  litra: {
    setState: (state: boolean) => {
      ipcRenderer.send('litra-state', state);
    },
    setBrightness: (level: number) => {
      ipcRenderer.send('litra-brightness', level);
    },
    setTemperature: (level: number) => {
      ipcRenderer.send('litra-temperature', level);
    },
  },
  win: {
    donate: () => shell.openExternal('https://www.buymeacoffee.com/zource'),
    minimize: () => ipcRenderer.send('minimize'),
    close: () => ipcRenderer.send('close'),
  },
});

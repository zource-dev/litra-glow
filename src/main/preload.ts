import { contextBridge, ipcRenderer, shell } from 'electron';

contextBridge.exposeInMainWorld('config', {
  save: (config: any) => ipcRenderer.send('config-save', config),
});

contextBridge.exposeInMainWorld('litra', {
  setState: (state: boolean) => {
    ipcRenderer.send('litra-state', state);
  },
  setBrightness: (level: number) => {
    ipcRenderer.send('litra-brightness', level);
  },
  setTemperature: (level: number) => {
    ipcRenderer.send('litra-temperature', level);
  },
  onUpdate: (callback: (value: any) => any) => {
    ipcRenderer.on('litra-update', (_, value: any) => callback(value));
  },
});

contextBridge.exposeInMainWorld('win', {
  donate: () => shell.openExternal('https://www.buymeacoffee.com/zource'),
  minimize: () => ipcRenderer.send('minimize'),
  close: () => ipcRenderer.send('close'),
});

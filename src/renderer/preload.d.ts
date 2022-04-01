declare global {
  interface Window {
    electron: {
      saveConfig: (config: any) => void;
      litra: {
        setState(state: boolean): void;
        setBrightness(level: number): void;
        setTemperature(level: number): void;
      };
      win: {
        donate: () => void;
        minimize: () => void;
        close: () => void;
      };
    };
  }
}

export {};

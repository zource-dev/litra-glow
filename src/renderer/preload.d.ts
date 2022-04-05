declare global {
  interface Window {
    config: {
      save: (config: any) => void;
    };
    litra: {
      setState(state: boolean): void;
      setBrightness(level: number): void;
      setTemperature(level: number): void;
      onUpdate(callback: (update: [string, number]) => void): void;
    };
    win: {
      donate: () => void;
      minimize: () => void;
      close: () => void;
    };
  }
}

export {};

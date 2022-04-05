window.config = {
  save: jest.fn(),
};
window.litra = {
  setState: jest.fn(),
  setBrightness: jest.fn(),
  setTemperature: jest.fn(),
  onUpdate: jest.fn(),
};
window.win = {
  donate: jest.fn(),
  minimize: jest.fn(),
  close: jest.fn(),
};

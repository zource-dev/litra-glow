import { usb } from 'usb';

export { DeviceInterface, default as Device } from './Device';

export const setDebugLevel = (level: 0 | 1 | 2 | 3 | 4) => {
  usb.setDebugLevel(level);
};

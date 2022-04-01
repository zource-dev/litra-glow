import { usb } from 'usb';

export { DeviceInterface, default as Device } from './Device';
export { default as Interface } from './Interface';

export const setDebugLevel = (level: 0 | 1 | 2 | 3 | 4) => {
  usb.setDebugLevel(level);
};

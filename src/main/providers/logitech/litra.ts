import Device, { DeviceInterface } from '../../driver/Device';
import promised from '../../utils/promised';

const VENDOR_ID = 0x046d;
const PRODUCT_ID = 0xc900;

const ENDPOINT_OUT = 0x02;
const ENDPOINT_IN = 0x82;

export const MIN_BRIGHTNESS = 0x14;
export const MAX_BRIGHTNESS = 0xfa;

const COMMAND_POWER = 301925404;
const COMMAND_BRIGHTNESS = 301925452;
const COMMAND_TEMPERATURE = 301925532;

export interface LitraDevice extends DeviceInterface {
  vendorId: 0x046d;
  productId: 0xc900;
}

export const create = () => new Device(VENDOR_ID, PRODUCT_ID) as LitraDevice;

export const setState = async (device: LitraDevice, state: boolean) => {
  const buffer = Buffer.alloc(20);
  buffer.writeUInt32BE(COMMAND_POWER);
  buffer.writeUInt8(+state, 4);
  await device.write(ENDPOINT_OUT, buffer);
};

// 1 - 100
export const setBrightness = async (device: LitraDevice, level: number) => {
  const buffer = Buffer.alloc(20);
  buffer.writeUInt32BE(COMMAND_BRIGHTNESS);
  buffer.writeUInt16BE(level, 4);
  await device.write(ENDPOINT_OUT, buffer);
};

// 2700 - 6500
export const setTemperature = async (device: LitraDevice, level: number) => {
  const buffer = Buffer.alloc(20);
  buffer.writeUInt32BE(COMMAND_TEMPERATURE);
  buffer.writeUInt16BE(level, 4);
  await device.write(ENDPOINT_OUT, buffer);
};

export const listen = async (device: LitraDevice, callback: (name: string, value: number) => any) => {
  await setState(device, false);

  for await (const data of device.read(ENDPOINT_IN)) {
    switch (data?.[3]) {
      case 0x00:
        callback('power', data[4]);
        break;
      case 0x10:
        callback('brightness', data[5]);
        break;
      case 0x20:
        callback('temperature', data.slice(4, 6).readUInt16BE());
        break;
    }
    console.log('LISTEN', data);
  }
};

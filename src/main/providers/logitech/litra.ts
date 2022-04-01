import Device, { DeviceInterface } from '../../driver/Device';
import promised from '../../utils/promised';

const VENDOR_ID = 0x046d;
const PRODUCT_ID = 0xc900;

const ENDPOINT_OUT = 0x02;
const ENDPOINT_IN = 0x82;

const MIN_BRIGHTNESS = 0x14;
const MAX_BRIGHTNESS = 0xfa;

export interface LitraDevice extends DeviceInterface {
  vendorId: 0x046d;
  productId: 0xc900;
}

export const create = async () => new Device(VENDOR_ID, PRODUCT_ID) as LitraDevice;

export const setState = async (device: LitraDevice, state: boolean) => {
  const iface = device.interface(0);
  const endpoint = iface.endpoint(ENDPOINT_OUT);
  if (endpoint?.direction === 'out') {
    await promised(endpoint.transfer, endpoint, Buffer.from([0x11, 0xff, 0x04, 0x1c, +state, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
  }
  const endpointIn = iface.endpoint(ENDPOINT_IN);
  if (endpointIn?.direction === 'in') {
    await promised(endpointIn.transfer, endpointIn, 64);
  }
};

// 1 - 100
export const setBrightness = async (device: LitraDevice, level: number) => {
  const brightness = Math.floor(MIN_BRIGHTNESS + (level / 100) * (MAX_BRIGHTNESS - MIN_BRIGHTNESS));
  const iface = device.interface(0);
  const endpointOut = iface.endpoint(ENDPOINT_OUT);
  if (endpointOut?.direction === 'out') {
    await promised(endpointOut.transfer, endpointOut, Buffer.from([0x11, 0xff, 0x04, 0x4c, 0x00, brightness, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
  }
  const endpointIn = iface.endpoint(ENDPOINT_IN);
  if (endpointIn?.direction === 'in') {
    await promised(endpointIn.transfer, endpointIn, 64);
  }
};

// 2700 - 6500
export const setTemperature = async (device: LitraDevice, level: number) => {
  const [low, high] = level
    .toString(16)
    .padStart(4, '0')
    .match(/.{2}/g)
    ?.map((b) => parseInt(b, 16)) || [0, 0];
  const iface = device.interface(0);
  const endpoint = iface.endpoint(ENDPOINT_OUT);
  if (endpoint?.direction === 'out') {
    await promised(endpoint.transfer, endpoint, Buffer.from([0x11, 0xff, 0x04, 0x9c, low, high, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
  }
  const endpointIn = iface.endpoint(ENDPOINT_IN);
  if (endpointIn?.direction === 'in') {
    await promised(endpointIn.transfer, endpointIn, 64);
  }
};

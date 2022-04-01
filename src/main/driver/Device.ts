import { usb, findByIds } from 'usb';
import Interface from './Interface';
import promised from '../utils/promised';

export interface DeviceInterface {
  vendorId: number;
  productId: number;
  interface(addr: number): Interface;
  dispose(): Promise<void>;
}

export default class Device implements DeviceInterface {
  private static devices = new Set<usb.Device>();

  private interfaces = new Map<number, Interface>();

  private device: usb.Device;

  constructor(public readonly vendorId: number, public readonly productId: number) {
    const device = findByIds(vendorId, productId);
    if (device) {
      try {
        device.open();
        this.device = device;
        Device.devices.add(this.device);
      } catch (e) {
        device.close();
        throw e;
      }
    } else {
      throw new Error('Device not found');
    }

    ['SIGTERM', 'SIGINT'].map((event) => process.on(event, () => this.dispose()));
  }

  interface(addr: number) {
    if (!this.interfaces.has(addr)) {
      const iface = new Interface(this.device.interface(addr));
      this.interfaces.set(addr, iface);
    }

    return this.interfaces.get(addr) as Interface;
  }

  async reset() {
    await promised(this.device.reset, this.device);
  }

  async dispose() {
    await Promise.all([...this.interfaces.values()].map(async (iface) => iface.dispose()));
    this.device.close();
  }
}

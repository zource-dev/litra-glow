import { usb, findByIds } from 'usb';
import { Interface } from 'usb/dist/usb/interface';
import type * as USBEndpoint from 'usb/dist/usb/endpoint';
import promised from '../utils/promised';

interface EndpointIn extends USBEndpoint.InEndpoint {
  direction: 'in';
}

interface EndpointOut extends USBEndpoint.OutEndpoint {
  direction: 'out';
}

export interface DeviceInterface {
  vendorId: number;
  productId: number;
  ifaceAddr: number;
  write(addr: number, buffer: Buffer): Promise<number>;
  read(addr: number, size?: number): AsyncGenerator<Buffer | undefined, void, unknown>;
  dispose(): Promise<void>;
}

export default class Device implements DeviceInterface {
  private device: usb.Device;

  private iface: Interface;

  private reattach = false;

  private disposing = false;

  constructor(public readonly vendorId: number, public readonly productId: number, public readonly ifaceAddr: number = 0) {
    const device = findByIds(vendorId, productId);
    if (device) {
      try {
        device.open();
        const iface = device.interface(ifaceAddr);
        if (iface.isKernelDriverActive()) {
          iface.detachKernelDriver();
          this.reattach = true;
        }
        iface.claim();

        this.device = device;
        this.iface = iface;
      } catch (e) {
        device.close();
        throw e;
      }
    } else {
      throw new Error('Device not found');
    }

    ['SIGTERM', 'SIGINT'].map((event) => process.on(event, () => this.dispose()));
  }

  async write(addr: number, buffer: Buffer) {
    const endpoint = this.iface.endpoint(addr) as EndpointIn | EndpointOut | undefined;
    if (endpoint?.direction === 'out') {
      return promised(endpoint.transfer, endpoint, buffer);
    }
    return 0;
  }

  async *read(addr: number, size = 64) {
    const endpoint = this.iface.endpoint(addr) as EndpointIn | EndpointOut | undefined;
    if (endpoint?.direction === 'in') {
      while (!this.disposing) {
        // eslint-disable-next-line no-await-in-loop
        const data = await promised(endpoint.transfer, endpoint, size);
        yield data;
      }
    }
  }

  async reset() {
    await promised(this.device.reset, this.device);
  }

  async dispose() {
    this.disposing = true;
    await promised(this.iface.release, this.iface).catch(Boolean);
    if (this.reattach) {
      this.iface.attachKernelDriver();
    }
    this.device.close();
  }
}

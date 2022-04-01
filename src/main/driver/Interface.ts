import type * as USBInterface from 'usb/dist/usb/interface';
import type * as USBEndpoint from 'usb/dist/usb/endpoint';
import promised from '../utils/promised';

type EndpointIn = USBEndpoint.InEndpoint;

type EndpointOut = USBEndpoint.OutEndpoint;

export default class Interface {
  private reattach = false;

  constructor(private iface: USBInterface.Interface) {
    try {
      if (iface.isKernelDriverActive()) {
        iface.detachKernelDriver();
        this.reattach = true;
      }
      iface.claim();
    } catch (e) {
      this.dispose();
    }
  }

  descriptor() {
    return this.iface.descriptor;
  }

  endpoint(addr: number): EndpointIn | EndpointOut | undefined {
    return this.iface.endpoint(addr) as any;
  }

  async dispose() {
    await promised(this.iface.release, this.iface);
    if (this.reattach) {
      this.iface.attachKernelDriver();
    }
  }
}

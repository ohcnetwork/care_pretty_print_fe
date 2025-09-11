declare module "zebra-browser-print" {
  export default class BrowserPrint {
    getDefaultDevice(
      type: string,
      successCallback: (device: PrinterDevice) => void,
      errorCallback: (error: any) => void,
    ): void;
  }

  export interface PrinterDevice {
    name: string;
    send(
      data: string,
      successCallback: () => void,
      errorCallback: (error: any) => void,
    ): void;
  }
}

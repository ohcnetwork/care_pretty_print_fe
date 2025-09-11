import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";
import type { Device } from "zebra-browser-print-wrapper/lib/types";

interface PrinterStatus {
  status: "ready" | "error" | "not_connected";
  printer?: string;
  connection?: string;
  isReadyToPrint?: boolean;
  errors?: string[] | string;
  error?: string;
}

class ZC300PrinterManager {
  private wrapper: ZebraBrowserPrintWrapper;
  private selectedPrinter: Device | null = null;

  constructor() {
    this.wrapper = new ZebraBrowserPrintWrapper();
  }

  async initialize(): Promise<boolean> {
    // The wrapper doesn't need initialization, just return true
    return true;
  }

  async getAvailablePrinters(): Promise<Device[]> {
    try {
      const printers = await this.wrapper.getAvailablePrinters();
      console.log("Available printers:", printers);

      // Handle case where result might be an error
      if (printers instanceof Error) {
        console.error("No printers available:", printers.message);
        return [];
      }

      return printers || [];
    } catch (error) {
      console.error("Failed to get available printers:", error);
      return [];
    }
  }

  async findZC300Printer(): Promise<Device | null> {
    try {
      // First try to get the default printer
      try {
        const defaultPrinter = await this.wrapper.getDefaultPrinter();
        if (
          defaultPrinter &&
          (defaultPrinter.name.toLowerCase().includes("zc300") ||
            defaultPrinter.name.toLowerCase().includes("192.168.165.60") ||
            defaultPrinter.deviceType?.toLowerCase().includes("card"))
        ) {
          console.log("Found ZC300 as default printer:", defaultPrinter);
          return defaultPrinter;
        }
      } catch (_error) {
        console.log(
          "No default printer or not ZC300, checking available printers...",
        );
      }

      // If default is not ZC300, check all available printers
      const printers = await this.getAvailablePrinters();

      // Look for ZC300 printers specifically
      const zc300Printer = printers.find(
        (printer) =>
          printer.name.toLowerCase().includes("zc300") ||
          printer.name.toLowerCase().includes("192.168.165.60") ||
          printer.deviceType?.toLowerCase().includes("card"),
      );

      if (zc300Printer) {
        console.log("Found ZC300 printer:", zc300Printer);
        return zc300Printer;
      }

      // If no specific ZC300 found, return first available printer
      if (printers.length > 0) {
        console.log(
          "No ZC300 found, using first available printer:",
          printers[0],
        );
        return printers[0];
      }

      return null;
    } catch (error) {
      console.error("Error finding ZC300 printer:", error);
      return null;
    }
  }

  async connectToZC300(): Promise<boolean> {
    try {
      const printer = await this.findZC300Printer();
      if (!printer) {
        throw new Error("No ZC300 printer found");
      }

      this.wrapper.setPrinter(printer);
      this.selectedPrinter = printer;
      console.log("Connected to printer:", printer.name);
      return true;
    } catch (error) {
      console.error("Failed to connect to ZC300:", error);
      return false;
    }
  }

  async printZPL(zplCommand: string): Promise<boolean> {
    try {
      if (!this.selectedPrinter) {
        const connected = await this.connectToZC300();
        if (!connected) {
          throw new Error("No printer connected");
        }
      }

      console.log("Sending ZPL command to ZC300:", zplCommand);
      await this.wrapper.print(zplCommand);
      console.log("ZPL command sent successfully");
      return true;
    } catch (error) {
      console.error("Failed to print ZPL:", error);
      return false;
    }
  }

  getSelectedPrinter(): Device | null {
    return this.selectedPrinter;
  }

  isConnected(): boolean {
    return this.selectedPrinter !== null;
  }

  async checkPrinterStatus(): Promise<PrinterStatus> {
    try {
      if (!this.selectedPrinter) {
        return { status: "not_connected" };
      }

      // Use the wrapper's built-in status check
      const status = await this.wrapper.checkPrinterStatus();
      return {
        status: status.isReadyToPrint ? "ready" : "error",
        printer: this.selectedPrinter.name,
        connection: this.selectedPrinter.connection,
        isReadyToPrint: status.isReadyToPrint,
        errors: status.errors,
      };
    } catch (error) {
      console.error("Failed to check printer status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { status: "error", error: errorMessage };
    }
  }
}

export default ZC300PrinterManager;

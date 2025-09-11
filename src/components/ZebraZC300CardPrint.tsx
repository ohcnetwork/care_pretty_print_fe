import { CreditCard, Loader2, Printer } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { PatientRead } from "@/types/types";
import { getPatientId } from "@/utils";
import ZC300PrinterManager from "@/utils/ZC300PrinterManager";

interface ZebraZC300CardPrintProps {
  patient: PatientRead;
  className?: string;
}

export default function ZebraZC300CardPrint({
  patient,
  className,
}: ZebraZC300CardPrintProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [printerManager] = useState(() => new ZC300PrinterManager());
  const [printerInfo, setPrinterInfo] = useState<string>("");

  const formatGender = (gender: string): string => {
    switch (gender.toLowerCase()) {
      case "male":
        return "M";
      case "female":
        return "F";
      case "non_binary":
        return "NB";
      case "transgender":
        return "T";
      default:
        return "N/A";
    }
  };

  const calculateAge = (dateOfBirth?: string): number | string => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return "N/A";
    // Format phone number if needed
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  const getPatientData = () => ({
    name: patient.name?.toUpperCase() || "",
    patientID: patient.id || "",
    id: getPatientId(patient),
    age: calculateAge(patient.date_of_birth),
    sex: patient.gender ? formatGender(patient.gender) : "N/A",
    phone: formatPhoneNumber(patient.phone_number),
    dateOfBirth: patient.date_of_birth
      ? new Date(patient.date_of_birth).toLocaleDateString()
      : "N/A",
    printDate: new Date().toLocaleDateString(),
    printTime: new Date().toLocaleTimeString(),
  });

  const generateZPLCommand = (
    data: ReturnType<typeof getPatientData>,
  ): string => {
    const zpl = `^XA

^FX Paient name 
^CFA,45
^FO50,300^FD${data.name}^FS
^CFA,40
^CFA,35
^FO50,430^FDID.No. :^FS 
^FO250,430^FD${data.id}^FS 
^CFA,35
^FO50,480^FDAge/Sex:^FS 
^FO250,480^FD${data.age}/${data.sex}^FS 
^CFA,30
^FO700,250^FD12/08/2025^FS


^FX bar code
^BY2,2,70
^FO600,450^BC,,N^FD${data.patientID}^FS

^XZ`;

    return zpl;
  };

  const connectToPrinter = async (): Promise<void> => {
    try {
      // Initialize the printer manager
      const initialized = await printerManager.initialize();
      if (!initialized) {
        throw new Error(
          "Failed to initialize Zebra Browser Print. Please ensure it's installed and running.",
        );
      }

      // Connect to ZC300 printer
      const connected = await printerManager.connectToZC300();
      if (!connected) {
        throw new Error("Failed to connect to ZC300 printer.");
      }

      const printer = printerManager.getSelectedPrinter();
      if (printer) {
        setPrinterInfo(printer.name);
        setIsConnected(true);
        console.log("Connected to ZC300 printer:", printer.name);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setIsConnected(false);
      setPrinterInfo("");
      throw error;
    }
  };

  const handleZebraPrint = async (): Promise<void> => {
    setIsPrinting(true);

    try {
      // Connect if not already connected
      if (!isConnected) {
        await connectToPrinter();
      }

      const printData = getPatientData();
      const zplCommand = generateZPLCommand(printData);

      console.log("Sending ZPL command to ZC300:", zplCommand);

      // Send ZPL command to printer using the manager
      const success = await printerManager.printZPL(zplCommand);
      if (!success) {
        throw new Error("Failed to send print job to ZC300 printer");
      }

      console.log("ID card printed successfully on ZC300");
    } catch (error) {
      console.error("ZC300 printing error:", error);
      // Reset connection state on error
      setIsConnected(false);
      setPrinterInfo("");
      throw error;
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintCard = async (): Promise<void> => {
    try {
      await handleZebraPrint();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown printing error";
      alert(`Printing failed: ${errorMessage}`);
    }
  };

  const handleTestConnection = async (): Promise<void> => {
    await connectToPrinter();
  };

  return (
    <div className={className}>
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <CreditCard className="size-5" />
            Zebra ZC300 ID Card Printer
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`size-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className={isConnected ? "text-green-700" : "text-red-700"}>
              {isConnected ? "Connected" : "Not connected"}
            </span>
            {printerInfo && (
              <span className="text-gray-500">({printerInfo})</span>
            )}
          </div>

          {/* Patient Information Preview */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Name:</strong> {patient.name}
              </p>
              <p>
                <strong>ID:</strong> {getPatientId(patient)}
              </p>
              <p>
                <strong>Age/Sex:</strong> {calculateAge(patient.date_of_birth)}/
                {patient.gender ? formatGender(patient.gender) : "N/A"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={isPrinting}
              variant="outline"
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Test Connection
            </Button>

            <Button
              onClick={handlePrintCard}
              disabled={isPrinting}
              variant="primary"
              className="flex-1"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Printing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Print ID Card
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

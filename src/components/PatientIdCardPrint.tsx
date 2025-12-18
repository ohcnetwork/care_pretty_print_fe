import { Loader2, Printer } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button, ButtonVariant } from "@/components/ui/button";

import type { PatientRead } from "@/types/types";
import { getPatientId } from "@/utils";

interface PatientIdCardPrintProps {
  patient: PatientRead;
  className?: string;
  __meta?: Record<string, unknown>;
  onlyShowPrintButton?: boolean;
  variant?: ButtonVariant;
}

export default function PatientIdCardPrint({
  patient,
  className,
  __meta,
  onlyShowPrintButton,
  variant = "link",
}: PatientIdCardPrintProps) {
  const [isPrinting, _setIsPrinting] = useState(false);

  const formatGender = (gender: string): string => {
    switch (gender.toLowerCase()) {
      case "male":
        return "M";
      case "female":
        return "F";
      case "non_binary":
        return "N";
      case "transgender":
        return "T";
      default:
        return "N/A";
    }
  };

  const getAge = (): number | string => {
    if (patient.date_of_birth) {
      return (
        new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
      );
    }
    if (patient.year_of_birth) {
      return new Date().getFullYear() - patient.year_of_birth;
    }
    return "-";
  };

  const getPatientData = () => ({
    name: patient.name?.toUpperCase() || "",
    patientID: patient.id || "",
    id: getPatientId(
      patient,
      __meta?.REACT_APP_PATIENT_IDENTIFIER_ID as string,
    ),
    age: getAge(),
    sex: patient.gender ? formatGender(patient.gender) : "-",
    date: new Date().toLocaleDateString(),
  });

  const handleBrowserPrint = async () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      console.error("Could not open print window");
      return;
    }

    const printData = getPatientData();

    try {
      // Generate QR code data URL
      const qrCodeDataURL = await QRCode.toDataURL(printData.patientID, {
        width: 100,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Patient ID Card</title>
          <style>
            @page {
              size: 4.375in auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              width: 4.375in;
              font-family: "Times New Roman", sans-serif;
              position: relative;
            }
            .card {
              width: 100%;
              padding: 0.25in;
              box-sizing: border-box;
              position: relative;
              top: 0.25in;
            }
            .name {
              font-size: 22px;
              font-weight: bold;
              position: absolute;
              top: 95px;
              left: 25px;
            }
            .op {
              font-size: 18px;
              position: absolute;
              top: 130px;
              left: 25px;
            }
            .age-sex {
              font-size: 18px;
              position: absolute;
              top: 155px;
              left: 25px;
            }
            .qrcode {
              position: absolute;
              top: 115px;
              right: 110px;
            }
            #qrcode {
              width: 75px;
              height: 75px;
            }
          </style>
          <script>
            window.onload = function() {
              const img = document.getElementById('qrcode');
              if (img.complete) {
                setTimeout(() => window.print(), 100);
              } else {
                img.onload = function() {
                  setTimeout(() => window.print(), 100);
                };
              }
            };
          </script>
        </head>
        <body>
          <div class="card">
            <div class="name">${printData.name}</div>
            <div class="op">ID No. : ${printData.id}</div>
            <div class="age-sex">Age/Sex : ${printData.age}/${printData.sex}</div>
            <div class="qrcode">
              <img id="qrcode" src="${qrCodeDataURL}" alt="QR Code" />
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.close();
      }, 500);
    } catch (error) {
      console.error("Error generating QR code:", error);
      printWindow.close();
    }
  };

  if (onlyShowPrintButton) {
    return (
      <Button
        data-shortcut-id="print-button"
        onClick={handleBrowserPrint}
        disabled={isPrinting}
        variant={variant}
        className={cn(className, "font-semibold")}
      >
        {isPrinting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Printer className="size-4" />
        )}
        Print ID Card
      </Button>
    );
  }

  return (
    <div className={className}>
      <div className="w-full bg-white border border-gray-200 rounded-md shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <Printer className="size-5" />
            Patient ID Card
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="text-sm text-gray-600 flex flex-col">
            <strong className="text-base">{patient.name}</strong>
            <span>
              <strong>ID No. :</strong>{" "}
              {getPatientId(
                patient,
                __meta?.REACT_APP_PATIENT_IDENTIFIER_ID as string,
              )}
            </span>
            <span>
              <strong>Age/Sex:</strong> {getAge()}/
              {patient.gender ? formatGender(patient.gender) : "-"}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              data-shortcut-id="print-button"
              onClick={handleBrowserPrint}
              disabled={isPrinting}
              variant="primary"
              className="flex-1"
            >
              {isPrinting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Printer className="size-4" />
              )}
              Card Printer
              <div className="size-5 rounded-md border text-black bg-white">
                P
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

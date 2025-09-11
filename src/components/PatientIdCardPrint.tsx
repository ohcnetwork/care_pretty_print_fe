import { Loader2, Printer } from "lucide-react";
import QRCode from "qrcode";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { PatientRead } from "@/types/types";
import { getPatientId } from "@/utils";

interface PatientIdCardPrintProps {
  patient: PatientRead;
  className?: string;
}

export default function PatientIdCardPrint({
  patient,
  className,
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

  const calculateAge = (dateOfBirth?: string): number | string => {
    if (!dateOfBirth) return "N/A";
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  };

  const getPatientData = () => ({
    name: patient.name?.toUpperCase() || "",
    patientID: patient.id || "",
    id: getPatientId(patient),
    age: calculateAge(patient.date_of_birth),
    sex: patient.gender ? formatGender(patient.gender) : "N/A",
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
              top: 100px;
              left: 25px;
            }
            .op {
              font-size: 18px;
              position: absolute;
              top: 135px;
              left: 25px;
            }
            .age-sex {
              font-size: 18px;
              position: absolute;
              top: 160px;
              left: 25px;
            }
            .qrcode {
              position: absolute;
              top: 110px;
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

  return (
    <div className={className}>
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <Printer className="size-5" />
            Patient ID Card
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="text-sm text-gray-600">
            <p>
              <strong>Patient:</strong> {patient.name}
            </p>
            <p>
              <strong>ID:</strong> {getPatientId(patient)}
            </p>
            <p>
              <strong>Age/Sex:</strong> {calculateAge(patient.date_of_birth)}/
              {patient.gender ? formatGender(patient.gender) : "N/A"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              data-shortcut-id="print-token"
              onClick={handleBrowserPrint}
              disabled={isPrinting}
              variant="primary"
              className="flex-1"
            >
              {isPrinting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              Card Printer
              <div className="size-5 rounded-md border border-gray-200">P</div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

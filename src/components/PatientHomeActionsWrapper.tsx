import type { PatientRead } from "@/types/types";

import PatientIdCardPrint from "./PatientIdCardPrint";
import ZebraZC300CardPrint from "./ZebraZC300CardPrint";

interface PatientHomeActionsWrapperProps {
  patient: PatientRead;
  className?: string;
}

export default function PatientHomeActionsWrapper({
  patient,
  className,
}: PatientHomeActionsWrapperProps) {
  // Get environment variables to control component visibility
  // Default to true if not set or if set to anything other than 'false'
  const enableBrowserPrint =
    import.meta.env.REACT_APP_ENABLE_BROWSER_PRINT !== "false";
  const enableZebraPrint =
    import.meta.env.REACT_APP_ENABLE_ZEBRA_ZC300_PRINT !== "false";

  // If no print components are enabled, don't render anything
  if (!enableBrowserPrint && !enableZebraPrint) {
    return null;
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Browser Print Section */}
        {enableBrowserPrint && <PatientIdCardPrint patient={patient} />}

        {/* ZC300 Basic Print Section */}
        {enableZebraPrint && <ZebraZC300CardPrint patient={patient} />}
      </div>
    </div>
  );
}

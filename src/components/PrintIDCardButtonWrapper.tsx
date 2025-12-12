import { ButtonVariant } from "@/components/ui/button";

import type { PatientRead } from "@/types/types";

import PatientIdCardPrint from "./PatientIdCardPrint";

interface PrintIDCardButtonWrapperProps {
  patient: PatientRead;
  className?: string;
  __meta?: Record<string, unknown>;
  variant?: ButtonVariant;
}

export default function PrintIDCardButtonWrapper({
  patient,
  className,
  __meta,
  variant,
}: PrintIDCardButtonWrapperProps) {
  const enableBrowserPrint =
    import.meta.env.REACT_APP_ENABLE_BROWSER_PRINT !== "false";

  if (!enableBrowserPrint) {
    return null;
  }

  return (
    <div className={className}>
      {enableBrowserPrint && (
        <PatientIdCardPrint
          patient={patient}
          __meta={__meta}
          onlyShowPrintButton
          className={className}
          variant={variant}
        />
      )}
    </div>
  );
}

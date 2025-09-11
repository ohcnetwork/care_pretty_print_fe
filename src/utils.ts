import type { PatientRead } from "./types/types";

/**
 * Get patient ID from instance identifiers based on identifier ID
 * @param patient - Patient object
 * @param identifierId - Identifier ID to match (defaults to environment variable)
 * @returns Patient ID value or fallback to first identifier or patient.id
 */
export const getPatientId = (
  patient: PatientRead,
  identifierId?: string,
): string => {
  const targetIdentifierId =
    identifierId || import.meta.env.REACT_APP_PATIENT_IDENTIFIER_ID;

  if (!patient.instance_identifiers?.length) {
    return patient.id || "";
  }

  // If a specific identifier ID is provided, try to find it
  if (targetIdentifierId) {
    const matchingIdentifier = patient.instance_identifiers.find(
      (identifier) => identifier.config.id === targetIdentifierId,
    );
    if (matchingIdentifier) {
      return matchingIdentifier.value || patient.id || "";
    }
  }

  // Fall back to the first identifier in the array
  const firstIdentifier = patient.instance_identifiers[0];
  return firstIdentifier?.value || patient.id || "";
};

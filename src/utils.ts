import dayjs from "dayjs";

import type { PatientRead } from "./types/types";

const getRelativeDateSuffix = (abbreviated: boolean) => {
  return {
    day: abbreviated ? "d" : "days",
    month: abbreviated ? "mo" : "months",
    year: abbreviated ? "Y" : "years",
  };
};

/**
 * Format patient age following the logic from care_fe core.
 *
 * - Uses `date_of_birth` when available for precise year/month/day output.
 * - Falls back to `year_of_birth` (Jan 1) when only the year is known.
 * - For patients less than 1 year old (with date_of_birth), returns months and days.
 * - If the patient is deceased, calculates age at time of death instead of now.
 * - Supports an `abbreviated` flag for short suffixes (e.g. "25 Y" vs "25 years").
 */
export const formatPatientAge = (
  patient: PatientRead,
  abbreviated = false,
): string => {
  const suffixes = getRelativeDateSuffix(abbreviated);

  const start = dayjs(
    patient.date_of_birth
      ? new Date(patient.date_of_birth)
      : new Date(patient.year_of_birth!, 0, 1),
  );

  const end = patient.deceased_datetime
    ? dayjs(new Date(patient.deceased_datetime))
    : dayjs(new Date());

  const years = end.diff(start, "years");
  if (years) {
    return `${years} ${suffixes.year}`;
  }

  // Skip representing as months/days if we don't know the date of birth
  // since it would be inaccurate.
  if (!patient.date_of_birth) {
    return abbreviated
      ? `Born ${patient.year_of_birth}`
      : `Born on ${patient.year_of_birth}`;
  }

  const month = end.diff(start, "month");
  const day = end.diff(start.add(month, "month"), "day");
  if (month) {
    return `${month}${suffixes.month} ${day}${suffixes.day}`;
  }
  return `${day}${suffixes.day}`;
};

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
    return "NIL";
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

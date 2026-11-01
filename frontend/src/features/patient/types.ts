/**
 * A patient as the workflows use them. Shaped after the JP Core Patient
 * profile (HL7 FHIR), so the hospital API maps onto it field by field.
 */
export type Patient = {
  /** The hospital's patient ID (identifier.value). */
  id: string;
  /** Kanji name, family and given name separated by a space. */
  name: string;
  /** Katakana reading of the name, in the same form. */
  kana: string;
  /** YYYY-MM-DD. */
  birthDate: string;
  gender: "male" | "female" | "other" | "unknown";
  /** Department in charge (診療科). */
  department: string;
  /** Where an inpatient stays; null for outpatients. */
  admission: { ward: string; room: string } | null;
  /** Another patient has the same kanji name. EMRs keep this flag in the patient master. */
  hasNamesake: boolean;
};

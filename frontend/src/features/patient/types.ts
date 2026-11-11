/** Shaped after JP Core Patient (HL7 FHIR), so the hospital API maps onto it. */
export type Patient = {
  id: string;
  /** Family and given name, separated by a space. */
  name: string;
  kana: string;
  /** YYYY-MM-DD. */
  birthDate: string;
  gender: "male" | "female" | "other" | "unknown";
  department: string;
  /** Null for outpatients. */
  admission: { ward: string; room: string } | null;
  /** Another patient has the same name (a patient-master flag in EMRs). */
  hasNamesake: boolean;
};

/** One hospital stay. */
export type Encounter = {
  id: string;
  department: string;
  ward: string;
  room: string;
  /** YYYY-MM-DD. */
  admittedOn: string;
  /** YYYY-MM-DD; null while the patient is still in hospital. */
  dischargedOn: string | null;
};

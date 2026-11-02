/**
 * Staff roles (職種). Labels live in t.account.roles, which TypeScript
 * requires for every role.
 */
export type StaffRole =
  | "doctor"
  | "nurse"
  | "pharmacist"
  | "radiological-technologist"
  | "laboratory-technologist"
  | "physical-therapist"
  | "occupational-therapist"
  | "speech-therapist"
  | "dietitian"
  | "social-worker"
  | "medical-clerk"
  | "office-staff";

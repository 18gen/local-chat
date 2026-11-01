/**
 * Staff roles (職種), in the order hospitals usually list them. A role is a
 * code; its label lives in the locale (t.account.roles), which TypeScript
 * requires for every role. Workflows can later be listed by role, e.g.
 * referral letters only for the roles that write them.
 */
export const STAFF_ROLES = [
  "doctor",
  "nurse",
  "pharmacist",
  "radiological-technologist",
  "laboratory-technologist",
  "physical-therapist",
  "occupational-therapist",
  "speech-therapist",
  "dietitian",
  "social-worker",
  "medical-clerk",
  "office-staff",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

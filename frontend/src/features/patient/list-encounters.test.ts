import { expect, test } from "vitest";

import { defaultEncounterId } from "@/features/patient/list-encounters";
import type { Encounter } from "@/features/patient/types";

function stay(id: string, dischargedOn: string | null): Encounter {
  return { id, department: "内科", ward: "4階東", room: "401", admittedOn: "2026-10-01", dischargedOn };
}

const inHospital = [stay("now", null), stay("before", "2025-09-01")];
const discharged = [stay("last", "2026-10-20"), stay("before", "2025-09-01")];

test("a stay still going on is the default for every workflow", () => {
  expect(defaultEncounterId(inHospital, false)).toBe("now");
  expect(defaultEncounterId(inHospital, true)).toBe("now");
});

test("after discharge, only a discharge summary starts with the last stay", () => {
  expect(defaultEncounterId(discharged, true)).toBe("last");
  expect(defaultEncounterId(discharged, false)).toBeNull();
});

test("a patient who never stayed has no default", () => {
  expect(defaultEncounterId([], true)).toBeNull();
});

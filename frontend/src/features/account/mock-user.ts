import type { StaffRole } from "@/features/account/staff-roles";

type User = {
  name: string;
  email: string;
  role: StaffRole;
  initials: string;
};

// Placeholder account until real auth exists.
export const mockUser: User = {
  name: "山田 太郎",
  email: "yamada@example.com",
  role: "doctor",
  initials: "山",
};

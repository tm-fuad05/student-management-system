import type { ModuleKey, UserRole } from "./types";

const ALL: ModuleKey[] = [
  "dashboard",
  "departments",
  "students",
  "teachers",
  "courses",
  "semesters",
  "sections",
  "enrollments",
  "attendance",
  "results",
  "payments",
  "reports",
];

/** Same module visibility as admin; write restrictions use helpers below. */
const ACADEMIC: ModuleKey[] = [...ALL];

const TEACHER: ModuleKey[] = [
  "dashboard",
  "students",
  "courses",
  "sections",
  "enrollments",
  "attendance",
  "results",
  "reports",
];

const ROLE_MODULES: Record<UserRole, ModuleKey[]> = {
  admin: ALL,
  academic_staff: ACADEMIC,
  teacher: TEACHER,
};

export function canAccessModule(role: UserRole, key: ModuleKey): boolean {
  return ROLE_MODULES[role].includes(key);
}

/** Only admins may add, edit, or delete payment records (sensitive finance). */
export function canWritePayments(role: UserRole): boolean {
  return role === "admin";
}

/** Only admins may remove department records. */
export function canDeleteDepartment(role: UserRole): boolean {
  return role === "admin";
}

/** Only admins may remove teacher records. */
export function canDeleteTeacher(role: UserRole): boolean {
  return role === "admin";
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "academic_staff":
      return "Academic Staff";
    case "teacher":
      return "Teacher";
  }
}

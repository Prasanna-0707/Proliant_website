// Roles the backend accepts. Administrators live in the Admin collection;
// every other role lives in the User collection.

export const ADMIN_ROLE = "Administrator";

export const USER_ROLE_OPTIONS = [
  { value: "HR", label: "HR" },
  { value: "RECRUITER", label: "Recruiter" },
  { value: "L0_SCREENER", label: "L0 Screener" },
  { value: "INTERVIEWER", label: "Interviewer" },
  { value: "L1_INTERVIEWER", label: "L1 Interviewer" },
  { value: "L2_INTERVIEWER", label: "L2 Interviewer" },
  { value: "HIRING_MANAGER", label: "Hiring Manager" },
  { value: "HIRING_LEAD", label: "Hiring Lead" },
  { value: "EMPLOYEE", label: "Employee" },
];

export const ALL_ROLE_OPTIONS = [
  { value: ADMIN_ROLE, label: "Administrator" },
  ...USER_ROLE_OPTIONS,
];

export const roleLabel = (value) =>
  ALL_ROLE_OPTIONS.find((option) => option.value === value)?.label || value;

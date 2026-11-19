import { apiRequest } from "./http.js";

// =====================================================
// EMPLOYEE COUNT  (HR / Global Administrator)
// Shown on the public "Proliant in Numbers" section.
// The Employees page itself manages /api/employees (CRUD and bulk upload).
// =====================================================

export const getEmployeeCount = (signal) =>
  apiRequest("/settings/employee-count", { signal });

export const saveEmployeeCount = (employeeCount) =>
  apiRequest("/settings/employee-count", {
    method: "PUT",
    body: { employeeCount },
  });

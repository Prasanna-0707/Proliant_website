export const SCREENER_ROLE = "L0_SCREENER";

export const SCREENER_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const getEmployeeId = (employee) =>
  employee?._id || employee?.id || employee?.employeeId || "";

export const getEmployeeName = (employee) =>
  employee?.name ||
  employee?.fullName ||
  employee?.employeeName ||
  "Unnamed Employee";

export const getEmployeeEmail = (employee) =>
  employee?.email || employee?.emailAddress || "—";

export const getEmployeeDepartment = (employee) =>
  employee?.department || employee?.dept || "—";

export const getEmployeeDesignation = (employee) =>
  employee?.designation || employee?.role || "—";

export const isEmployeeActive = (employee) => {
  const status = String(employee?.status || "Active").toLowerCase();

  return (
    status === "active" ||
    status === "enabled" ||
    status === "true"
  );
};

export const isAlreadyScreener = (employee) => {
  const roles = [
    employee?.systemRole,
    employee?.userRole,
    employee?.role,
    employee?.user?.role,
  ];

  return roles.some((role) => {
    const normalized = String(role || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    return (
      normalized === "L0_SCREENER" ||
      normalized === "L0SCREENER" ||
      normalized === "SCREENER"
    );
  });
};
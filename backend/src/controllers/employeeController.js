import multer from "multer";
import * as XLSX from "xlsx";

import Employee from "../models/Employee.js";

/*
 * =========================================================
 * MULTER CONFIGURATION
 * =========================================================
 */

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },

  fileFilter: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase();

    if (
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only .xlsx and .xls files are supported."
        )
      );
    }
  },
});

/*
 * Middleware wrapper for Excel upload.
 */
export const uploadEmployeeFile = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      console.error(
        "Employee file upload error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Unable to upload the employee Excel file.",
      });
    }

    next();
  });
};


/*
 * =========================================================
 * HELPER FUNCTIONS
 * =========================================================
 */

/*
 * Normalize Excel header names.

 * Examples:
 * "Employee Name"   -> "employeename"
 * "Email Address"   -> "emailaddress"
 * "Job Role"       -> "jobrole"
 * "Employee_Status" -> "employeestatus"
 */
const normalizeHeader = (value) => {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};


/*
 * Find a column index using possible header names.
 */
const findColumnIndex = (headers, names) => {
  return headers.findIndex((header) =>
    names.includes(header)
  );
};


/*
 * Find the employee header row.

 * We don't assume the headers are in row 1.

 * Example:

 * Proliant Data LLC
 * Employee Master List
 * Updated October 2026

 * Name | Email | Role | Department | Status
 */
const findEmployeeHeader = (rows) => {
  const maxRowsToCheck = Math.min(
    rows.length,
    100
  );

  let bestMatch = null;
  let bestScore = -1;

  for (let rowIndex = 0; rowIndex < maxRowsToCheck; rowIndex++) {
    const row = rows[rowIndex] || [];

    const headers = row.map(normalizeHeader);

    const nameIndex = findColumnIndex(headers, [
      "name",
      "fullname",
      "employeename",
    ]);

    const emailIndex = findColumnIndex(headers, [
      "email",
      "emailaddress",
    ]);

    const roleIndex = findColumnIndex(headers, [
      "role",
      "jobrole",
      "designation",
    ]);

    const departmentIndex = findColumnIndex(
      headers,
      [
        "department",
        "dept",
      ]
    );

    const statusIndex = findColumnIndex(
      headers,
      [
        "status",
        "employeestatus",
      ]
    );

    let score = 0;

    if (nameIndex !== -1) {
      score += 10;
    }

    if (emailIndex !== -1) {
      score += 10;
    }

    if (roleIndex !== -1) {
      score += 10;
    }

    if (departmentIndex !== -1) {
      score += 10;
    }

    if (statusIndex !== -1) {
      score += 1;
    }

    /*
     * Required columns must exist.
     */
    if (
      nameIndex === -1 ||
      emailIndex === -1 ||
      roleIndex === -1 ||
      departmentIndex === -1
    ) {
      continue;
    }

    if (score > bestScore) {
      bestScore = score;

      bestMatch = {
        headerRowIndex: rowIndex,
        nameIndex,
        emailIndex,
        roleIndex,
        departmentIndex,
        statusIndex,
      };
    }
  }

  return bestMatch;
};


/*
 * =========================================================
 * GET ALL EMPLOYEES
 * =========================================================
 */

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();

    res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};


/*
 * =========================================================
 * ADD EMPLOYEE
 * =========================================================
 */

export const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      department,
      status,
    } = req.body;

    const employee = await Employee.create({
      name,
      email,
      role,
      department,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add employee",
      error: error.message,
    });
  }
};


/*
 * =========================================================
 * BULK ADD EMPLOYEES FROM EXCEL
 * =========================================================
 */

export const bulkAddEmployees = async (req, res) => {
  try {
    /*
     * -----------------------------------------------------
     * CHECK FILE
     * -----------------------------------------------------
     */

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No Excel file was uploaded.",
      });
    }

    const fileName =
      req.file.originalname.toLowerCase();

    const isXlsx =
      fileName.endsWith(".xlsx");

    const isXls =
      fileName.endsWith(".xls");

    if (!isXlsx && !isXls) {
      return res.status(400).json({
        success: false,
        message:
          "Only .xlsx and .xls files are supported.",
      });
    }


    /*
     * -----------------------------------------------------
     * READ EXCEL WORKBOOK
     * -----------------------------------------------------
     */

    let workbook;

    try {
      workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
        cellDates: true,
      });
    } catch (error) {
      console.error(
        "Excel parsing error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          "Unable to read this Excel file. Please upload a valid and unprotected .xlsx or .xls file.",
      });
    }


    /*
     * -----------------------------------------------------
     * FIND EMPLOYEE SHEET
     * -----------------------------------------------------
     *
     * We don't blindly use the first sheet.
     *
     * HR might have:
     *
     * Sheet 1 -> Instructions
     * Sheet 2 -> Employees
     * Sheet 3 -> Old Data
     *
     * We search for the sheet containing the
     * required employee columns.
     * -----------------------------------------------------
     */

    let employeeSheet = null;
    let employeeSheetName = null;
    let employeeHeaderInfo = null;
    let employeeRows = null;

    for (
      const sheetName of workbook.SheetNames
    ) {
      const worksheet =
        workbook.Sheets[sheetName];

      const rows =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            header: 1,
            defval: "",
            blankrows: true,
          }
        );

      const headerInfo =
        findEmployeeHeader(rows);

      if (headerInfo) {
        employeeSheet = worksheet;
        employeeSheetName = sheetName;
        employeeHeaderInfo = headerInfo;
        employeeRows = rows;

        break;
      }
    }


    /*
     * -----------------------------------------------------
     * CHECK IF EMPLOYEE SHEET WAS FOUND
     * -----------------------------------------------------
     */

    if (
      !employeeSheet ||
      !employeeHeaderInfo ||
      !employeeRows
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to find an employee sheet. Required columns are Name, Email, Role, and Department. Status is optional.",
      });
    }

    console.log(
      `Employee sheet detected: ${employeeSheetName}`
    );

    console.log(
      `Employee header row detected: ${
        employeeHeaderInfo.headerRowIndex + 1
      }`
    );


    /*
     * -----------------------------------------------------
     * GET HEADER INFORMATION
     * -----------------------------------------------------
     */

    const {
      headerRowIndex,
      nameIndex,
      emailIndex,
      roleIndex,
      departmentIndex,
      statusIndex,
    } = employeeHeaderInfo;


    /*
     * -----------------------------------------------------
     * GET EMPLOYEE DATA ROWS
     * -----------------------------------------------------
     */

    const dataRows =
      employeeRows.slice(
        headerRowIndex + 1
      );


    /*
     * -----------------------------------------------------
     * SUMMARY COUNTERS
     * -----------------------------------------------------
     */

    let totalRecords = 0;
    let successfullyAdded = 0;
    let alreadyExisting = 0;
    let invalidRecords = 0;
    let failedRecords = 0;


    /*
     * -----------------------------------------------------
     * PREPARE VALID EMPLOYEES
     * -----------------------------------------------------
     */

    const validEmployees = [];

    const excelEmails = new Set();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    /*
     * -----------------------------------------------------
     * VALIDATE EACH EXCEL ROW
     * -----------------------------------------------------
     */

    for (const row of dataRows) {
      const values = row || [];


      /*
       * Read required fields
       */

      const name = String(
        values[nameIndex] ?? ""
      ).trim();


      const email = String(
        values[emailIndex] ?? ""
      )
        .trim()
        .toLowerCase();


      const role = String(
        values[roleIndex] ?? ""
      ).trim();


      const department = String(
        values[departmentIndex] ?? ""
      ).trim();


      /*
       * Status is optional.
       * Default = Active
       */

      let status =
        statusIndex === -1
          ? "Active"
          : String(
              values[statusIndex] ?? ""
            ).trim();


      /*
       * Ignore completely empty rows.
       */

      if (
        !name &&
        !email &&
        !role &&
        !department
      ) {
        continue;
      }


      totalRecords++;


      /*
       * Validate required fields.
       */

      if (
        !name ||
        !email ||
        !emailRegex.test(email) ||
        !role ||
        !department
      ) {
        invalidRecords++;
        continue;
      }


      /*
       * Normalize status.
       */

      if (!status) {
        status = "Active";
      } else if (
        status.toLowerCase() ===
        "active"
      ) {
        status = "Active";
      } else if (
        status.toLowerCase() ===
        "inactive"
      ) {
        status = "Inactive";
      } else {
        invalidRecords++;
        continue;
      }


      /*
       * Duplicate email inside the same Excel file.
       */

      if (excelEmails.has(email)) {
        invalidRecords++;
        continue;
      }

      excelEmails.add(email);


      /*
       * Prepare employee for MongoDB.
       */

      validEmployees.push({
        name,
        email,
        role,
        department,
        status,
      });
    }


    /*
     * -----------------------------------------------------
     * CHECK EXISTING EMPLOYEES IN MONGODB
     * -----------------------------------------------------
     */

    const emails =
      validEmployees.map(
        (employee) =>
          employee.email
      );


    let existingEmployees = [];


    if (emails.length > 0) {
      existingEmployees =
        await Employee.find(
          {
            email: {
              $in: emails,
            },
          },
          {
            email: 1,
          }
        ).lean();
    }


    const existingEmails =
      new Set(
        existingEmployees.map(
          (employee) =>
            employee.email.toLowerCase()
        )
      );


    /*
     * -----------------------------------------------------
     * SEPARATE NEW VS EXISTING
     * -----------------------------------------------------
     */

    const employeesToInsert = [];


    for (
      const employee of validEmployees
    ) {
      if (
        existingEmails.has(
          employee.email
        )
      ) {
        alreadyExisting++;
      } else {
        employeesToInsert.push(
          employee
        );
      }
    }


    /*
     * -----------------------------------------------------
     * INSERT NEW EMPLOYEES
     * -----------------------------------------------------
     */

    if (
      employeesToInsert.length > 0
    ) {
      try {
        const insertedEmployees =
          await Employee.insertMany(
            employeesToInsert,
            {
              ordered: false,
            }
          );

        successfullyAdded =
          insertedEmployees.length;
      } catch (error) {
        console.error(
          "Bulk employee insertion error:",
          error
        );


        /*
         * Some records may have been
         * inserted successfully even if
         * others failed.
         */

        if (
          Array.isArray(
            error.writeErrors
          ) &&
          error.writeErrors.length > 0
        ) {
          failedRecords =
            error.writeErrors.length;

          successfullyAdded =
            employeesToInsert.length -
            failedRecords;
        } else {
          failedRecords =
            employeesToInsert.length;

          successfullyAdded = 0;
        }
      }
    }


    /*
     * -----------------------------------------------------
     * RETURN SUMMARY
     * -----------------------------------------------------
     */

    return res.status(200).json({
      success: true,

      message:
        "Employee upload processed successfully.",

      summary: {
        totalRecords,
        successfullyAdded,
        alreadyExisting,
        invalidRecords,
        failedRecords,
      },
    });
  } catch (error) {
    console.error(
      "Bulk employee upload error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to process the employee Excel file.",

      error: error.message,
    });
  }
};


/*
 * =========================================================
 * DELETE EMPLOYEE
 * =========================================================
 */

export const deleteEmployee = async (req, res) => {
  try {
    const employee =
      await Employee.findByIdAndDelete(
        req.params.id
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to delete employee",
      error: error.message,
    });
  }
};


/*
 * =========================================================
 * UPDATE EMPLOYEE
 * =========================================================
 */

export const updateEmployee = async (req, res) => {
  try {
    console.log(
      "Employee ID:",
      req.params.id
    );

    console.log(
      "Update data:",
      req.body
    );

    const employee =
      await Employee.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to update employee",
      error: error.message,
    });
  }
};
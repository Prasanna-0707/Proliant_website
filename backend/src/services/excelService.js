import ExcelJS from "exceljs";

// =====================================================
// GENERATE CANDIDATES EXCEL
// =====================================================

export const generateCandidatesExcel = async (candidates) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Proliant Data LLC";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Candidates");

  // =====================================================
  // EXCEL COLUMNS
  // =====================================================

  worksheet.columns = [
    {
      header: "Position",
      key: "position",
      width: 25,
    },
    {
      header: "Area of Interest",
      key: "areaOfInterest",
      width: 25,
    },
    {
      header: "Name",
      key: "name",
      width: 25,
    },
    {
      header: "Email",
      key: "email",
      width: 30,
    },
    {
      header: "Phone",
      key: "phone",
      width: 18,
    },
    {
      header: "Fresher",
      key: "isFresher",
      width: 12,
    },
    {
      header: "Location",
      key: "location",
      width: 20,
    },
    {
      header: "Years of Experience",
      key: "yearsOfExperience",
      width: 20,
    },
    {
      header: "Highest Qualification",
      key: "highestQualification",
      width: 25,
    },
    {
      header: "Current Company",
      key: "currentCompany",
      width: 25,
    },
    {
      header: "Notice Period",
      key: "noticePeriod",
      width: 18,
    },
    {
      header: "Cover Message",
      key: "coverMessage",
      width: 45,
    },
    {
      header: "Status",
      key: "status",
      width: 18,
    },
    {
      header: "Applied On",
      key: "createdAt",
      width: 22,
    },
    {
      header: "Resume",
      key: "resume",
      width: 20,
    },
  ];

  // =====================================================
  // HEADER STYLING
  // =====================================================

  const headerRow = worksheet.getRow(1);

  headerRow.font = {
    bold: true,
  };

  headerRow.alignment = {
    vertical: "middle",
    horizontal: "center",
  };

  // =====================================================
  // ADD CANDIDATE DATA
  // =====================================================

  candidates.forEach((candidate) => {
    const row = worksheet.addRow({
      position: candidate.position,
      areaOfInterest: candidate.areaOfInterest,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,

      isFresher: candidate.isFresher
        ? "Yes"
        : "No",

      location: candidate.location || "",

      yearsOfExperience:
        candidate.yearsOfExperience ?? "",

      highestQualification:
        candidate.highestQualification,

      currentCompany:
        candidate.currentCompany || "",

      noticePeriod:
        candidate.noticePeriod,

      coverMessage:
        candidate.coverMessage || "",

      status:
        candidate.status,

      createdAt: candidate.createdAt
        ? new Date(candidate.createdAt)
        : "",

      // Resume handled separately below
      resume: "",
    });

    // ===================================================
    // RESUME COLUMN
    // ===================================================

    const resumeCell = row.getCell("resume");

    /*
      For now resume storage is not implemented.

      Later, when SharePoint resume storage is completed,
      we will pass the resume URL/reference here.
    */

    if (candidate.resumeUrl) {
      resumeCell.value = {
        text: "Open Resume",
        hyperlink: candidate.resumeUrl,
        tooltip: "Open Resume",
      };
    } else {
      resumeCell.value = "Not Available";
    }
  });

  // =====================================================
  // DATE FORMAT
  // =====================================================

  worksheet.getColumn("createdAt").numFmt =
    "dd-mm-yyyy hh:mm";

  // =====================================================
  // FREEZE HEADER
  // =====================================================

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  // =====================================================
  // ENABLE FILTER
  // =====================================================

  worksheet.autoFilter = {
    from: "A1",
    to: "O1",
  };

  // =====================================================
  // ALIGNMENT
  // =====================================================

  worksheet.eachRow((row) => {
    row.alignment = {
      vertical: "top",
      wrapText: true,
    };
  });

  // =====================================================
  // RETURN EXCEL FILE
  // =====================================================

  return workbook.xlsx.writeBuffer();
};
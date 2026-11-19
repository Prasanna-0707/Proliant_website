import {
  getRecruitmentStatistics,
  parseStatisticsFilters,
  StatisticsFilterError,
} from "../services/recruitmentStatisticsService.js";

// GET /api/department-admin/dashboard/statistics
//   ?department=&status=ALL|IN_INTERVIEW|SELECTED|JOINED
//   &from=YYYY-MM-DD&to=YYYY-MM-DD  |  &year=2026[&month=1-12|&quarter=1-4]
//
// Aggregate counts for ALL departments (a Department Administrator may see
// organization-wide numbers). No candidate-level data is returned.
export const getDashboardStatistics = async (req, res) => {
  try {
    const filters = parseStatisticsFilters(req.query);
    const data = await getRecruitmentStatistics(filters);

    return res.status(200).json({
      success: true,
      data: {
        ...data,
        access: {
          scope: req.departmentAdminAccess?.scope || null,
          ownDepartment: req.departmentAdminAccess?.department || null,
          readOnly: true,
        },
      },
    });
  } catch (error) {
    if (error instanceof StatisticsFilterError) {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error("Department Admin statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve recruitment statistics.",
    });
  }
};

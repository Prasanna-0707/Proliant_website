import Employee from "../models/HREmployee.js";
import { sendError } from "../../../shared/utils/httpErrors.js";
import Location from "../models/HRLocation.js";

export const getDashboardStats = async (req, res) => {
  try {
    const employeeCount = await Employee.countDocuments();

    const countries = await Location.distinct("country");
    const countryCount = countries.length;

    res.status(200).json({
      success: true,
      stats: {
        employees: employeeCount,
        countries: countryCount,
      },
    });
  } catch (error) {
    return sendError(res, error, "Failed to fetch dashboard stats");
  }
};
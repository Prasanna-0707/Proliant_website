import Employee from "../models/Employee.js";
import Location from "../models/Location.js";

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
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};
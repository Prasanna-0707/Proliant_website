import SiteSetting from "../models/SiteSetting.js";

const EMPLOYEE_COUNT_KEY = "employeeCount";

// Get current employee count
export const getEmployeeCount = async (req, res) => {
  try {
    let setting = await SiteSetting.findOne({
      key: EMPLOYEE_COUNT_KEY,
    });

    // Create the setting if it does not exist yet
    if (!setting) {
      setting = await SiteSetting.create({
        key: EMPLOYEE_COUNT_KEY,
        employeeCount: 130,
      });
    }

    res.status(200).json({
      success: true,
      employeeCount: setting.employeeCount,
    });
  } catch (error) {
    console.error("Failed to fetch employee count:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch employee count.",
    });
  }
};

// Update employee count
export const updateEmployeeCount = async (req, res) => {
  try {
    const { employeeCount } = req.body;

    // Validate employee count
    if (
      employeeCount === undefined ||
      employeeCount === null ||
      !Number.isInteger(Number(employeeCount)) ||
      Number(employeeCount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Employee count must be a whole number greater than or equal to 0.",
      });
    }

    const count = Number(employeeCount);

    const setting = await SiteSetting.findOneAndUpdate(
      {
        key: EMPLOYEE_COUNT_KEY,
      },
      {
        $set: {
          employeeCount: count,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Employee count updated successfully.",
      employeeCount: setting.employeeCount,
    });
  } catch (error) {
    console.error("Failed to update employee count:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update employee count.",
    });
  }
};
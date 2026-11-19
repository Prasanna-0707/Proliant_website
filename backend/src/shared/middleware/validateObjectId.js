import mongoose from "mongoose";

// Use with router.param so every route containing the parameter
// is protected from malformed MongoDB ids:
//
//   router.param("id", validateObjectIdParam);
//
// A malformed id returns 400 instead of causing a server error.
export const validateObjectIdParam = (req, res, next, value, name) => {
  if (!mongoose.isValidObjectId(value)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${name}.`,
    });
  }

  return next();
};

export default validateObjectIdParam;
// =====================================================
// SHARED HTTP ERROR RESPONSES
//
// Converts common database errors into correct HTTP
// responses and never leaks internal error messages.
//
//   Mongoose ValidationError -> 400 (with field messages)
//   Mongoose CastError       -> 400 (malformed id / value)
//   Duplicate key (11000)    -> 409
//   anything else            -> 500 (generic message)
// =====================================================

export const sendError = (res, error, fallbackMessage) => {
  if (error?.name === "ValidationError" && error.errors) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path || "value"}.`,
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with the same unique value already exists.",
    });
  }

  console.error(fallbackMessage, error);

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

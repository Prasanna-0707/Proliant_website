import jwt from "jsonwebtoken";

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

// Access token for an authenticated staff account.
// accountType tells the auth middleware which collection to
// load the account from (ADMIN -> Admin, USER -> User).
export const signAccessToken = (account, accountType) =>
  jwt.sign(
    {
      userId: account._id.toString(),
      accountType,
      role: account.role,
      tokenVersion: account.tokenVersion || 0,
    },
    getSecret(),
    { expiresIn: "1d" }
  );

export const verifyAccessToken = (token) =>
  jwt.verify(token, getSecret());

// Short-lived token proving that a password-reset OTP was verified.
export const signResetToken = (account, accountType) =>
  jwt.sign(
    {
      userId: account._id.toString(),
      accountType,
      email: account.email,
      purpose: "password-reset",
      resetTokenVersion: account.resetTokenVersion || 0,
    },
    getSecret(),
    { expiresIn: "10m" }
  );

export const verifyResetToken = (token) =>
  jwt.verify(token, getSecret());

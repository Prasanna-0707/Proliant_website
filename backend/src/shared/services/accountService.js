import Admin from "../../modules/administrator/models/Admin.js";
import User from "../../modules/auth/models/Users.js";

import {
  ACCOUNT_TYPES,
  getAccountTypeForRole,
} from "../constants/roles.js";

// =====================================================
// ACCOUNT SERVICE
//
// Single place that knows which collection stores which
// staff account. Admin accounts (Global / Department
// Administrator) live in the Admin collection. HR,
// Interviewer, Hiring Manager and L0 Screener accounts
// live in the User collection. The two are never merged.
// =====================================================

const MODELS = {
  [ACCOUNT_TYPES.ADMIN]: Admin,
  [ACCOUNT_TYPES.USER]: User,
};

export const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

export const getAccountModel = (accountType) => {
  const model = MODELS[accountType];

  if (!model) {
    throw new Error(`Unknown account type: ${accountType}`);
  }

  return model;
};

export const getAccountModelForRole = (role) => {
  const accountType = getAccountTypeForRole(role);

  return accountType ? MODELS[accountType] : null;
};

// Returns "ADMIN" or "USER" for a loaded Mongoose document.
export const getAccountTypeOfDocument = (account) => {
  const modelName = account?.constructor?.modelName;

  if (modelName === Admin.modelName) return ACCOUNT_TYPES.ADMIN;
  if (modelName === User.modelName) return ACCOUNT_TYPES.USER;

  return null;
};

// Finds an account by email. Emails are unique across both
// collections, so at most one account is returned.
export const findAccountByEmail = async (
  email,
  { includePassword = false } = {}
) => {
  const normalized = normalizeEmail(email);

  if (!normalized) return null;

  for (const accountType of [ACCOUNT_TYPES.ADMIN, ACCOUNT_TYPES.USER]) {
    let query = MODELS[accountType].findOne({ email: normalized });

    if (includePassword) query = query.select("+password");

    const account = await query;

    if (account) return { account, accountType };
  }

  return null;
};

// Finds an account by id in the collection implied by its type.
export const findAccountById = async (
  accountType,
  id,
  { includePassword = false } = {}
) => {
  const model = MODELS[accountType];

  if (!model) return null;

  let query = model.findById(id);

  if (includePassword) query = query.select("+password");

  return query;
};

// Finds a staff account by id when the type is not known.
export const findStaffAccountById = async (id) => {
  for (const accountType of [ACCOUNT_TYPES.ADMIN, ACCOUNT_TYPES.USER]) {
    const account = await MODELS[accountType].findById(id);

    if (account) return { account, accountType };
  }

  return null;
};

// True when an email is already used in either staff collection.
export const isEmailInUse = async (email, excludeId = null) => {
  const normalized = normalizeEmail(email);

  if (!normalized) return false;

  const filter = { email: normalized };

  if (excludeId) filter._id = { $ne: excludeId };

  const [admin, user] = await Promise.all([
    Admin.exists(filter),
    User.exists(filter),
  ]);

  return Boolean(admin || user);
};

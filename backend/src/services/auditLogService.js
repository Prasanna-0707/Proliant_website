import AuditLog from "../models/AuditLog.js";

// Remove sensitive information before storing audit snapshots.
const SENSITIVE_FIELD =
  /password|token|otp|secret|authorization|resume|filepath/i;

// Convert values into safe, serializable snapshots.
const sanitizeSnapshot = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeSnapshot);
  }

  // Convert MongoDB ObjectIds into strings.
  if (value?._bsontype === "ObjectId") {
    return value.toString();
  }

  // Convert Mongoose documents into plain objects.
  if (
    typeof value === "object" &&
    typeof value.toObject === "function"
  ) {
    return sanitizeSnapshot(
      value.toObject({
        depopulate: true,
        flattenMaps: true,
      })
    );
  }

  if (typeof value !== "object") {
    return value;
  }

  const safeObject = {};

  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_FIELD.test(key)) {
      continue;
    }

    safeObject[key] = sanitizeSnapshot(item);
  }

  return safeObject;
};

// Safely convert values into strings with a maximum length.
const safeString = (value, maxLength = 150) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().slice(0, maxLength);
};

// Create an audit record.
//
// Supported actor types:
// HUMAN      - Authenticated Admin action.
// SYSTEM     - Automatic backend/system action.
// AI_AGENT   - Future AI agent action.
// CANDIDATE  - Candidate portal action.
//
// Existing calls using { req, action, targetType, ... }
// continue to work without changes.
export const createAuditLog = async ({
  req,

  // Actor information
  actorType,
  actorId = "",
  actorName = "",
  actorEmail = "",
  roleUsed = "",
  adminScope = null,

  // AI agent information (reserved for future use)
  agentId = "",
  toolName = "",
  approvalId = "",

  // Action information
  action,
  targetType,
  targetId = null,
  targetLabel = "",
  department = "",

  // Audit snapshots
  before = null,
  after = null,
  reason = "",

  // Result information
  outcome = "SUCCESS",

  // Request tracking
  requestId = "",
  correlationId = "",
  ipAddress = "",

  // Additional structured information
  metadata = null,

  // MongoDB transaction support
  session = null,
}) => {
  const adminActor = req?.admin;

  // Automatically identify existing authenticated Admin calls as HUMAN.
  const resolvedActorType =
    actorType || (adminActor?._id ? "HUMAN" : "");

  if (
    !["HUMAN", "SYSTEM", "AI_AGENT", "CANDIDATE"].includes(
      resolvedActorType
    )
  ) {
    throw new Error(
      "A valid audit actor type is required."
    );
  }

  if (!action || !targetType) {
    throw new Error(
      "Audit action and target type are required."
    );
  }

  let resolvedActor = null;
  let resolvedActorId = safeString(actorId);
  let resolvedActorName = safeString(actorName);
  let resolvedActorEmail = safeString(actorEmail, 254);
  let resolvedRole = safeString(roleUsed);
  let resolvedAdminScope = adminScope || null;

  // --------------------------------------------------
  // HUMAN ACTOR
  // --------------------------------------------------
  if (resolvedActorType === "HUMAN") {
    if (
      !adminActor?._id ||
      !adminActor.email ||
      !adminActor.role
    ) {
      throw new Error(
        "Cannot create a HUMAN audit log without an authenticated Admin."
      );
    }

    resolvedActor = adminActor._id;
    resolvedActorId = adminActor._id.toString();
    resolvedActorName = safeString(
      adminActor.name || actorName
    );
    resolvedActorEmail = safeString(
      adminActor.email,
      254
    );
    resolvedRole = safeString(
      adminActor.role
    );
    resolvedAdminScope = adminActor.adminScope || null;
  }

  // --------------------------------------------------
  // SYSTEM ACTOR
  // --------------------------------------------------
  if (resolvedActorType === "SYSTEM") {
    resolvedActor = null;

    resolvedActorId =
      resolvedActorId || "SYSTEM";

    resolvedActorName =
      resolvedActorName || "System";

    resolvedActorEmail =
      resolvedActorEmail || "";

    resolvedRole =
      resolvedRole || "SYSTEM";

    resolvedAdminScope = null;
  }

  // --------------------------------------------------
  // AI AGENT ACTOR
  // --------------------------------------------------
  if (resolvedActorType === "AI_AGENT") {
    const resolvedAgentId = safeString(
      agentId || actorId
    );

    if (!resolvedAgentId) {
      throw new Error(
        "An AI agent ID is required for AI_AGENT audit logs."
      );
    }

    resolvedActor = null;
    resolvedActorId = resolvedAgentId;
    resolvedActorName =
      resolvedActorName || "AI Agent";
    resolvedActorEmail =
      resolvedActorEmail || "";
    resolvedRole =
      resolvedRole || "AI_AGENT";
    resolvedAdminScope = null;
  }

  // --------------------------------------------------
  // CANDIDATE ACTOR
  // --------------------------------------------------
  if (resolvedActorType === "CANDIDATE") {
    if (!resolvedActorId) {
      throw new Error(
        "A candidate ID is required for CANDIDATE audit logs."
      );
    }

    resolvedActor = null;
    resolvedActorName =
      resolvedActorName || "Candidate";
    resolvedActorEmail =
      resolvedActorEmail || "";
    resolvedRole =
      resolvedRole || "CANDIDATE";
    resolvedAdminScope = null;
  }

  // --------------------------------------------------
  // REQUEST TRACKING
  // --------------------------------------------------
  const resolvedRequestId = safeString(
    requestId ||
      req?.requestId ||
      req?.headers?.["x-request-id"]
  );

  const resolvedCorrelationId = safeString(
    correlationId ||
      req?.correlationId ||
      req?.headers?.["x-correlation-id"]
  );

  // --------------------------------------------------
  // BUILD AUDIT RECORD
  // --------------------------------------------------
  const auditLog = new AuditLog({
    // Actor details
    actorType: resolvedActorType,
    actor: resolvedActor,
    actorId: resolvedActorId,
    actorName: resolvedActorName,
    actorEmail: resolvedActorEmail,
    roleUsed: resolvedRole,
    adminScope: resolvedAdminScope,

    // Action details
    action,
    targetType,
    targetId,
    targetLabel: safeString(targetLabel),
    department: safeString(department),

    // Action result
    outcome,
    reason: safeString(reason, 2000),

    // Before and after snapshots
    before: sanitizeSnapshot(before),
    after: sanitizeSnapshot(after),

    // Request tracking
    requestId: resolvedRequestId,
    correlationId: resolvedCorrelationId,
    ipAddress: safeString(
      ipAddress || req?.ip
    ),

    // Future AI tracking
    agentId: safeString(agentId),
    toolName: safeString(toolName),
    approvalId: safeString(approvalId),

    // Additional structured information
    metadata: sanitizeSnapshot(metadata),
  });

  // --------------------------------------------------
  // SAVE AUDIT RECORD
  // --------------------------------------------------
  // Keep the audit entry in the same transaction when
  // the calling operation provides a MongoDB session.
  if (session) {
    await auditLog.save({ session });
  } else {
    await auditLog.save();
  }

  return auditLog;
};
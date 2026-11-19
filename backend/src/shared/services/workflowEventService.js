import Candidate from "../../modules/candidate/models/Candidate.js";
import { notifyHr } from "./notificationService.js";
import { applyPortalEvent } from "./portalApplicationService.js";

// Runs after an L0 screening decision has been saved: notifies HR and
// updates the candidate's portal application. Never throws.
export const announceScreeningDecision = async (body, screener) => {
  try {
    const decision = body?.screening?.decision;
    const applicationId = body?.screening?.application;

    if (!decision || !applicationId) return;

    const candidate = await Candidate.findById(applicationId)
      .select("name position")
      .lean();

    const label = {
      SHORTLIST: "shortlisted",
      REJECT: "rejected",
      ON_HOLD: "placed on hold",
      ESCALATE: "escalated for HR review",
    }[decision];

    if (label) {
      await notifyHr({
        title: `Screening decision: ${decision.replace("_", " ")}`,
        message: `${candidate?.name || "A candidate"} (${
          candidate?.position || "position"
        }) was ${label} by ${screener?.name || "the screener"}.`,
        type: "SCREENING",
        link: "/hr/candidates",
        relatedApplication: applicationId,
      });
    }

    if (decision === "SHORTLIST") {
      await applyPortalEvent(applicationId, "SHORTLISTED");
    } else if (decision === "REJECT") {
      await applyPortalEvent(applicationId, "SCREENING_REJECTED");
    }
  } catch (error) {
    console.error("Screening decision announcement failed:", error.message);
  }
};
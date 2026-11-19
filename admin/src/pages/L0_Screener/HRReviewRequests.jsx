import ScreenerApplications from "./ScreenerApplications";

const HRReviewRequests = () => (
  <ScreenerApplications
    title="HR Review Requests"
    description="Applications escalated to HR for exception-based review."
    filterStatus="HR_REVIEW_REQUIRED"
  />
);

export default HRReviewRequests;
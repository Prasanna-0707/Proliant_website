import ScreenerApplications from "./ScreenerApplications";

const Shortlisted = () => (
  <ScreenerApplications
    title="Shortlisted Candidates"
    description="Candidates shortlisted and moved to the L1 Interview queue."
    filterStatus={["L0_SHORTLISTED", "Interview"]}
  />
);

export default Shortlisted;
import ScreenerApplications from "./ScreenerApplications";

const Shortlisted = () => (
  <ScreenerApplications
    title="Shortlisted Candidates"
    description="Candidates shortlisted and moved to the L1 Interview queue."
    filterStatus="L1_PENDING"
  />
);

export default Shortlisted;
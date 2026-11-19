import ScreenerApplications from "./ScreenerApplications";

const Rejected = () => (
  <ScreenerApplications
    title="Rejected Applications"
    description="Review applications rejected during L0 screening."
    filterStatus="L0_REJECTED"
  />
);

export default Rejected;
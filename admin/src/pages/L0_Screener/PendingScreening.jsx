import ScreenerApplications from "./ScreenerApplications";

const PendingScreening = () => (
  <ScreenerApplications
    title="Pending Screening"
    description="Review applications waiting for your screening decision."
    filterStatus="ASSIGNED_TO_L0"
  />
);

export default PendingScreening;
import ScreenerApplications from "./ScreenerApplications";

const OnHold = () => (
  <ScreenerApplications
    title="On Hold Applications"
    description="Applications waiting for clarification or additional information."
    filterStatus="L0_ON_HOLD"
  />
);

export default OnHold;
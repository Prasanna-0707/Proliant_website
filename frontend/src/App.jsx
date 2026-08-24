import ClickSpark from "@/components/ui/ClickSpark";

import Navbar from "@/components/layout/Navbar";
import AppRoutes from "@/routes/AppRoutes";
import SmoothScroll from "@/components/common/SmoothScroll";

function App() {
  return (
    <>
      <SmoothScroll />
      <ClickSpark
        sparkColor="#ffffff"
        sparkSize={8}
        sparkRadius={18}
        sparkCount={8}
        duration={450}
        easing="ease-out"
        extraScale={1}
      >
        <Navbar />
        <AppRoutes />
      </ClickSpark>
    </>
  );
}

export default App;
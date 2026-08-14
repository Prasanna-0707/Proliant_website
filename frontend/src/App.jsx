import ClickSpark from "@/components/ClickSpark";

import Navbar from "@/components/layout/Navbar";
import AppRoutes from "@/routes/AppRoutes";

function App() {
  return (
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
  );
}

export default App;
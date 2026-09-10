import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import QuizPage from "./pages/QuizPage";
import IdentifyPage from "./pages/IdentifyPage";
import WeaknessMapPage from "./pages/WeaknessMapPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/quiz/:subjectId" element={<QuizPage />} />
      <Route path="/identify/:subjectId" element={<IdentifyPage />} />
      <Route path="/weakness" element={<WeaknessMapPage />} />
    </Routes>
  );
}

export default App;

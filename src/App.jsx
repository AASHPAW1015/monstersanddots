import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "./context/SimulationContext";
import SimulationPage from "./pages/SimulationPage";
import HistoryPage from "./pages/HistoryPage";
import PathLearningPage from "./pages/PathLearningPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <SimulationProvider>
        <Routes>
          <Route path="/" element={<SimulationPage />} />
          <Route path="/path" element={<PathLearningPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </SimulationProvider>
    </BrowserRouter>
  );
}

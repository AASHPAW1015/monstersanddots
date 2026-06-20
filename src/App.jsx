import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SimulationProvider } from "./context/SimulationContext";
import SimulationPage from "./pages/SimulationPage";
import HistoryPage from "./pages/HistoryPage";
import PathLearningPage from "./pages/PathLearningPage";
import "./App.css";

export default function App() {
  // ThemeProvider is outermost so the toggle works on every route; the
  // SimulationProvider wraps the routed content so all pages share GA state.
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SimulationProvider>
          <Routes>
            <Route path="/" element={<SimulationPage />} />
            <Route path="/path" element={<PathLearningPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </SimulationProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

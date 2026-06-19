import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "./context/SimulationContext";
import SimulationPage from "./pages/SimulationPage";
import HistoryPage from "./pages/HistoryPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <SimulationProvider>
        <Routes>
          <Route path="/" element={<SimulationPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </SimulationProvider>
    </BrowserRouter>
  );
}

import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import { ReactorPage } from "./pages/ReactorPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reactor/:id" element={<ReactorPage />} />
    </Routes>
  );
}

export default App;

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { JamSessionPage } from "./pages/jam/JamSessionPage";

export function App() {
  return (
    <BrowserRouter>
      <Header />
      {/* Pages own their layout: the fixed header is 60px tall (56px bar + 4px stripe). */}
      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jam" element={<JamSessionPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

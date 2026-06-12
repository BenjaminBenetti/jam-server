import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { JamSessionPage } from "./pages/jam/JamSessionPage";

export function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-28">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jam" element={<JamSessionPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { WireGuardPage } from "@/features/wireguard/WireGuardPage";
import { ProfilesPage } from "@/features/profiles/ProfilesPage";
import { RoutersPage } from "@/features/routers/RoutersPage";
import { ChrDeployPage } from "@/features/chr-deploy/ChrDeployPage";

function App() {
  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/wireguard" element={<WireGuardPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/routers" element={<RoutersPage />} />
          <Route path="/chr-deploy" element={<ChrDeployPage />} />
        </Route>
      </Routes>
      <Toaster theme="dark" richColors position="bottom-right" />
    </>
  );
}

export default App;

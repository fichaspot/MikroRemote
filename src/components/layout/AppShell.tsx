import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";

export function AppShell() {
  return (
    <div className="flex flex-col h-screen overflow-hidden noise-bg">
      <TopNav />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

import { LayoutDashboard } from "lucide-react";

export function Navbar() {
  return (
    <nav className="navbar">
      <LayoutDashboard className="mr-2" color="var(--primary-color)" />
      <span className="navbar-title">AgroApp Analytics</span>
    </nav>
  );
}

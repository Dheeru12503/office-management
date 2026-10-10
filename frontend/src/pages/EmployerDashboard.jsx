import { ChartNoAxesColumnIncreasing } from "lucide-react";
import Navbar from "../components/Navbar";
import WorkspacePanel from "../components/WorkspacePanel";
import EmployeesPanel from "../components/EmployeesPanel";
import "../App.css";

export default function EmployerDashboard() {
  return (
    <div className="appPage">
      <Navbar />
      <main className="dashboardContent">
        <header className="pageHeading">
          <div>
            <span className="eyebrow"><ChartNoAxesColumnIncreasing size={14} /> Employer workspace</span>
            <h1>Your team, in focus.</h1>
            <p>Manage your workspace and keep a clear view of your people and their progress.</p>
          </div>
        </header>
        <div className="sectionStack">
          <WorkspacePanel />
          <EmployeesPanel />
        </div>
      </main>
    </div>
  );
}

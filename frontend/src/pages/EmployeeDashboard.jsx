import { CalendarDays, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import TodoPanel from "../components/TodoPanel";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  return (
    <div className="appPage">
      <Navbar />
      <main className="dashboardContent">
        <header className="pageHeading">
          <div>
            <span className="eyebrow"><Sparkles size={14} /> Personal dashboard</span>
            <h1>Good to see you, {user?.name?.split(" ")[0]}.</h1>
            <p>Plan your week, keep your priorities moving, and celebrate your progress.</p>
          </div>
          <span className="badge weekBadge"><CalendarDays size={13} /> Your weekly view</span>
        </header>
        <TodoPanel />
      </main>
    </div>
  );
}

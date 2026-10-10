import { BriefcaseBusiness, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <nav className="topbar" aria-label="Main navigation">
      <Link className="brand" to={user?.role === "EMPLOYER" ? "/employer" : "/employee"}>
        <span className="brandMark"><BriefcaseBusiness size={19} strokeWidth={2.2} /></span>
        <span>
          Office Management
          <span className="brandSub">Workspace</span>
        </span>
      </Link>
      <div className="navUser">
        <span className="userAvatar" aria-hidden="true">{initials || "U"}</span>
        <span className="userMeta">
          <span className="userName">{user?.name}</span>
          <span className="userRole">{user?.role?.toLowerCase()}</span>
        </span>
        <button className="button buttonSecondary buttonSmall" onClick={handleLogout} type="button">
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </nav>
  );
}

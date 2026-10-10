import { BriefcaseBusiness, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(form);
      setUser(res.data.user);
      navigate(res.data.user.role === "EMPLOYER" ? "/employer" : "/employee");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="authPage">
      <aside className="authAside">
        <Link className="authBrand" to="/login">
          <span className="authBrandMark"><BriefcaseBusiness size={20} /></span>
          Office Management
        </Link>
        <div className="authAsideCopy">
          <h1>Work better, together.</h1>
          <p>A calmer place to bring your people, workspace, and daily priorities into focus.</p>
        </div>
        <span className="authAsideFoot">Thoughtful tools for teams that get things done.</span>
      </aside>
      <section className="authMain">
        <div className="authCard">
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to your workspace</h2>
          <p className="authIntro">Enter your details to continue to your office dashboard.</p>
          {error && <p className="message messageError authMessage" role="alert">{error}</p>}
          <form onSubmit={handleSubmit} className="authForm">
            <label className="field">
              <span className="fieldLabel">Email address</span>
              <span className="authInputIcon"><Mail size={15} /></span>
              <input className="input" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="field">
              <span className="fieldLabel">Password</span>
              <span className="authInputIcon"><LockKeyhole size={15} /></span>
              <input className="input" type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>
            <button className="button authSubmit" type="submit">Continue to dashboard</button>
          </form>
          <p className="authFooter">New to Office Management? <Link to="/signup">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}

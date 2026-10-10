import { BriefcaseBusiness, Building2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
import "../App.css";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EMPLOYER", workspaceName: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await signup(form);
      setSuccess("Account created! Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
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
          <h1>A better rhythm for work.</h1>
          <p>Bring your people and plans together in one thoughtful, easy-to-use workspace.</p>
        </div>
        <span className="authAsideFoot">Designed to help every team do their best work.</span>
      </aside>
      <section className="authMain">
        <div className="authCard">
          <span className="eyebrow">Get started</span>
          <h2>Create your account</h2>
          <p className="authIntro">Set up your profile and join your team workspace.</p>
          {error && <p className="message messageError authMessage" role="alert">{error}</p>}
          {success && <p className="message authMessage" role="status">{success}</p>}
          <form onSubmit={handleSubmit} className="authForm">
            <label className="field">
              <span className="fieldLabel">Full name</span>
              <span className="authInputIcon"><UserRound size={15} /></span>
              <input className="input" autoComplete="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="field">
              <span className="fieldLabel">Email address</span>
              <span className="authInputIcon"><Mail size={15} /></span>
              <input className="input" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="field">
              <span className="fieldLabel">Password</span>
              <span className="authInputIcon"><LockKeyhole size={15} /></span>
              <input className="input" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>
            <label className="field">
              <span className="fieldLabel">I am joining as</span>
              <span className="authInputIcon"><UserRound size={15} /></span>
              <select className="select authSelect" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="EMPLOYER">Employer</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </label>
            <label className="field">
              <span className="fieldLabel">Workspace name</span>
              <span className="authInputIcon"><Building2 size={15} /></span>
              <input className="input" placeholder={form.role === "EMPLOYER" ? "Name your new workspace" : "Enter your team's workspace"} value={form.workspaceName} onChange={(e) => setForm({ ...form, workspaceName: e.target.value })} required />
            </label>
            <button className="button authSubmit" type="submit">Create account</button>
          </form>
          <p className="authFooter">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}

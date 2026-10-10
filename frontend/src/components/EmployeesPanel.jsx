import { useEffect, useState } from "react";
import { ClipboardList, Eye, Pencil, Plus, Trash2, UserRoundPlus, UsersRound, X } from "lucide-react";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../api/employees";
import { getEmployeeTodos } from "../api/todos";
import { formatDate } from "../utils/date";
import "../App.css";

const statusClass = (status) => {
  if (status === "COMPLETED") return "statusDone";
  if (status === "IN_PROGRESS") return "statusProgress";
  return "statusPending";
};

const priorityClass = (priority) => {
  if (priority === "HIGH") return "priorityHigh";
  if (priority === "LOW") return "priorityLow";
  return "priorityMedium";
};

const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("");

function getReportWeek() {
  const today = new Date();
  const offset = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() + offset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const toDateString = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split("T")[0];
  };
  return { start: toDateString(start), end: toDateString(end) };
}

export default function EmployeesPanel() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewTodos, setViewTodos] = useState(null);
  const [todosLoading, setTodosLoading] = useState(false);
  const [todosError, setTodosError] = useState("");
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportWeek] = useState(getReportWeek);

  const load = () => getEmployees().then((r) => setEmployees(r.data.employees));

  useEffect(() => {
    load()
      .catch((err) => {
        setIsError(true);
        setMsg(err.response?.data?.message || "Unable to load employees. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsError(false);
    try {
      await createEmployee(form);
      setForm({ name: "", email: "", password: "" });
      setReportData(null);
      setMsg("Employee added!");
      load().catch((err) => {
        setIsError(true);
        setMsg(err.response?.data?.message || "Employee was added, but the team list could not be refreshed.");
      });
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.message || "Unable to add employee.");
    }
  };

  const handleUpdate = async (e, id = editId) => {
    e?.preventDefault();
    setMsg("");
    setIsError(false);
    try {
      await updateEmployee(id, editForm);
      setEditId(null);
      setReportData(null);
      setMsg("Employee details updated.");
      load().catch((err) => {
        setIsError(true);
        setMsg(err.response?.data?.message || "Employee was updated, but the team list could not be refreshed.");
      });
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.message || "Unable to update employee.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete employee?")) return;
    setMsg("");
    setIsError(false);
    try {
      await deleteEmployee(id);
      setReportData(null);
      setMsg("Employee deleted.");
      load().catch((err) => {
        setIsError(true);
        setMsg(err.response?.data?.message || "Employee was deleted, but the team list could not be refreshed.");
      });
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.message || "Unable to delete employee.");
    }
  };

  const handleViewTodos = async (employee) => {
    setViewTodos({ employee, todos: [] });
    setTodosLoading(true);
    setTodosError("");
    try {
      const res = await getEmployeeTodos(employee._id);
      setViewTodos({ employee, todos: res.data.todos });
    } catch (err) {
      setTodosError(err.response?.data?.message || "Unable to load this employee's tasks.");
    } finally {
      setTodosLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportError("");
    try {
      const results = await Promise.allSettled(employees.map(async (employee) => {
        const res = await getEmployeeTodos(employee._id);
        return { employee, todos: res.data.todos };
      }));
      const successfulReports = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
      const failedCount = results.length - successfulReports.length;
      setReportData(successfulReports);
      if (failedCount) {
        setReportError(`Task data could not be loaded for ${failedCount} employee${failedCount === 1 ? "" : "s"}. The report below includes employees whose data loaded successfully.`);
      }
    } finally {
      setReportLoading(false);
    }
  };

  const closeTodos = () => {
    setViewTodos(null);
    setTodosError("");
  };

  const reportRows = reportData?.map(({ employee, todos }) => {
    const weeklyTodos = todos.filter((todo) => (
      todo.weekStart && todo.weekEnd && todo.weekStart <= reportWeek.end && todo.weekEnd >= reportWeek.start
    ));
    const completed = weeklyTodos.filter((todo) => todo.status === "COMPLETED").length;
    return {
      employee,
      total: weeklyTodos.length,
      completed,
      progress: weeklyTodos.length ? Math.round((completed / weeklyTodos.length) * 100) : 0,
    };
  }) ?? [];
  const allWeeklyTasks = reportRows.reduce((total, row) => total + row.total, 0);
  const allCompletedTasks = reportRows.reduce((total, row) => total + row.completed, 0);
  const teamProgress = allWeeklyTasks ? Math.round((allCompletedTasks / allWeeklyTasks) * 100) : 0;

  return (
    <section className="panel" aria-labelledby="employees-heading">
      <header className="panelHeader">
        <div className="panelTitleGroup">
          <span className="panelIcon"><UsersRound size={19} /></span>
          <div>
            <h2 className="panelTitle" id="employees-heading">People</h2>
            <p className="panelSubtitle">Add teammates, manage their access, and monitor task progress.</p>
          </div>
        </div>
        <div className="peopleHeaderActions">
          <button className="button buttonSecondary buttonSmall" type="button" onClick={handleGenerateReport} disabled={reportLoading || loading || employees.length === 0}>
            <ClipboardList size={13} /> {reportLoading ? "Building report…" : "Weekly report"}
          </button>
          <span className="badge weekBadge"><Eye size={12} /> Read-only todos</span>
        </div>
      </header>

      {msg && <p className={`message${isError ? " messageError" : ""}`} role={isError ? "alert" : "status"}>{msg}</p>}

      <div className="metricsGrid">
        <div className="metricCard">
          <span className="metricLabel">Team members</span>
          <strong className="metricValue">{loading ? "—" : employees.length}</strong>
          <span className="metricHint">Employees in your workspace</span>
        </div>
        <div className="metricCard">
          <span className="metricLabel">Team management</span>
          <strong className="metricValue"><UserRoundPlus size={24} color="var(--green)" /></strong>
          <span className="metricHint">Add, update, or remove employee accounts</span>
        </div>
        <div className="metricCard">
          <span className="metricLabel">Todo access</span>
          <strong className="metricValue">View only</strong>
          <span className="metricHint">Employee-owned tasks stay protected</span>
        </div>
      </div>

      {reportData && (
        <section className="teamReport" aria-labelledby="weekly-report-heading">
          <header className="teamReportHeader">
            <div>
              <h3 className="subsectionTitle" id="weekly-report-heading">Weekly progress report</h3>
              <p className="panelSubtitle">
                {formatDate(reportWeek.start)}
                {" – "}
                {formatDate(reportWeek.end)}
                {" · "}
                Read-only summary of employee todos.
              </p>
            </div>
            <button className="button buttonSecondary buttonSmall" type="button" onClick={handleGenerateReport} disabled={reportLoading}>
              {reportLoading ? "Refreshing…" : "Refresh"}
            </button>
          </header>
          {reportError && <p className="message messageError" role="alert">{reportError}</p>}
          <div className="metricsGrid reportMetrics">
            <div className="metricCard">
              <span className="metricLabel">Tasks this week</span>
              <strong className="metricValue">{allWeeklyTasks}</strong>
              <span className="metricHint">Across loaded team members</span>
            </div>
            <div className="metricCard">
              <span className="metricLabel">Completed</span>
              <strong className="metricValue">{allCompletedTasks}</strong>
              <span className="metricHint">Employee tasks marked done</span>
            </div>
            <div className="metricCard progressMetric">
              <div className="progressMetricTop"><span className="metricLabel">Team progress</span><strong className="progressValue">{teamProgress}%</strong></div>
              <div className="progressTrack" role="progressbar" aria-label="Team task completion" aria-valuenow={teamProgress} aria-valuemin="0" aria-valuemax="100"><span className="progressFill" style={{ width: `${teamProgress}%` }} /></div>
              <span className="metricHint">{reportRows.length} employee{reportRows.length === 1 ? "" : "s"} in this report</span>
            </div>
          </div>
          <div className="tableWrap reportTableWrap">
            <table className="dataTable">
              <thead><tr><th scope="col">Employee</th><th scope="col">Planned</th><th scope="col">Done</th><th scope="col">Progress</th></tr></thead>
              <tbody>
                {reportRows.map(({ employee, total, completed, progress }) => (
                  <tr key={employee._id}>
                    <td><span className="employeeIdentity"><span className="miniAvatar">{initials(employee.name) || "U"}</span>{employee.name}</span></td>
                    <td>{total}</td>
                    <td>{completed}</td>
                    <td>
                      <span className="reportProgressCell">
                        <span className="reportProgressTrack"><span className="progressFill" style={{ width: `${progress}%` }} /></span>
                        <strong>{progress}%</strong>
                      </span>
                    </td>
                  </tr>
                ))}
                {!reportRows.length && <tr><td className="tableEmpty" colSpan="4">No employee task data is available for this report.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <form className="employeeForm" onSubmit={handleCreate}>
        <label className="srOnly" htmlFor="employee-name">Employee name</label>
        <input id="employee-name" className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <label className="srOnly" htmlFor="employee-email">Employee email</label>
        <input id="employee-email" className="input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className="srOnly" htmlFor="employee-password">Temporary password</label>
        <input id="employee-password" className="input" type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="button" type="submit"><Plus size={15} /> Add employee</button>
      </form>

      <div className="tableWrap">
        <table className="dataTable">
          <thead>
            <tr><th scope="col">Employee</th><th scope="col">Email</th><th scope="col">Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="tableEmpty" colSpan="3"><span className="tableLoading"><span className="spinner" /> Loading your team…</span></td></tr>
            ) : employees.length === 0 ? (
              <tr><td className="tableEmpty" colSpan="3">No employees yet. Add your first teammate above.</td></tr>
            ) : employees.map((emp) => (
              <tr key={emp._id}>
                {editId === emp._id ? (
                  <>
                    <td><input className="input" aria-label="Employee name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                    <td><input className="input" type="email" aria-label="Employee email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></td>
                    <td>
                      <div className="rowActions">
                        <button className="button buttonSmall" type="button" onClick={(e) => handleUpdate(e, emp._id)}>Save</button>
                        <button className="button buttonSecondary buttonSmall" type="button" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td><span className="employeeIdentity"><span className="miniAvatar">{initials(emp.name) || "U"}</span>{emp.name}</span></td>
                    <td>{emp.email}</td>
                    <td>
                      <div className="rowActions">
                        <button className="button buttonSecondary buttonSmall" type="button" onClick={() => { setEditId(emp._id); setEditForm({ name: emp.name, email: emp.email }); }}>
                          <Pencil size={12} /> Edit
                        </button>
                        <button className="button buttonSecondary buttonSmall" type="button" onClick={() => handleViewTodos(emp)}>
                          <Eye size={13} /> Todos
                        </button>
                        <button className="button buttonDanger buttonSmall" type="button" aria-label={`Delete ${emp.name}`} onClick={() => handleDelete(emp._id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewTodos && (
        <div className="modalBackdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeTodos(); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="employee-todos-title">
            <header className="modalHeader">
              <div>
                <h3 className="modalTitle" id="employee-todos-title">{viewTodos.employee.name}'s tasks</h3>
                <p className="modalSubtitle">Progress overview · read-only</p>
              </div>
              <button className="button buttonSecondary buttonIcon" type="button" onClick={closeTodos} aria-label="Close task monitor"><X size={17} /></button>
            </header>
            {todosError && <p className="message messageError" role="alert">{todosError}</p>}
            {todosLoading ? (
              <div className="inlineLoading"><span className="spinner" /> Loading tasks…</div>
            ) : todosError ? null : viewTodos.todos.length === 0 ? (
              <div className="emptyState">
                <span className="emptyIcon"><Eye size={18} /></span>
                <p className="emptyTitle">No tasks to show</p>
                <p className="emptyCopy">This employee has not created any todos yet.</p>
              </div>
            ) : (
              <div className="todoList">
                {viewTodos.todos.map((todo) => (
                  <article className="todoCard" key={todo._id}>
                    <h4 className="todoTitle">{todo.title}</h4>
                    {todo.description && <p className="todoDescription">{todo.description}</p>}
                    <div className="todoMeta">
                      <span className={`badge ${statusClass(todo.status)}`}>{todo.status.replace("_", " ")}</span>
                      <span className={`badge ${priorityClass(todo.priority)}`}>{todo.priority} priority</span>
                      {todo.weekStart && todo.weekEnd && <span className="badge weekBadge">{formatDate(todo.weekStart)} – {formatDate(todo.weekEnd)}</span>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

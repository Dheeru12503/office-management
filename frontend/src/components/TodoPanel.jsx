import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, CirclePlus, ClipboardList, Clock3, Pencil, Target, Trash2, X } from "lucide-react";
import { getMyTodos, createTodo, updateTodo, deleteTodo } from "../api/todos";
import { formatDate } from "../utils/date";
import "../App.css";

const STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const today = () => new Date().toISOString().split("T")[0];

function getWeekRange() {
  const date = new Date();
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const format = (value) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  };
  return { start: format(monday), end: format(sunday) };
}

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

export default function TodoPanel() {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", weekStart: today(), weekEnd: today() });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("week");
  const [weekRange] = useState(getWeekRange);

  const load = () => getMyTodos().then((r) => setTodos(r.data.todos));

  useEffect(() => {
    load()
      .catch((err) => {
        setIsError(true);
        setMsg(err.response?.data?.message || "Unable to load your tasks. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const thisWeekTodos = useMemo(() => todos.filter((todo) => (
    todo.weekStart && todo.weekEnd && todo.weekStart <= weekRange.end && todo.weekEnd >= weekRange.start
  )), [todos, weekRange]);
  const weekDone = thisWeekTodos.filter((todo) => todo.status === "COMPLETED").length;
  const weekProgress = thisWeekTodos.length ? Math.round((weekDone / thisWeekTodos.length) * 100) : 0;
  const visibleTodos = filter === "week" ? thisWeekTodos : todos;

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsError(false);
    try {
      await createTodo(form);
      setForm({ title: "", description: "", priority: "MEDIUM", weekStart: today(), weekEnd: today() });
      setMsg("Todo added!");
      load().catch((err) => {
        setIsError(true);
        setMsg(err.response?.data?.message || "Todo was added, but your task list could not be refreshed.");
      });
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.message || "Unable to add todo.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsError(false);
    try {
      await updateTodo(editId, editForm);
      setEditId(null);
      setMsg("Todo updated!");
      load().catch((err) => {
        setIsError(true);
        setMsg(err.response?.data?.message || "Todo was updated, but your task list could not be refreshed.");
      });
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.message || "Unable to update todo.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete todo?")) return;
    setMsg("");
    setIsError(false);
    try {
      await deleteTodo(id);
      setMsg("Todo deleted.");
      load().catch((err) => {
        setIsError(true);
        setMsg(err.response?.data?.message || "Todo was deleted, but your task list could not be refreshed.");
      });
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.message || "Unable to delete todo.");
    }
  };

  return (
    <div className="sectionStack">
      <section className="panel" aria-labelledby="planner-heading">
        <header className="panelHeader">
          <div className="panelTitleGroup">
            <span className="panelIcon"><CalendarDays size={19} /></span>
            <div>
              <h2 className="panelTitle" id="planner-heading">Your weekly plan</h2>
              <p className="panelSubtitle">
                {formatDate(weekRange.start)}
                {" – "}
                {formatDate(weekRange.end)}
                {" · "}
                Keep your own priorities moving.
              </p>
            </div>
          </div>
          <span className="badge weekBadge"><Target size={12} /> Personal tasks</span>
        </header>

        <div className="metricsGrid">
          <div className="metricCard">
            <span className="metricLabel">Tasks this week</span>
            <strong className="metricValue">{thisWeekTodos.length}</strong>
            <span className="metricHint">Based on your selected task dates</span>
          </div>
          <div className="metricCard">
            <span className="metricLabel">Completed</span>
            <strong className="metricValue">{weekDone}</strong>
            <span className="metricHint">Marked done this week</span>
          </div>
          <div className="metricCard progressMetric">
            <div className="progressMetricTop">
              <span className="metricLabel">Weekly progress</span>
              <strong className="progressValue">{weekProgress}%</strong>
            </div>
            <div className="progressTrack" role="progressbar" aria-label="Weekly task completion" aria-valuenow={weekProgress} aria-valuemin="0" aria-valuemax="100">
              <span className="progressFill" style={{ width: `${weekProgress}%` }} />
            </div>
            <span className="metricHint">{thisWeekTodos.length ? "You're making progress" : "Add tasks to start your week"}</span>
          </div>
        </div>

        <div className="todoFormSection">
          <div className="todoFormIntro">
            <span className="smallIcon"><CirclePlus size={16} /></span>
            <div>
              <h3 className="subsectionTitle">Add a task</h3>
              <p className="panelSubtitle">Capture the work you want to move forward.</p>
            </div>
          </div>
          {msg && <p className={`message${isError ? " messageError" : ""}`} role={isError ? "alert" : "status"}>{msg}</p>}
          <form className="formGrid formGridThree todoCreateForm" onSubmit={handleCreate}>
            <label className="field">
              <span className="fieldLabel">Task title</span>
              <input className="input" placeholder="What needs to get done?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="field">
              <span className="fieldLabel">Priority</span>
              <select className="select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="fieldLabel">Description</span>
              <input className="input" placeholder="Add a little more detail (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="field">
              <span className="fieldLabel">Week starts</span>
              <input className="input" type="date" value={form.weekStart} onChange={(e) => setForm({ ...form, weekStart: e.target.value })} required />
            </label>
            <label className="field">
              <span className="fieldLabel">Week ends</span>
              <input className="input" type="date" value={form.weekEnd} onChange={(e) => setForm({ ...form, weekEnd: e.target.value })} required />
            </label>
            <div className="field todoCreateAction">
              <span className="fieldLabel" aria-hidden="true">&nbsp;</span>
              <button className="button" type="submit"><PlusIcon /> Add task</button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel" aria-labelledby="todos-heading">
        <header className="panelHeader todoListHeader">
          <div className="panelTitleGroup">
            <span className="panelIcon"><ClipboardList size={19} /></span>
            <div>
              <h2 className="panelTitle" id="todos-heading">My todos</h2>
              <p className="panelSubtitle">Update your task status, priority, or details at any time.</p>
            </div>
          </div>
          <div className="filterGroup" role="group" aria-label="Filter tasks">
            <button className={`filterButton${filter === "week" ? " isActive" : ""}`} type="button" onClick={() => setFilter("week")}>
              This week <span>{thisWeekTodos.length}</span>
            </button>
            <button className={`filterButton${filter === "all" ? " isActive" : ""}`} type="button" onClick={() => setFilter("all")}>
              All tasks <span>{todos.length}</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="inlineLoading"><span className="spinner" /> Loading your tasks…</div>
        ) : isError && !todos.length ? (
          <div className="emptyState">
            <span className="emptyIcon"><Clock3 size={18} /></span>
            <p className="emptyTitle">Your tasks couldn't be loaded</p>
            <p className="emptyCopy">{msg || "Please refresh the page and try again."}</p>
          </div>
        ) : visibleTodos.length === 0 ? (
          <div className="emptyState">
            <span className="emptyIcon"><ClipboardList size={18} /></span>
            <p className="emptyTitle">{filter === "week" ? "A clear week ahead" : "No todos yet"}</p>
            <p className="emptyCopy">{filter === "week" ? "There are no tasks scheduled for this week. Try All tasks or add a new one above." : "Add your first task above to build your personal plan."}</p>
          </div>
        ) : (
          <div className="todoList">
            {visibleTodos.map((todo) => (
              <article className="todoCard" key={todo._id}>
                {editId === todo._id ? (
                  <form className="todoEditForm" onSubmit={handleUpdate}>
                    <label className="srOnly" htmlFor={`edit-title-${todo._id}`}>Task title</label>
                    <input id={`edit-title-${todo._id}`} className="input" value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
                    <label className="srOnly" htmlFor={`edit-description-${todo._id}`}>Task description</label>
                    <input id={`edit-description-${todo._id}`} className="input" value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                    <label className="srOnly" htmlFor={`edit-status-${todo._id}`}>Task status</label>
                    <select id={`edit-status-${todo._id}`} className="select" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                      {STATUSES.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                    </select>
                    <label className="srOnly" htmlFor={`edit-priority-${todo._id}`}>Task priority</label>
                    <select id={`edit-priority-${todo._id}`} className="select" value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                      {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                    </select>
                    <div className="todoEditActions">
                      <button className="button buttonSmall" type="submit"><Check size={13} /> Save changes</button>
                      <button className="button buttonSecondary buttonSmall" type="button" onClick={() => setEditId(null)}><X size={13} /> Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="todoCardTop">
                      <div>
                        <h3 className="todoTitle">{todo.title}</h3>
                        {todo.description && <p className="todoDescription">{todo.description}</p>}
                      </div>
                      <div className="todoActions">
                        <button className="button buttonSecondary buttonSmall" type="button" onClick={() => { setEditId(todo._id); setEditForm({ title: todo.title, description: todo.description || "", status: todo.status, priority: todo.priority }); }}>
                          <Pencil size={12} /> Edit
                        </button>
                        <button className="button buttonDanger buttonSmall" type="button" onClick={() => handleDelete(todo._id)}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                    <div className="todoMeta">
                      <span className={`badge ${statusClass(todo.status)}`}>{todo.status.replace("_", " ")}</span>
                      <span className={`badge ${priorityClass(todo.priority)}`}>{todo.priority} priority</span>
                      {todo.weekStart && todo.weekEnd && <span className="badge weekBadge"><CalendarDays size={11} /> {formatDate(todo.weekStart)} – {formatDate(todo.weekEnd)}</span>}
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PlusIcon() {
  return <CirclePlus size={15} />;
}

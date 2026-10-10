import { useEffect, useState } from "react";
import { Building2, Check, FolderKanban, Pencil, Plus, Trash2, X } from "lucide-react";
import { getWorkspace, createWorkspace, updateWorkspace, deleteWorkspace } from "../api/workspace";
import "../App.css";

export default function WorkspacePanel() {
  const [workspace, setWorkspace] = useState(null);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getWorkspace()
      .then((res) => setWorkspace(res.data.workspace))
      .catch((err) => {
        setWorkspace(null);
        setError(true);
        setMsg(err.response?.data?.message || "Unable to load your workspace. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg("");
    setError(false);
    try {
      const res = await createWorkspace({ name });
      setWorkspace(res.data.workspace);
      setName("");
      setMsg("Workspace created!");
    } catch (err) {
      setError(true);
      setMsg(err.response?.data?.message || "Unable to create workspace.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg("");
    setError(false);
    try {
      const res = await updateWorkspace(workspace._id, { name });
      setWorkspace(res.data.workspace);
      setEditing(false);
      setMsg("Workspace updated!");
    } catch (err) {
      setError(true);
      setMsg(err.response?.data?.message || "Unable to update workspace.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete workspace?")) return;
    setMsg("");
    setError(false);
    try {
      await deleteWorkspace(workspace._id);
      setWorkspace(null);
      setMsg("Workspace deleted.");
    } catch (err) {
      setError(true);
      setMsg(err.response?.data?.message || "Unable to delete workspace.");
    }
  };

  return (
    <section className="panel" aria-labelledby="workspace-heading">
      <header className="panelHeader">
        <div className="panelTitleGroup">
          <span className="panelIcon"><FolderKanban size={19} /></span>
          <div>
            <h2 className="panelTitle" id="workspace-heading">Workspace</h2>
            <p className="panelSubtitle">Your team's home base and shared work environment.</p>
          </div>
        </div>
        {workspace && <span className="badge statusDone"><Check size={12} /> Active</span>}
      </header>
      {msg && <p className={`message${error ? " messageError" : ""}`} role={error ? "alert" : "status"}>{msg}</p>}

      {loading ? (
        <div className="inlineLoading"><span className="spinner" /> Loading workspace…</div>
      ) : workspace ? (
        <div className="workspaceRow">
          {editing ? (
            <form className="workspaceEdit" onSubmit={handleUpdate}>
              <label className="srOnly" htmlFor="workspace-name">Workspace name</label>
              <input className="input workspaceNameInput" id="workspace-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Workspace name" required />
              <div className="buttonGroup">
                <button className="button buttonSmall" type="submit"><Check size={14} /> Save</button>
                <button className="button buttonSecondary buttonSmall" type="button" onClick={() => setEditing(false)}><X size={14} /> Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="workspaceIdentity">
                <span className="workspaceGlyph"><Building2 size={19} /></span>
                <span>
                  <span className="workspaceName">{workspace.name}</span>
                  <span className="workspaceCaption">Your workspace is ready for the team.</span>
                </span>
              </div>
              <div className="buttonGroup">
                <button className="button buttonSecondary buttonSmall" type="button" onClick={() => { setEditing(true); setName(workspace.name); }}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="button buttonDanger buttonSmall" type="button" onClick={handleDelete}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <form className="workspaceCreate" onSubmit={handleCreate}>
          <label className="field workspaceNameField">
            <span className="fieldLabel">Create your team's workspace</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Studio" required />
          </label>
          <button className="button" type="submit"><Plus size={15} /> Create workspace</button>
        </form>
      )}
    </section>
  );
}

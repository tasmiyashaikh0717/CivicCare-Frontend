import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getComplaints } from "../services/api";
import { requireSupabase } from "../services/supabase";

const readableDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "—";
const getStatusClass = (status) => status === "Resolved" ? "status-resolved" : status === "In Progress" ? "status-review" : "status-submitted";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const loadComplaints = useCallback(async () => {
    setLoading(true); setError("");
    try { setComplaints(await getComplaints({ limit: 50 })); }
    catch (err) { setError(err.message || "Could not load complaints."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadComplaints(); }, [loadComplaints]);
  async function logout() { await requireSupabase().auth.signOut(); navigate("/login", { replace: true }); }
  const submitted = complaints.filter((item) => item.status === "Submitted").length;
  const inProgress = complaints.filter((item) => item.status === "In Progress").length;
  return (
    <div className="my-complaints-page">
      <nav className="navbar"><Link to="/dashboard" className="brand"><span className="brand-icon">C</span>CivicCare</Link><div className="nav-links"><Link to="/dashboard">Dashboard</Link><button type="button" className="clear-filters-btn" onClick={logout}>Logout</button></div></nav>
      <main className="my-complaints-container">
        <div className="page-heading"><span className="portal-label">CITIZEN PORTAL</span><h1>My Complaints</h1><p>Track your reported issues and stay updated on their progress.</p></div>
        <div className="complaint-summary"><div className="summary-card"><span>Total Complaints</span><h2>{complaints.length}</h2></div><div className="summary-card"><span>Submitted</span><h2>{submitted}</h2></div><div className="summary-card"><span>In Progress</span><h2>{inProgress}</h2></div></div>
        <div className="complaints-list-heading"><h2>Your Reported Issues</h2><Link to="/submit-complaint" className="complaint-action">+ New Complaint</Link></div>
        {loading && <p role="status">Loading your complaints...</p>}
        {error && <div className="demo-notice" role="alert">{error} <button type="button" onClick={loadComplaints}>Try again</button></div>}
        {!loading && !error && complaints.length === 0 && <div className="demo-notice">You have not submitted any complaints yet. Use “New Complaint” to report an issue.</div>}
        <div className="complaints-list">{complaints.map((item) => {
          const status = item.status || "Submitted";
          const category = item.categories?.name || item.category_name || item.category || "—";
          return <article className="my-complaint-card" key={item.id}>
            <div className="my-complaint-header"><div><span className="complaint-id">{item.complaint_code || item.id}</span><h3>{item.description?.length > 72 ? `${item.description.slice(0, 72)}…` : item.description || "Civic complaint"}</h3></div><span className={`complaint-status ${getStatusClass(status)}`}>{status}</span></div>
            <p className="complaint-description">{item.description}</p>
            <div className="complaint-details-grid"><div><span>Category</span><strong>{category}</strong></div><div><span>Location</span><strong>{item.address || "—"}</strong></div><div><span>Priority</span><strong className={`priority-${String(item.priority_level || "unassigned").toLowerCase()}`}>{item.priority_level || "Unassigned"}</strong></div><div><span>Date Reported</span><strong>{readableDate(item.created_at)}</strong></div></div>
            {item.aiAnalysis?.isMock && <p className="complaint-hint">AI analysis is currently in mock mode.</p>}
          </article>;
        })}</div>
      </main>
    </div>
  );
}
export default MyComplaints;

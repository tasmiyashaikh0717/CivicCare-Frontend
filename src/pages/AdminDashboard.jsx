import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getComplaintStats, getComplaints } from "../services/api";
import { requireSupabase } from "../services/supabase";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [statData, complaintData] = await Promise.all([getComplaintStats(), getComplaints({ limit: 5 })]);
      setStats(statData); setComplaints(complaintData);
    } catch (err) { setError(err.message || "Could not load admin dashboard."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  async function logout() { await requireSupabase().auth.signOut(); navigate("/login", { replace: true }); }
  const cards = [
    { label: "Total Complaints", value: stats?.totalComplaints ?? "—", description: "All reported issues", tone: "admin-stat-blue", icon: "▤" },
    { label: "Submitted", value: stats?.submitted ?? "—", description: "Awaiting action", tone: "admin-stat-orange", icon: "◷" },
    { label: "High Priority", value: stats?.priorityCounts?.High ?? "—", description: "Require urgent attention", tone: "admin-stat-red", icon: "↑" },
    { label: "Resolved", value: stats?.resolved ?? "—", description: "Issues completed", tone: "admin-stat-green", icon: "✓" },
  ];
  return <div className="admin-dashboard"><nav className="admin-navbar"><Link to="/admin-dashboard" className="admin-brand"><span className="admin-brand-icon">C</span>CivicCare <span className="admin-brand-label">ADMIN</span></Link><div className="admin-nav-links"><Link to="/">Home</Link><Link to="/all-complaints">All Complaints</Link><button type="button" className="admin-logout" onClick={logout}>Logout</button></div></nav>
    <main className="admin-content"><div className="admin-welcome"><div><span className="admin-tag">ADMINISTRATION</span><h1>Admin Dashboard</h1><p>Monitor civic issues and coordinate complaint resolution.</p></div><Link to="/all-complaints" className="admin-primary-btn">Manage Complaints <span>→</span></Link></div>
      {error && <div className="admin-demo-notice" role="alert">{error} <button type="button" onClick={load}>Try again</button></div>}
      <section className="admin-stats">{cards.map((card) => <div className={`admin-stat-card ${card.tone}`} key={card.label}><div className="admin-stat-top"><span>{card.label}</span><span className="admin-stat-icon">{card.icon}</span></div><h2>{card.value}</h2><p>{card.description}</p></div>)}</section>
      <section className="admin-section"><div className="admin-section-heading"><div><h2>Recent Complaints</h2><p>{loading ? "Loading records from the backend..." : "Latest records returned by the backend."}</p></div><Link to="/all-complaints" className="admin-view-all">View All Complaints →</Link></div>
        {complaints.length ? <div className="admin-complaint-list">{complaints.map((item) => <article className="admin-complaint" key={item.id}><div className="admin-complaint-main"><span className="admin-complaint-id">{item.complaint_code || item.id}</span><h3>{item.description?.length > 90 ? `${item.description.slice(0, 90)}…` : item.description || "Civic complaint"}</h3><div className="admin-complaint-details"><span>{item.categories?.name || item.category_name || "Category not available"}</span><span>📍 {item.address || "Location not provided"}</span></div></div><div className="admin-complaint-meta"><span className={`admin-priority priority-${String(item.priority_level || "unassigned").toLowerCase()}`}>{item.priority_level || "Unassigned"} Priority</span><span className="admin-status admin-status-submitted">{item.status || "Submitted"}</span></div></article>)}</div> : !loading && <div className="admin-demo-notice">No complaint records are available to display.</div>}
      </section><section className="admin-help-card"><div><h3>Complaint Management</h3><p>Open the complaints page to review records and update complaint status.</p></div><Link to="/all-complaints" className="admin-secondary-btn">Open Complaint List</Link></section>
    </main><footer className="admin-footer">© {new Date().getFullYear()} CivicCare. Administration Portal.</footer></div>;
}
export default AdminDashboard;

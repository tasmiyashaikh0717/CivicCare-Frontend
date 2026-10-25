
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getComplaints, updateComplaintStatus } from "../services/api";
import { requireSupabase } from "../services/supabase";

function AllComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setComplaints(await getComplaints({ limit: 50 }));
    } catch (err) {
      setError(err.message || "Could not load complaints.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    try {
      await requireSupabase().auth.signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Could not log out.");
    }
  }

  async function changeStatus(item, nextStatus) {
    setUpdatingId(item.id);
    setError("");

    try {
      await updateComplaintStatus(item.id, nextStatus);
      await load();
    } catch (err) {
      setError(err.message || "Could not update status.");
    } finally {
      setUpdatingId("");
    }
  }

  const getCategory = (item) =>
    item.categories?.name ||
    item.category_name ||
    item.category ||
    "—";

  const filtered = complaints.filter((item) => {
    const cat = getCategory(item);
    const matchesCategory =
      !category || cat.toLowerCase() === category.toLowerCase();
    const matchesStatus = !status || item.status === status;
    const matchesPriority =
      !priority ||
      (item.priority_level || "Unassigned") === priority;

    const text = `${item.complaint_code || item.id} ${
      item.description || ""
    } ${item.address || ""} ${cat}`.toLowerCase();

    return (
      matchesCategory &&
      matchesStatus &&
      matchesPriority &&
      text.includes(search.toLowerCase())
    );
  });

  const categories = [
    ...new Set(
      complaints
        .map((item) => getCategory(item))
        .filter((item) => item !== "—")
    ),
  ];

  function clearFilters() {
    setCategory("");
    setStatus("");
    setPriority("");
    setSearch("");
  }

  function renderStatusAction(item) {
    if (item.status === "Submitted") {
      return (
        <button
          type="button"
          disabled={updatingId === item.id}
          onClick={() => changeStatus(item, "In Progress")}
        >
          {updatingId === item.id ? "Saving..." : "Start work"}
        </button>
      );
    }

    if (item.status === "In Progress") {
      return (
        <button
          type="button"
          disabled={updatingId === item.id}
          onClick={() => changeStatus(item, "Resolved")}
        >
          {updatingId === item.id ? "Saving..." : "Mark resolved"}
        </button>
      );
    }

    return <span>Completed</span>;
  }

  function renderComplaintCard(item) {
    const cat = getCategory(item);
    const currentPriority = item.priority_level || "Unassigned";
    const currentStatus = item.status || "Submitted";

    return (
      <article className="mobile-complaint-card" key={item.id}>
        <div className="mobile-card-heading">
          <span className="mobile-card-id">
            {item.complaint_code || item.id}
          </span>
          <span
            className={`priority-badge ${currentPriority.toLowerCase()}`}
          >
            {currentPriority}
          </span>
        </div>

        <h3 className="mobile-card-description">
          {item.description || "No description provided"}
        </h3>

        <div className="mobile-card-detail">
          <span>Category</span>
          <strong>{cat}</strong>
        </div>

        <div className="mobile-card-detail">
          <span>Status</span>
          <strong>
            <span
              className={`status-badge ${currentStatus
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {currentStatus}
            </span>
          </strong>
        </div>

        {item.address && (
          <div className="mobile-card-address">
            <span>Location</span>
            <p>{item.address}</p>
          </div>
        )}

        <div className="mobile-card-action">
          {renderStatusAction(item)}
        </div>
      </article>
    );
  }

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <h2>CivicCare Admin</h2>
        <div className="nav-links">
          <Link to="/admin-dashboard">Dashboard</Link>
          <button
            type="button"
            className="clear-filters-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="all-complaints-container">
        <div className="complaints-heading">
          <div>
            <h1>All Complaints</h1>
            <p>View and manage complaints submitted by citizens.</p>
          </div>
          <Link
            to="/admin-dashboard"
            className="back-dashboard-btn"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="demo-notice" role="alert">
            {error}
            <button type="button" onClick={load}>
              Try again
            </button>
          </div>
        )}

        <div className="complaints-summary">
          <div className="complaint-summary-card">
            <span>Total Complaints Loaded</span>
            <h2>{complaints.length}</h2>
          </div>

          <div className="complaint-summary-card">
            <span>Matching Complaints</span>
            <h2>{filtered.length}</h2>
          </div>
        </div>

        <div className="filter-box">
          <input
            type="search"
            placeholder="Search ID, description or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option>Submitted</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
            <option>Unassigned</option>
          </select>

          <button
            type="button"
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="complaints-results" aria-live="polite">
          {loading
            ? "Loading complaints..."
            : `Showing ${filtered.length} of ${complaints.length} complaints`}
        </div>

        {/* Desktop and laptop table */}
        <div className="complaint-table-wrapper desktop-complaints-table">
          <div className="complaint-table">
            <div className="table-header">
              <span>ID</span>
              <span>Complaint</span>
              <span>Category</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Update Status</span>
            </div>

            {!loading &&
              filtered.map((item) => {
                const cat = getCategory(item);
                const currentPriority =
                  item.priority_level || "Unassigned";
                const currentStatus = item.status || "Submitted";

                return (
                  <div className="table-row" key={item.id}>
                    <span>{item.complaint_code || item.id}</span>

                    <span>
                      {item.description || "—"}
                      <small>{item.address || ""}</small>
                    </span>

                    <span>{cat}</span>

                    <span>
                      <span
                        className={`priority-badge ${currentPriority.toLowerCase()}`}
                      >
                        {currentPriority}
                      </span>
                    </span>

                    <span>
                      <span
                        className={`status-badge ${currentStatus
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {currentStatus}
                      </span>
                    </span>

                    <span>{renderStatusAction(item)}</span>
                  </div>
                );
              })}

            {!loading && filtered.length === 0 && (
              <div className="no-complaints">
                <h3>No complaints found</h3>
                <p>
                  {complaints.length
                    ? "Try changing your filters."
                    : "No live complaint records were returned by the backend."}
                </p>
                <button type="button" onClick={clearFilters}>
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile complaint cards */}
        <div className="mobile-complaints-list">
          {!loading &&
            filtered.map((item) => renderComplaintCard(item))}

          {!loading && filtered.length === 0 && (
            <div className="no-complaints">
              <h3>No complaints found</h3>
              <p>
                {complaints.length
                  ? "Try changing your filters."
                  : "No live complaint records were returned by the backend."}
              </p>
              <button type="button" onClick={clearFilters}>
                Reset Filters
              </button>
            </div>
          )}
        </div>

        <p className="sample-data-note">
          This page displays records returned by the backend API. The
          backend must be connected to the configured Supabase project
          for live data.
        </p>
      </div>
    </div>
  );
}

export default AllComplaints;

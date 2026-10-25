
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="citizen-dashboard">
      <nav className="dashboard-navbar">
        <Link to="/" className="dashboard-brand">
          <span className="dashboard-brand-icon">C</span>
          CivicCare
        </Link>

        <div className="dashboard-nav-links">
          <Link to="/">Home</Link>
          <Link to="/login" className="logout-link">
            Logout
          </Link>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <span className="dashboard-tag">CITIZEN PORTAL</span>
            <h1>Citizen Dashboard</h1>
            <p>Welcome to CivicCare! Let's make your community better.</p>
          </div>

          <Link to="/submit-complaint" className="dashboard-primary-btn">
            + Submit New Complaint
          </Link>
        </div>

        <section className="dashboard-stats">
          <div className="stat-card stat-blue">
            <div className="stat-icon">📋</div>
            <p>Total Complaints</p>
            <h2>—</h2>
            <span>Complaints you have submitted</span>
          </div>

          <div className="stat-card stat-orange">
            <div className="stat-icon">⏳</div>
            <p>Pending Complaints</p>
            <h2>—</h2>
            <span>Waiting for action</span>
          </div>

          <div className="stat-card stat-green">
            <div className="stat-icon">✓</div>
            <p>Resolved Complaints</p>
            <h2>—</h2>
            <span>Successfully resolved</span>
          </div>
        </section>

        <section className="dashboard-actions">
          <div className="dashboard-section-heading">
            <h2>Quick Actions</h2>
            <p>What would you like to do today?</p>
          </div>

          <div className="dashboard-cards">
            <article className="dashboard-card">
              <div className="action-icon">📝</div>
              <h3>Report a Civic Issue</h3>
              <p>
                Report problems such as potholes, garbage, water supply, or
                damaged streetlights in your area.
              </p>
              <Link to="/submit-complaint" className="dashboard-card-link">
                Submit Complaint <span>→</span>
              </Link>
            </article>

            <article className="dashboard-card">
              <div className="action-icon action-icon-green">📍</div>
              <h3>Track My Complaints</h3>
              <p>
                View your submitted complaints and check their current status
                and progress.
              </p>
              <Link to="/my-complaints" className="dashboard-card-link">
                View My Complaints <span>→</span>
              </Link>
            </article>
          </div>
        </section>

        <section className="dashboard-info">
          <div className="dashboard-info-icon">💡</div>
          <div>
            <h3>Your voice matters!</h3>
            <p>
              Every complaint helps identify local problems and supports
              better, faster civic services.
            </p>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>© {new Date().getFullYear()} CivicCare. Building better communities together.</p>
      </footer>
    </div>
  );
}

export default Dashboard;

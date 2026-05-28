import { useState } from "react";
import Analytics from "./Analytics";
import Portfolio from "./Portfolio";

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState("analytics");

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logo}>QuantBoard</div>
        <nav style={s.nav}>
          {[
            { id: "analytics", icon: "◈", label: "Analytics" },
            { id: "portfolio", icon: "◇", label: "Portfolio" },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                ...s.navBtn,
                background: tab === id ? "rgba(99,102,241,0.15)" : "transparent",
                color: tab === id ? "#818cf8" : "#4b5563",
                borderLeft: tab === id ? "2px solid #818cf8" : "2px solid transparent",
              }}
            >
              <span style={s.navIcon}>{icon}</span>
              <span style={s.navLabel}>{label}</span>
            </button>
          ))}
        </nav>
        <button onClick={onLogout} style={s.logoutBtn}>
          <span>⎋</span>
          <span style={s.navLabel}>Sign out</span>
        </button>
      </aside>

      {/* Main */}
      <main style={s.main}>
        {/* Top bar */}
        <div style={s.topbar}>
          <div>
            <p style={s.greeting}>Good day, {user?.name?.split("@")[0] || "Trader"}</p>
            <p style={s.subgreeting}>Here's what's moving today</p>
          </div>
          <div style={s.topbarRight}>
            <div style={s.statusDot} />
            <span style={s.statusText}>Markets open</span>
          </div>
        </div>

        {/* Content */}
        <div style={s.content}>
          {tab === "analytics" ? (
            <Analytics token={user.token} />
          ) : (
            <Portfolio token={user.token} />
          )}
        </div>
      </main>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#080b14",
    fontFamily: "'DM Mono', 'Fira Code', monospace",
    color: "#e2e8f0",
  },
  sidebar: {
    width: "200px",
    background: "#0d1117",
    borderRight: "1px solid #1f2937",
    display: "flex",
    flexDirection: "column",
    padding: "1.5rem 0",
    position: "sticky",
    top: 0,
    height: "100vh",
    flexShrink: 0,
  },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#818cf8",
    letterSpacing: "0.1em",
    padding: "0 1.25rem 2rem",
    borderBottom: "1px solid #1f2937",
    marginBottom: "1rem",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "2px",
    padding: "0 0.5rem",
  },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
    transition: "all 0.15s",
    textAlign: "left",
  },
  navIcon: { fontSize: "16px", width: "20px", textAlign: "center" },
  navLabel: { fontSize: "13px" },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 24px",
    background: "transparent",
    border: "none",
    color: "#4b5563",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
    marginTop: "auto",
    transition: "color 0.15s",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 2rem",
    borderBottom: "1px solid #1f2937",
    background: "#0d1117",
  },
  greeting: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: "2px",
  },
  subgreeting: {
    fontSize: "12px",
    color: "#4b5563",
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#34d399",
    boxShadow: "0 0 8px #34d399",
  },
  statusText: {
    fontSize: "12px",
    color: "#34d399",
  },
  content: {
    flex: 1,
    padding: "2rem",
    overflowY: "auto",
  },
};
import { useState } from "react";
import Analytics from "./Analytics";
import Portfolio from "./Portfolio";

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState("analytics");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        background: "var(--bg2)",
        borderBottom: "1px solid var(--border)",
        padding: "0 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "56px", position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--accent)", letterSpacing: "-0.2px" }}>
            QuantBoard
          </span>
          <nav style={{ display: "flex", gap: "2px" }}>
            {["analytics", "portfolio"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "6px 16px", borderRadius: "6px", fontSize: "14px",
                fontWeight: tab === t ? "500" : "400",
                background: tab === t ? "var(--accent-light)" : "transparent",
                color: tab === t ? "var(--accent)" : "var(--muted)",
                border: "none",
                textTransform: "capitalize"
              }}>{t}</button>
            ))}
          </nav>
        </div>
        <button onClick={onLogout} style={{
          padding: "7px 16px", borderRadius: "6px", fontSize: "14px",
          background: "transparent", color: "var(--muted)",
          border: "1px solid var(--border)", fontWeight: "400"
        }}
          onMouseEnter={e => e.target.style.borderColor = "var(--border2)"}
          onMouseLeave={e => e.target.style.borderColor = "var(--border)"}
        >Sign out</button>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 2rem" }}>
        {tab === "analytics" ? <Analytics token={user.token} /> : <Portfolio token={user.token} />}
      </main>
    </div>
  );
}

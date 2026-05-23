import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    try {
      if (mode === "signup") {
        await axios.post(`${API}/signup`, { email, password });
        setSuccess("Account created successfully. You can now sign in.");
        setMode("login");
        setPassword("");
      } else {
        const res = await axios.post(`${API}/login`, { email, password });
        onLogin(res.data.token, String(res.data.user_id));
      }
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: "2rem", background: "var(--bg)"
    }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "2.5rem",
          boxShadow: "0 1px 3px rgba(91,77,232,0.08), 0 8px 32px rgba(91,77,232,0.06)"
        }}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{
              fontSize: "24px", fontWeight: "600",
              color: "var(--text)", marginBottom: "8px", letterSpacing: "-0.3px"
            }}>
              {mode === "login" ? "Sign in to QuantBoard" : "Create your account"}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.5" }}>
              {mode === "login"
                ? "Enter your email and password to continue."
                : "Start tracking your investments for free."}
            </p>
          </div>

          {error && (
            <div style={{
              padding: "12px 14px", borderRadius: "6px",
              background: "var(--red-light)", border: "1px solid #fecaca",
              marginBottom: "1.25rem"
            }}>
              <p style={{ fontSize: "14px", color: "var(--red)" }}>{error}</p>
            </div>
          )}

          {success && (
            <div style={{
              padding: "12px 14px", borderRadius: "6px",
              background: "var(--green-light)", border: "1px solid #bbf7d0",
              marginBottom: "1.25rem"
            }}>
              <p style={{ fontSize: "14px", color: "var(--green)" }}>{success}</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{
                display: "block", fontSize: "14px", fontWeight: "500",
                color: "var(--text)", marginBottom: "6px"
              }}>Email address</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                autoComplete="email"
              />
            </div>
            <div>
              <label style={{
                display: "block", fontSize: "14px", fontWeight: "500",
                color: "var(--text)", marginBottom: "6px"
              }}>Password</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit} disabled={loading}
            style={{
              width: "100%", padding: "12px",
              background: loading ? "var(--muted2)" : "var(--accent)",
              color: "#fff", fontWeight: "500", fontSize: "15px",
              borderRadius: "6px", marginBottom: "1.25rem",
              letterSpacing: "0.1px"
            }}
            onMouseEnter={e => !loading && (e.target.style.background = "var(--accent-hover)")}
            onMouseLeave={e => !loading && (e.target.style.background = "var(--accent)")}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <div style={{
            borderTop: "1px solid var(--border)", paddingTop: "1.25rem",
            textAlign: "center"
          }}>
            <p style={{ fontSize: "14px", color: "var(--muted)" }}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
                style={{ color: "var(--accent)", cursor: "pointer", fontWeight: "500" }}
              >
                {mode === "login" ? "Create one" : "Sign in"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

export default function Portfolio({ token }) {
  const [stocks, setStocks] = useState([]);
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/portfolio/`, { headers });
      setStocks(res.data);
    } catch {
      setStocks([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadPortfolio(); }, [token]);

  const addStock = async () => {
    if (!ticker || !shares) { setError("All fields are required"); return; }
    setAdding(true); setError("");
    try {
      await axios.post(`${API}/portfolio/`, {
        ticker: ticker.toUpperCase(),
        shares: parseFloat(shares)
      }, { headers });
      setTicker(""); setShares("");
      const res = await axios.get(`${API}/portfolio/`, { headers });
      setStocks(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to add position");
    }
    setAdding(false);
  };

  const totalValue = stocks.reduce((sum, s) => sum + s.shares * s.buy_price, 0);

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.2px" }}>
          My portfolio
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "14px" }}>Track your stock positions</p>
      </div>

      {stocks.length > 0 && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px", marginBottom: "2rem"
        }}>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "8px", padding: "1rem 1.25rem"
          }}>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px", fontWeight: "500" }}>Total invested</p>
            <p style={{ fontSize: "22px", fontWeight: "600", color: "var(--accent)" }}>
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "8px", padding: "1rem 1.25rem"
          }}>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px", fontWeight: "500" }}>Positions</p>
            <p style={{ fontSize: "22px", fontWeight: "600", color: "var(--text)" }}>{stocks.length}</p>
          </div>
        </div>
      )}

      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "10px", padding: "1.5rem", marginBottom: "2rem"
      }}>
        <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "1.25rem", color: "var(--text)" }}>
          Add position
        </h3>
        {/* Adjusted grid column layout from 2fr 1fr 1fr down to 2fr 1fr since price is automated */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--muted)", marginBottom: "6px" }}>
              Ticker symbol
            </label>
            <input
              value={ticker} onChange={e => setTicker(e.target.value)}
              placeholder="e.g. TCS.NS"
              onKeyDown={e => e.key === "Enter" && addStock()}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--muted)", marginBottom: "6px" }}>
              Shares
            </label>
            <input
              type="number" value={shares} onChange={e => setShares(e.target.value)}
              placeholder="10"
              onKeyDown={e => e.key === "Enter" && addStock()}
            />
          </div>
        </div>

        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: "6px", marginBottom: "12px",
            background: "var(--red-light)", border: "1px solid #fecaca"
          }}>
            <p style={{ fontSize: "13px", color: "var(--red)" }}>{error}</p>
          </div>
        )}

        <button
          onClick={addStock} disabled={adding}
          style={{
            padding: "10px 20px", background: adding ? "var(--muted2)" : "var(--accent)",
            color: "#fff", fontWeight: "500", fontSize: "14px", borderRadius: "6px"
          }}
          onMouseEnter={e => !adding && (e.target.style.background = "var(--accent-hover)")}
          onMouseLeave={e => !adding && (e.target.style.background = "var(--accent)")}
        >
          {adding ? "Adding..." : "Add position"}
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)", fontSize: "14px" }}>Loading positions...</p>
      ) : stocks.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "3rem 2rem",
          border: "1px dashed var(--border2)", borderRadius: "10px",
          background: "var(--bg2)"
        }}>
          <p style={{ color: "var(--muted)", fontSize: "15px", marginBottom: "4px" }}>No positions yet</p>
          <p style={{ color: "var(--muted2)", fontSize: "13px" }}>Add your first stock using the form above</p>
        </div>
      ) : (
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "10px", overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
                {["Ticker", "Shares", "Buy price", "Position value", "Added"].map(h => (
                  <th key={h} style={{
                    padding: "11px 16px", textAlign: "left",
                    fontSize: "12px", color: "var(--muted)",
                    fontWeight: "500", letterSpacing: "0.2px"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocks.map((s, i) => (
                <tr key={s.id}
                  style={{ borderBottom: i < stocks.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--accent-light)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{
                      fontSize: "13px", fontWeight: "600", color: "var(--accent)",
                      background: "var(--accent-light)", padding: "3px 8px",
                      borderRadius: "4px", border: "1px solid var(--border2)"
                    }}>{s.ticker}</span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "14px", color: "var(--text)" }}>{s.shares}</td>
                  <td style={{ padding: "13px 16px", fontSize: "14px", color: "var(--text)" }}>
                    ${parseFloat(s.buy_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>
                    ${(s.shares * s.buy_price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "13px", color: "var(--muted)" }}>
                    {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
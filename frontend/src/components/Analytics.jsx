import { useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API = "http://localhost:8000";

const MetricCard = ({ label, value, sub, color }) => (
  <div style={{
    background: "var(--bg2)", border: "1px solid var(--border)",
    borderRadius: "8px", padding: "1rem 1.25rem"
  }}>
    <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "6px", fontWeight: "500" }}>{label}</p>
    <p style={{ fontSize: "20px", fontWeight: "600", color: color || "var(--text)" }}>{value}</p>
    {sub && <p style={{ fontSize: "12px", color: "var(--muted2)", marginTop: "4px" }}>{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "6px", padding: "8px 12px",
      boxShadow: "0 4px 12px rgba(91,77,232,0.1)"
    }}>
      <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "3px" }}>{label}</p>
      <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--accent)" }}>
        ${payload[0].value?.toFixed(2)}
      </p>
    </div>
  );
};

export default function Analytics({ token }) {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!ticker.trim()) return;
    setLoading(true); setError(""); setData(null);
    try {
      const res = await axios.get(`${API}/analytics/${ticker.toUpperCase()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch {
      setError("Ticker not found. Try TCS.NS, RELIANCE.NS, or MSFT");
    }
    setLoading(false);
  };

  const chartData = data
    ? Object.entries(data.historical_prices).map(([date, price]) => ({
        date: date.slice(5, 10), price: parseFloat(price)
      }))
    : [];

  const priceChange = data && chartData.length > 1
    ? ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price * 100).toFixed(2)
    : null;

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.2px" }}>
          Stock analytics
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "14px" }}>
          30-day risk metrics and price history for any stock
        </p>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "2rem", maxWidth: "500px" }}>
        <input
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          placeholder="Enter ticker — TCS.NS, RELIANCE.NS, MSFT..."
          onKeyDown={e => e.key === "Enter" && fetchData()}
        />
        <button
          onClick={fetchData} disabled={loading}
          style={{
            padding: "12px 22px", background: "var(--accent)",
            color: "#fff", fontWeight: "500", fontSize: "14px",
            borderRadius: "6px", whiteSpace: "nowrap", minWidth: "90px"
          }}
          onMouseEnter={e => !loading && (e.target.style.background = "var(--accent-hover)")}
          onMouseLeave={e => !loading && (e.target.style.background = "var(--accent)")}
        >
          {loading ? "Loading..." : "Analyse"}
        </button>
      </div>

      {error && (
        <div style={{
          padding: "12px 14px", borderRadius: "6px", marginBottom: "1.5rem",
          background: "var(--red-light)", border: "1px solid #fecaca"
        }}>
          <p style={{ fontSize: "14px", color: "var(--red)" }}>{error}</p>
        </div>
      )}

      {data && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-0.3px" }}>{data.ticker}</h3>
            {priceChange && (
              <span style={{
                fontSize: "13px", fontWeight: "500",
                color: parseFloat(priceChange) >= 0 ? "var(--green)" : "var(--red)"
              }}>
                {parseFloat(priceChange) >= 0 ? "▲" : "▼"} {Math.abs(priceChange)}% (30d)
              </span>
            )}
            <span style={{
              fontSize: "12px", padding: "3px 10px", borderRadius: "20px", fontWeight: "500",
              background: data.signal === "Bullish" ? "var(--green-light)" : "var(--red-light)",
              color: data.signal === "Bullish" ? "var(--green)" : "var(--red)",
              border: `1px solid ${data.signal === "Bullish" ? "#bbf7d0" : "#fecaca"}`
            }}>
              {data.signal}
            </span>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
            gap: "10px", marginBottom: "1.75rem"
          }}>
            <MetricCard label="Current price" value={`$${data.current_price}`} />
            <MetricCard label="30-day high" value={`$${data.high_30}`} color="var(--green)" />
            <MetricCard label="30-day low" value={`$${data.low_30}`} color="var(--red)" />
            <MetricCard
              label="Sharpe ratio"
              value={data.sharpe_ratio}
              sub={data.sharpe_ratio > 1 ? "Good risk-adjusted return" : "Below benchmark"}
              color={data.sharpe_ratio > 1 ? "var(--green)" : "var(--amber)"}
            />
            <MetricCard
              label="Volatility"
              value={`${(data.volatility * 100).toFixed(2)}%`}
              sub="Daily std deviation"
            />
            <MetricCard
              label="Max drawdown"
              value={`${(data.max_drawdown * 100).toFixed(2)}%`}
              color="var(--red)"
              sub="Worst peak-to-trough"
            />
          </div>

          <div style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "10px", padding: "1.5rem"
          }}>
            <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--muted)", marginBottom: "1.25rem" }}>
              30-day price history
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="price" stroke="var(--accent)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

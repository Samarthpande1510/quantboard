import { useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const API = process.env.REACT_APP_API_URL;

const Metric = ({ label, value, sub, color, bg }) => (
  <div style={{
    background: bg || "rgba(255,255,255,0.03)",
    border: "1px solid #1f2937",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    transition: "border-color 0.2s",
  }}>
    <p style={{ fontSize: "11px", color: "#4b5563", marginBottom: "8px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
    <p style={{ fontSize: "22px", fontWeight: "700", color: color || "#e2e8f0", fontVariantNumeric: "tabular-nums" }}>{value}</p>
    {sub && <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>{sub}</p>}
  </div>
);

const Badge = ({ children, color }) => (
  <span style={{
    fontSize: "11px", padding: "3px 10px", borderRadius: "4px",
    fontWeight: "600", letterSpacing: "0.06em",
    background: color === "green" ? "rgba(52,211,153,0.1)" : color === "red" ? "rgba(239,68,68,0.1)" : "rgba(129,140,248,0.1)",
    color: color === "green" ? "#34d399" : color === "red" ? "#f87171" : "#818cf8",
    border: `1px solid ${color === "green" ? "rgba(52,211,153,0.2)" : color === "red" ? "rgba(239,68,68,0.2)" : "rgba(129,140,248,0.2)"}`,
  }}>{children}</span>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0d1117", border: "1px solid #1f2937",
      borderRadius: "8px", padding: "10px 14px",
    }}>
      <p style={{ fontSize: "11px", color: "#4b5563", marginBottom: "4px" }}>{label}</p>
      <p style={{ fontSize: "15px", fontWeight: "700", color: "#818cf8" }}>
        ${payload[0].value?.toFixed(2)}
      </p>
    </div>
  );
};

const RecommendationCard = ({ rec }) => {
  const colorMap = {
    BUY: { color: "#34d399", bg: "rgba(52,211,153,0.05)", border: "rgba(52,211,153,0.2)" },
    SELL: { color: "#f87171", bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.2)" },
    HOLD: { color: "#fbbf24", bg: "rgba(251,191,36,0.05)", border: "rgba(251,191,36,0.2)" },
  };
  const c = colorMap[rec.recommendation] || colorMap.HOLD;

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: "12px",
      padding: "1.5rem",
      marginTop: "1.5rem",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
            AI Recommendation {rec.cached && <span style={{ color: "#4b5563" }}>· cached</span>}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "32px", fontWeight: "800", color: c.color, letterSpacing: "-0.02em" }}>
              {rec.recommendation}
            </span>
            <Badge color={rec.sentiment === "BULLISH" ? "green" : rec.sentiment === "BEARISH" ? "red" : "purple"}>
              {rec.sentiment}
            </Badge>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "11px", color: "#4b5563", marginBottom: "4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Confidence</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "80px", height: "6px", background: "#1f2937", borderRadius: "3px", overflow: "hidden"
            }}>
              <div style={{
                width: `${rec.confidence * 10}%`,
                height: "100%",
                background: c.color,
                borderRadius: "3px",
                transition: "width 0.8s ease",
              }} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: "700", color: c.color }}>{rec.confidence}/10</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p style={{ fontSize: "13px", color: "#9ca3af", lineHeight: "1.7", marginBottom: "1.25rem" }}>
        {rec.summary}
      </p>

      {/* Insights + Risks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#34d399", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Key Insights
          </p>
          {rec.insights?.map((insight, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
              <span style={{ color: "#34d399", flexShrink: 0, fontSize: "12px" }}>→</span>
              <p style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "1.5" }}>{insight}</p>
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#f87171", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Risk Factors
          </p>
          {rec.risks?.map((risk, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
              <span style={{ color: "#f87171", flexShrink: 0, fontSize: "12px" }}>⚠</span>
              <p style={{ fontSize: "12px", color: "#9ca3af", lineHeight: "1.5" }}>{risk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical grid */}
      {rec.technical && (
        <div style={{
          marginTop: "1.25rem",
          paddingTop: "1.25rem",
          borderTop: `1px solid ${c.border}`,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.75rem"
        }}>
          {[
            { label: "RSI", value: rec.technical.rsi?.toFixed(1), note: rec.technical.rsi > 70 ? "Overbought" : rec.technical.rsi < 30 ? "Oversold" : "Neutral" },
            { label: "MACD", value: rec.technical.macd?.toFixed(3) },
            { label: "MA 50d", value: `$${rec.technical.ma50?.toFixed(2)}` },
            { label: "MA 200d", value: `$${rec.technical.ma200?.toFixed(2)}` },
          ].map(({ label, value, note }) => (
            <div key={label} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "6px", padding: "0.6rem 0.75rem" }}>
              <p style={{ fontSize: "10px", color: "#4b5563", marginBottom: "4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
              <p style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>{value || "—"}</p>
              {note && <p style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>{note}</p>}
            </div>
          ))}
        </div>
      )}

      {/* News */}
      {rec.news?.length > 0 && (
        <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: `1px solid ${c.border}` }}>
          <p style={{ fontSize: "11px", color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Recent News
          </p>
          {rec.news.slice(0, 3).map((n, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" }}>
              <span style={{ color: "#4b5563", fontSize: "10px", marginTop: "2px", flexShrink: 0 }}>◦</span>
              <p style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.5" }}>
                {n.title} <span style={{ color: "#374151" }}>· {n.source}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Analytics({ token }) {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!ticker.trim()) return;
    setLoading(true); setError(""); setData(null); setAnalysis(null);
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

  const fetchAnalysis = async () => {
    if (!ticker.trim()) return;
    setAnalyzing(true);
    try {
      const res = await axios.get(`${API}/analyze/${ticker.toUpperCase()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalysis(res.data);
    } catch {
      setError("AI analysis failed. Try again.");
    }
    setAnalyzing(false);
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
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#e2e8f0", letterSpacing: "-0.03em", marginBottom: "4px" }}>
          Stock Analytics
        </h2>
        <p style={{ color: "#4b5563", fontSize: "13px" }}>
          Quantitative metrics + AI-powered investment analysis
        </p>
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "2rem", maxWidth: "560px" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            value={ticker}
            onChange={e => setTicker(e.target.value.toUpperCase())}
            placeholder="MSFT, TCS.NS, RELIANCE.NS..."
            onKeyDown={e => e.key === "Enter" && fetchData()}
            style={{
              background: "#0d1117",
              border: "1px solid #1f2937",
              color: "#e2e8f0",
              borderRadius: "8px",
              padding: "12px 14px",
              fontSize: "14px",
              width: "100%",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            padding: "12px 20px",
            background: "#1f2937",
            color: "#e2e8f0",
            fontWeight: "600",
            fontSize: "13px",
            borderRadius: "8px",
            border: "1px solid #374151",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Loading..." : "Fetch"}
        </button>
        {data && (
          <button
            onClick={fetchAnalysis}
            disabled={analyzing}
            style={{
              padding: "12px 20px",
              background: analyzing ? "#1f2937" : "rgba(129,140,248,0.15)",
              color: analyzing ? "#4b5563" : "#818cf8",
              fontWeight: "600",
              fontSize: "13px",
              borderRadius: "8px",
              border: "1px solid rgba(129,140,248,0.3)",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            {analyzing ? "Analyzing..." : "◈ AI Analyze"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 14px", borderRadius: "8px", marginBottom: "1.5rem",
          background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)"
        }}>
          <p style={{ fontSize: "13px", color: "#f87171" }}>{error}</p>
        </div>
      )}

      {data && (
        <div>
          {/* Ticker header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.04em", color: "#e2e8f0" }}>
              {data.ticker}
            </h3>
            <span style={{ fontSize: "24px", fontWeight: "700", color: "#e2e8f0" }}>
              ${data.current_price}
            </span>
            {priceChange && (
              <Badge color={parseFloat(priceChange) >= 0 ? "green" : "red"}>
                {parseFloat(priceChange) >= 0 ? "▲" : "▼"} {Math.abs(priceChange)}%
              </Badge>
            )}
            <Badge color={data.signal === "Bullish" ? "green" : "red"}>
              {data.signal}
            </Badge>
          </div>

          {/* Metrics grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            marginBottom: "1.5rem"
          }}>
            <Metric label="30d High" value={`$${data.high_30}`} color="#34d399" />
            <Metric label="30d Low" value={`$${data.low_30}`} color="#f87171" />
            <Metric
              label="Sharpe Ratio"
              value={data.sharpe_ratio}
              sub={data.sharpe_ratio > 1 ? "Above benchmark" : "Below benchmark"}
              color={data.sharpe_ratio > 1 ? "#34d399" : "#fbbf24"}
            />
            <Metric
              label="Volatility"
              value={`${(data.volatility * 100).toFixed(2)}%`}
              sub="Daily std dev"
            />
            <Metric
              label="Max Drawdown"
              value={`${(data.max_drawdown * 100).toFixed(2)}%`}
              color="#f87171"
              sub="Peak to trough"
            />
          </div>

          {/* Chart */}
          <div style={{
            background: "#0d1117",
            border: "1px solid #1f2937",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "0.5rem"
          }}>
            <p style={{ fontSize: "11px", color: "#4b5563", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Price History
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#374151", fontFamily: "inherit" }} axisLine={false} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#374151", fontFamily: "inherit" }} axisLine={false} tickLine={false} width={55} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="price" stroke="#818cf8" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Analysis */}
          {analysis && <RecommendationCard rec={analysis} />}
        </div>
      )}
    </div>
  );
}
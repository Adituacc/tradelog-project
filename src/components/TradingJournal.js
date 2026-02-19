"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// ─────────────────────────────────────────────
// SEED DATA & CONSTANTS
// ─────────────────────────────────────────────
const STRATEGIES = ["Breakout", "Reversal", "Momentum", "Scalp", "Swing", "Mean Reversion"];
const EMOTIONS = ["Confident", "Fearful", "Greedy", "Calm", "Anxious", "Disciplined", "FOMO", "Revenge"];

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_TRADES = [
  { id: generateId(), date: "2025-12-02", symbol: "AAPL", direction: "Long", entryPrice: 189.5, exitPrice: 194.2, positionSize: 100, stopLoss: 187.0, takeProfit: 196.0, strategy: "Breakout", emotion: "Confident", notes: "Clean breakout above resistance with volume confirmation.", status: "Closed", tags: ["Tech", "Breakout"] },
  { id: generateId(), date: "2025-12-05", symbol: "TSLA", direction: "Short", entryPrice: 252.8, exitPrice: 245.1, positionSize: 50, stopLoss: 258.0, takeProfit: 240.0, strategy: "Reversal", emotion: "Calm", notes: "Double top formation on 4H chart.", status: "Closed", tags: ["Tech", "Reversal"] },
  { id: generateId(), date: "2025-12-08", symbol: "SPY", direction: "Long", entryPrice: 458.2, exitPrice: 455.9, positionSize: 200, stopLoss: 456.0, takeProfit: 462.0, strategy: "Momentum", emotion: "FOMO", notes: "Entered late, chased the move.", status: "Closed", tags: ["ETF", "Momentum"] },
  { id: generateId(), date: "2025-12-11", symbol: "NVDA", direction: "Long", entryPrice: 485.0, exitPrice: 502.3, positionSize: 40, stopLoss: 478.0, takeProfit: 510.0, strategy: "Breakout", emotion: "Disciplined", notes: "Perfect setup. Held through minor pullback.", status: "Closed", tags: ["Tech", "Breakout"] },
  { id: generateId(), date: "2025-12-14", symbol: "AMZN", direction: "Short", entryPrice: 153.6, exitPrice: 157.2, positionSize: 80, stopLoss: 156.0, takeProfit: 148.0, strategy: "Reversal", emotion: "Fearful", notes: "Stopped out. Should have waited for confirmation.", status: "Closed", tags: ["Tech", "Reversal"] },
  { id: generateId(), date: "2025-12-17", symbol: "META", direction: "Long", entryPrice: 345.0, exitPrice: 358.4, positionSize: 60, stopLoss: 340.0, takeProfit: 360.0, strategy: "Momentum", emotion: "Confident", notes: "Strong earnings momentum continuation.", status: "Closed", tags: ["Tech", "Momentum"] },
  { id: generateId(), date: "2025-12-20", symbol: "MSFT", direction: "Long", entryPrice: 378.5, exitPrice: 374.1, positionSize: 70, stopLoss: 375.0, takeProfit: 385.0, strategy: "Scalp", emotion: "Anxious", notes: "Tight stop got hit in choppy market.", status: "Closed", tags: ["Tech", "Scalp"] },
  { id: generateId(), date: "2025-12-23", symbol: "BTC-USD", direction: "Long", entryPrice: 43250, exitPrice: 44800, positionSize: 2, stopLoss: 42500, takeProfit: 45500, strategy: "Swing", emotion: "Calm", notes: "Weekly support bounce. Clean setup.", status: "Closed", tags: ["Crypto", "Swing"] },
  { id: generateId(), date: "2026-01-03", symbol: "AMD", direction: "Long", entryPrice: 142.3, exitPrice: 149.7, positionSize: 90, stopLoss: 139.0, takeProfit: 152.0, strategy: "Breakout", emotion: "Disciplined", notes: "Sector rotation into semis.", status: "Closed", tags: ["Tech", "Breakout"] },
  { id: generateId(), date: "2026-01-07", symbol: "GOOG", direction: "Short", entryPrice: 141.8, exitPrice: 138.5, positionSize: 100, stopLoss: 144.0, takeProfit: 136.0, strategy: "Mean Reversion", emotion: "Confident", notes: "Overbought RSI on daily.", status: "Closed", tags: ["Tech", "Mean Reversion"] },
  { id: generateId(), date: "2026-01-10", symbol: "JPM", direction: "Long", entryPrice: 198.4, exitPrice: 203.1, positionSize: 60, stopLoss: 195.0, takeProfit: 206.0, strategy: "Momentum", emotion: "Calm", notes: "Financials breaking out ahead of earnings.", status: "Closed", tags: ["Finance", "Momentum"] },
  { id: generateId(), date: "2026-01-15", symbol: "NFLX", direction: "Long", entryPrice: 492.0, exitPrice: 478.5, positionSize: 30, stopLoss: 485.0, takeProfit: 510.0, strategy: "Breakout", emotion: "Greedy", notes: "Oversized position. Should have respected stop.", status: "Closed", tags: ["Tech", "Breakout"] },
  { id: generateId(), date: "2026-01-20", symbol: "XOM", direction: "Short", entryPrice: 104.2, exitPrice: 101.8, positionSize: 120, stopLoss: 106.5, takeProfit: 100.0, strategy: "Reversal", emotion: "Disciplined", notes: "Clean head and shoulders on 1H.", status: "Closed", tags: ["Energy", "Reversal"] },
  { id: generateId(), date: "2026-01-25", symbol: "COIN", direction: "Long", entryPrice: 178.5, exitPrice: null, positionSize: 50, stopLoss: 170.0, takeProfit: 195.0, strategy: "Momentum", emotion: "Confident", notes: "Crypto momentum play. Holding swing.", status: "Open", tags: ["Crypto", "Momentum"] },
  { id: generateId(), date: "2026-02-01", symbol: "DIS", direction: "Long", entryPrice: 112.3, exitPrice: null, positionSize: 80, stopLoss: 108.0, takeProfit: 120.0, strategy: "Swing", emotion: "Calm", notes: "Accumulation zone on weekly chart.", status: "Open", tags: ["Entertainment", "Swing"] },
];

const MOODS = ["🔥 On Fire", "😊 Good", "😐 Neutral", "😤 Frustrated", "😰 Anxious", "🧘 Zen"];
const MOOD_COLORS = { "🔥 On Fire": "#ff9500", "😊 Good": "#00e89d", "😐 Neutral": "#8b8fa3", "😤 Frustrated": "#ff4976", "😰 Anxious": "#ffa726", "🧘 Zen": "#00b4d8" };

const INITIAL_JOURNAL_ENTRIES = [
  { id: generateId(), date: "2026-02-13", mood: "😊 Good", title: "Solid day — stayed disciplined", body: "Followed my rules today. Took two setups that met all my criteria. Didn't chase anything. The AAPL breakout was textbook — waited for the pullback to the 9 EMA and entered on the bounce. Closed at target. Need to keep this energy going.\n\nKey takeaway: patience pays. The setups come to you if you wait.", rating: 4, tags: ["Discipline", "Process"] },
  { id: generateId(), date: "2026-02-12", mood: "😤 Frustrated", title: "Overtraded in the morning chop", body: "Terrible morning. Took 4 trades in the first hour when I should have waited for the market to pick a direction. Lost on 3 of them. The afternoon was better — I stepped away, took a walk, and came back with a clear head. Got one good short on TSLA that recovered some of the losses.\n\nLesson: Morning chop is NOT my edge. Wait until 10:30 AM minimum.", rating: 2, tags: ["Overtrading", "Lesson"] },
  { id: generateId(), date: "2026-02-11", mood: "🧘 Zen", title: "No trades — market was unclear", body: "Sat on my hands all day. Nothing met my criteria. SPY was ranging in a 2-point zone with no clear direction. Some might call this a wasted day but honestly it felt like a win. Not losing money IS making money.\n\nRead two chapters of Trading in the Zone. The section about probabilistic thinking really clicked today.", rating: 5, tags: ["Patience", "Education"] },
  { id: generateId(), date: "2026-02-10", mood: "🔥 On Fire", title: "Best day this month — NVDA momentum play", body: "Caught the NVDA move right at the open. Semis were gapping up on the AI chip news and I had it on my watchlist from last night. Entered at 502 with a tight stop at 498. Rode it to 518 and scaled out in thirds.\n\nThis is what preparation looks like. Pre-market analysis → identify the catalyst → execute the plan → manage the trade. No emotions, just process.", rating: 5, tags: ["Big Win", "Preparation", "Process"] },
  { id: generateId(), date: "2026-02-07", mood: "😰 Anxious", title: "Held a loser too long", body: "Knew the AMZN short was wrong within 10 minutes but I moved my stop. Classic mistake. Turned a -$200 loss into a -$580 loss. The original stop was right — it bounced exactly where I expected resistance to fail.\n\nI need to tattoo this on my forehead: RESPECT THE STOP. No exceptions. Ever.", rating: 1, tags: ["Stop Loss", "Lesson", "Psychology"] },
];


const calcPnL = (trade) => {
  if (!trade.exitPrice) return null;
  const mult = trade.direction === "Long" ? 1 : -1;
  return ((trade.exitPrice - trade.entryPrice) * mult * trade.positionSize);
};

const calcRR = (trade) => {
  if (!trade.stopLoss || !trade.takeProfit) return null;
  const risk = Math.abs(trade.entryPrice - trade.stopLoss);
  const reward = Math.abs(trade.takeProfit - trade.entryPrice);
  return risk > 0 ? (reward / risk) : null;
};

const fmt = (n, decimals = 2) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
};

const fmtCurrency = (n) => {
  if (n == null) return "—";
  const prefix = n >= 0 ? "+$" : "-$";
  return prefix + fmt(Math.abs(n));
};

// ─────────────────────────────────────────────
// ICONS (inline SVG components)
// ─────────────────────────────────────────────
const Icons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Journal: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  Analytics: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  TrendUp: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Menu: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  ChevDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Pen: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  StarEmpty: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Target: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Import: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  File: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
};

// ─────────────────────────────────────────────
// CUSTOM TOOLTIP FOR CHARTS
// ─────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = "$" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(15, 16, 22, 0.95)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8,
      padding: "10px 14px",
      backdropFilter: "blur(12px)",
    }}>
      <p style={{ color: "#8b8fa3", fontSize: 11, margin: 0, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#00e89d", fontSize: 13, fontWeight: 600, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
          {p.name}: {prefix}{fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────────
const StatCard = ({ label, value, subtext, trend, color, icon }) => (
  <div className="stat-card" style={{
    background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: "22px 24px",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  }}>
    <div style={{ position: "absolute", top: 16, right: 18, opacity: 0.15, color: color || "#00e89d" }}>
      {icon}
    </div>
    <p style={{ color: "#6b7084", fontSize: 12, fontWeight: 500, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
    <p style={{ color: color || "#fff", fontSize: 28, fontWeight: 700, margin: "8px 0 4px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>{value}</p>
    {subtext && (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {trend === "up" ? <Icons.TrendUp /> : trend === "down" ? <Icons.TrendDown /> : null}
        <p style={{ color: trend === "up" ? "#00e89d" : trend === "down" ? "#ff4976" : "#6b7084", fontSize: 12, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{subtext}</p>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────
// MODAL COMPONENT
// ─────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children, width = 640 }) => {
  if (!isOpen) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(180deg, #191b27 0%, #13141e 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20, width: "100%", maxWidth: width, maxHeight: "90vh",
        overflow: "auto", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky", top: 0, background: "#191b27", zIndex: 2,
        }}>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 600, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8,
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#8b8fa3", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.color = "#fff"; }}
            onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.color = "#8b8fa3"; }}
          >
            <Icons.Close />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// FORM INPUT COMPONENT
// ─────────────────────────────────────────────
const FormField = ({ label, children, span = 1 }) => (
  <div style={{ gridColumn: `span ${span}` }}>
    <label style={{ display: "block", color: "#8b8fa3", fontSize: 12, fontWeight: 500, marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{label}</label>
    {children}
  </div>
);

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10, padding: "10px 14px", color: "#e8e9f0", fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s",
};

const selectStyle = {
  ...inputStyle, appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238b8fa3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
};

// ─────────────────────────────────────────────
// TRADE ENTRY FORM MODAL
// ─────────────────────────────────────────────
const TradeEntryModal = ({ isOpen, onClose, onSave, editTrade = null }) => {
  const empty = {
    date: new Date().toISOString().split("T")[0], symbol: "", direction: "Long",
    entryPrice: "", exitPrice: "", positionSize: "", stopLoss: "", takeProfit: "",
    strategy: "Breakout", emotion: "Calm", notes: "", status: "Open", tags: [],
  };
  const [form, setForm] = useState(empty);
  const [tagInput, setTagInput] = useState("");
  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    if (editTrade) {
      setForm({ ...editTrade, entryPrice: String(editTrade.entryPrice), exitPrice: editTrade.exitPrice ? String(editTrade.exitPrice) : "", positionSize: String(editTrade.positionSize), stopLoss: editTrade.stopLoss ? String(editTrade.stopLoss) : "", takeProfit: editTrade.takeProfit ? String(editTrade.takeProfit) : "" });
    } else {
      setForm(empty);
    }
    setScreenshot(null);
  }, [editTrade, isOpen]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.symbol || !form.entryPrice || !form.positionSize) return;
    onSave({
      ...form,
      id: editTrade?.id || generateId(),
      entryPrice: parseFloat(form.entryPrice),
      exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : null,
      positionSize: parseFloat(form.positionSize),
      stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : null,
      takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : null,
      status: form.exitPrice ? "Closed" : "Open",
    });
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      set("tags", [...form.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTrade ? "Edit Trade" : "Log New Trade"} width={700}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FormField label="Date">
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
        </FormField>
        <FormField label="Symbol / Asset">
          <input placeholder="e.g. AAPL, BTC-USD" value={form.symbol} onChange={e => set("symbol", e.target.value.toUpperCase())} style={inputStyle} />
        </FormField>
        <FormField label="Direction">
          <div style={{ display: "flex", gap: 8 }}>
            {["Long", "Short"].map(d => (
              <button key={d} onClick={() => set("direction", d)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid",
                borderColor: form.direction === d ? (d === "Long" ? "#00e89d" : "#ff4976") : "rgba(255,255,255,0.08)",
                background: form.direction === d ? (d === "Long" ? "rgba(0,232,157,0.1)" : "rgba(255,73,118,0.1)") : "rgba(255,255,255,0.03)",
                color: form.direction === d ? (d === "Long" ? "#00e89d" : "#ff4976") : "#8b8fa3",
                fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}>{d}</button>
            ))}
          </div>
        </FormField>
        <FormField label="Position Size">
          <input type="number" placeholder="Quantity" value={form.positionSize} onChange={e => set("positionSize", e.target.value)} style={inputStyle} />
        </FormField>
        <FormField label="Entry Price">
          <input type="number" step="0.01" placeholder="0.00" value={form.entryPrice} onChange={e => set("entryPrice", e.target.value)} style={inputStyle} />
        </FormField>
        <FormField label="Exit Price">
          <input type="number" step="0.01" placeholder="Leave blank if open" value={form.exitPrice} onChange={e => set("exitPrice", e.target.value)} style={inputStyle} />
        </FormField>
        <FormField label="Stop Loss">
          <input type="number" step="0.01" placeholder="0.00" value={form.stopLoss} onChange={e => set("stopLoss", e.target.value)} style={inputStyle} />
        </FormField>
        <FormField label="Take Profit">
          <input type="number" step="0.01" placeholder="0.00" value={form.takeProfit} onChange={e => set("takeProfit", e.target.value)} style={inputStyle} />
        </FormField>
        <FormField label="Strategy">
          <select value={form.strategy} onChange={e => set("strategy", e.target.value)} style={selectStyle}>
            {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Emotion / Mindset">
          <select value={form.emotion} onChange={e => set("emotion", e.target.value)} style={selectStyle}>
            {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </FormField>
        <FormField label="Tags" span={2}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: form.tags.length ? 8 : 0 }}>
            {form.tags.map(t => (
              <span key={t} style={{
                background: "rgba(0, 232, 157, 0.1)", border: "1px solid rgba(0,232,157,0.2)",
                borderRadius: 6, padding: "3px 10px", fontSize: 12, color: "#00e89d",
                display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif",
              }}>
                {t}
                <span onClick={() => set("tags", form.tags.filter(x => x !== t))} style={{ cursor: "pointer", opacity: 0.7 }}>×</span>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={addTag} style={{
              background: "rgba(0,232,157,0.1)", border: "1px solid rgba(0,232,157,0.2)",
              borderRadius: 10, padding: "0 16px", color: "#00e89d", cursor: "pointer",
              fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}>Add</button>
          </div>
        </FormField>
        <FormField label="Strategy Notes & Analysis" span={2}>
          <textarea
            rows={4} placeholder="Describe your trade setup, rationale, and execution..."
            value={form.notes} onChange={e => set("notes", e.target.value)}
            style={{ ...inputStyle, resize: "vertical", minHeight: 80, lineHeight: 1.5 }}
          />
        </FormField>
        <FormField label="Chart Screenshot" span={2}>
          <div
            onClick={() => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setScreenshot(ev.target.result); r.readAsDataURL(f); } }; inp.click(); }}
            style={{
              border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 12,
              padding: screenshot ? 8 : "28px 20px", textAlign: "center", cursor: "pointer",
              transition: "all 0.2s", background: screenshot ? "rgba(255,255,255,0.02)" : "transparent",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,232,157,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
          >
            {screenshot ? (
              <img src={screenshot} alt="Chart" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} />
            ) : (
              <>
                <div style={{ color: "#6b7084", marginBottom: 6 }}><Icons.Upload /></div>
                <p style={{ color: "#6b7084", fontSize: 13, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Click to upload chart screenshot</p>
              </>
            )}
          </div>
        </FormField>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "10px 24px", color: "#8b8fa3", fontSize: 14,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
        }}>Cancel</button>
        <button onClick={handleSubmit} style={{
          background: "linear-gradient(135deg, #00e89d 0%, #00c9a7 100%)",
          border: "none", borderRadius: 10, padding: "10px 28px", color: "#0a0b10",
          fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 4px 20px rgba(0,232,157,0.25)",
        }}>
          {editTrade ? "Update Trade" : "Log Trade"}
        </button>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// CSV IMPORT PARSERS
// ─────────────────────────────────────────────
const parseCSVText = (text) => {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map(line => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; }
      else if (line[i] === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += line[i]; }
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });
    return obj;
  }).filter(row => Object.values(row).some(v => v !== ""));
  return { headers, rows };
};

const parseHyperliquidCSV = (rows) => {
  // Hyperliquid CSV: Time, Coin, Direction, Px, Sz, Notional USD, Closed PNL, Hash, ...
  // Also may have: time, coin, side, px, sz, ntl, closedPnl, ...
  const trades = [];
  const groupedFills = {};

  rows.forEach(row => {
    const time = row["Time"] || row["time"] || row["Timestamp"] || row["timestamp"] || "";
    const coin = row["Coin"] || row["coin"] || row["Asset"] || row["asset"] || row["Symbol"] || row["symbol"] || "";
    const side = (row["Direction"] || row["direction"] || row["Side"] || row["side"] || "").toLowerCase();
    const px = parseFloat(row["Px"] || row["px"] || row["Price"] || row["price"] || 0);
    const sz = parseFloat(row["Sz"] || row["sz"] || row["Size"] || row["size"] || row["Qty"] || row["qty"] || 0);
    const closedPnl = parseFloat(row["Closed PNL"] || row["closedPnl"] || row["Closed Pnl"] || row["closed_pnl"] || row["PnL"] || row["pnl"] || 0);
    const fee = parseFloat(row["Fee"] || row["fee"] || 0);
    const ntl = parseFloat(row["Notional USD"] || row["ntl"] || row["Notional"] || row["notional"] || 0);

    if (!coin || !px || !sz) return;

    let date;
    try { date = time ? new Date(time).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]; }
    catch { date = new Date().toISOString().split("T")[0]; }
    const direction = side.includes("buy") || side.includes("long") || side === "b" ? "Long" : "Short";

    // If closedPnl is present and non-zero, treat as a completed trade
    if (closedPnl !== 0) {
      trades.push({
        id: generateId(), date, symbol: coin.toUpperCase(),
        direction: closedPnl > 0 ? (direction === "Long" ? "Long" : "Short") : direction,
        entryPrice: direction === "Long" ? px - (closedPnl / sz) : px + (closedPnl / sz),
        exitPrice: px, positionSize: Math.abs(sz),
        stopLoss: null, takeProfit: null,
        strategy: "Imported", emotion: "Calm",
        notes: `Imported from Hyperliquid. Fee: $${fee || 0}. Notional: $${ntl || (px * sz).toFixed(2)}`,
        status: "Closed", tags: ["Hyperliquid", "Import"],
      });
    } else {
      // Group fills by coin to reconstruct positions
      const key = `${coin}-${direction}`;
      if (!groupedFills[key]) groupedFills[key] = { coin, direction, fills: [], totalSize: 0, weightedPrice: 0 };
      groupedFills[key].fills.push({ date, px, sz });
      groupedFills[key].totalSize += sz;
      groupedFills[key].weightedPrice += px * sz;
    }
  });

  // Convert remaining grouped fills to open trades
  Object.values(groupedFills).forEach(g => {
    if (g.totalSize > 0) {
      const avgPrice = g.weightedPrice / g.totalSize;
      trades.push({
        id: generateId(), date: g.fills[g.fills.length - 1].date,
        symbol: g.coin.toUpperCase(), direction: g.direction,
        entryPrice: Math.round(avgPrice * 100) / 100,
        exitPrice: null, positionSize: Math.round(g.totalSize * 1000) / 1000,
        stopLoss: null, takeProfit: null,
        strategy: "Imported", emotion: "Calm",
        notes: `Imported from Hyperliquid. ${g.fills.length} fills aggregated.`,
        status: "Open", tags: ["Hyperliquid", "Import"],
      });
    }
  });

  return trades;
};

const parseLighterCSV = (rows) => {
  const trades = [];

  rows.forEach(row => {
    const time = row["timestamp"] || row["Timestamp"] || row["Time"] || row["time"] || row["date"] || row["Date"] || "";
    const market = row["market"] || row["Market"] || row["pair"] || row["Pair"] || row["Symbol"] || row["symbol"] || row["Asset"] || row["asset"] || "";
    const side = (row["side"] || row["Side"] || row["Direction"] || row["direction"] || row["Type"] || "").toLowerCase();
    const price = parseFloat(row["price"] || row["Price"] || row["Px"] || row["px"] || row["fill_price"] || row["Fill Price"] || 0);
    const size = parseFloat(row["size"] || row["Size"] || row["Sz"] || row["sz"] || row["quantity"] || row["Quantity"] || row["amount"] || row["Amount"] || 0);
    const fee = parseFloat(row["fee"] || row["Fee"] || row["fees"] || row["Fees"] || 0);
    const pnl = parseFloat(row["pnl"] || row["PnL"] || row["Pnl"] || row["realized_pnl"] || row["Realized PnL"] || row["Closed PNL"] || 0);
    const statusRaw = (row["status"] || row["Status"] || "").toLowerCase();

    if (!market || !price || !size) return;

    const symbol = market.replace(/[-_\/]/g, "-").toUpperCase();
    let date;
    try { date = time ? new Date(time).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]; }
    catch { date = new Date().toISOString().split("T")[0]; }
    const direction = side.includes("buy") || side.includes("long") || side === "b" ? "Long" : "Short";

    // A trade is closed ONLY if it has actual realized PnL
    const hasPnl = pnl !== 0 && !isNaN(pnl);
    const isClosed = hasPnl || statusRaw.includes("closed");

    if (isClosed && hasPnl) {
      // Back-calculate entry from exit price and pnl
      const entryPrice = direction === "Long" ? price - (pnl / size) : price + (pnl / size);
      trades.push({
        id: generateId(), date, symbol, direction,
        entryPrice: Math.round(entryPrice * 1e6) / 1e6,
        exitPrice: price, positionSize: Math.abs(size),
        stopLoss: null, takeProfit: null,
        strategy: "Imported", emotion: "Calm",
        notes: `Imported from Lighter. Fee: $${fee || 0}. Realized P&L: $${pnl}`,
        status: "Closed", tags: ["Lighter", "Import"],
      });
    } else {
      // Open position or fill without realized PnL
      trades.push({
        id: generateId(), date, symbol, direction,
        entryPrice: price, exitPrice: null,
        positionSize: Math.abs(size),
        stopLoss: null, takeProfit: null,
        strategy: "Imported", emotion: "Calm",
        notes: `Imported from Lighter. Fee: $${fee || 0}`,
        status: "Open", tags: ["Lighter", "Import"],
      });
    }
  });

  return trades;
};

const parseGenericCSV = (rows, mapping) => {
  return rows.map(row => {
    const symbol = row[mapping.symbol] || "";
    const price = parseFloat(row[mapping.price] || 0);
    const size = parseFloat(row[mapping.size] || 0);
    if (!symbol || !price) return null;

    const sideRaw = (row[mapping.side] || "long").toLowerCase();
    const direction = sideRaw.includes("buy") || sideRaw.includes("long") || sideRaw === "b" ? "Long" : "Short";
    const exitPrice = mapping.exitPrice ? parseFloat(row[mapping.exitPrice] || 0) || null : null;
    const time = row[mapping.date] || "";
    const date = time ? (() => { try { return new Date(time).toISOString().split("T")[0]; } catch { return new Date().toISOString().split("T")[0]; } })() : new Date().toISOString().split("T")[0];

    return {
      id: generateId(), date, symbol: symbol.toUpperCase(), direction,
      entryPrice: price, exitPrice, positionSize: Math.abs(size) || 1,
      stopLoss: null, takeProfit: null,
      strategy: "Imported", emotion: "Calm",
      notes: "Imported from CSV", status: exitPrice ? "Closed" : "Open",
      tags: ["CSV Import"],
    };
  }).filter(Boolean);
};

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function TradingJournal() {
  const [trades, setTrades] = useState(INITIAL_TRADES);
  const [page, setPage] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTrade, setEditTrade] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [journalFilter, setJournalFilter] = useState("All");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [settingsTab, setSettingsTab] = useState("general");
  const [journalEntries, setJournalEntries] = useState(INITIAL_JOURNAL_ENTRIES);
  const [dailyView, setDailyView] = useState("list"); // "list" or "write"
  const [editingEntry, setEditingEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({ date: new Date().toISOString().split("T")[0], mood: "😊 Good", title: "", body: "", rating: 3, tags: [] });
  const [dailyTagInput, setDailyTagInput] = useState("");
  const [importSource, setImportSource] = useState("hyperliquid");
  const [importPreview, setImportPreview] = useState(null);
  const [importStatus, setImportStatus] = useState(null); // { type: "success"|"error", message }
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvMapping, setCsvMapping] = useState({ symbol: "", price: "", size: "", side: "", date: "", exitPrice: "" });
  const [importNotification, setImportNotification] = useState(null);

  // ── Computed metrics ──
  const closedTrades = useMemo(() => trades.filter(t => t.status === "Closed"), [trades]);
  const openTrades = useMemo(() => trades.filter(t => t.status === "Open"), [trades]);

  const metrics = useMemo(() => {
    const pnls = closedTrades.map(t => calcPnL(t));
    const totalPnL = pnls.reduce((s, v) => s + v, 0);
    const wins = pnls.filter(v => v > 0);
    const losses = pnls.filter(v => v < 0);
    const winRate = pnls.length > 0 ? (wins.length / pnls.length) * 100 : 0;
    const grossProfit = wins.reduce((s, v) => s + v, 0);
    const grossLoss = Math.abs(losses.reduce((s, v) => s + v, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const maxWin = wins.length > 0 ? Math.max(...wins) : 0;
    const maxLoss = losses.length > 0 ? Math.min(...losses) : 0;
    const avgRR = closedTrades.reduce((s, t) => s + (calcRR(t) || 0), 0) / (closedTrades.length || 1);
    return { totalPnL, winRate, profitFactor, avgWin, avgLoss, maxWin, maxLoss, avgRR, totalTrades: closedTrades.length, wins: wins.length, losses: losses.length, grossProfit, grossLoss };
  }, [closedTrades]);

  // ── Streaks ──
  const streaks = useMemo(() => {
    const sorted = [...closedTrades].sort((a, b) => a.date.localeCompare(b.date));
    let currentStreak = 0, currentType = null, bestWin = 0, worstLoss = 0, tempStreak = 0;
    sorted.forEach(t => {
      const isWin = calcPnL(t) > 0;
      if (currentType === null || currentType === isWin) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      currentType = isWin;
      currentStreak = tempStreak;
      if (isWin) bestWin = Math.max(bestWin, tempStreak);
      else worstLoss = Math.max(worstLoss, tempStreak);
    });
    return { current: currentStreak, currentIsWin: currentType, bestWin, worstLoss };
  }, [closedTrades]);

  // ── Drawdown curve ──
  const drawdownData = useMemo(() => {
    let peak = 10000, equity = 10000;
    const sorted = [...closedTrades].sort((a, b) => a.date.localeCompare(b.date));
    let maxDD = 0;
    return sorted.map(t => {
      equity += calcPnL(t);
      peak = Math.max(peak, equity);
      const dd = peak > 0 ? ((equity - peak) / peak) * 100 : 0;
      maxDD = Math.min(maxDD, dd);
      return { date: t.date, drawdown: Math.round(dd * 100) / 100, equity: Math.round(equity * 100) / 100, maxDD: Math.round(maxDD * 100) / 100 };
    });
  }, [closedTrades]);

  const maxDrawdown = useMemo(() => drawdownData.length > 0 ? Math.min(...drawdownData.map(d => d.drawdown)) : 0, [drawdownData]);

  // ── Day of Week performance ──
  const dayOfWeekPerf = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const map = days.map(d => ({ day: d, trades: 0, wins: 0, pnl: 0 }));
    closedTrades.forEach(t => {
      const dow = new Date(t.date + "T12:00:00").getDay();
      map[dow].trades++;
      const pnl = calcPnL(t);
      map[dow].pnl += pnl;
      if (pnl > 0) map[dow].wins++;
    });
    return map.filter(d => d.trades > 0);
  }, [closedTrades]);

  // ── Calendar heatmap data ──
  const calendarData = useMemo(() => {
    const map = {};
    closedTrades.forEach(t => {
      if (!map[t.date]) map[t.date] = { date: t.date, pnl: 0, trades: 0 };
      map[t.date].pnl += calcPnL(t);
      map[t.date].trades++;
    });
    return map;
  }, [closedTrades]);

  // ── Expectancy (avg $ per trade) ──
  const expectancy = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    return metrics.totalPnL / closedTrades.length;
  }, [metrics, closedTrades]);

  // ── Risk calculator state ──
  const [riskCalc, setRiskCalc] = useState({ accountSize: 10000, riskPercent: 2, entryPrice: "", stopLoss: "", direction: "Long" });
  const riskCalcResult = useMemo(() => {
    const entry = parseFloat(riskCalc.entryPrice);
    const stop = parseFloat(riskCalc.stopLoss);
    if (!entry || !stop || entry === stop) return null;
    const riskAmount = (riskCalc.accountSize * riskCalc.riskPercent) / 100;
    const riskPerUnit = Math.abs(entry - stop);
    const positionSize = riskAmount / riskPerUnit;
    const notionalValue = positionSize * entry;
    return { riskAmount: Math.round(riskAmount * 100) / 100, riskPerUnit: Math.round(riskPerUnit * 1e6) / 1e6, positionSize: Math.round(positionSize * 1000) / 1000, notionalValue: Math.round(notionalValue * 100) / 100 };
  }, [riskCalc]);

  // ── Trade detail modal state ──
  const [detailTrade, setDetailTrade] = useState(null);

  // ── Equity curve ──
  const equityCurve = useMemo(() => {
    let equity = 10000;
    const sorted = [...closedTrades].sort((a, b) => a.date.localeCompare(b.date));
    return [{ date: "Start", equity: 10000, pnl: 0 }, ...sorted.map(t => {
      const pnl = calcPnL(t);
      equity += pnl;
      return { date: t.date, equity: Math.round(equity * 100) / 100, pnl, symbol: t.symbol };
    })];
  }, [closedTrades]);

  // ── Strategy breakdown for analytics ──
  const strategyBreakdown = useMemo(() => {
    const map = {};
    closedTrades.forEach(t => {
      if (!map[t.strategy]) map[t.strategy] = { strategy: t.strategy, trades: 0, wins: 0, pnl: 0 };
      const pnl = calcPnL(t);
      map[t.strategy].trades++;
      map[t.strategy].pnl += pnl;
      if (pnl > 0) map[t.strategy].wins++;
    });
    return Object.values(map).map(s => ({ ...s, winRate: s.trades > 0 ? (s.wins / s.trades * 100) : 0 }));
  }, [closedTrades]);

  // ── Emotion breakdown ──
  const emotionBreakdown = useMemo(() => {
    const map = {};
    closedTrades.forEach(t => {
      if (!map[t.emotion]) map[t.emotion] = { emotion: t.emotion, trades: 0, wins: 0, pnl: 0 };
      const pnl = calcPnL(t);
      map[t.emotion].trades++;
      map[t.emotion].pnl += pnl;
      if (pnl > 0) map[t.emotion].wins++;
    });
    return Object.values(map).map(s => ({ ...s, winRate: s.trades > 0 ? (s.wins / s.trades * 100) : 0 }));
  }, [closedTrades]);

  // ── Monthly P&L ──
  const monthlyPnL = useMemo(() => {
    const map = {};
    closedTrades.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!map[month]) map[month] = { month, pnl: 0, trades: 0 };
      map[month].pnl += calcPnL(t);
      map[month].trades++;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [closedTrades]);

  // ── Sorted/Filtered trades for journal ──
  const filteredTrades = useMemo(() => {
    let list = [...trades];
    if (journalFilter === "Open") list = list.filter(t => t.status === "Open");
    else if (journalFilter === "Closed") list = list.filter(t => t.status === "Closed");
    else if (journalFilter === "Winners") list = list.filter(t => t.status === "Closed" && calcPnL(t) > 0);
    else if (journalFilter === "Losers") list = list.filter(t => t.status === "Closed" && calcPnL(t) < 0);
    list.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "pnl") { va = calcPnL(a) || 0; vb = calcPnL(b) || 0; }
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? (va || 0) - (vb || 0) : (vb || 0) - (va || 0);
    });
    return list;
  }, [trades, journalFilter, sortField, sortDir]);

  // ── Handlers ──
  const saveTrade = (trade) => {
    setTrades(prev => {
      const idx = prev.findIndex(t => t.id === trade.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = trade; return next; }
      return [...prev, trade];
    });
    setEditTrade(null);
  };

  const deleteTrade = (id) => setTrades(prev => prev.filter(t => t.id !== id));

  const openEdit = (trade) => { setEditTrade(trade); setModalOpen(true); };
  const openNew = () => { setEditTrade(null); setModalOpen(true); };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  // ── Direction / Status pill colors ──
  const PIE_COLORS = ["#00e89d", "#00b4d8", "#ff4976", "#ffa726", "#ab47bc", "#29b6f6"];

  // ── Nav items ──
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <Icons.Dashboard /> },
    { id: "journal", label: "Trade Log", icon: <Icons.Journal /> },
    { id: "daily", label: "Daily Journal", icon: <Icons.Pen /> },
    { id: "import", label: "Import", icon: <Icons.Import /> },
    { id: "analytics", label: "Analytics", icon: <Icons.Analytics /> },
    { id: "settings", label: "Settings", icon: <Icons.Settings /> },
  ];

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "#0a0b10", color: "#e8e9f0",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.6 } }
        * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.1) !important; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .trade-row:hover { background: rgba(255,255,255,0.03) !important; }
        .nav-item:hover { background: rgba(255,255,255,0.05) !important; }
        .nav-item.active { background: rgba(0, 232, 157, 0.08) !important; color: #00e89d !important; }
        input:focus, select:focus, textarea:focus { border-color: rgba(0,232,157,0.4) !important; }
        option { background: #191b27; color: #e8e9f0; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-header { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
          .sidebar-mobile-overlay { display: none !important; }
        }
      `}</style>

      {/* ── SIDEBAR (Desktop) ── */}
      <aside className="sidebar-desktop" style={{
        width: 240, minWidth: 240, background: "linear-gradient(180deg, #0f1017 0%, #0a0b10 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)", padding: "0", display: "flex",
        flexDirection: "column", height: "100vh", position: "sticky", top: 0,
      }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #00e89d 0%, #00c9a7 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,232,157,0.3)",
            }}>
              <Icons.Target />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>TradeLog</h1>
              <p style={{ margin: 0, fontSize: 11, color: "#6b7084" }}>Journal & Tracker</p>
            </div>
          </div>
        </div>
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
              borderRadius: 10, border: "none", background: "transparent",
              color: page === item.id ? "#00e89d" : "#8b8fa3", fontSize: 14, fontWeight: 500,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: 4,
              transition: "all 0.2s",
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={openNew} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "12px 0", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #00e89d 0%, #00c9a7 100%)",
            color: "#0a0b10", fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 20px rgba(0,232,157,0.25)",
            transition: "all 0.2s",
          }}>
            <Icons.Plus /> New Trade
          </button>
        </div>
      </aside>

      {/* ── SIDEBAR (Mobile Overlay) ── */}
      {sidebarOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)", display: "flex",
        }}>
          <aside onClick={e => e.stopPropagation()} style={{
            width: 260, background: "#0f1017", padding: "20px 12px",
            borderRight: "1px solid rgba(255,255,255,0.05)",
            animation: "slideUp 0.2s ease",
          }}>
            <div style={{ padding: "0 8px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #00e89d 0%, #00c9a7 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icons.Target />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>TradeLog</h1>
                <p style={{ margin: 0, fontSize: 11, color: "#6b7084" }}>Journal & Tracker</p>
              </div>
            </div>
            {navItems.map(item => (
              <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { setPage(item.id); setSidebarOpen(false); }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                borderRadius: 10, border: "none", background: "transparent",
                color: page === item.id ? "#00e89d" : "#8b8fa3", fontSize: 14, fontWeight: 500,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: 4,
              }}>
                {item.icon} {item.label}
              </button>
            ))}
            <button onClick={() => { openNew(); setSidebarOpen(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "12px 0", borderRadius: 12, border: "none", marginTop: 16,
              background: "linear-gradient(135deg, #00e89d 0%, #00c9a7 100%)",
              color: "#0a0b10", fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <Icons.Plus /> New Trade
            </button>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Mobile Header */}
        <header className="mobile-header" style={{
          display: "none", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(15,16,23,0.9)", backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#8b8fa3", cursor: "pointer", padding: 4 }}>
            <Icons.Menu />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #00e89d 0%, #00c9a7 100%)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
            }}>
              <Icons.Target />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>TradeLog</span>
          </div>
          <button onClick={openNew} style={{ background: "none", border: "none", color: "#00e89d", cursor: "pointer", padding: 4 }}>
            <Icons.Plus />
          </button>
        </header>

        <div style={{ padding: "28px 32px 40px", maxWidth: 1280, width: "100%", margin: "0 auto" }}>

          {/* Import success notification banner — visible across all pages */}
          {importNotification && (
            <div style={{
              padding: "12px 18px", borderRadius: 12, marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(135deg, rgba(0,232,157,0.1) 0%, rgba(0,201,167,0.06) 100%)",
              border: "1px solid rgba(0,232,157,0.2)",
              animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#00e89d" }}><Icons.Check /></span>
                <p style={{ color: "#00e89d", fontSize: 13, fontWeight: 600, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                  {importNotification.count} trades imported from {importNotification.source}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {page !== "dashboard" && (
                  <button onClick={() => { setPage("dashboard"); setImportNotification(null); }} style={{
                    background: "rgba(0,232,157,0.15)", border: "none", borderRadius: 6,
                    padding: "5px 12px", color: "#00e89d", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>View Dashboard →</button>
                )}
                {page !== "journal" && (
                  <button onClick={() => { setPage("journal"); setImportNotification(null); }} style={{
                    background: "rgba(0,232,157,0.15)", border: "none", borderRadius: 6,
                    padding: "5px 12px", color: "#00e89d", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>View Journal →</button>
                )}
                <button onClick={() => setImportNotification(null)} style={{
                  background: "none", border: "none", color: "rgba(0,232,157,0.5)",
                  cursor: "pointer", padding: "2px 6px", fontSize: 16,
                }}>×</button>
              </div>
            </div>
          )}

          {/* ═══════ DASHBOARD PAGE ═══════ */}
          {page === "dashboard" && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>Dashboard</h2>
                <p style={{ fontSize: 14, color: "#6b7084", margin: "4px 0 0" }}>Performance overview · {closedTrades.length} closed trades</p>
              </div>

              {/* Stat Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
                <StatCard label="Net P&L" value={fmtCurrency(metrics.totalPnL)} subtext={`${metrics.wins}W / ${metrics.losses}L`} trend={metrics.totalPnL >= 0 ? "up" : "down"} color={metrics.totalPnL >= 0 ? "#00e89d" : "#ff4976"} icon={<Icons.TrendUp />} />
                <StatCard label="Win Rate" value={`${fmt(metrics.winRate, 1)}%`} subtext={`${metrics.totalTrades} total trades`} trend={metrics.winRate >= 50 ? "up" : "down"} color={metrics.winRate >= 50 ? "#00e89d" : "#ffa726"} icon={<Icons.Target />} />
                <StatCard label="Profit Factor" value={metrics.profitFactor === Infinity ? "∞" : fmt(metrics.profitFactor)} subtext={metrics.profitFactor >= 1.5 ? "Strong edge" : "Needs work"} trend={metrics.profitFactor >= 1.5 ? "up" : "down"} color={metrics.profitFactor >= 1.5 ? "#00e89d" : "#ffa726"} icon={<Icons.Analytics />} />
                <StatCard label="Avg R:R" value={`${fmt(metrics.avgRR)}:1`} subtext={`Max win: ${fmtCurrency(metrics.maxWin)}`} trend="up" color="#00b4d8" icon={<Icons.Target />} />
                <StatCard label="Expectancy" value={fmtCurrency(expectancy)} subtext="Avg $ per trade" trend={expectancy >= 0 ? "up" : "down"} color={expectancy >= 0 ? "#00e89d" : "#ff4976"} icon={<Icons.Analytics />} />
                <StatCard label="Max Drawdown" value={`${fmt(maxDrawdown, 1)}%`} subtext={`From equity peak`} trend="down" color={maxDrawdown > -10 ? "#ffa726" : "#ff4976"} icon={<Icons.TrendDown />} />
              </div>

              {/* Streak Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: `1px solid ${streaks.currentIsWin ? "rgba(0,232,157,0.15)" : "rgba(255,73,118,0.15)"}`,
                  borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    background: streaks.currentIsWin ? "rgba(0,232,157,0.1)" : "rgba(255,73,118,0.1)",
                    fontSize: 20,
                  }}>{streaks.currentIsWin ? "🔥" : "❄️"}</div>
                  <div>
                    <p style={{ color: "#6b7084", fontSize: 11, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif" }}>Current Streak</p>
                    <p style={{ color: streaks.currentIsWin ? "#00e89d" : "#ff4976", fontSize: 22, fontWeight: 700, margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                      {streaks.current} {streaks.currentIsWin ? "Win" : "Loss"}{streaks.current !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(0,232,157,0.1)", borderRadius: 14, padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,232,157,0.1)", fontSize: 20 }}>🏆</div>
                  <div>
                    <p style={{ color: "#6b7084", fontSize: 11, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Win Streak</p>
                    <p style={{ color: "#00e89d", fontSize: 22, fontWeight: 700, margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>{streaks.bestWin}</p>
                  </div>
                </div>
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,73,118,0.1)", borderRadius: 14, padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,73,118,0.1)", fontSize: 20 }}>💀</div>
                  <div>
                    <p style={{ color: "#6b7084", fontSize: 11, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Worst Loss Streak</p>
                    <p style={{ color: "#ff4976", fontSize: 22, fontWeight: 700, margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>{streaks.worstLoss}</p>
                  </div>
                </div>
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,180,216,0.1)", fontSize: 20 }}>📊</div>
                  <div>
                    <p style={{ color: "#6b7084", fontSize: 11, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Win / Avg Loss</p>
                    <p style={{ color: "#00b4d8", fontSize: 16, fontWeight: 700, margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>
                      {metrics.avgLoss > 0 ? fmt(metrics.avgWin / metrics.avgLoss, 2) : "∞"}x
                    </p>
                  </div>
                </div>
              </div>

              {/* Equity Curve + Drawdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "24px 24px 16px",
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 20px", color: "#fff" }}>Equity Curve</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={equityCurve} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                      <defs>
                        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00e89d" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#00e89d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} />
                      <YAxis stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="equity" stroke="#00e89d" strokeWidth={2.5} fill="url(#eqGrad)" dot={false} activeDot={{ r: 5, fill: "#00e89d", stroke: "#0a0b10", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Drawdown Chart */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "24px 24px 16px",
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 20px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                    Drawdown
                    <span style={{ fontSize: 12, fontWeight: 400, color: "#ff4976", fontFamily: "'JetBrains Mono', monospace" }}>
                      Max: {fmt(maxDrawdown, 1)}%
                    </span>
                  </h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={drawdownData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                      <defs>
                        <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff4976" stopOpacity={0} />
                          <stop offset="100%" stopColor="#ff4976" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} />
                      <YAxis stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} tickFormatter={v => `${v}%`} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div style={{ background: "rgba(15,16,22,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px" }}>
                            <p style={{ color: "#8b8fa3", fontSize: 11, margin: 0, marginBottom: 4 }}>{label}</p>
                            <p style={{ color: "#ff4976", fontSize: 13, fontWeight: 600, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>DD: {payload[0].value}%</p>
                          </div>
                        );
                      }} />
                      <Area type="monotone" dataKey="drawdown" stroke="#ff4976" strokeWidth={2} fill="url(#ddGrad)" dot={false} activeDot={{ r: 4, fill: "#ff4976", stroke: "#0a0b10", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Calendar Heatmap */}
              <div style={{
                background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, marginBottom: 28,
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>P&L Calendar</h3>
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {(() => {
                    const today = new Date();
                    const cells = [];
                    for (let i = 89; i >= 0; i--) {
                      const d = new Date(today);
                      d.setDate(d.getDate() - i);
                      const dateStr = d.toISOString().split("T")[0];
                      const data = calendarData[dateStr];
                      const pnl = data ? data.pnl : 0;
                      const intensity = data ? Math.min(Math.abs(pnl) / 500, 1) : 0;
                      const bg = !data ? "rgba(255,255,255,0.02)" :
                        pnl > 0 ? `rgba(0, 232, 157, ${0.15 + intensity * 0.55})` :
                        pnl < 0 ? `rgba(255, 73, 118, ${0.15 + intensity * 0.55})` :
                        "rgba(255,255,255,0.04)";
                      cells.push(
                        <div key={dateStr} title={`${dateStr}${data ? `: ${fmtCurrency(pnl)} (${data.trades} trade${data.trades > 1 ? "s" : ""})` : ": No trades"}`}
                          style={{
                            width: 14, height: 14, borderRadius: 3, background: bg,
                            cursor: data ? "pointer" : "default", transition: "transform 0.1s",
                          }}
                          onMouseEnter={e => { if (data) e.target.style.transform = "scale(1.5)"; }}
                          onMouseLeave={e => e.target.style.transform = "scale(1)"}
                        />
                      );
                    }
                    return cells;
                  })()}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#6b7084" }}>Last 90 days</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,73,118,0.6)" }} />
                    <span style={{ fontSize: 10, color: "#6b7084" }}>Loss</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,255,255,0.04)" }} />
                    <span style={{ fontSize: 10, color: "#6b7084" }}>None</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(0,232,157,0.6)" }} />
                    <span style={{ fontSize: 10, color: "#6b7084" }}>Profit</span>
                  </div>
                </div>
              </div>

              {/* Day of Week + Risk Calculator row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                {/* Day of Week */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>P&L by Day of Week</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dayOfWeekPerf} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="day" stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 11 }} />
                      <YAxis stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} tickFormatter={v => `$${v}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="pnl" radius={[5, 5, 0, 0]}>
                        {dayOfWeekPerf.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? "#00e89d" : "#ff4976"} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Risk Calculator */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>Position Size Calculator</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <FormField label="Account Size ($)">
                      <input type="number" value={riskCalc.accountSize} onChange={e => setRiskCalc(p => ({ ...p, accountSize: parseFloat(e.target.value) || 0 }))} style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} />
                    </FormField>
                    <FormField label="Risk (%)">
                      <input type="number" step="0.5" value={riskCalc.riskPercent} onChange={e => setRiskCalc(p => ({ ...p, riskPercent: parseFloat(e.target.value) || 0 }))} style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} />
                    </FormField>
                    <FormField label="Entry Price">
                      <input type="number" step="0.01" placeholder="0.00" value={riskCalc.entryPrice} onChange={e => setRiskCalc(p => ({ ...p, entryPrice: e.target.value }))} style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} />
                    </FormField>
                    <FormField label="Stop Loss">
                      <input type="number" step="0.01" placeholder="0.00" value={riskCalc.stopLoss} onChange={e => setRiskCalc(p => ({ ...p, stopLoss: e.target.value }))} style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} />
                    </FormField>
                  </div>
                  {riskCalcResult && (
                    <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 10, background: "rgba(0,232,157,0.06)", border: "1px solid rgba(0,232,157,0.12)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <p style={{ color: "#6b7084", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Position Size</p>
                          <p style={{ color: "#00e89d", fontSize: 18, fontWeight: 700, margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(riskCalcResult.positionSize, 3)}</p>
                        </div>
                        <div>
                          <p style={{ color: "#6b7084", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk Amount</p>
                          <p style={{ color: "#ffa726", fontSize: 18, fontWeight: 700, margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>${fmt(riskCalcResult.riskAmount)}</p>
                        </div>
                        <div>
                          <p style={{ color: "#6b7084", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk Per Unit</p>
                          <p style={{ color: "#8b8fa3", fontSize: 14, fontWeight: 600, margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>${fmt(riskCalcResult.riskPerUnit)}</p>
                        </div>
                        <div>
                          <p style={{ color: "#6b7084", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Notional Value</p>
                          <p style={{ color: "#8b8fa3", fontSize: 14, fontWeight: 600, margin: "2px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>${fmt(riskCalcResult.notionalValue)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Trades & Win distribution row */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                {/* Recent Trades */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "20px 0", overflow: "hidden",
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px", padding: "0 24px", color: "#fff" }}>Recent Trades</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          {["Symbol", "Direction", "P&L", "R:R", "Strategy"].map(h => (
                            <th key={h} style={{ padding: "8px 16px", textAlign: "left", color: "#6b7084", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {closedTrades.slice(-5).reverse().map(t => {
                          const pnl = calcPnL(t);
                          const rr = calcRR(t);
                          return (
                            <tr key={t.id} className="trade-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.15s" }}>
                              <td style={{ padding: "10px 16px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "#fff" }}>{t.symbol}</td>
                              <td style={{ padding: "10px 16px" }}>
                                <span style={{
                                  padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                  background: t.direction === "Long" ? "rgba(0,232,157,0.1)" : "rgba(255,73,118,0.1)",
                                  color: t.direction === "Long" ? "#00e89d" : "#ff4976",
                                }}>{t.direction}</span>
                              </td>
                              <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: pnl >= 0 ? "#00e89d" : "#ff4976" }}>{fmtCurrency(pnl)}</td>
                              <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", color: "#8b8fa3" }}>{rr ? `${fmt(rr)}:1` : "—"}</td>
                              <td style={{ padding: "10px 16px", color: "#8b8fa3" }}>{t.strategy}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Win/Loss pie */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 20,
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px", color: "#fff", alignSelf: "flex-start" }}>Win / Loss</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={[{ name: "Wins", value: metrics.wins }, { name: "Losses", value: metrics.losses }]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                        <Cell fill="#00e89d" />
                        <Cell fill="#ff4976" />
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif" }} formatter={(v) => <span style={{ color: "#8b8fa3" }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ JOURNAL PAGE ═══════ */}
          {page === "journal" && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>Trade Journal</h2>
                  <p style={{ fontSize: 14, color: "#6b7084", margin: "4px 0 0" }}>{trades.length} total entries · {openTrades.length} open</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["All", "Open", "Closed", "Winners", "Losers"].map(f => (
                    <button key={f} onClick={() => setJournalFilter(f)} style={{
                      padding: "7px 16px", borderRadius: 8, border: "1px solid",
                      borderColor: journalFilter === f ? "rgba(0,232,157,0.3)" : "rgba(255,255,255,0.08)",
                      background: journalFilter === f ? "rgba(0,232,157,0.08)" : "rgba(255,255,255,0.03)",
                      color: journalFilter === f ? "#00e89d" : "#8b8fa3",
                      fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.2s",
                    }}>{f}</button>
                  ))}
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, overflow: "hidden",
              }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {[
                          { key: "date", label: "Date" }, { key: "symbol", label: "Symbol" },
                          { key: "direction", label: "Dir" }, { key: "entryPrice", label: "Entry" },
                          { key: "exitPrice", label: "Exit" }, { key: "positionSize", label: "Size" },
                          { key: "pnl", label: "P&L" }, { key: "status", label: "Status" },
                          { key: "strategy", label: "Strategy" }, { key: "actions", label: "" },
                        ].map(col => (
                          <th key={col.key} onClick={() => col.key !== "actions" && toggleSort(col.key)} style={{
                            padding: "12px 14px", textAlign: "left", color: sortField === col.key ? "#00e89d" : "#6b7084",
                            fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em",
                            cursor: col.key !== "actions" ? "pointer" : "default", whiteSpace: "nowrap",
                            userSelect: "none",
                          }}>
                            {col.label} {sortField === col.key && (sortDir === "asc" ? "↑" : "↓")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrades.map(t => {
                        const pnl = calcPnL(t);
                        return (
                          <tr key={t.id} className="trade-row" onClick={() => setDetailTrade(t)} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.15s", cursor: "pointer" }}>
                            <td style={{ padding: "12px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#8b8fa3", fontSize: 12 }}>{t.date}</td>
                            <td style={{ padding: "12px 14px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "#00b4d8", textDecoration: "underline", textDecorationColor: "rgba(0,180,216,0.3)", textUnderlineOffset: 3 }}>{t.symbol}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                background: t.direction === "Long" ? "rgba(0,232,157,0.1)" : "rgba(255,73,118,0.1)",
                                color: t.direction === "Long" ? "#00e89d" : "#ff4976",
                              }}>{t.direction}</span>
                            </td>
                            <td style={{ padding: "12px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#c8c9d4" }}>${fmt(t.entryPrice)}</td>
                            <td style={{ padding: "12px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#c8c9d4" }}>{t.exitPrice ? `$${fmt(t.exitPrice)}` : "—"}</td>
                            <td style={{ padding: "12px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#c8c9d4" }}>{t.positionSize}</td>
                            <td style={{ padding: "12px 14px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: pnl === null ? "#6b7084" : pnl >= 0 ? "#00e89d" : "#ff4976" }}>{pnl !== null ? fmtCurrency(pnl) : "—"}</td>
                            <td style={{ padding: "12px 14px" }}>
                              <span style={{
                                padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                background: t.status === "Open" ? "rgba(255,167,38,0.1)" : "rgba(255,255,255,0.05)",
                                color: t.status === "Open" ? "#ffa726" : "#8b8fa3",
                              }}>{t.status}{t.status === "Open" && <span style={{ animation: "pulse 2s infinite", marginLeft: 4 }}>●</span>}</span>
                            </td>
                            <td style={{ padding: "12px 14px", color: "#8b8fa3", fontSize: 12 }}>{t.strategy}</td>
                            <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                              <button onClick={(e) => { e.stopPropagation(); openEdit(t); }} title="Edit" style={{
                                background: "none", border: "none", color: "#6b7084", cursor: "pointer",
                                padding: 4, borderRadius: 4, transition: "color 0.15s",
                              }}
                                onMouseEnter={e => e.target.style.color = "#00e89d"}
                                onMouseLeave={e => e.target.style.color = "#6b7084"}
                              ><Icons.Edit /></button>
                              <button onClick={(e) => { e.stopPropagation(); deleteTrade(t.id); }} title="Delete" style={{
                                background: "none", border: "none", color: "#6b7084", cursor: "pointer",
                                padding: 4, borderRadius: 4, transition: "color 0.15s", marginLeft: 4,
                              }}
                                onMouseEnter={e => e.target.style.color = "#ff4976"}
                                onMouseLeave={e => e.target.style.color = "#6b7084"}
                              ><Icons.Trash /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredTrades.length === 0 && (
                  <div style={{ textAlign: "center", padding: "48px 20px", color: "#6b7084" }}>
                    <p style={{ fontSize: 14, margin: 0 }}>No trades found with the current filter.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════ DAILY JOURNAL PAGE ═══════ */}
          {page === "daily" && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>Daily Journal</h2>
                  <p style={{ fontSize: 14, color: "#6b7084", margin: "4px 0 0" }}>Reflect on your trading day · {journalEntries.length} entries</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setDailyView("list"); setEditingEntry(null); }} style={{
                    padding: "8px 18px", borderRadius: 8, border: "1px solid",
                    borderColor: dailyView === "list" ? "rgba(0,232,157,0.3)" : "rgba(255,255,255,0.08)",
                    background: dailyView === "list" ? "rgba(0,232,157,0.08)" : "rgba(255,255,255,0.03)",
                    color: dailyView === "list" ? "#00e89d" : "#8b8fa3",
                    fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>All Entries</button>
                  <button onClick={() => {
                    setDailyView("write");
                    setEditingEntry(null);
                    setNewEntry({ date: new Date().toISOString().split("T")[0], mood: "😊 Good", title: "", body: "", rating: 3, tags: [] });
                    setDailyTagInput("");
                  }} style={{
                    padding: "8px 18px", borderRadius: 8, border: "none",
                    background: "linear-gradient(135deg, #00e89d 0%, #00c9a7 100%)",
                    color: "#0a0b10", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 16px rgba(0,232,157,0.2)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}><Icons.Plus /> New Entry</button>
                </div>
              </div>

              {/* ── WRITE / EDIT VIEW ── */}
              {dailyView === "write" && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 28,
                  animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}>
                  {/* Date & Mood row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    <FormField label="Date">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#6b7084" }}><Icons.Calendar /></span>
                        <input type="date" value={editingEntry ? editingEntry.date : newEntry.date}
                          onChange={e => editingEntry ? setEditingEntry({...editingEntry, date: e.target.value}) : setNewEntry({...newEntry, date: e.target.value})}
                          style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    </FormField>
                    <FormField label="Mood">
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {MOODS.map(m => (
                          <button key={m} onClick={() => editingEntry ? setEditingEntry({...editingEntry, mood: m}) : setNewEntry({...newEntry, mood: m})}
                            style={{
                              padding: "6px 12px", borderRadius: 8, border: "1px solid",
                              fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                              transition: "all 0.2s", whiteSpace: "nowrap",
                              borderColor: (editingEntry ? editingEntry.mood : newEntry.mood) === m ? (MOOD_COLORS[m] || "#00e89d") + "55" : "rgba(255,255,255,0.06)",
                              background: (editingEntry ? editingEntry.mood : newEntry.mood) === m ? (MOOD_COLORS[m] || "#00e89d") + "18" : "rgba(255,255,255,0.02)",
                              color: (editingEntry ? editingEntry.mood : newEntry.mood) === m ? (MOOD_COLORS[m] || "#00e89d") : "#6b7084",
                            }}>{m}</button>
                        ))}
                      </div>
                    </FormField>
                  </div>

                  {/* Title */}
                  <FormField label="Title">
                    <input placeholder="How was your trading day?"
                      value={editingEntry ? editingEntry.title : newEntry.title}
                      onChange={e => editingEntry ? setEditingEntry({...editingEntry, title: e.target.value}) : setNewEntry({...newEntry, title: e.target.value})}
                      style={{ ...inputStyle, fontSize: 16, fontWeight: 600, padding: "12px 16px", marginBottom: 16 }} />
                  </FormField>

                  {/* Body - main writing area */}
                  <FormField label="Your Thoughts">
                    <textarea
                      placeholder="Write freely about your trading day... What went well? What could be better? Any patterns you noticed? Lessons learned?"
                      value={editingEntry ? editingEntry.body : newEntry.body}
                      onChange={e => editingEntry ? setEditingEntry({...editingEntry, body: e.target.value}) : setNewEntry({...newEntry, body: e.target.value})}
                      style={{
                        ...inputStyle, resize: "vertical", minHeight: 220, lineHeight: 1.8,
                        fontSize: 15, padding: "16px 18px",
                        background: "rgba(255,255,255,0.02)", marginBottom: 16,
                      }}
                    />
                  </FormField>

                  {/* Rating & Tags row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    <FormField label="Day Rating">
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => editingEntry ? setEditingEntry({...editingEntry, rating: star}) : setNewEntry({...newEntry, rating: star})}
                            style={{
                              background: "none", border: "none", cursor: "pointer", padding: 2,
                              color: star <= (editingEntry ? editingEntry.rating : newEntry.rating) ? "#ffa726" : "#3a3d50",
                              transform: star <= (editingEntry ? editingEntry.rating : newEntry.rating) ? "scale(1.1)" : "scale(1)",
                              transition: "all 0.15s",
                            }}>
                            {star <= (editingEntry ? editingEntry.rating : newEntry.rating) ? <Icons.Star /> : <Icons.StarEmpty />}
                          </button>
                        ))}
                        <span style={{ color: "#6b7084", fontSize: 12, marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                          {(editingEntry ? editingEntry.rating : newEntry.rating)}/5
                        </span>
                      </div>
                    </FormField>
                    <FormField label="Tags">
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: (editingEntry ? editingEntry.tags : newEntry.tags).length ? 8 : 0 }}>
                        {(editingEntry ? editingEntry.tags : newEntry.tags).map(t => (
                          <span key={t} style={{
                            background: "rgba(0, 180, 216, 0.1)", border: "1px solid rgba(0,180,216,0.2)",
                            borderRadius: 6, padding: "2px 10px", fontSize: 11, color: "#00b4d8",
                            display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans', sans-serif",
                          }}>
                            {t}
                            <span onClick={() => {
                              const updated = (editingEntry ? editingEntry.tags : newEntry.tags).filter(x => x !== t);
                              editingEntry ? setEditingEntry({...editingEntry, tags: updated}) : setNewEntry({...newEntry, tags: updated});
                            }} style={{ cursor: "pointer", opacity: 0.7 }}>×</span>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input placeholder="e.g. Discipline, Lesson..."
                          value={dailyTagInput} onChange={e => setDailyTagInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const curr = editingEntry ? editingEntry.tags : newEntry.tags;
                              if (dailyTagInput.trim() && !curr.includes(dailyTagInput.trim())) {
                                const updated = [...curr, dailyTagInput.trim()];
                                editingEntry ? setEditingEntry({...editingEntry, tags: updated}) : setNewEntry({...newEntry, tags: updated});
                                setDailyTagInput("");
                              }
                            }
                          }}
                          style={{ ...inputStyle, flex: 1 }} />
                        <button onClick={() => {
                          const curr = editingEntry ? editingEntry.tags : newEntry.tags;
                          if (dailyTagInput.trim() && !curr.includes(dailyTagInput.trim())) {
                            const updated = [...curr, dailyTagInput.trim()];
                            editingEntry ? setEditingEntry({...editingEntry, tags: updated}) : setNewEntry({...newEntry, tags: updated});
                            setDailyTagInput("");
                          }
                        }} style={{
                          background: "rgba(0,180,216,0.1)", border: "1px solid rgba(0,180,216,0.2)",
                          borderRadius: 10, padding: "0 14px", color: "#00b4d8", cursor: "pointer",
                          fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                        }}>Add</button>
                      </div>
                    </FormField>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <button onClick={() => { setDailyView("list"); setEditingEntry(null); }} style={{
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10, padding: "10px 24px", color: "#8b8fa3", fontSize: 14,
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    }}>Cancel</button>
                    <button onClick={() => {
                      const entry = editingEntry || newEntry;
                      if (!entry.title.trim() && !entry.body.trim()) return;
                      const toSave = { ...entry, id: editingEntry ? editingEntry.id : generateId() };
                      if (editingEntry) {
                        setJournalEntries(prev => prev.map(e => e.id === toSave.id ? toSave : e));
                      } else {
                        setJournalEntries(prev => [toSave, ...prev]);
                      }
                      setDailyView("list");
                      setEditingEntry(null);
                      setNewEntry({ date: new Date().toISOString().split("T")[0], mood: "😊 Good", title: "", body: "", rating: 3, tags: [] });
                    }} style={{
                      background: "linear-gradient(135deg, #00e89d 0%, #00c9a7 100%)",
                      border: "none", borderRadius: 10, padding: "10px 28px", color: "#0a0b10",
                      fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      boxShadow: "0 4px 20px rgba(0,232,157,0.25)",
                    }}>{editingEntry ? "Update Entry" : "Save Entry"}</button>
                  </div>
                </div>
              )}

              {/* ── LIST VIEW ── */}
              {dailyView === "list" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {journalEntries.length === 0 && (
                    <div style={{
                      background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                      border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: "60px 20px",
                      textAlign: "center",
                    }}>
                      <div style={{ color: "#3a3d50", marginBottom: 12, fontSize: 40 }}>📝</div>
                      <p style={{ color: "#6b7084", fontSize: 15, margin: "0 0 4px" }}>No journal entries yet</p>
                      <p style={{ color: "#4a4d60", fontSize: 13, margin: 0 }}>Start writing about your trading day to build self-awareness</p>
                    </div>
                  )}
                  {journalEntries.sort((a, b) => b.date.localeCompare(a.date)).map(entry => {
                    const moodColor = MOOD_COLORS[entry.mood] || "#8b8fa3";
                    return (
                      <div key={entry.id} className="trade-row" style={{
                        background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                        border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16,
                        padding: "22px 26px", transition: "all 0.2s", cursor: "default",
                        borderLeft: `3px solid ${moodColor}`,
                      }}>
                        {/* Header row: date, mood, rating, actions */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                            <span style={{ color: "#6b7084", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 5 }}>
                              <Icons.Calendar /> {entry.date}
                            </span>
                            <span style={{
                              padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                              background: moodColor + "18", color: moodColor,
                              border: `1px solid ${moodColor}33`,
                            }}>{entry.mood}</span>
                            <span style={{ display: "flex", gap: 2 }}>
                              {[1,2,3,4,5].map(s => (
                                <span key={s} style={{ color: s <= entry.rating ? "#ffa726" : "#2a2d3e", fontSize: 11 }}>
                                  {s <= entry.rating ? <Icons.Star /> : <Icons.StarEmpty />}
                                </span>
                              ))}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button onClick={() => { setEditingEntry({...entry}); setDailyView("write"); setDailyTagInput(""); }}
                              title="Edit" style={{
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center",
                                justifyContent: "center", cursor: "pointer", color: "#6b7084", transition: "all 0.15s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = "#00e89d"; e.currentTarget.style.borderColor = "rgba(0,232,157,0.3)"; }}
                              onMouseLeave={e => { e.currentTarget.style.color = "#6b7084"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                            ><Icons.Edit /></button>
                            <button onClick={() => setJournalEntries(prev => prev.filter(e => e.id !== entry.id))}
                              title="Delete" style={{
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center",
                                justifyContent: "center", cursor: "pointer", color: "#6b7084", transition: "all 0.15s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = "#ff4976"; e.currentTarget.style.borderColor = "rgba(255,73,118,0.3)"; }}
                              onMouseLeave={e => { e.currentTarget.style.color = "#6b7084"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                            ><Icons.Trash /></button>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: "#fff", lineHeight: 1.3 }}>{entry.title || "Untitled Entry"}</h3>

                        {/* Body preview */}
                        <p style={{
                          color: "#9b9eb3", fontSize: 14, lineHeight: 1.7, margin: "0 0 12px",
                          whiteSpace: "pre-wrap", maxHeight: 120, overflow: "hidden",
                          maskImage: entry.body.length > 300 ? "linear-gradient(to bottom, black 70%, transparent 100%)" : "none",
                          WebkitMaskImage: entry.body.length > 300 ? "linear-gradient(to bottom, black 70%, transparent 100%)" : "none",
                        }}>{entry.body}</p>

                        {/* Tags */}
                        {entry.tags && entry.tags.length > 0 && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {entry.tags.map(t => (
                              <span key={t} style={{
                                background: "rgba(0, 180, 216, 0.08)", border: "1px solid rgba(0,180,216,0.15)",
                                borderRadius: 5, padding: "2px 9px", fontSize: 11, color: "#00b4d8",
                                fontFamily: "'DM Sans', sans-serif",
                              }}>{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══════ IMPORT PAGE ═══════ */}
          {page === "import" && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>Import Trades</h2>
                <p style={{ fontSize: 14, color: "#6b7084", margin: "4px 0 0" }}>Import your trade history from Hyperliquid, Lighter, or CSV</p>
              </div>

              {/* Source selector */}
              <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                {[
                  { id: "hyperliquid", label: "Hyperliquid", color: "#00e89d", desc: "Perp DEX" },
                  { id: "lighter", label: "Lighter", color: "#00b4d8", desc: "Perp DEX" },
                  { id: "generic", label: "Custom CSV", color: "#ffa726", desc: "Any platform" },
                ].map(src => (
                  <button key={src.id} onClick={() => { setImportSource(src.id); setImportPreview(null); setImportStatus(null); setCsvHeaders([]); }}
                    style={{
                      flex: "1 1 180px", padding: "18px 20px", borderRadius: 14, border: "1px solid",
                      borderColor: importSource === src.id ? src.color + "55" : "rgba(255,255,255,0.06)",
                      background: importSource === src.id ? src.color + "12" : "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                      cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                    <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 2px", color: importSource === src.id ? src.color : "#fff" }}>{src.label}</p>
                    <p style={{ fontSize: 12, margin: 0, color: "#6b7084" }}>{src.desc}</p>
                  </button>
                ))}
              </div>

              {/* Instructions panel */}
              <div style={{
                background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, marginBottom: 20,
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                  <Icons.File /> How to export from {importSource === "hyperliquid" ? "Hyperliquid" : importSource === "lighter" ? "Lighter" : "your platform"}
                </h3>
                {importSource === "hyperliquid" && (
                  <div style={{ color: "#9b9eb3", fontSize: 13, lineHeight: 1.8 }}>
                    <p style={{ margin: "0 0 8px" }}><span style={{ color: "#00e89d", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginRight: 8 }}>1</span> Go to <span style={{ color: "#fff", fontWeight: 500 }}>app.hyperliquid.xyz</span> and connect your wallet</p>
                    <p style={{ margin: "0 0 8px" }}><span style={{ color: "#00e89d", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginRight: 8 }}>2</span> Navigate to <span style={{ color: "#fff", fontWeight: 500 }}>Portfolio → Trade History</span> tab at the bottom</p>
                    <p style={{ margin: "0 0 8px" }}><span style={{ color: "#00e89d", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginRight: 8 }}>3</span> Click <span style={{ color: "#fff", fontWeight: 500 }}>"Export as CSV"</span> to download your trade fills</p>
                    <p style={{ margin: 0 }}><span style={{ color: "#00e89d", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginRight: 8 }}>4</span> Upload the CSV file below — we'll auto-detect columns like <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8b8fa3" }}>Time, Coin, Direction, Px, Sz, Closed PNL</span></p>
                    <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(0,232,157,0.06)", border: "1px solid rgba(0,232,157,0.12)", fontSize: 12, color: "#00e89d" }}>
                      Fills with a non-zero "Closed PNL" are imported as completed trades. Other fills are grouped by coin + direction into open positions.
                    </div>
                  </div>
                )}
                {importSource === "lighter" && (
                  <div style={{ color: "#9b9eb3", fontSize: 13, lineHeight: 1.8 }}>
                    <p style={{ margin: "0 0 8px" }}><span style={{ color: "#00b4d8", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginRight: 8 }}>1</span> Go to <span style={{ color: "#fff", fontWeight: 500 }}>app.lighter.xyz</span> and connect your wallet</p>
                    <p style={{ margin: "0 0 8px" }}><span style={{ color: "#00b4d8", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginRight: 8 }}>2</span> Navigate to your <span style={{ color: "#fff", fontWeight: 500 }}>Portfolio → Trade History / Orders</span></p>
                    <p style={{ margin: "0 0 8px" }}><span style={{ color: "#00b4d8", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginRight: 8 }}>3</span> Export your trade history as CSV (look for download/export button)</p>
                    <p style={{ margin: 0 }}><span style={{ color: "#00b4d8", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", marginRight: 8 }}>4</span> Upload below — we'll parse columns like <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8b8fa3" }}>market, side, price, size, pnl, fee</span></p>
                    <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.12)", fontSize: 12, color: "#00b4d8" }}>
                      Lighter is a zero-fee perp DEX. Trades with non-zero PnL are imported as closed positions. Others are imported as open.
                    </div>
                  </div>
                )}
                {importSource === "generic" && (
                  <div style={{ color: "#9b9eb3", fontSize: 13, lineHeight: 1.8 }}>
                    <p style={{ margin: "0 0 8px" }}>Upload any CSV file and map the columns to TradeLog fields. Your CSV should contain at minimum:</p>
                    <p style={{ margin: "0 0 4px", color: "#ffa726" }}>Required: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8b8fa3" }}>symbol/asset, price, size/quantity</span></p>
                    <p style={{ margin: 0, color: "#ffa726" }}>Optional: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8b8fa3" }}>side/direction, date/time, exit price</span></p>
                  </div>
                )}
              </div>

              {/* File upload zone + Paste CSV */}
              <div style={{
                background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, marginBottom: 20,
              }}>
                {/* Quick demo import button */}
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <button onClick={() => {
                    const src = importSource === "lighter" ? "Lighter" : importSource === "hyperliquid" ? "Hyperliquid" : "CSV";
                    const suffix = importSource === "lighter" ? "-PERP" : "";
                    const tag = src;
                    const demoTrades = [
                      { id: generateId(), date: "2026-02-10", symbol: "BTC" + suffix, direction: "Long", entryPrice: 96907.75, exitPrice: 97250.50, positionSize: 0.15, stopLoss: 96500, takeProfit: 97800, strategy: "Momentum", emotion: "Confident", notes: `Imported from ${src} demo. Clean breakout on 1H.`, status: "Closed", tags: [tag, "Import"] },
                      { id: generateId(), date: "2026-02-10", symbol: "ETH" + suffix, direction: "Short", entryPrice: 3470.64, exitPrice: 3420.80, positionSize: 2.5, stopLoss: 3520, takeProfit: 3380, strategy: "Reversal", emotion: "Calm", notes: `Imported from ${src} demo.`, status: "Closed", tags: [tag, "Import"] },
                      { id: generateId(), date: "2026-02-10", symbol: "SOL" + suffix, direction: "Long", entryPrice: 192.65, exitPrice: 198.35, positionSize: 50, stopLoss: 189, takeProfit: 203, strategy: "Breakout", emotion: "Disciplined", notes: `Imported from ${src} demo.`, status: "Closed", tags: [tag, "Import"] },
                      { id: generateId(), date: "2026-02-11", symbol: "BTC" + suffix, direction: "Short", entryPrice: 98256.80, exitPrice: 98100.00, positionSize: 0.08, stopLoss: 98600, takeProfit: 97500, strategy: "Scalp", emotion: "Calm", notes: `Imported from ${src} demo.`, status: "Closed", tags: [tag, "Import"] },
                      { id: generateId(), date: "2026-02-11", symbol: "ETH" + suffix, direction: "Long", entryPrice: 3450.50, exitPrice: 3380.50, positionSize: 3, stopLoss: 3410, takeProfit: 3520, strategy: "Momentum", emotion: "FOMO", notes: `Imported from ${src} demo. Chased the move.`, status: "Closed", tags: [tag, "Import"] },
                      { id: generateId(), date: "2026-02-11", symbol: "ARB" + suffix, direction: "Long", entryPrice: 1.70, exitPrice: 1.85, positionSize: 5000, stopLoss: 1.60, takeProfit: 1.95, strategy: "Swing", emotion: "Disciplined", notes: `Imported from ${src} demo.`, status: "Closed", tags: [tag, "Import"] },
                      { id: generateId(), date: "2026-02-12", symbol: "DOGE" + suffix, direction: "Long", entryPrice: 0.197, exitPrice: 0.182, positionSize: 25000, stopLoss: 0.190, takeProfit: 0.210, strategy: "Momentum", emotion: "Greedy", notes: `Imported from ${src} demo. Oversized.`, status: "Closed", tags: [tag, "Import"] },
                      { id: generateId(), date: "2026-02-12", symbol: "SOL" + suffix, direction: "Short", entryPrice: 219.20, exitPrice: 205.20, positionSize: 30, stopLoss: 225, takeProfit: 198, strategy: "Reversal", emotion: "Confident", notes: `Imported from ${src} demo.`, status: "Closed", tags: [tag, "Import"] },
                      { id: generateId(), date: "2026-02-13", symbol: "BTC" + suffix, direction: "Long", entryPrice: 99500.00, exitPrice: null, positionSize: 0.05, stopLoss: 98800, takeProfit: 101000, strategy: "Swing", emotion: "Calm", notes: `Open position from ${src} import.`, status: "Open", tags: [tag, "Import"] },
                    ];
                    setTrades(prev => [...prev, ...demoTrades]);
                    const count = demoTrades.length;
                    setImportNotification({ count, source: src });
                    setImportStatus({ type: "success", message: `Imported ${count} ${src} demo trades! Check Dashboard or Journal.` });
                    setTimeout(() => setImportNotification(null), 8000);
                  }} style={{
                    flex: 1, padding: "14px 20px", borderRadius: 12, border: "2px solid rgba(0,232,157,0.25)",
                    background: "linear-gradient(135deg, rgba(0,232,157,0.08) 0%, rgba(0,201,167,0.04) 100%)",
                    color: "#00e89d", fontSize: 14, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,232,157,0.15) 0%, rgba(0,201,167,0.08) 100%)"}
                    onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,232,157,0.08) 0%, rgba(0,201,167,0.04) 100%)"}
                  >
                    ⚡ Load 9 Demo Trades Instantly
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <span style={{ color: "#6b7084", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>or upload / paste CSV</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                </div>

                {/* File upload */}
                <div
                  onClick={() => {
                    const inp = document.createElement("input");
                    inp.type = "file"; inp.accept = ".csv,.txt";
                    inp.onchange = (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        try {
                          const text = ev.target.result;
                          const { headers, rows } = parseCSVText(text);
                          if (rows.length === 0) { setImportStatus({ type: "error", message: "No data rows found in CSV." }); return; }

                          setCsvHeaders(headers);

                          let parsed;
                          if (importSource === "hyperliquid") {
                            parsed = parseHyperliquidCSV(rows);
                          } else if (importSource === "lighter") {
                            parsed = parseLighterCSV(rows);
                          } else {
                            setImportPreview({ raw: rows, mapped: null, fileName: file.name, rowCount: rows.length });
                            setImportStatus({ type: "info", message: `Loaded ${rows.length} rows from ${file.name}. Map columns below, then click Import.` });
                            const guess = { symbol: "", price: "", size: "", side: "", date: "", exitPrice: "" };
                            headers.forEach(h => {
                              const hl = h.toLowerCase();
                              if (hl.includes("symbol") || hl.includes("coin") || hl.includes("asset") || hl.includes("market") || hl.includes("pair")) guess.symbol = h;
                              if ((hl.includes("price") || hl === "px") && !hl.includes("exit") && !hl.includes("close")) guess.price = h;
                              if (hl.includes("size") || hl.includes("qty") || hl.includes("quantity") || hl.includes("amount") || hl === "sz") guess.size = h;
                              if (hl.includes("side") || hl.includes("direction") || hl.includes("type")) guess.side = h;
                              if (hl.includes("date") || hl.includes("time") || hl.includes("timestamp")) guess.date = h;
                              if (hl.includes("exit") || hl.includes("close_price") || hl.includes("close price")) guess.exitPrice = h;
                            });
                            setCsvMapping(guess);
                            return;
                          }

                          if (parsed.length === 0) {
                            setImportStatus({ type: "error", message: "Could not parse any trades. Check that the CSV format matches the expected columns." });
                            return;
                          }

                          setImportPreview({ raw: null, mapped: parsed, fileName: file.name, rowCount: rows.length });
                          setImportStatus({ type: "success", message: `Parsed ${parsed.length} trades from ${file.name} (${rows.length} rows)` });
                        } catch (err) {
                          setImportStatus({ type: "error", message: `Error parsing file: ${err.message}` });
                        }
                      };
                      reader.readAsText(file);
                    };
                    inp.click();
                  }}
                  style={{
                    border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 14,
                    padding: "28px 20px", textAlign: "center", cursor: "pointer",
                    transition: "all 0.2s", marginBottom: 16,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = importSource === "hyperliquid" ? "rgba(0,232,157,0.3)" : importSource === "lighter" ? "rgba(0,180,216,0.3)" : "rgba(255,167,38,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <div style={{ color: "#6b7084", marginBottom: 6 }}><Icons.Upload /></div>
                  <p style={{ color: "#e8e9f0", fontSize: 14, fontWeight: 600, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>
                    Click to upload CSV file
                  </p>
                  <p style={{ color: "#6b7084", fontSize: 12, margin: 0 }}>
                    .csv files from {importSource === "hyperliquid" ? "Hyperliquid" : importSource === "lighter" ? "Lighter" : "any platform"}
                  </p>
                </div>

                {/* Paste CSV textarea */}
                <div>
                  <p style={{ color: "#8b8fa3", fontSize: 12, fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Or paste CSV text directly</p>
                  <textarea
                    id="csv-paste-area"
                    placeholder={importSource === "hyperliquid"
                      ? "Time,Coin,Direction,Px,Sz,Notional USD,Closed PNL,Hash,Start Position,Fee\n2026-02-10T14:32:00Z,BTC,Buy,97250.50,0.15,14587.58,342.75,0xabc,-0.15,5.83"
                      : importSource === "lighter"
                      ? "timestamp,market,side,price,size,fee,pnl,status,orderId\n2026-02-10T14:32:00Z,BTC-PERP,buy,97250.50,0.15,0.00,342.75,filled,ord_abc"
                      : "symbol,date,side,price,size,exit_price\nBTC-USD,2026-02-10,Buy,97250.50,0.15,97593.25"
                    }
                    style={{ ...inputStyle, resize: "vertical", minHeight: 80, lineHeight: 1.5, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <button onClick={() => {
                    const textarea = document.getElementById("csv-paste-area");
                    const text = textarea?.value?.trim();
                    if (!text) { setImportStatus({ type: "error", message: "Paste some CSV data first." }); return; }
                    try {
                      const { headers, rows } = parseCSVText(text);
                      if (rows.length === 0) { setImportStatus({ type: "error", message: "No data rows found." }); return; }
                      setCsvHeaders(headers);
                      let parsed;
                      if (importSource === "hyperliquid") parsed = parseHyperliquidCSV(rows);
                      else if (importSource === "lighter") parsed = parseLighterCSV(rows);
                      else {
                        setImportPreview({ raw: rows, mapped: null, fileName: "pasted CSV", rowCount: rows.length });
                        setImportStatus({ type: "info", message: `Loaded ${rows.length} rows. Map columns below.` });
                        const guess = { symbol: "", price: "", size: "", side: "", date: "", exitPrice: "" };
                        headers.forEach(h => {
                          const hl = h.toLowerCase();
                          if (hl.includes("symbol") || hl.includes("coin") || hl.includes("asset") || hl.includes("market")) guess.symbol = h;
                          if ((hl.includes("price") || hl === "px") && !hl.includes("exit")) guess.price = h;
                          if (hl.includes("size") || hl.includes("qty") || hl.includes("quantity") || hl === "sz") guess.size = h;
                          if (hl.includes("side") || hl.includes("direction")) guess.side = h;
                          if (hl.includes("date") || hl.includes("time")) guess.date = h;
                          if (hl.includes("exit") || hl.includes("close_price")) guess.exitPrice = h;
                        });
                        setCsvMapping(guess);
                        return;
                      }
                      if (!parsed || parsed.length === 0) { setImportStatus({ type: "error", message: "Could not parse trades from pasted data." }); return; }
                      setImportPreview({ raw: null, mapped: parsed, fileName: "pasted CSV", rowCount: rows.length });
                      setImportStatus({ type: "success", message: `Parsed ${parsed.length} trades from pasted data.` });
                    } catch (err) {
                      setImportStatus({ type: "error", message: `Parse error: ${err.message}` });
                    }
                  }} style={{
                    marginTop: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, padding: "9px 20px", color: "#e8e9f0", fontSize: 13,
                    fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>Parse Pasted CSV</button>
                </div>
              </div>

              {/* Status message */}
              {importStatus && (
                <div style={{
                  padding: "14px 18px", borderRadius: 12, marginBottom: 20,
                  display: "flex", alignItems: "flex-start", gap: 10,
                  background: importStatus.type === "success" ? "rgba(0,232,157,0.08)" : importStatus.type === "error" ? "rgba(255,73,118,0.08)" : "rgba(0,180,216,0.08)",
                  border: `1px solid ${importStatus.type === "success" ? "rgba(0,232,157,0.2)" : importStatus.type === "error" ? "rgba(255,73,118,0.2)" : "rgba(0,180,216,0.2)"}`,
                  animation: "slideUp 0.3s ease",
                }}>
                  <span style={{ color: importStatus.type === "success" ? "#00e89d" : importStatus.type === "error" ? "#ff4976" : "#00b4d8", marginTop: 1 }}>
                    {importStatus.type === "success" ? <Icons.Check /> : <Icons.Alert />}
                  </span>
                  <p style={{ color: importStatus.type === "success" ? "#00e89d" : importStatus.type === "error" ? "#ff4976" : "#00b4d8", fontSize: 13, margin: 0, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                    {importStatus.message}
                  </p>
                </div>
              )}

              {/* Generic CSV column mapping UI */}
              {importSource === "generic" && importPreview?.raw && !importPreview?.mapped && csvHeaders.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, marginBottom: 20,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>Map CSV Columns</h3>
                  <p style={{ fontSize: 13, color: "#6b7084", margin: "0 0 16px" }}>
                    Detected {csvHeaders.length} columns: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#8b8fa3" }}>{csvHeaders.join(", ")}</span>
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    {[
                      { key: "symbol", label: "Symbol / Asset *", required: true },
                      { key: "price", label: "Entry Price *", required: true },
                      { key: "size", label: "Size / Quantity *", required: true },
                      { key: "side", label: "Side / Direction", required: false },
                      { key: "date", label: "Date / Time", required: false },
                      { key: "exitPrice", label: "Exit Price", required: false },
                    ].map(field => (
                      <FormField key={field.key} label={field.label}>
                        <select value={csvMapping[field.key]} onChange={e => setCsvMapping(p => ({ ...p, [field.key]: e.target.value }))}
                          style={{ ...selectStyle, borderColor: field.required && !csvMapping[field.key] ? "rgba(255,73,118,0.3)" : "rgba(255,255,255,0.08)" }}>
                          <option value="">{field.required ? "— Select column —" : "— None —"}</option>
                          {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </FormField>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                    <button onClick={() => {
                      if (!csvMapping.symbol || !csvMapping.price) {
                        setImportStatus({ type: "error", message: "Please map at least Symbol and Price columns." });
                        return;
                      }
                      const parsed = parseGenericCSV(importPreview.raw, csvMapping);
                      if (parsed.length === 0) {
                        setImportStatus({ type: "error", message: "Could not parse any trades with the selected mapping." });
                        return;
                      }
                      setImportPreview(p => ({ ...p, mapped: parsed }));
                      setImportStatus({ type: "success", message: `Mapped ${parsed.length} trades successfully. Review below and click Import.` });
                    }} style={{
                      background: "linear-gradient(135deg, #ffa726 0%, #ff9100 100%)",
                      border: "none", borderRadius: 10, padding: "10px 24px", color: "#0a0b10",
                      fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>Parse & Preview</button>
                  </div>
                </div>
              )}

              {/* Preview table */}
              {importPreview?.mapped && importPreview.mapped.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, overflow: "hidden", marginBottom: 20,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#fff" }}>
                      Preview — {importPreview.mapped.length} trades
                      <span style={{ fontSize: 12, fontWeight: 400, color: "#6b7084", marginLeft: 8 }}>from {importPreview.fileName}</span>
                    </h3>
                    <button onClick={() => {
                      const count = importPreview.mapped.length;
                      setTrades(prev => [...prev, ...importPreview.mapped]);
                      setImportStatus({ type: "success", message: `Successfully imported ${count} trades into your journal!` });
                      setImportNotification({ count, source: importSource === "hyperliquid" ? "Hyperliquid" : importSource === "lighter" ? "Lighter" : "CSV" });
                      setImportPreview(null);
                      // Auto-clear notification after 8 seconds
                      setTimeout(() => setImportNotification(null), 8000);
                    }} style={{
                      background: "linear-gradient(135deg, #00e89d 0%, #00c9a7 100%)",
                      border: "none", borderRadius: 10, padding: "10px 24px", color: "#0a0b10",
                      fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      boxShadow: "0 4px 20px rgba(0,232,157,0.25)",
                      display: "flex", alignItems: "center", gap: 6,
                    }}><Icons.Check /> Import {importPreview.mapped.length} Trades</button>
                  </div>
                  <div style={{ overflowX: "auto", maxHeight: 400 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 700 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "#191b27" }}>
                          {["Date", "Symbol", "Dir", "Entry", "Exit", "Size", "Status", "Tags"].map(h => (
                            <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6b7084", fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.mapped.slice(0, 50).map((t, i) => (
                          <tr key={i} className="trade-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "8px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#8b8fa3" }}>{t.date}</td>
                            <td style={{ padding: "8px 14px", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "#fff" }}>{t.symbol}</td>
                            <td style={{ padding: "8px 14px" }}>
                              <span style={{
                                padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600,
                                background: t.direction === "Long" ? "rgba(0,232,157,0.1)" : "rgba(255,73,118,0.1)",
                                color: t.direction === "Long" ? "#00e89d" : "#ff4976",
                              }}>{t.direction}</span>
                            </td>
                            <td style={{ padding: "8px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#c8c9d4" }}>${fmt(t.entryPrice)}</td>
                            <td style={{ padding: "8px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#c8c9d4" }}>{t.exitPrice ? `$${fmt(t.exitPrice)}` : "—"}</td>
                            <td style={{ padding: "8px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#c8c9d4" }}>{t.positionSize}</td>
                            <td style={{ padding: "8px 14px" }}>
                              <span style={{
                                padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600,
                                background: t.status === "Open" ? "rgba(255,167,38,0.1)" : "rgba(255,255,255,0.05)",
                                color: t.status === "Open" ? "#ffa726" : "#8b8fa3",
                              }}>{t.status}</span>
                            </td>
                            <td style={{ padding: "8px 14px" }}>
                              <div style={{ display: "flex", gap: 4 }}>
                                {t.tags.map(tag => (
                                  <span key={tag} style={{
                                    padding: "2px 7px", borderRadius: 4, fontSize: 10,
                                    background: "rgba(0,232,157,0.08)", color: "#00e89d",
                                  }}>{tag}</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.mapped.length > 50 && (
                      <p style={{ textAlign: "center", padding: "12px", color: "#6b7084", fontSize: 12 }}>
                        Showing first 50 of {importPreview.mapped.length} trades
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Sample CSV format reference */}
              {!importPreview && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: "#fff" }}>
                    {importSource === "hyperliquid" ? "Hyperliquid" : importSource === "lighter" ? "Lighter" : "Generic"} CSV Format Reference
                  </h3>
                  <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <pre style={{
                      margin: 0, padding: 16, fontSize: 12, lineHeight: 1.6,
                      fontFamily: "'JetBrains Mono', monospace", color: "#8b8fa3",
                      background: "rgba(0,0,0,0.2)", whiteSpace: "pre-wrap",
                    }}>
{importSource === "hyperliquid"
? `Time,Coin,Direction,Px,Sz,Notional USD,Closed PNL,Hash,Start Position,Fee
2026-02-10T14:32:00Z,BTC,Buy,97250.50,0.15,14587.58,342.75,0xabc...,-0.15,5.83
2026-02-10T15:01:00Z,ETH,Sell,3420.80,2.5,8552.00,-125.40,0xdef...,2.5,3.42
2026-02-11T09:15:00Z,SOL,Buy,198.35,50,9917.50,0,0xghi...,0,3.97`
: importSource === "lighter"
? `timestamp,market,side,price,size,fee,pnl,status,orderId
2026-02-10T14:32:00Z,BTC-PERP,buy,97250.50,0.15,0.00,342.75,filled,ord_abc123
2026-02-10T15:01:00Z,ETH-PERP,sell,3420.80,2.5,0.00,-125.40,filled,ord_def456
2026-02-11T09:15:00Z,SOL-PERP,buy,198.35,50,0.00,0,filled,ord_ghi789`
: `symbol,date,side,price,size,exit_price
BTC-USD,2026-02-10,Buy,97250.50,0.15,97593.25
ETH-USD,2026-02-10,Sell,3420.80,2.5,3471.00
SOL-USD,2026-02-11,Buy,198.35,50,`}
                    </pre>
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7084", margin: "12px 0 0", lineHeight: 1.6 }}>
                    Column names are flexibly matched — we accept common variations like "Coin"/"Symbol"/"Asset", "Px"/"Price", "Sz"/"Size"/"Qty", etc. Headers are case-insensitive.
                  </p>
                  <button onClick={() => {
                    const samples = {
                      hyperliquid: `Time,Coin,Direction,Px,Sz,Notional USD,Closed PNL,Hash,Start Position,Fee\n2026-02-10T14:32:00Z,BTC,Buy,97250.50,0.15,14587.58,342.75,0xabc123,-0.15,5.83\n2026-02-10T15:01:00Z,ETH,Sell,3420.80,2.5,8552.00,-125.40,0xdef456,2.5,3.42\n2026-02-10T16:45:00Z,SOL,Buy,198.35,50,9917.50,285.00,0xghi789,-50,3.97\n2026-02-11T10:20:00Z,BTC,Sell,98100.00,0.08,7848.00,156.80,0xjkl012,0.08,3.14\n2026-02-11T11:30:00Z,ETH,Buy,3380.50,3,10141.50,-210.00,0xmno345,-3,4.06\n2026-02-11T14:15:00Z,ARB,Buy,1.85,5000,9250.00,750.00,0xpqr678,-5000,3.70\n2026-02-12T09:00:00Z,DOGE,Buy,0.182,25000,4550.00,-375.00,0xstu901,-25000,1.82\n2026-02-12T13:45:00Z,SOL,Sell,205.20,30,6156.00,420.00,0xvwx234,30,2.46\n2026-02-13T10:00:00Z,BTC,Buy,99500.00,0.05,4975.00,0,0xyza567,0,1.99`,
                      lighter: `timestamp,market,side,price,size,fee,pnl,status,orderId\n2026-02-10T14:32:00Z,BTC-PERP,buy,97250.50,0.15,0.00,342.75,filled,ord_abc123\n2026-02-10T15:01:00Z,ETH-PERP,sell,3420.80,2.5,0.00,-125.40,filled,ord_def456\n2026-02-10T16:45:00Z,SOL-PERP,buy,198.35,50,0.00,285.00,filled,ord_ghi789\n2026-02-11T10:20:00Z,BTC-PERP,sell,98100.00,0.08,0.00,156.80,filled,ord_jkl012\n2026-02-11T11:30:00Z,ETH-PERP,buy,3380.50,3,0.00,-210.00,filled,ord_mno345\n2026-02-11T14:15:00Z,ARB-PERP,buy,1.85,5000,0.00,750.00,filled,ord_pqr678\n2026-02-12T09:00:00Z,DOGE-PERP,buy,0.182,25000,0.00,-375.00,filled,ord_stu901\n2026-02-12T13:45:00Z,SOL-PERP,sell,205.20,30,0.00,420.00,filled,ord_vwx234\n2026-02-13T10:00:00Z,BTC-PERP,buy,99500.00,0.05,0.00,0,filled,ord_yza567`,
                      generic: `symbol,date,side,price,size,exit_price\nBTC-USD,2026-02-10,Buy,97250.50,0.15,97593.25\nETH-USD,2026-02-10,Sell,3420.80,2.5,3471.00\nSOL-USD,2026-02-10,Buy,198.35,50,204.05\nBTC-USD,2026-02-11,Sell,98100.00,0.08,97943.20\nETH-USD,2026-02-11,Buy,3380.50,3,3310.50\nARB-USD,2026-02-11,Buy,1.85,5000,2.00\nDOGE-USD,2026-02-12,Buy,0.182,25000,0.167\nSOL-USD,2026-02-12,Sell,205.20,30,191.20\nBTC-USD,2026-02-13,Buy,99500.00,0.05,`,
                    };
                    const csv = samples[importSource];
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `sample-${importSource}-trades.csv`; a.click();
                    URL.revokeObjectURL(url);
                  }} style={{
                    marginTop: 14, background: "rgba(0,180,216,0.1)", border: "1px solid rgba(0,180,216,0.2)",
                    borderRadius: 10, padding: "10px 20px", color: "#00b4d8", fontSize: 13,
                    fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 6,
                  }}><Icons.Import /> Download Sample CSV to Test</button>
                </div>
              )}
            </div>
          )}

          {/* ═══════ ANALYTICS PAGE ═══════ */}
          {page === "analytics" && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>Analytics</h2>
                <p style={{ fontSize: 14, color: "#6b7084", margin: "4px 0 0" }}>Strategy & psychology performance breakdown</p>
              </div>

              {/* Strategy Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 20px", color: "#fff" }}>P&L by Strategy</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={strategyBreakdown} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="strategy" stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
                      <YAxis stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} tickFormatter={v => `$${v}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                        {strategyBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.pnl >= 0 ? "#00e89d" : "#ff4976"} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 20px", color: "#fff" }}>Win Rate by Strategy</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={strategyBreakdown} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="strategy" stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
                      <YAxis stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div style={{ background: "rgba(15,16,22,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px" }}>
                            <p style={{ color: "#8b8fa3", fontSize: 11, margin: 0, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
                            <p style={{ color: "#00b4d8", fontSize: 13, fontWeight: 600, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>Win Rate: {fmt(payload[0].value, 1)}%</p>
                          </div>
                        );
                      }} />
                      <Bar dataKey="winRate" fill="#00b4d8" fillOpacity={0.85} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Emotion Analysis & Monthly P&L */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                {/* Emotion P&L */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 20px", color: "#fff" }}>P&L by Emotion / Mindset</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={emotionBreakdown} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} tickFormatter={v => `$${v}`} />
                      <YAxis dataKey="emotion" type="category" stroke="#3a3d50" tick={{ fill: "#8b8fa3", fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} width={80} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="pnl" radius={[0, 6, 6, 0]}>
                        {emotionBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.pnl >= 0 ? "#00e89d" : "#ff4976"} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly P&L */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 20px", color: "#fff" }}>Monthly P&L</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyPnL} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} />
                      <YAxis stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} tickFormatter={v => `$${v}`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                        {monthlyPnL.map((entry, i) => (
                          <Cell key={i} fill={entry.pnl >= 0 ? "#00e89d" : "#ff4976"} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Day of Week + Trade Size Distribution */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 20px", color: "#fff" }}>Performance by Day of Week</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={dayOfWeekPerf} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="day" stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 11 }} />
                      <YAxis stroke="#3a3d50" tick={{ fill: "#6b7084", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} tickFormatter={v => `$${v}`} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = dayOfWeekPerf.find(x => x.day === label);
                        return (
                          <div style={{ background: "rgba(15,16,22,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px" }}>
                            <p style={{ color: "#8b8fa3", fontSize: 11, margin: 0, marginBottom: 4 }}>{label}</p>
                            <p style={{ color: payload[0].value >= 0 ? "#00e89d" : "#ff4976", fontSize: 13, fontWeight: 600, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>P&L: ${fmt(payload[0].value)}</p>
                            {d && <p style={{ color: "#8b8fa3", fontSize: 11, margin: "2px 0 0" }}>{d.trades} trades · {d.wins}W</p>}
                          </div>
                        );
                      }} />
                      <Bar dataKey="pnl" radius={[5, 5, 0, 0]}>
                        {dayOfWeekPerf.map((e, i) => <Cell key={i} fill={e.pnl >= 0 ? "#00e89d" : "#ff4976"} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Direction breakdown */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24,
                }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 20px", color: "#fff" }}>Long vs Short Performance</h3>
                  {(() => {
                    const longs = closedTrades.filter(t => t.direction === "Long");
                    const shorts = closedTrades.filter(t => t.direction === "Short");
                    const longPnl = longs.reduce((s, t) => s + calcPnL(t), 0);
                    const shortPnl = shorts.reduce((s, t) => s + calcPnL(t), 0);
                    const longWins = longs.filter(t => calcPnL(t) > 0).length;
                    const shortWins = shorts.filter(t => calcPnL(t) > 0).length;
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {[
                          { label: "Long", count: longs.length, wins: longWins, pnl: longPnl, color: "#00e89d" },
                          { label: "Short", count: shorts.length, wins: shortWins, pnl: shortPnl, color: "#ff4976" },
                        ].map(d => (
                          <div key={d.label} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "14px 16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <span style={{ color: d.color, fontSize: 14, fontWeight: 600 }}>{d.label}</span>
                              <span style={{ color: d.pnl >= 0 ? "#00e89d" : "#ff4976", fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{fmtCurrency(d.pnl)}</span>
                            </div>
                            <div style={{ display: "flex", gap: 16 }}>
                              <span style={{ fontSize: 12, color: "#6b7084" }}>{d.count} trades</span>
                              <span style={{ fontSize: 12, color: "#6b7084" }}>{d.wins}W / {d.count - d.wins}L</span>
                              <span style={{ fontSize: 12, color: d.count > 0 ? "#00b4d8" : "#6b7084" }}>{d.count > 0 ? fmt(d.wins / d.count * 100, 1) : 0}% WR</span>
                            </div>
                            {/* Win rate bar */}
                            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", marginTop: 8, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${d.count > 0 ? (d.wins / d.count * 100) : 0}%`, borderRadius: 3, background: d.color, transition: "width 0.5s ease" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Strategy Detail Table */}
              <div style={{
                background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, overflow: "hidden",
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, padding: "20px 24px 12px", color: "#fff" }}>Strategy Detail Breakdown</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {["Strategy", "Trades", "Wins", "Win Rate", "Total P&L", "Avg P&L"].map(h => (
                          <th key={h} style={{ padding: "10px 20px", textAlign: "left", color: "#6b7084", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {strategyBreakdown.map(s => (
                        <tr key={s.strategy} className="trade-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding: "12px 20px", fontWeight: 600, color: "#fff" }}>{s.strategy}</td>
                          <td style={{ padding: "12px 20px", fontFamily: "'JetBrains Mono', monospace", color: "#c8c9d4" }}>{s.trades}</td>
                          <td style={{ padding: "12px 20px", fontFamily: "'JetBrains Mono', monospace", color: "#00e89d" }}>{s.wins}</td>
                          <td style={{ padding: "12px 20px", fontFamily: "'JetBrains Mono', monospace", color: s.winRate >= 50 ? "#00e89d" : "#ff4976" }}>{fmt(s.winRate, 1)}%</td>
                          <td style={{ padding: "12px 20px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: s.pnl >= 0 ? "#00e89d" : "#ff4976" }}>{fmtCurrency(s.pnl)}</td>
                          <td style={{ padding: "12px 20px", fontFamily: "'JetBrains Mono', monospace", color: "#8b8fa3" }}>{fmtCurrency(s.pnl / s.trades)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ SETTINGS PAGE ═══════ */}
          {page === "settings" && (
            <div style={{ animation: "fadeIn 0.4s ease", maxWidth: 680 }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>Settings</h2>
                <p style={{ fontSize: 14, color: "#6b7084", margin: "4px 0 0" }}>Customize your trading journal</p>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {["general", "data", "about"].map(tab => (
                  <button key={tab} onClick={() => setSettingsTab(tab)} style={{
                    padding: "8px 18px", borderRadius: 8, border: "1px solid",
                    borderColor: settingsTab === tab ? "rgba(0,232,157,0.3)" : "rgba(255,255,255,0.08)",
                    background: settingsTab === tab ? "rgba(0,232,157,0.08)" : "rgba(255,255,255,0.03)",
                    color: settingsTab === tab ? "#00e89d" : "#8b8fa3",
                    fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    textTransform: "capitalize",
                  }}>{tab}</button>
                ))}
              </div>

              <div style={{
                background: "linear-gradient(135deg, rgba(22, 24, 33, 0.9) 0%, rgba(28, 30, 42, 0.7) 100%)",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 28,
              }}>
                {settingsTab === "general" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <FormField label="Starting Capital">
                      <input type="number" defaultValue="10000" style={inputStyle} />
                    </FormField>
                    <FormField label="Default Currency">
                      <select defaultValue="USD" style={selectStyle}>
                        <option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option>
                      </select>
                    </FormField>
                    <FormField label="Risk Per Trade (%)">
                      <input type="number" defaultValue="2" step="0.1" style={inputStyle} />
                    </FormField>
                    <FormField label="Commission Per Trade ($)">
                      <input type="number" defaultValue="0" step="0.01" style={inputStyle} />
                    </FormField>
                  </div>
                )}
                {settingsTab === "data" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                      <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Export Trades</p>
                      <p style={{ color: "#6b7084", fontSize: 13, margin: "0 0 12px" }}>Download all your trades as a JSON file for backup.</p>
                      <button onClick={() => {
                        const blob = new Blob([JSON.stringify(trades, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href = url; a.download = "tradelog-export.json"; a.click();
                        URL.revokeObjectURL(url);
                      }} style={{
                        background: "rgba(0,232,157,0.1)", border: "1px solid rgba(0,232,157,0.2)",
                        borderRadius: 10, padding: "10px 20px", color: "#00e89d", fontSize: 13,
                        fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      }}>Export JSON</button>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
                      <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Clear All Data</p>
                      <p style={{ color: "#6b7084", fontSize: 13, margin: "0 0 12px" }}>This will permanently delete all trades. This cannot be undone.</p>
                      <button onClick={() => { if (confirm("Are you sure? This will delete all trades.")) setTrades([]); }} style={{
                        background: "rgba(255,73,118,0.1)", border: "1px solid rgba(255,73,118,0.2)",
                        borderRadius: 10, padding: "10px 20px", color: "#ff4976", fontSize: 13,
                        fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      }}>Clear All Trades</button>
                    </div>
                  </div>
                )}
                {settingsTab === "about" && (
                  <div>
                    <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>TradeLog v1.0</p>
                    <p style={{ color: "#6b7084", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                      A comprehensive trading journal and activity tracker built to help traders log executions, analyze psychology, and track performance metrics over time. Features include automatic P&L calculations, R:R ratio tracking, strategy tagging, emotion analysis, equity curves, and detailed analytics breakdowns.
                    </p>
                    <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: "rgba(0,232,157,0.05)", border: "1px solid rgba(0,232,157,0.1)" }}>
                      <p style={{ color: "#00e89d", fontSize: 12, margin: 0, fontFamily: "'JetBrains Mono', monospace" }}>
                        Tech: React · Recharts · Tailwind-inspired styling
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── TRADE DETAIL MODAL ── */}
      <Modal isOpen={!!detailTrade} onClose={() => setDetailTrade(null)} title="Trade Detail" width={600}>
        {detailTrade && (() => {
          const pnl = calcPnL(detailTrade);
          const rr = calcRR(detailTrade);
          const riskAmt = detailTrade.stopLoss ? Math.abs(detailTrade.entryPrice - detailTrade.stopLoss) * detailTrade.positionSize : null;
          const rewardAmt = detailTrade.takeProfit ? Math.abs(detailTrade.takeProfit - detailTrade.entryPrice) * detailTrade.positionSize : null;
          return (
            <div>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#fff" }}>{detailTrade.symbol}</span>
                  <span style={{
                    padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: detailTrade.direction === "Long" ? "rgba(0,232,157,0.1)" : "rgba(255,73,118,0.1)",
                    color: detailTrade.direction === "Long" ? "#00e89d" : "#ff4976",
                  }}>{detailTrade.direction}</span>
                  <span style={{
                    padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: detailTrade.status === "Open" ? "rgba(255,167,38,0.1)" : "rgba(255,255,255,0.05)",
                    color: detailTrade.status === "Open" ? "#ffa726" : "#8b8fa3",
                  }}>{detailTrade.status}</span>
                </div>
                {pnl !== null && (
                  <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: pnl >= 0 ? "#00e89d" : "#ff4976" }}>{fmtCurrency(pnl)}</span>
                )}
              </div>

              {/* Price grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Entry", value: `$${fmt(detailTrade.entryPrice)}`, color: "#fff" },
                  { label: "Exit", value: detailTrade.exitPrice ? `$${fmt(detailTrade.exitPrice)}` : "—", color: detailTrade.exitPrice ? "#fff" : "#6b7084" },
                  { label: "Stop Loss", value: detailTrade.stopLoss ? `$${fmt(detailTrade.stopLoss)}` : "—", color: detailTrade.stopLoss ? "#ff4976" : "#6b7084" },
                  { label: "Take Profit", value: detailTrade.takeProfit ? `$${fmt(detailTrade.takeProfit)}` : "—", color: detailTrade.takeProfit ? "#00e89d" : "#6b7084" },
                ].map(item => (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px" }}>
                    <p style={{ color: "#6b7084", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                    <p style={{ color: item.color, fontSize: 15, fontWeight: 600, margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Metrics row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Size", value: String(detailTrade.positionSize) },
                  { label: "R:R Ratio", value: rr ? `${fmt(rr)}:1` : "—" },
                  { label: "Risk $", value: riskAmt ? `$${fmt(riskAmt)}` : "—" },
                  { label: "Reward $", value: rewardAmt ? `$${fmt(rewardAmt)}` : "—" },
                ].map(item => (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px" }}>
                    <p style={{ color: "#6b7084", fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                    <p style={{ color: "#c8c9d4", fontSize: 15, fontWeight: 600, margin: "4px 0 0", fontFamily: "'JetBrains Mono', monospace" }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Visual R:R bar */}
              {detailTrade.stopLoss && detailTrade.takeProfit && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: "#6b7084", fontSize: 11, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk / Reward Visualization</p>
                  <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 28 }}>
                    <div style={{
                      flex: riskAmt || 1, background: "rgba(255,73,118,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 600, color: "#ff4976", fontFamily: "'JetBrains Mono', monospace",
                    }}>Risk: ${riskAmt ? fmt(riskAmt) : "—"}</div>
                    <div style={{
                      flex: rewardAmt || 1, background: "rgba(0,232,157,0.3)", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 600, color: "#00e89d", fontFamily: "'JetBrains Mono', monospace",
                    }}>Reward: ${rewardAmt ? fmt(rewardAmt) : "—"}</div>
                  </div>
                </div>
              )}

              {/* Info pills */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, background: "rgba(255,255,255,0.05)", color: "#8b8fa3" }}>📅 {detailTrade.date}</span>
                <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, background: "rgba(0,180,216,0.1)", color: "#00b4d8" }}>🎯 {detailTrade.strategy}</span>
                <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, background: "rgba(255,167,38,0.1)", color: "#ffa726" }}>🧠 {detailTrade.emotion}</span>
                {detailTrade.tags?.map(t => (
                  <span key={t} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, background: "rgba(0,232,157,0.08)", color: "#00e89d" }}>{t}</span>
                ))}
              </div>

              {/* Notes */}
              {detailTrade.notes && (
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <p style={{ color: "#6b7084", fontSize: 10, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trade Notes</p>
                  <p style={{ color: "#c8c9d4", fontSize: 14, margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{detailTrade.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={() => { setDetailTrade(null); openEdit(detailTrade); }} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(0,232,157,0.2)",
                  background: "rgba(0,232,157,0.08)", color: "#00e89d", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}><Icons.Edit /> Edit Trade</button>
                <button onClick={() => { deleteTrade(detailTrade.id); setDetailTrade(null); }} style={{
                  padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,73,118,0.2)",
                  background: "rgba(255,73,118,0.08)", color: "#ff4976", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}><Icons.Trash /> Delete</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── TRADE ENTRY MODAL ── */}
      <TradeEntryModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditTrade(null); }} onSave={saveTrade} editTrade={editTrade} />
    </div>
  );
}

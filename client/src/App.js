import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Mock data (replace with real API calls) ──────────────────────────────────
const mockSales = [
  { date: "Mar 03", revenue: 18400, orders: 12 },
  { date: "Mar 06", revenue: 22100, orders: 15 },
  { date: "Mar 09", revenue: 17800, orders: 11 },
  { date: "Mar 12", revenue: 31200, orders: 21 },
  { date: "Mar 15", revenue: 28900, orders: 19 },
  { date: "Mar 18", revenue: 24600, orders: 16 },
  { date: "Mar 21", revenue: 38700, orders: 26 },
  { date: "Mar 24", revenue: 33100, orders: 22 },
  { date: "Mar 27", revenue: 41200, orders: 28 },
  { date: "Mar 30", revenue: 36800, orders: 24 },
  { date: "Apr 01", revenue: 44500, orders: 30 },
  { date: "Apr 02", revenue: 29300, orders: 20 },
];

const mockInventory = [
  { id: 1, sku: "FLT-3500XL", name: "Forklift 3500XL", category: "Forklifts", qty: 3, reorder: 2, price: 28500, status: "ok" },
  { id: 2, sku: "PLT-JACK-HD", name: "Heavy Duty Pallet Jack", category: "Pallet Jacks", qty: 1, reorder: 5, price: 1200, status: "critical" },
  { id: 3, sku: "CNV-BELT-20", name: "Belt Conveyor 20ft", category: "Conveyors", qty: 0, reorder: 3, price: 4800, status: "out" },
  { id: 4, sku: "DOCK-LVL-6K", name: "Dock Leveler 6000lb", category: "Dock Equipment", qty: 2, reorder: 3, price: 3200, status: "low" },
  { id: 5, sku: "STCK-RCH-EL", name: "Electric Reach Stacker", category: "Stackers", qty: 5, reorder: 2, price: 22000, status: "ok" },
  { id: 6, sku: "WRAP-AUTO-X", name: "Auto Stretch Wrapper", category: "Packaging", qty: 1, reorder: 4, price: 6500, status: "critical" },
  { id: 7, sku: "LIFT-TABLE-H", name: "Hydraulic Lift Table", category: "Lift Tables", qty: 8, reorder: 3, price: 2100, status: "ok" },
  { id: 8, sku: "TRLR-SPTT-4W", name: "4-Wheel Spotting Trailer", category: "Trailers", qty: 2, reorder: 2, price: 11400, status: "low" },
  { id: 9, sku: "SCSR-ELC-MNI", name: "Electric Mini Scissor Lift", category: "Lifts", qty: 0, reorder: 2, price: 9800, status: "out" },
  { id: 10, sku: "BUMP-DOCK-RB", name: "Rubber Dock Bumper Set", category: "Dock Equipment", qty: 22, reorder: 10, price: 380, status: "ok" },
  { id: 11, sku: "CHAIN-HOIST-2T", name: "2-Ton Chain Hoist", category: "Hoists", qty: 4, reorder: 5, price: 850, status: "low" },
  { id: 12, sku: "FLT-BATT-48V", name: "48V Forklift Battery", category: "Batteries", qty: 6, reorder: 4, price: 3400, status: "ok" },
];

const mockOrders = [
  { id: "#ORD-4821", customer: "Apex Logistics Inc.", items: 3, total: 34200, status: "fulfilled", date: "Apr 02" },
  { id: "#ORD-4820", customer: "Northern Steel Co.", items: 1, total: 28500, status: "pending", date: "Apr 02" },
  { id: "#ORD-4819", customer: "Midwest Warehousing", items: 5, total: 8640, status: "fulfilled", date: "Apr 01" },
  { id: "#ORD-4818", customer: "TechMove Solutions", items: 2, total: 15300, status: "refunded", date: "Apr 01" },
  { id: "#ORD-4817", customer: "Great Lakes Freight", items: 4, total: 22100, status: "fulfilled", date: "Mar 31" },
  { id: "#ORD-4816", customer: "Summit Distribution", items: 1, total: 6500, status: "pending", date: "Mar 31" },
];

const categoryData = [
  { name: "Forklifts", value: 38 },
  { name: "Pallet Jacks", value: 18 },
  { name: "Conveyors", value: 14 },
  { name: "Stackers", value: 16 },
  { name: "Dock Equip.", value: 14 },
];

const COLORS = ["#E8A020", "#C0392B", "#2980B9", "#27AE60", "#8E44AD"];

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);

const statusConfig = {
  ok:       { label: "IN STOCK",  color: "#27AE60", bg: "rgba(39,174,96,0.12)" },
  low:      { label: "LOW",       color: "#E8A020", bg: "rgba(232,160,32,0.12)" },
  critical: { label: "CRITICAL",  color: "#C0392B", bg: "rgba(192,57,43,0.15)" },
  out:      { label: "OUT",       color: "#7F0000", bg: "rgba(127,0,0,0.2)" },
};

const orderStatusConfig = {
  fulfilled: { label: "FULFILLED", color: "#27AE60" },
  pending:   { label: "PENDING",   color: "#E8A020" },
  refunded:  { label: "REFUNDED",  color: "#888" },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function KPI({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: "#161616",
      border: "1px solid #2a2a2a",
      borderTop: `3px solid ${accent}`,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ fontSize: 11, color: "#666", letterSpacing: "0.15em", fontFamily: "monospace" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#F0EDE8", fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#555", fontFamily: "monospace" }}>{sub}</div>}
      <div style={{ position: "absolute", right: 16, top: 16, fontSize: 22, opacity: 0.15 }}>{icon}</div>
    </div>
  );
}

function SectionHeader({ title, badge }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <div style={{ width: 3, height: 18, background: "#E8A020" }} />
      <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#999", fontFamily: "monospace", textTransform: "uppercase" }}>{title}</span>
      {badge !== undefined && (
        <span style={{ fontSize: 10, background: "#C0392B", color: "#fff", padding: "2px 7px", fontFamily: "monospace", marginLeft: "auto" }}>{badge} ALERTS</span>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("overview");
  const [inventoryFilter, setInventoryFilter] = useState("all");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const totalRevenue = mockSales.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = mockSales.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalRevenue / totalOrders;
  const alertItems = mockInventory.filter(i => i.status !== "ok");
  const outItems = mockInventory.filter(i => i.status === "out");
  const lowItems = mockInventory.filter(i => i.status === "low" || i.status === "critical");
  const inventoryValue = mockInventory.reduce((s, i) => s + i.qty * i.price, 0);

  const filteredInventory = inventoryFilter === "all"
    ? mockInventory
    : mockInventory.filter(i => i.status === inventoryFilter);

  const tabs = ["overview", "inventory", "orders"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D0D",
      color: "#F0EDE8",
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; }
        .row-hover:hover { background: #1a1a1a !important; }
        .tab-btn { background: none; border: none; cursor: pointer; transition: all 0.15s; }
        .filter-btn { background: none; border: 1px solid #2a2a2a; cursor: pointer; transition: all 0.15s; padding: 5px 14px; font-family: monospace; font-size: 11px; letter-spacing: 0.1em; }
        .filter-btn:hover { border-color: #E8A020; color: #E8A020; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#111",
        borderBottom: "1px solid #222",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        height: 56,
        gap: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, background: "#E8A020", transform: "rotate(45deg)" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, letterSpacing: "0.1em", color: "#F0EDE8" }}>
            HEAVYLIFT <span style={{ color: "#E8A020" }}>OPS</span>
          </span>
        </div>

        <div style={{ width: 1, height: 24, background: "#2a2a2a" }} />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map(t => (
            <button key={t} className="tab-btn" onClick={() => setTab(t)} style={{
              padding: "6px 16px",
              fontSize: 11,
              letterSpacing: "0.15em",
              color: tab === t ? "#E8A020" : "#555",
              borderBottom: tab === t ? "2px solid #E8A020" : "2px solid transparent",
              textTransform: "uppercase",
            }}>{t}</button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", fontSize: 11, color: "#444", letterSpacing: "0.1em" }}>
          {now.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" })} &nbsp;·&nbsp; {now.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
        </div>

        {alertItems.length > 0 && (
          <div style={{ background: "#C0392B", padding: "4px 12px", fontSize: 11, letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 6 }}>
            ⚠ {alertItems.length} INVENTORY ALERTS
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              <KPI label="30-DAY REVENUE" value={fmt(totalRevenue)} sub={`+12.4% vs prior period`} accent="#E8A020" icon="$" />
              <KPI label="TOTAL ORDERS" value={totalOrders} sub={`${mockOrders.filter(o=>o.status==='pending').length} pending`} accent="#2980B9" icon="📦" />
              <KPI label="AVG ORDER VALUE" value={fmt(avgOrder)} sub="per transaction" accent="#27AE60" icon="≈" />
              <KPI label="INVENTORY VALUE" value={fmt(inventoryValue)} sub={`${mockInventory.length} SKUs tracked`} accent="#8E44AD" icon="🏭" />
              <KPI label="STOCK ALERTS" value={alertItems.length} sub={`${outItems.length} out of stock`} accent="#C0392B" icon="⚠" />
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

              {/* Revenue Chart */}
              <div style={{ background: "#111", border: "1px solid #222", padding: "20px 24px" }}>
                <SectionHeader title="Revenue — Last 30 Days" />
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={mockSales}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E8A020" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E8A020" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", fontFamily: "monospace", fontSize: 12 }} formatter={(v) => [fmt(v), "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#E8A020" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown */}
              <div style={{ background: "#111", border: "1px solid #222", padding: "20px 24px" }}>
                <SectionHeader title="Sales by Category" />
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", fontFamily: "monospace", fontSize: 12 }} />
                    <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10, fontFamily: "monospace", color: "#888" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Low Stock Alerts */}
              <div style={{ background: "#111", border: "1px solid #222", padding: "20px 24px" }}>
                <SectionHeader title="Stock Alerts" badge={alertItems.length} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {alertItems.map(item => {
                    const s = statusConfig[item.status];
                    return (
                      <div key={item.id} className="row-hover" style={{
                        display: "grid", gridTemplateColumns: "1fr auto auto",
                        alignItems: "center", gap: 12,
                        padding: "10px 12px",
                        background: s.bg,
                        border: `1px solid ${s.color}22`,
                      }}>
                        <div>
                          <div style={{ fontSize: 12, color: "#ddd" }}>{item.name}</div>
                          <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{item.sku}</div>
                        </div>
                        <div style={{ fontSize: 11, color: "#888" }}>QTY: <span style={{ color: "#ddd" }}>{item.qty}</span></div>
                        <div style={{ fontSize: 10, color: s.color, letterSpacing: "0.1em", minWidth: 60, textAlign: "right" }}>{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Orders */}
              <div style={{ background: "#111", border: "1px solid #222", padding: "20px 24px" }}>
                <SectionHeader title="Recent Orders" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mockOrders.map(order => {
                    const s = orderStatusConfig[order.status];
                    return (
                      <div key={order.id} className="row-hover" style={{
                        display: "grid", gridTemplateColumns: "auto 1fr auto auto",
                        alignItems: "center", gap: 12,
                        padding: "10px 12px",
                        background: "#161616",
                        border: "1px solid #222",
                      }}>
                        <div style={{ fontSize: 10, color: "#E8A020", fontFamily: "monospace" }}>{order.id}</div>
                        <div>
                          <div style={{ fontSize: 11, color: "#ccc" }}>{order.customer}</div>
                          <div style={{ fontSize: 10, color: "#555" }}>{order.date} · {order.items} item{order.items > 1 ? "s" : ""}</div>
                        </div>
                        <div style={{ fontSize: 12, color: "#ddd" }}>{fmt(order.total)}</div>
                        <div style={{ fontSize: 10, color: s.color, letterSpacing: "0.1em", minWidth: 70, textAlign: "right" }}>{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── INVENTORY TAB ── */}
        {tab === "inventory" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Inventory KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <KPI label="TOTAL SKUs" value={mockInventory.length} sub="active product lines" accent="#2980B9" icon="#" />
              <KPI label="INVENTORY VALUE" value={fmt(inventoryValue)} sub="at cost price" accent="#27AE60" icon="$" />
              <KPI label="OUT OF STOCK" value={outItems.length} sub="need immediate reorder" accent="#7F0000" icon="✕" />
              <KPI label="LOW / CRITICAL" value={lowItems.length} sub="below reorder point" accent="#E8A020" icon="⚠" />
            </div>

            {/* Orders per day bar chart */}
            <div style={{ background: "#111", border: "1px solid #222", padding: "20px 24px" }}>
              <SectionHeader title="Daily Order Volume" />
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={mockSales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", fontFamily: "monospace", fontSize: 12 }} />
                  <Bar dataKey="orders" fill="#2980B9" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em" }}>FILTER:</span>
              {["all", "ok", "low", "critical", "out"].map(f => (
                <button key={f} className="filter-btn" onClick={() => setInventoryFilter(f)} style={{
                  color: inventoryFilter === f ? "#E8A020" : "#666",
                  borderColor: inventoryFilter === f ? "#E8A020" : "#2a2a2a",
                  textTransform: "uppercase",
                }}>{f}</button>
              ))}
            </div>

            {/* Inventory Table */}
            <div style={{ background: "#111", border: "1px solid #222" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 140px 80px 80px 100px 90px",
                padding: "10px 20px",
                borderBottom: "1px solid #222",
                fontSize: 10,
                color: "#555",
                letterSpacing: "0.15em",
              }}>
                <div>SKU</div><div>PRODUCT</div><div>CATEGORY</div>
                <div style={{textAlign:"center"}}>QTY</div>
                <div style={{textAlign:"center"}}>REORDER PT</div>
                <div style={{textAlign:"right"}}>UNIT PRICE</div>
                <div style={{textAlign:"right"}}>STATUS</div>
              </div>
              {filteredInventory.map((item, i) => {
                const s = statusConfig[item.status];
                return (
                  <div key={item.id} className="row-hover" style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 140px 80px 80px 100px 90px",
                    padding: "12px 20px",
                    borderBottom: "1px solid #1a1a1a",
                    alignItems: "center",
                    background: item.status !== "ok" ? s.bg : "transparent",
                  }}>
                    <div style={{ fontSize: 10, color: "#E8A020", fontFamily: "monospace" }}>{item.sku}</div>
                    <div style={{ fontSize: 12, color: "#ddd" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#666" }}>{item.category}</div>
                    <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: item.qty === 0 ? "#7F0000" : "#ddd" }}>{item.qty}</div>
                    <div style={{ textAlign: "center", fontSize: 12, color: "#555" }}>{item.reorder}</div>
                    <div style={{ textAlign: "right", fontSize: 12, color: "#aaa" }}>{fmt(item.price)}</div>
                    <div style={{ textAlign: "right", fontSize: 10, color: s.color, letterSpacing: "0.1em" }}>{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <KPI label="TOTAL ORDERS (30D)" value={totalOrders} sub="across all channels" accent="#2980B9" icon="📦" />
              <KPI label="FULFILLED" value={mockOrders.filter(o=>o.status==="fulfilled").length} sub="completed orders" accent="#27AE60" icon="✓" />
              <KPI label="PENDING" value={mockOrders.filter(o=>o.status==="pending").length} sub="awaiting processing" accent="#E8A020" icon="⏳" />
              <KPI label="REFUNDED" value={mockOrders.filter(o=>o.status==="refunded").length} sub="this period" accent="#888" icon="↩" />
            </div>

            {/* Orders Table */}
            <div style={{ background: "#111", border: "1px solid #222" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 80px 120px 90px",
                padding: "10px 20px",
                borderBottom: "1px solid #222",
                fontSize: 10, color: "#555", letterSpacing: "0.15em",
              }}>
                <div>ORDER ID</div><div>CUSTOMER</div><div style={{textAlign:"center"}}>ITEMS</div>
                <div style={{textAlign:"right"}}>TOTAL</div>
                <div style={{textAlign:"right"}}>STATUS</div>
              </div>
              {mockOrders.map(order => {
                const s = orderStatusConfig[order.status];
                return (
                  <div key={order.id} className="row-hover" style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 80px 120px 90px",
                    padding: "14px 20px",
                    borderBottom: "1px solid #1a1a1a",
                    alignItems: "center",
                  }}>
                    <div style={{ fontSize: 11, color: "#E8A020" }}>{order.id}</div>
                    <div>
                      <div style={{ fontSize: 12, color: "#ddd" }}>{order.customer}</div>
                      <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{order.date}</div>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 12, color: "#888" }}>{order.items}</div>
                    <div style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: "#ddd" }}>{fmt(order.total)}</div>
                    <div style={{ textAlign: "right", fontSize: 10, color: s.color, letterSpacing: "0.1em" }}>{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Revenue chart */}
            <div style={{ background: "#111", border: "1px solid #222", padding: "20px 24px" }}>
              <SectionHeader title="Revenue Trend" />
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={mockSales}>
                  <defs>
                    <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2980B9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2980B9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                  <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#555", fontSize: 10, fontFamily: "monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", fontFamily: "monospace", fontSize: 12 }} formatter={(v) => [fmt(v), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#2980B9" strokeWidth={2} fill="url(#revGrad2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
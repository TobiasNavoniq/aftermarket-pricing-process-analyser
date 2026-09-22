import { useState, useMemo } from "react";

// ─── BMW PRODUCT LINES ────────────────────────────────────────────────────────
const PRODUCT_LINES = [
  { id: "all",      label: "All Product Lines",  short: "ALL",   icon: "◈" },
  { id: "engine",   label: "Engine & Drivetrain", short: "ENG",   icon: "⚙" },
  { id: "body",     label: "Body & Exterior",     short: "BOD",   icon: "◻" },
  { id: "electrical",label: "Electrical & Electronics", short: "ELE", icon: "⚡" },
  { id: "brakes",   label: "Brakes & Suspension", short: "BRK",   icon: "◎" },
  { id: "service",  label: "Service & Wear Parts",short: "SVC",   icon: "↻" },
  { id: "accessories",label:"Accessories & Lifestyle", short: "ACC", icon: "✦" },
];

// ─── KPI DEFINITIONS (3 types, per the Vistex legend) ───────────────────────
// type: "data" = Data/Modelling/Optimization (blue)
//       "mgmt" = Management/Steering/Monitoring (green)
//       "ops"  = Operational Processing/Integration (orange)
// status per product line: "green" | "amber" | "red"

const KPIS = [
  // Stage 1
  { id:"k01", stage:1, label:"Family Code Coverage", short:"FC Coverage",        type:"data", formula:"Parts in FC ÷ Total × 100" },
  { id:"k02", stage:1, label:"Segmentation Accuracy", short:"Seg. Accuracy",     type:"data", formula:"Correctly segmented ÷ Sample" },
  { id:"k03", stage:1, label:"Approval Compliance",   short:"Approval Rate",     type:"mgmt", formula:"Approved ÷ Submitted changes" },
  // Stage 2
  { id:"k04", stage:2, label:"Gross Profit %",         short:"GP%",              type:"data", formula:"(RET − ExFactory) ÷ RET × 100" },
  { id:"k05", stage:2, label:"Contribution Margin %",  short:"CM%",              type:"data", formula:"(RET − VarCost) ÷ RET × 100" },
  { id:"k06", stage:2, label:"New Part Cycle Time",    short:"Cycle Time",        type:"ops",  formula:"Avg sec: release → valid price" },
  { id:"k07", stage:2, label:"Upload Error Rate",      short:"Upload Errors",     type:"ops",  formula:"Rejected ÷ Uploaded × 100" },
  // Stage 3
  { id:"k08", stage:3, label:"Lump Sum Pass-Through",  short:"Lump Sum PT",       type:"mgmt", formula:"Markets applied ÷ Notified" },
  { id:"k09", stage:3, label:"Profit Violation Rate",  short:"P. Violations",     type:"data", formula:"Below-min CM parts ÷ Total" },
  // Stage 4
  { id:"k10", stage:4, label:"Market Notification Time",short:"Notif. Time",      type:"ops",  formula:"Hrs: AG price set → worklist" },
  { id:"k11", stage:4, label:"Transfer Accuracy",      short:"Transfer Acc.",     type:"ops",  formula:"Correct transfers ÷ Total" },
  // Stage 5
  { id:"k12", stage:5, label:"NSC Gross Profit Floor", short:"NSC GP Floor",      type:"data", formula:"(MRP − MDN) ÷ MRP × 100" },
  { id:"k13", stage:5, label:"FX Rate Lag Impact",     short:"FX Lag",            type:"data", formula:"CM loss from stale rates" },
  { id:"k14", stage:5, label:"Rounding Compliance",    short:"Rounding",          type:"ops",  formula:"Correct rounded ÷ Total" },
  // Stage 6
  { id:"k15", stage:6, label:"Competitive Price Index",short:"CPI",               type:"data", formula:"BMW MRP ÷ Best IAM × 100" },
  { id:"k16", stage:6, label:"Manual Price Rate",      short:"Manual Rate",       type:"mgmt", formula:"Manual priced ÷ Total market" },
  { id:"k17", stage:6, label:"Approval Cycle Time",    short:"Approval Time",     type:"mgmt", formula:"Days: trigger → approved live" },
  // Stage 7
  { id:"k18", stage:7, label:"Campaign Restoration",   short:"Restoration",       type:"ops",  formula:"Auto-restored ÷ Expired" },
  { id:"k19", stage:7, label:"Customer Margin Compliance",short:"Cust. Margin",   type:"mgmt", formula:"Special prices > min margin ÷ Total" },
  // Stage 8
  { id:"k20", stage:8, label:"ATLAS Transfer Success", short:"ATLAS Transfer",    type:"ops",  formula:"Success ÷ Total price records" },
  { id:"k21", stage:8, label:"Price Activation Time",  short:"Activation",        type:"ops",  formula:"Days: approval → market live" },
  // Stage 9
  { id:"k22", stage:9, label:"Audit Trail Completeness",short:"Audit Trail",      type:"mgmt", formula:"Full log ÷ All changes × 100" },
  { id:"k23", stage:9, label:"Aftersales EBIT Margin", short:"EBIT Margin",       type:"data", formula:"Aftersales EBIT ÷ Revenue × 100" },
  { id:"k24", stage:9, label:"IAM Capture Rate",       short:"IAM Capture",       type:"data", formula:"BMW genuine ÷ Total repair spend" },
];

// ─── TRAFFIC LIGHT DATA per product line ─────────────────────────────────────
// Simulated realistic data: engine parts have pricing pressure, accessories healthy, etc.
const TRAFFIC_DATA = {
  all:       { k01:"green",k02:"green",k03:"green",k04:"green",k05:"amber",k06:"green",k07:"green",k08:"amber",k09:"amber",k10:"amber",k11:"green",k12:"green",k13:"amber",k14:"green",k15:"amber",k16:"amber",k17:"green",k18:"green",k19:"green",k20:"green",k21:"green",k22:"green",k23:"green",k24:"amber" },
  engine:    { k01:"green",k02:"amber",k03:"green",k04:"red",  k05:"red",  k06:"green",k07:"amber",k08:"green",k09:"red",  k10:"green",k11:"green",k12:"red",  k13:"red",  k14:"green",k15:"red",  k16:"red",  k17:"amber",k18:"green",k19:"amber",k20:"green",k21:"green",k22:"green",k23:"red",  k24:"red"   },
  body:      { k01:"green",k02:"green",k03:"green",k04:"amber",k05:"amber",k06:"green",k07:"green",k08:"green",k09:"amber",k10:"amber",k11:"green",k12:"amber",k13:"amber",k14:"green",k15:"amber",k16:"amber",k17:"green",k18:"amber",k19:"green",k20:"green",k21:"amber",k22:"green",k23:"amber",k24:"amber" },
  electrical:{ k01:"amber",k02:"amber",k03:"green",k04:"green",k05:"green",k06:"amber",k07:"red",  k08:"amber",k09:"green",k10:"red",  k11:"amber",k12:"green",k13:"amber",k14:"amber",k15:"green",k16:"green",k17:"green",k18:"amber",k19:"green",k20:"amber",k21:"amber",k22:"green",k23:"green",k24:"green" },
  brakes:    { k01:"green",k02:"green",k03:"amber",k04:"amber",k05:"amber",k06:"green",k07:"green",k08:"red",  k09:"amber",k10:"amber",k11:"green",k12:"amber",k13:"green",k14:"green",k15:"red",  k16:"red",  k17:"red",  k18:"green",k19:"amber",k20:"green",k21:"green",k22:"amber",k23:"amber",k24:"red"   },
  service:   { k01:"green",k02:"green",k03:"green",k04:"green",k05:"green",k06:"green",k07:"green",k08:"green",k09:"green",k10:"green",k11:"green",k12:"green",k13:"green",k14:"green",k15:"amber",k16:"amber",k17:"green",k18:"green",k19:"green",k20:"green",k21:"green",k22:"green",k23:"green",k24:"green" },
  accessories:{ k01:"green",k02:"green",k03:"green",k04:"green",k05:"green",k06:"green",k07:"green",k08:"green",k09:"green",k10:"green",k11:"green",k12:"green",k13:"green",k14:"green",k15:"green",k16:"green",k17:"green",k18:"amber",k19:"green",k20:"green",k21:"green",k22:"green",k23:"green",k24:"green" },
};

// ─── WATERFALL STAGES ─────────────────────────────────────────────────────────
const BASE_STAGES = [
  { n:"1", label:"Price Structure\nDefinition",   level:"AG",           color:"#1B3A6B", type:"build",   baseDelta:18 },
  { n:"2", label:"Initial Price\nCreation",        level:"AG",           color:"#1E5C9B", type:"build",   baseDelta:22 },
  { n:"3", label:"Central Price\nAdjustments",     level:"AG",           color:"#0E7490", type:"build",   baseDelta:12 },
  { n:"4", label:"AG → Market\nHandover",          level:"AG",           color:"#DC2626", type:"risk",    baseDelta:-5  },
  { n:"5", label:"Market Price\nDerivation",       level:"Market",       color:"#0369A1", type:"build",   baseDelta:16 },
  { n:"6", label:"Market Price\nChanges",          level:"Market",       color:"#EA580C", type:"risk",    baseDelta:-8  },
  { n:"7", label:"Campaigns &\nSpecial Prices",    level:"Market",       color:"#D97706", type:"risk",    baseDelta:-4  },
  { n:"8", label:"Price Publication\n& Distribution",level:"AG+Market", color:"#16A34A", type:"protect", baseDelta:8   },
  { n:"9", label:"Audit, History\n& Compliance",   level:"AG+Market",   color:"#5B21B6", type:"protect", baseDelta:6   },
];

// Per-product-line delta modifiers (how much each stage delta shifts for that line)
const DELTA_MODS = {
  all:        [0,  0,  0,  0,  0,  0,  0,  0,  0],
  engine:     [-2,-4, -2,  -3, -4, -5, -2,  0,  0],
  body:       [0, -1, -1,  -1, -1, -2, -1,  0,  0],
  electrical: [1,  2,  0,  -4, 1,  -1,  0, -1,  0],
  brakes:     [0, -2,  -3, -2, -2, -5, -1,  0, -1],
  service:    [1,  2,  1,   0,  2,  0,  1,  1,  1],
  accessories:[2,  3,  2,   0,  3,  1,  0,  1,  1],
};

const TL = {
  green: { bg:"#14532D", dot:"#22C55E", border:"#166534", label:"On Target" },
  amber: { bg:"#78350F", dot:"#F59E0B", border:"#92400E", label:"Monitor"   },
  red:   { bg:"#450A0A", dot:"#EF4444", border:"#7F1D1D", label:"At Risk"   },
};
const KPI_TYPE = {
  data: { color:"#3B82F6", label:"Data / Modelling", short:"DATA" },
  mgmt: { color:"#22C55E", label:"Management / Steering", short:"MGMT" },
  ops:  { color:"#F97316", label:"Operational / Integration", short:"OPS" },
};
const STAGE_COLORS = ["#1B3A6B","#1E5C9B","#0E7490","#DC2626","#0369A1","#EA580C","#D97706","#16A34A","#5B21B6"];

export default function BMWPricingDashboard() {
  const [selectedLine, setSelectedLine] = useState("all");
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredKpi, setHoveredKpi] = useState(null);
  const [activeStageFilter, setActiveStageFilter] = useState(null);

  // Compute waterfall for selected product line
  const stages = useMemo(() => {
    const mods = DELTA_MODS[selectedLine];
    let running = 0;
    return BASE_STAGES.map((s, i) => {
      const delta = s.baseDelta + mods[i];
      const start = running;
      const end = running + delta;
      running = end;
      return { ...s, delta, start, end };
    });
  }, [selectedLine]);

  const netTotal = stages[stages.length - 1].end;

  // Traffic data for selected line
  const traffic = TRAFFIC_DATA[selectedLine];

  // Filter KPIs by stage if clicked
  const visibleKpis = activeStageFilter != null
    ? KPIS.filter(k => k.stage === activeStageFilter)
    : KPIS;

  // Score summary
  const counts = Object.values(traffic);
  const greenCount = counts.filter(v => v === "green").length;
  const amberCount = counts.filter(v => v === "amber").length;
  const redCount   = counts.filter(v => v === "red").length;

  // ── Chart geometry ──────────────────────────────────────────────────────────
  const CW = 860, CH = 280;
  const PAD = { top: 40, right: 16, bottom: 90, left: 52 };
  const chartW = CW - PAD.left - PAD.right;
  const chartH = CH - PAD.top - PAD.bottom;
  const minVal = -20, maxVal = 75, range = maxVal - minVal;
  const scaleY = v => PAD.top + chartH - ((v - minVal) / range) * chartH;
  const htOf   = v => (Math.abs(v) / range) * chartH;
  const nSlots = stages.length + 1;
  const slotW  = chartW / (nSlots + 0.4);
  const barGap = slotW * 0.2;
  const barW   = slotW - barGap;
  const barX   = i => PAD.left + barGap / 2 + i * slotW;
  const yTicks = [0, 20, 40, 60];

  const pl = PRODUCT_LINES.find(p => p.id === selectedLine);

  return (
    <div style={{
      background: "#080F17",
      minHeight: "100vh",
      fontFamily: "'Georgia', 'Palatino Linotype', serif",
      color: "#CBD5E1",
      userSelect: "none",
    }}>

      {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ background:"#0D1520", borderBottom:"1px solid #1E3554", padding:"16px 28px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <span style={{ fontSize:10, letterSpacing:4, color:"#3A6FA8", fontFamily:"monospace", textTransform:"uppercase" }}>
              BMW Group · Aftersales Pricing Intelligence
            </span>
            <h1 style={{ margin:"4px 0 0", fontSize:20, fontWeight:700, color:"#E2EAF4", letterSpacing:-0.5 }}>
              Pricing Effectiveness Dashboard
            </h1>
          </div>
          {/* Score pills */}
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {[
              { c:TL.green.dot, v:greenCount, l:"On Target" },
              { c:TL.amber.dot, v:amberCount, l:"Monitor"   },
              { c:TL.red.dot,   v:redCount,   l:"At Risk"   },
            ].map(p => (
              <div key={p.l} style={{ display:"flex", alignItems:"center", gap:6, background:"#111C2A", border:"1px solid #1E3554", borderRadius:6, padding:"5px 12px" }}>
                <div style={{ width:9, height:9, borderRadius:"50%", background:p.c, boxShadow:`0 0 6px ${p.c}` }} />
                <span style={{ fontSize:18, fontWeight:700, color:"#E2EAF4", fontFamily:"monospace" }}>{p.v}</span>
                <span style={{ fontSize:9, color:"#3A6FA8", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:1 }}>{p.l}</span>
              </div>
            ))}
            <div style={{ background:"#0D2644", border:"1px solid #1E5C9B", borderRadius:6, padding:"5px 14px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:700, color:"#60A5FA", fontFamily:"monospace", lineHeight:1 }}>{netTotal}</div>
              <div style={{ fontSize:8, color:"#3A6FA8", fontFamily:"monospace", letterSpacing:1 }}>NET SCORE</div>
            </div>
          </div>
        </div>

        {/* Product line selector */}
        <div style={{ display:"flex", gap:6, marginTop:14, flexWrap:"wrap" }}>
          {PRODUCT_LINES.map(pl => {
            const isActive = selectedLine === pl.id;
            const mod = DELTA_MODS[pl.id];
            const netMod = mod ? mod.reduce((a,b) => a+b, 0) : 0;
            return (
              <button key={pl.id} onClick={() => { setSelectedLine(pl.id); setActiveStageFilter(null); }}
                style={{
                  background: isActive ? "#1B3A6B" : "#0D1B2E",
                  border: `1px solid ${isActive ? "#3B82F6" : "#1E3554"}`,
                  borderRadius: 6,
                  padding: "7px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "all 0.15s",
                  boxShadow: isActive ? "0 0 12px #1B3A6B80" : "none",
                }}>
                <span style={{ fontSize:14, color: isActive ? "#E2EAF4" : "#3A6FA8" }}>{pl.icon}</span>
                <span style={{ fontSize:11, color: isActive ? "#E2EAF4" : "#4A7FA8", fontFamily:"monospace", fontWeight: isActive ? 700 : 400 }}>
                  {pl.short}
                </span>
                {pl.id !== "all" && (
                  <span style={{ fontSize:9, fontFamily:"monospace", color: netMod >= 0 ? "#22C55E" : "#EF4444" }}>
                    {netMod >= 0 ? `+${netMod}` : netMod}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding:"16px 28px" }}>

        {/* ── WATERFALL CHART ───────────────────────────────────────────────── */}
        <div style={{
          background:"#0D1520",
          border:"1px solid #1E3554",
          borderRadius:8,
          padding:"14px 14px 10px",
          marginBottom:16,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div>
              <span style={{ fontSize:12, fontWeight:700, color:"#E2EAF4" }}>
                Pricing Effectiveness Waterfall
              </span>
              <span style={{ fontSize:10, color:"#3A6FA8", marginLeft:10 }}>
                {pl.label} {selectedLine !== "all" && `— adjusted vs. portfolio average`}
              </span>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              {[
                { c:"#2563EB", l:"Build" },
                { c:"#059669", l:"Protect" },
                { c:"#DC2626", l:"At Risk" },
                { c:"#374151", l:"Net Total" },
              ].map(x => (
                <div key={x.l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:10, height:10, background:x.c, borderRadius:2 }} />
                  <span style={{ fontSize:9, color:"#3A6FA8", fontFamily:"monospace" }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Band labels */}
          <div style={{ display:"flex", marginLeft:PAD.left, marginBottom:2, gap:2 }}>
            {[
              { label:"◀  AG (Central)  ▶", spans:3 },
              { label:"◀  Market  ▶",        spans:3 },
              { label:"◀  AG + Market  ▶",  spans:3 },
            ].map((band, bi) => (
              <div key={bi} style={{
                width: band.spans * slotW - 4,
                background:"#111C2A",
                border:"1px solid #1E3554",
                borderRadius:3,
                padding:"2px 0",
                textAlign:"center",
                fontSize:9,
                color:"#3A6FA8",
                fontFamily:"monospace",
                letterSpacing:0.5,
              }}>{band.label}</div>
            ))}
          </div>

          <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} style={{ display:"block" }}>
            {/* Grid */}
            {yTicks.map(tick => {
              const y = scaleY(tick);
              return (
                <g key={tick}>
                  <line x1={PAD.left} x2={CW - PAD.right} y1={y} y2={y}
                    stroke={tick === 0 ? "#2E4A6A" : "#111C2A"} strokeWidth={tick===0?1.5:1}
                    strokeDasharray={tick===0?"":"4,4"} />
                  <text x={PAD.left-8} y={y+4} textAnchor="end"
                    fill="#2E4A6A" fontSize="10" fontFamily="monospace">{tick}</text>
                </g>
              );
            })}

            {/* Connector lines */}
            {stages.map((bar, i) => {
              if (i >= stages.length - 1) return null;
              const cy = scaleY(bar.end);
              return <line key={i} x1={barX(i)+barW} x2={barX(i+1)} y1={cy} y2={cy}
                stroke="#1E3554" strokeWidth={1.5} strokeDasharray="3,2" />;
            })}

            {/* Stage bars */}
            {stages.map((bar, i) => {
              const topV = Math.max(bar.start, bar.end);
              const botV = Math.min(bar.start, bar.end);
              const top  = scaleY(topV);
              const ht   = Math.max(3, htOf(topV - botV));
              const bx   = barX(i);
              const isNeg = bar.delta < 0;
              const isHov = hoveredBar === i;
              const isActiveFilter = activeStageFilter === bar.n * 1;

              const barFill = isActiveFilter ? bar.color :
                bar.type === "build"   ? (isHov ? "#3B82F6" : "#1D4ED8") :
                bar.type === "protect" ? (isHov ? "#10B981" : "#059669") :
                                         (isHov ? "#F87171" : "#B91C1C");

              return (
                <g key={i}
                  style={{ cursor:"pointer" }}
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                  onClick={() => setActiveStageFilter(activeStageFilter === i+1 ? null : i+1)}
                >
                  {/* Glow when active */}
                  {(isHov || isActiveFilter) && (
                    <rect x={bx-3} y={top-3} width={barW+6} height={ht+6}
                      fill={barFill} fillOpacity={0.15} rx={3} />
                  )}
                  <rect x={bx} y={top} width={barW} height={ht}
                    fill={barFill} fillOpacity={isHov||isActiveFilter ? 1 : 0.88} rx={2} />
                  <rect x={bx} y={top} width={barW} height={2}
                    fill="white" fillOpacity={0.2} rx={1} />

                  {/* Delta */}
                  <text x={bx+barW/2} y={isNeg ? top+ht+14 : top-4}
                    textAnchor="middle"
                    fill={isNeg ? "#F87171" : "#93C5FD"}
                    fontSize="11" fontWeight="bold" fontFamily="monospace">
                    {bar.delta>0?`+${bar.delta}`:bar.delta}
                  </text>
                  {/* Running total */}
                  <text x={bx+barW/2} y={isNeg ? top+ht+26 : top-17}
                    textAnchor="middle" fill="#2E4A6A" fontSize="9" fontFamily="monospace">
                    ={bar.end}
                  </text>

                  {/* Label box */}
                  <rect x={bx} y={CH-PAD.bottom+6} width={barW} height={44}
                    fill={isActiveFilter ? bar.color : "#111C2A"}
                    stroke={isActiveFilter ? bar.color : "#1E3554"}
                    strokeWidth={isActiveFilter ? 0 : 1} rx={3} />
                  <text x={bx+barW/2} y={CH-PAD.bottom+22}
                    textAnchor="middle" fill={isActiveFilter?"white":"#7AA5C8"}
                    fontSize="9" fontWeight="bold" fontFamily="monospace">{bar.n}</text>
                  {bar.label.split("\n").map((line, li) => (
                    <text key={li} x={bx+barW/2} y={CH-PAD.bottom+33+li*11}
                      textAnchor="middle"
                      fill={isActiveFilter?"#E2EAF4":"#4A6FA8"}
                      fontSize="7.5" fontFamily="'Georgia',serif">{line}</text>
                  ))}
                </g>
              );
            })}

            {/* NET TOTAL bar */}
            {(() => {
              const i = stages.length;
              const bx = barX(i);
              const top = scaleY(netTotal);
              const ht  = htOf(netTotal);
              const isHov = hoveredBar === i;
              return (
                <g style={{ cursor:"pointer" }}
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}>
                  {isHov && <rect x={bx-3} y={top-3} width={barW+6} height={ht+6}
                    fill="#6B7280" fillOpacity={0.2} rx={3} />}
                  <rect x={bx} y={top} width={barW} height={ht}
                    fill={isHov ? "#6B7280" : "#374151"} rx={2} />
                  <rect x={bx} y={top} width={barW} height={2}
                    fill="white" fillOpacity={0.2} rx={1} />
                  <text x={bx+barW/2} y={top-4}
                    textAnchor="middle" fill="#9CA3AF"
                    fontSize="12" fontWeight="bold" fontFamily="monospace">{netTotal}</text>
                  <rect x={bx} y={CH-PAD.bottom+6} width={barW} height={44}
                    fill="#1F2937" stroke="#374151" strokeWidth={1} rx={3} />
                  <text x={bx+barW/2} y={CH-PAD.bottom+22}
                    textAnchor="middle" fill="#9CA3AF"
                    fontSize="9" fontWeight="bold" fontFamily="monospace">NET</text>
                  <text x={bx+barW/2} y={CH-PAD.bottom+34}
                    textAnchor="middle" fill="#6B7280" fontSize="8" fontFamily="monospace">TOTAL</text>
                </g>
              );
            })()}
          </svg>

          {activeStageFilter && (
            <div style={{ marginTop:4, textAlign:"center" }}>
              <span style={{ fontSize:10, color:"#3A6FA8", fontFamily:"monospace" }}>
                Showing KPIs for Stage {activeStageFilter} only ·{" "}
              </span>
              <span style={{ fontSize:10, color:"#60A5FA", fontFamily:"monospace", cursor:"pointer", textDecoration:"underline" }}
                onClick={() => setActiveStageFilter(null)}>
                Show all KPIs
              </span>
            </div>
          )}
        </div>

        {/* ── KPI MATRIX ────────────────────────────────────────────────────── */}
        <div style={{
          background:"#0D1520",
          border:"1px solid #1E3554",
          borderRadius:8,
          overflow:"hidden",
        }}>
          {/* Matrix header */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"10px 16px 8px",
            borderBottom:"1px solid #1E3554",
            background:"#0A1220",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#E2EAF4" }}>KPI Matrix</span>
              <span style={{ fontSize:10, color:"#3A6FA8" }}>
                {activeStageFilter ? `Stage ${activeStageFilter} · ${visibleKpis.length} KPIs` : `All 9 Stages · ${KPIS.length} KPIs`}
              </span>
            </div>
            <div style={{ display:"flex", gap:14 }}>
              {Object.entries(KPI_TYPE).map(([k,v]) => (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:v.color }} />
                  <span style={{ fontSize:9, color:"#3A6FA8", fontFamily:"monospace" }}>{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky column header row: product lines */}
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", tableLayout:"fixed" }}>
              <colgroup>
                <col style={{ width:42 }} /> {/* Stage # */}
                <col style={{ width:170 }} /> {/* KPI name */}
                {PRODUCT_LINES.map(pl => <col key={pl.id} style={{ width:90 }} />)}
              </colgroup>
              <thead>
                <tr style={{ background:"#0A1220" }}>
                  <th style={{ padding:"8px 6px", fontSize:9, color:"#3A6FA8", fontFamily:"monospace", textAlign:"center", borderBottom:"1px solid #1E3554", borderRight:"1px solid #1E3554" }}>
                    STG
                  </th>
                  <th style={{ padding:"8px 10px", fontSize:9, color:"#3A6FA8", fontFamily:"monospace", textAlign:"left", borderBottom:"1px solid #1E3554", borderRight:"1px solid #1E3554" }}>
                    KPI  ·  FORMULA
                  </th>
                  {PRODUCT_LINES.map(pl => (
                    <th key={pl.id} style={{
                      padding:"7px 4px",
                      borderBottom:"1px solid #1E3554",
                      borderRight:"1px solid #1E3554",
                      cursor:"pointer",
                      background: selectedLine === pl.id ? "#111C2A" : "transparent",
                      transition:"background 0.15s",
                    }}
                      onClick={() => { setSelectedLine(pl.id); setActiveStageFilter(null); }}
                    >
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:13, marginBottom:2, color: selectedLine===pl.id ? "#E2EAF4" : "#3A6FA8" }}>
                          {pl.icon}
                        </div>
                        <div style={{ fontSize:8, fontFamily:"monospace", fontWeight:700, color: selectedLine===pl.id ? "#60A5FA" : "#3A6FA8", letterSpacing:0.5 }}>
                          {pl.short}
                        </div>
                        {selectedLine === pl.id && (
                          <div style={{ width:16, height:2, background:"#3B82F6", borderRadius:1, margin:"3px auto 0" }} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleKpis.map((kpi, ri) => {
                  const stageColor = STAGE_COLORS[kpi.stage - 1];
                  const isHov = hoveredKpi === kpi.id;
                  const typeInfo = KPI_TYPE[kpi.type];

                  // Stage label for first KPI of each stage
                  const isFirstInStage = ri === 0 || visibleKpis[ri-1].stage !== kpi.stage;
                  const stageCount = visibleKpis.filter(k => k.stage === kpi.stage).length;

                  return (
                    <tr key={kpi.id}
                      onMouseEnter={() => setHoveredKpi(kpi.id)}
                      onMouseLeave={() => setHoveredKpi(null)}
                      style={{
                        background: isHov ? "#111C2A" : ri%2===0 ? "#0D1520" : "#0A1220",
                        transition:"background 0.1s",
                        cursor:"default",
                      }}
                    >
                      {/* Stage number */}
                      <td style={{
                        borderBottom:"1px solid #111C2A",
                        borderRight:"1px solid #1E3554",
                        textAlign:"center",
                        padding:"6px 4px",
                        verticalAlign:"middle",
                      }}>
                        {isFirstInStage && (
                          <div
                            style={{
                              background: stageColor,
                              borderRadius:4,
                              padding:"3px 0",
                              cursor:"pointer",
                              fontSize:10,
                              fontWeight:700,
                              color:"white",
                              fontFamily:"monospace",
                              boxShadow: activeStageFilter===kpi.stage ? `0 0 8px ${stageColor}` : "none",
                            }}
                            onClick={() => setActiveStageFilter(activeStageFilter===kpi.stage ? null : kpi.stage)}
                            title={`Filter to Stage ${kpi.stage}`}
                          >
                            {kpi.stage}
                          </div>
                        )}
                      </td>

                      {/* KPI name + formula */}
                      <td style={{
                        padding:"7px 10px",
                        borderBottom:"1px solid #111C2A",
                        borderRight:"1px solid #1E3554",
                        verticalAlign:"middle",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:typeInfo.color, flexShrink:0, boxShadow:`0 0 4px ${typeInfo.color}80` }} />
                          <div>
                            <div style={{ fontSize:11, color:"#C8D8EC", fontWeight:700, lineHeight:1.3 }}>{kpi.short}</div>
                            {isHov && (
                              <div style={{ fontSize:9, color:"#2E4A6A", fontFamily:"monospace", marginTop:1, lineHeight:1.4 }}>
                                {kpi.formula}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Traffic lights per product line */}
                      {PRODUCT_LINES.map(pl => {
                        const status = TRAFFIC_DATA[pl.id][kpi.id];
                        const tl = TL[status];
                        const isSelectedCol = selectedLine === pl.id;

                        return (
                          <td key={pl.id} style={{
                            padding:"6px 8px",
                            borderBottom:"1px solid #111C2A",
                            borderRight:"1px solid #1E3554",
                            textAlign:"center",
                            verticalAlign:"middle",
                            background: isSelectedCol
                              ? (ri%2===0 ? "#0F1E30" : "#0C1928")
                              : "transparent",
                          }}>
                            <div style={{
                              display:"inline-flex",
                              alignItems:"center",
                              justifyContent:"center",
                              width:28,
                              height:20,
                              background: tl.bg,
                              border:`1px solid ${tl.border}`,
                              borderRadius:4,
                              gap:4,
                              transition:"transform 0.1s",
                              transform: (isHov && isSelectedCol) ? "scale(1.15)" : "scale(1)",
                            }}>
                              <div style={{
                                width: isSelectedCol ? 9 : 7,
                                height: isSelectedCol ? 9 : 7,
                                borderRadius:"50%",
                                background: tl.dot,
                                boxShadow: isSelectedCol ? `0 0 6px ${tl.dot}` : `0 0 3px ${tl.dot}60`,
                                transition:"all 0.15s",
                              }} />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Matrix footer */}
          <div style={{
            padding:"8px 16px",
            borderTop:"1px solid #1E3554",
            background:"#0A1220",
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
          }}>
            <span style={{ fontSize:9, color:"#2E4A6A", fontFamily:"monospace" }}>
              Click stage numbers to filter · Click product line headers to change view · Hover KPI rows to see formula
            </span>
            <div style={{ display:"flex", gap:12 }}>
              {Object.entries(TL).map(([k,v]) => (
                <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:v.dot, boxShadow:`0 0 4px ${v.dot}` }} />
                  <span style={{ fontSize:9, color:"#2E4A6A", fontFamily:"monospace" }}>{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

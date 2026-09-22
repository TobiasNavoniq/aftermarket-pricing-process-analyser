import { useState, useMemo } from "react";

// BMW PRODUCT LINES
const PRODUCT_LINES = [
  { id: "all",      label: "All Product Lines",  short: "ALL",   icon: "◈" },
  { id: "engine",   label: "Engine & Drivetrain", short: "ENG",   icon: "⚙" },
  { id: "body",     label: "Body & Exterior",     short: "BOD",   icon: "◻" },
  { id: "electrical",label: "Electrical & Electronics", short: "ELE", icon: "⚡" },
  { id: "brakes",   label: "Brakes & Suspension", short: "BRK",   icon: "◎" },
  { id: "service",  label: "Service & Wear Parts",short: "SVC",   icon: "↻" },
  { id: "accessories",label:"Accessories & Lifestyle", short: "ACC", icon: "✦" },
];

// 24 KPIs mapped to 9 stages
const KPIS = [
  { id:"k01", stage:1, label:"Family Code Coverage", short:"FC Coverage", type:"data", formula:"Parts in FC ÷ Total × 100" },
  { id:"k02", stage:1, label:"Segmentation Accuracy", short:"Seg. Accuracy", type:"data", formula:"Correctly segmented ÷ Sample" },
  { id:"k03", stage:1, label:"Approval Compliance", short:"Approval Rate", type:"mgmt", formula:"Approved ÷ Submitted changes" },
  { id:"k04", stage:2, label:"Gross Profit %", short:"GP%", type:"data", formula:"(RET − ExFactory) ÷ RET × 100" },
  { id:"k05", stage:2, label:"Contribution Margin %", short:"CM%", type:"data", formula:"(RET − VarCost) ÷ RET × 100" },
  { id:"k06", stage:2, label:"New Part Cycle Time", short:"Cycle Time", type:"ops", formula:"Avg sec: release → valid price" },
  { id:"k07", stage:2, label:"Upload Error Rate", short:"Upload Errors", type:"ops", formula:"Rejected ÷ Uploaded × 100" },
  { id:"k08", stage:3, label:"Lump Sum Pass-Through", short:"Lump Sum PT", type:"mgmt", formula:"Markets applied ÷ Notified" },
  { id:"k09", stage:3, label:"Profit Violation Rate", short:"P. Violations", type:"data", formula:"Below-min CM parts ÷ Total" },
  { id:"k10", stage:4, label:"Market Notification Time", short:"Notif. Time", type:"ops", formula:"Hrs: AG price set → worklist" },
  { id:"k11", stage:4, label:"Transfer Accuracy", short:"Transfer Acc.", type:"ops", formula:"Correct transfers ÷ Total" },
  { id:"k12", stage:5, label:"NSC Gross Profit Floor", short:"NSC GP Floor", type:"data", formula:"(MRP − MDN) ÷ MRP × 100" },
  { id:"k13", stage:5, label:"FX Rate Lag Impact", short:"FX Lag", type:"data", formula:"CM loss from stale rates" },
  { id:"k14", stage:5, label:"Rounding Compliance", short:"Rounding", type:"ops", formula:"Correct rounded ÷ Total" },
  { id:"k15", stage:6, label:"Competitive Price Index", short:"CPI", type:"data", formula:"BMW MRP ÷ Best IAM × 100" },
  { id:"k16", stage:6, label:"Manual Price Rate", short:"Manual Rate", type:"mgmt", formula:"Manual priced ÷ Total market" },
  { id:"k17", stage:6, label:"Approval Cycle Time", short:"Approval Time", type:"mgmt", formula:"Days: trigger → approved live" },
  { id:"k18", stage:7, label:"Campaign Restoration", short:"Restoration", type:"ops", formula:"Auto-restored ÷ Expired" },
  { id:"k19", stage:7, label:"Customer Margin Compliance", short:"Cust. Margin", type:"mgmt", formula:"Special prices > min margin ÷ Total" },
  { id:"k20", stage:8, label:"ATLAS Transfer Success", short:"ATLAS Transfer", type:"ops", formula:"Success ÷ Total price records" },
  { id:"k21", stage:8, label:"Price Activation Time", short:"Activation", type:"ops", formula:"Days: approval → market live" },
  { id:"k22", stage:9, label:"Audit Trail Completeness", short:"Audit Trail", type:"mgmt", formula:"Full log ÷ All changes × 100" },
  { id:"k23", stage:9, label:"Aftersales EBIT Margin", short:"EBIT Margin", type:"data", formula:"Aftersales EBIT ÷ Revenue × 100" },
  { id:"k24", stage:9, label:"IAM Capture Rate", short:"IAM Capture", type:"data", formula:"BMW genuine ÷ Total repair spend" },
];

// BUSINESS VALUE DRIVERS (New)
const VALUE_DRIVERS = [
  { id: "vd01", category: "EFFICIENCY", metric: "Inventory Turns", target: "4.2x", benchmark: "3.8-4.5x" },
  { id: "vd02", category: "EFFICIENCY", metric: "GMROII", target: "2.8x", benchmark: "2.5-3.2x" },
  { id: "vd03", category: "EFFICIENCY", metric: "Service Level", target: "97%", benchmark: "95-98%" },
  { id: "vd04", category: "COST REDUCTION", metric: "Unit Cost ↓", target: "2.1%", benchmark: "1.5-3.0%" },
  { id: "vd05", category: "COST REDUCTION", metric: "Logistics Cost ↓", target: "3.0%", benchmark: "2.0-4.0%" },
  { id: "vd06", category: "COST AVOIDANCE", metric: "Obsolescence %", target: "3.2%", benchmark: "2.5-5.0%" },
  { id: "vd07", category: "COST AVOIDANCE", metric: "Slow Movers %", target: "11%", benchmark: "8-15%" },
  { id: "vd08", category: "VALUE OPTIMIZATION", metric: "Price Realization", target: "91%", benchmark: "88-94%" },
  { id: "vd09", category: "VALUE OPTIMIZATION", metric: "PVCR", target: "0.87", benchmark: "0.75-0.95" },
];

const TRAFFIC_DATA = {
  all:       { k01:"green",k02:"green",k03:"green",k04:"green",k05:"amber",k06:"green",k07:"green",k08:"amber",k09:"amber",k10:"amber",k11:"green",k12:"green",k13:"amber",k14:"green",k15:"amber",k16:"amber",k17:"green",k18:"green",k19:"green",k20:"green",k21:"green",k22:"green",k23:"green",k24:"amber" },
  engine:    { k01:"green",k02:"amber",k03:"green",k04:"red",  k05:"red",  k06:"green",k07:"amber",k08:"green",k09:"red",  k10:"green",k11:"green",k12:"red",  k13:"red",  k14:"green",k15:"red",  k16:"red",  k17:"amber",k18:"green",k19:"amber",k20:"green",k21:"green",k22:"green",k23:"red",  k24:"red"   },
  body:      { k01:"green",k02:"green",k03:"green",k04:"amber",k05:"amber",k06:"green",k07:"green",k08:"green",k09:"amber",k10:"amber",k11:"green",k12:"amber",k13:"amber",k14:"green",k15:"amber",k16:"amber",k17:"green",k18:"amber",k19:"green",k20:"green",k21:"amber",k22:"green",k23:"amber",k24:"amber" },
  electrical:{ k01:"amber",k02:"amber",k03:"green",k04:"green",k05:"green",k06:"amber",k07:"red",  k08:"amber",k09:"green",k10:"red",  k11:"amber",k12:"green",k13:"amber",k14:"amber",k15:"green",k16:"green",k17:"green",k18:"amber",k19:"green",k20:"amber",k21:"amber",k22:"green",k23:"green",k24:"green" },
  brakes:    { k01:"green",k02:"green",k03:"amber",k04:"amber",k05:"amber",k06:"green",k07:"green",k08:"red",  k09:"amber",k10:"amber",k11:"green",k12:"amber",k13:"green",k14:"green",k15:"red",  k16:"red",  k17:"red",  k18:"green",k19:"amber",k20:"green",k21:"green",k22:"amber",k23:"amber",k24:"red"   },
  service:   { k01:"green",k02:"green",k03:"green",k04:"green",k05:"green",k06:"green",k07:"green",k08:"green",k09:"green",k10:"green",k11:"green",k12:"green",k13:"green",k14:"green",k15:"amber",k16:"amber",k17:"green",k18:"green",k19:"green",k20:"green",k21:"green",k22:"green",k23:"green",k24:"green" },
  accessories:{ k01:"green",k02:"green",k03:"green",k04:"green",k05:"green",k06:"green",k07:"green",k08:"green",k09:"green",k10:"green",k11:"green",k12:"green",k13:"green",k14:"green",k15:"green",k16:"green",k17:"green",k18:"amber",k19:"green",k20:"green",k21:"green",k22:"green",k23:"green",k24:"green" },
};

const BASE_STAGES = [
  { n:"1", label:"Price Structure\nDefinition", level:"AG", color:"#1B3A6B", type:"build", baseDelta:18 },
  { n:"2", label:"Initial Price\nCreation", level:"AG", color:"#1E5C9B", type:"build", baseDelta:22 },
  { n:"3", label:"Central Price\nAdjustments", level:"AG", color:"#0E7490", type:"build", baseDelta:12 },
  { n:"4", label:"AG → Market\nHandover", level:"AG", color:"#DC2626", type:"risk", baseDelta:-5 },
  { n:"5", label:"Market Price\nDerivation", level:"Market", color:"#0369A1", type:"build", baseDelta:16 },
  { n:"6", label:"Market Price\nChanges", level:"Market", color:"#EA580C", type:"risk", baseDelta:-8 },
  { n:"7", label:"Campaigns &\nSpecial Prices", level:"Market", color:"#D97706", type:"risk", baseDelta:-4 },
  { n:"8", label:"Price Publication\n& Distribution", level:"AG+Market", color:"#16A34A", type:"protect", baseDelta:8 },
  { n:"9", label:"Audit, History\n& Compliance", level:"AG+Market", color:"#5B21B6", type:"protect", baseDelta:6 },
];

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
  amber: { bg:"#78350F", dot:"#F59E0B", border:"#92400E", label:"Monitor" },
  red:   { bg:"#450A0A", dot:"#EF4444", border:"#7F1D1D", label:"At Risk" },
};

const KPI_TYPE = {
  data: { color:"#3B82F6", label:"Data / Modelling", short:"DATA" },
  mgmt: { color:"#22C55E", label:"Management / Steering", short:"MGMT" },
  ops:  { color:"#F97316", label:"Operational / Integration", short:"OPS" },
};

const CATEGORY_COLORS = {
  "EFFICIENCY": "#3B82F6",
  "COST REDUCTION": "#A9D08E",
  "COST AVOIDANCE": "#FFD966",
  "VALUE OPTIMIZATION": "#F4B084",
};

export default function BMWPricingDashboard() {
  const [selectedLine, setSelectedLine] = useState("all");
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredKpi, setHoveredKpi] = useState(null);
  const [activeStageFilter, setActiveStageFilter] = useState(null);
  const [showValueDrivers, setShowValueDrivers] = useState(false);

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
  const traffic = TRAFFIC_DATA[selectedLine];
  const visibleKpis = activeStageFilter != null ? KPIS.filter(k => k.stage === activeStageFilter) : KPIS;

  const minVal = Math.min(0, ...stages.map(s => s.start), ...stages.map(s => s.end));
  const maxVal = Math.max(...stages.map(s => s.start), ...stages.map(s => s.end));
  const range = maxVal - minVal || 1;
  const chartHeight = 260;
  const barWidth = 60;
  const gap = 12;
  const totalWidth = stages.length * (barWidth + gap) + 100;
  const toY = (val) => chartHeight - ((val - minVal) / range) * (chartHeight - 40);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg, #050A14 0%, #0D1520 100%)",
      padding:"24px",
      fontFamily:"system-ui, -apple-system, sans-serif",
      color:"#C8D8EC",
    }}>
      <div style={{ maxWidth:1600, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:28, fontWeight:800, margin:0, color:"white", letterSpacing:"-0.5px" }}>
            BMW Pricing Excellence Dashboard
          </h1>
          <p style={{ fontSize:13, color:"#4A6B8A", marginTop:6, marginBottom:0 }}>
            PVCR-Driven Value Performance · €5B Revenue · Target PVCR: 0.93 (+€150M EBIT Opportunity)
          </p>
        </div>

        {/* PVCR Summary Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:20 }}>
          <div style={{ background:"#0A1220", border:"1px solid #1E3554", borderRadius:8, padding:16 }}>
            <div style={{ fontSize:11, color:"#4A6B8A", marginBottom:6 }}>Current PVCR</div>
            <div style={{ fontSize:28, fontWeight:700, color:"#F59E0B" }}>0.87</div>
            <div style={{ fontSize:10, color:"#4A6B8A", marginTop:4 }}>€300M leakage</div>
          </div>
          <div style={{ background:"#0A1220", border:"1px solid #1E3554", borderRadius:8, padding:16 }}>
            <div style={{ fontSize:11, color:"#4A6B8A", marginBottom:6 }}>Target PVCR</div>
            <div style={{ fontSize:28, fontWeight:700, color:"#22C55E" }}>0.93</div>
            <div style={{ fontSize:10, color:"#4A6B8A", marginTop:4 }}>+6 points improvement</div>
          </div>
          <div style={{ background:"#0A1220", border:"1px solid #1E3554", borderRadius:8, padding:16 }}>
            <div style={{ fontSize:11, color:"#4A6B8A", marginBottom:6 }}>EBIT Opportunity</div>
            <div style={{ fontSize:28, fontWeight:700, color:"#0EA5E9" }}>€150M</div>
            <div style={{ fontSize:10, color:"#4A6B8A", marginTop:4 }}>50% leakage recovery</div>
          </div>
          <div style={{ background:"#0A1220", border:"1px solid #1E3554", borderRadius:8, padding:16 }}>
            <div style={{ fontSize:11, color:"#4A6B8A", marginBottom:6 }}>Top Lever</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#EF4444" }}>Discount</div>
            <div style={{ fontSize:10, color:"#4A6B8A", marginTop:4 }}>-3pp = €150M leakage</div>
          </div>
        </div>

        {/* Toggle & Product Selector */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {PRODUCT_LINES.map(pl => {
              const isActive = selectedLine === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => setSelectedLine(pl.id)}
                  style={{
                    background: isActive ? "linear-gradient(135deg, #1E5C9B 0%, #0E7490 100%)" : "#0D1520",
                    border: isActive ? "2px solid #0EA5E9" : "2px solid #1E3554",
                    borderRadius:8,
                    padding:"10px 18px",
                    color: isActive ? "white" : "#4A6B8A",
                    fontSize:12,
                    fontWeight: isActive ? 700 : 600,
                    cursor:"pointer",
                    transition:"all 0.2s",
                    boxShadow: isActive ? "0 4px 12px rgba(14, 165, 233, 0.3)" : "none",
                    display:"flex",
                    alignItems:"center",
                    gap:8,
                  }}
                >
                  <span style={{ fontSize:16 }}>{pl.icon}</span>
                  <span>{pl.short}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowValueDrivers(!showValueDrivers)}
            style={{
              background: showValueDrivers ? "#1E5C9B" : "#0D1520",
              border:"2px solid #1E3554",
              borderRadius:8,
              padding:"10px 18px",
              color: showValueDrivers ? "white" : "#4A6B8A",
              fontSize:12,
              fontWeight:600,
              cursor:"pointer",
              transition:"all 0.2s",
            }}
          >
            {showValueDrivers ? "Hide" : "Show"} Value Drivers
          </button>
        </div>

        {/* Value Drivers Panel */}
        {showValueDrivers && (
          <div style={{
            background:"#0A1220",
            borderRadius:12,
            padding:20,
            border:"1px solid #1E3554",
            marginBottom:24,
          }}>
            <h2 style={{ fontSize:18, fontWeight:700, margin:"0 0 16px 0", color:"white" }}>
              Business Value Drivers & Benchmarks
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }}>
              {VALUE_DRIVERS.map(vd => (
                <div key={vd.id} style={{
                  background:"#0D1520",
                  border:"1px solid #1E3554",
                  borderRadius:8,
                  padding:14,
                  borderLeft:`4px solid ${CATEGORY_COLORS[vd.category]}`,
                }}>
                  <div style={{ fontSize:9, color:"#4A6B8A", fontWeight:700, marginBottom:6 }}>
                    {vd.category}
                  </div>
                  <div style={{ fontSize:13, color:"#C8D8EC", fontWeight:700, marginBottom:8 }}>
                    {vd.metric}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                    <span style={{ color:"#4A6B8A" }}>Target:</span>
                    <span style={{ color:"#22C55E", fontWeight:700 }}>{vd.target}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginTop:4 }}>
                    <span style={{ color:"#4A6B8A" }}>Benchmark:</span>
                    <span style={{ color:"#4A6B8A" }}>{vd.benchmark}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Waterfall Chart */}
        <div style={{
          background:"#0A1220",
          borderRadius:12,
          padding:24,
          border:"1px solid #1E3554",
          marginBottom:24,
        }}>
          <div style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            marginBottom:20,
          }}>
            <h2 style={{ fontSize:18, fontWeight:700, margin:0, color:"white" }}>
              Pricing Value Waterfall — {PRODUCT_LINES.find(p => p.id === selectedLine)?.label}
            </h2>
            <div style={{
              background:"#0D1520",
              border:"1px solid #1E3554",
              borderRadius:6,
              padding:"8px 14px",
              fontSize:11,
              fontWeight:700,
              color: netTotal >= 0 ? "#22C55E" : "#EF4444",
            }}>
              Net Impact: {netTotal > 0 ? "+" : ""}{netTotal}% · PVCR Impact
            </div>
          </div>

          <div style={{ overflowX:"auto", overflowY:"hidden" }}>
            <svg width={totalWidth} height={chartHeight} style={{ display:"block" }}>
              <line x1={0} y1={toY(0)} x2={totalWidth} y2={toY(0)} stroke="#1E3554" strokeWidth={1} strokeDasharray="4 4" />
              <text x={8} y={toY(0) - 6} fill="#2E4A6A" fontSize={10} fontFamily="monospace">Baseline</text>

              {stages.map((s, i) => {
                const x = i * (barWidth + gap) + 50;
                const yStart = toY(s.start);
                const yEnd = toY(s.end);
                const barHeight = Math.abs(yEnd - yStart);
                const barY = Math.min(yStart, yEnd);
                const isPos = s.delta >= 0;
                const isHovered = hoveredBar === i;

                return (
                  <g key={i}>
                    {i > 0 && (
                      <line x1={x - gap} y1={toY(stages[i - 1].end)} x2={x} y2={yStart} stroke="#2E4A6A" strokeWidth={1.5} strokeDasharray="3 3" />
                    )}
                    <rect
                      x={x} y={barY} width={barWidth} height={Math.max(barHeight, 2)}
                      fill={s.color}
                      stroke={isHovered ? "white" : "none"}
                      strokeWidth={isHovered ? 2 : 0}
                      style={{ cursor:"pointer", transition:"all 0.15s", opacity: isHovered ? 1 : 0.9 }}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                    <text x={x + barWidth / 2} y={isPos ? barY - 8 : barY + barHeight + 16}
                      fill={isHovered ? "white" : "#C8D8EC"} fontSize={11} fontWeight={700}
                      textAnchor="middle" fontFamily="monospace">
                      {s.delta > 0 ? "+" : ""}{s.delta}%
                    </text>
                    <text x={x + barWidth / 2} y={barY + barHeight / 2 + 5}
                      fill="white" fontSize={14} fontWeight={800} textAnchor="middle">
                      {s.n}
                    </text>
                    <text x={x + barWidth / 2} y={chartHeight - 8}
                      fill={isHovered ? "#C8D8EC" : "#4A6B8A"} fontSize={9} textAnchor="middle">
                      {s.label.split("\n").map((line, li) => (
                        <tspan key={li} x={x + barWidth / 2} dy={li === 0 ? 0 : 11}>{line}</tspan>
                      ))}
                    </text>
                    <rect x={x + barWidth / 2 - 22} y={barY + barHeight / 2 + 14}
                      width={44} height={14} rx={3} fill="#0D1520" stroke={s.color} strokeWidth={1} />
                    <text x={x + barWidth / 2} y={barY + barHeight / 2 + 24}
                      fill={s.color} fontSize={8} fontWeight={700} textAnchor="middle">
                      {s.level}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{
            display:"flex",
            gap:24,
            marginTop:20,
            paddingTop:16,
            borderTop:"1px solid #1E3554",
            fontSize:10,
            color:"#4A6B8A",
            flexWrap:"wrap",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:12, height:12, background:"#1E5C9B", borderRadius:2 }} />
              <span>Value Building</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:12, height:12, background:"#DC2626", borderRadius:2 }} />
              <span>Risk / Leakage (Focus Areas)</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:12, height:12, background:"#16A34A", borderRadius:2 }} />
              <span>Protection</span>
            </div>
          </div>
        </div>

        {/* KPI Matrix */}
        <div style={{
          background:"#0A1220",
          borderRadius:12,
          border:"1px solid #1E3554",
          overflow:"hidden",
        }}>
          <div style={{
            padding:"16px 20px",
            borderBottom:"1px solid #1E3554",
            background:"linear-gradient(135deg, #0D1520 0%, #0A1220 100%)",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 style={{ fontSize:18, fontWeight:700, margin:0, color:"white" }}>
                KPI Performance Matrix
                {activeStageFilter && (
                  <span style={{
                    marginLeft:12,
                    fontSize:11,
                    fontWeight:600,
                    color:"#0EA5E9",
                    background:"#0D1520",
                    padding:"4px 10px",
                    borderRadius:4,
                    border:"1px solid #1E3554",
                  }}>
                    Stage {activeStageFilter} Only
                  </span>
                )}
              </h2>
              <div style={{ display:"flex", gap:16 }}>
                {Object.entries(KPI_TYPE).map(([k, v]) => (
                  <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:v.color, boxShadow:`0 0 6px ${v.color}80` }} />
                    <span style={{ fontSize:10, color:"#4A6B8A", fontFamily:"monospace" }}>{v.short}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:10, fontFamily:"system-ui" }}>
              <thead>
                <tr style={{ background:"#0D1520" }}>
                  <th style={{
                    padding:"10px 8px",
                    borderBottom:"2px solid #1E3554",
                    borderRight:"1px solid #1E3554",
                    textAlign:"center",
                    color:"#4A6B8A",
                    fontWeight:700,
                    fontSize:9,
                    width:40,
                  }}>Stage</th>
                  <th style={{
                    padding:"10px 12px",
                    borderBottom:"2px solid #1E3554",
                    borderRight:"1px solid #1E3554",
                    textAlign:"left",
                    color:"#4A6B8A",
                    fontWeight:700,
                    fontSize:9,
                    minWidth:200,
                  }}>KPI</th>
                  {PRODUCT_LINES.map(pl => {
                    const isSelected = selectedLine === pl.id;
                    return (
                      <th
                        key={pl.id}
                        onClick={() => setSelectedLine(pl.id)}
                        style={{
                          padding:"10px 8px",
                          borderBottom:"2px solid #1E3554",
                          borderRight:"1px solid #1E3554",
                          textAlign:"center",
                          color: isSelected ? "#0EA5E9" : "#4A6B8A",
                          fontWeight:700,
                          fontSize:9,
                          cursor:"pointer",
                          background: isSelected ? "#0D1E30" : "transparent",
                          transition:"all 0.15s",
                          userSelect:"none",
                          minWidth:60,
                        }}
                      >
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                          <span style={{ fontSize:14 }}>{pl.icon}</span>
                          <span>{pl.short}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleKpis.map((kpi, ri) => {
                  const typeInfo = KPI_TYPE[kpi.type];
                  const isHov = hoveredKpi === kpi.id;
                  const isFirstInStage = ri === 0 || visibleKpis[ri - 1].stage !== kpi.stage;
                  const stageColor = BASE_STAGES[kpi.stage - 1]?.color || "#4A6B8A";

                  return (
                    <tr
                      key={kpi.id}
                      onMouseEnter={() => setHoveredKpi(kpi.id)}
                      onMouseLeave={() => setHoveredKpi(null)}
                      style={{
                        background: isHov ? "#111C2A" : ri%2===0 ? "#0D1520" : "#0A1220",
                        transition:"background 0.1s",
                        cursor:"default",
                      }}
                    >
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
                            background: isSelectedCol ? (ri%2===0 ? "#0F1E30" : "#0C1928") : "transparent",
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

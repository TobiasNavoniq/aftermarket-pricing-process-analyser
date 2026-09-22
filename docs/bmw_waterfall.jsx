import { useState } from "react";

const STAGES = [
  {
    n: "1", label: "Price Structure\nDefinition", level: "AG",
    delta: 18, type: "build",
    color: "#1B3A6B", lightColor: "#EEF4FF",
    kpis: ["Family Code Coverage Rate", "Willingness-to-Pay Index", "Segmentation Accuracy Score"],
    keyMetric: "FC Coverage: 100% target",
    anchor: "Defines the ceiling — correct segmentation determines maximum capturable value across the portfolio",
    formula: "RET = f(Family Code × Segment × Competition)",
  },
  {
    n: "2", label: "Initial Price\nCreation", level: "AG",
    delta: 22, type: "build",
    color: "#1E5C9B", lightColor: "#EEF6FF",
    kpis: ["Gross Profit % > 30%", "Contribution Margin %", "New Part Cycle Time < 30s"],
    keyMetric: "GP%: >30% | CM%: primary KPI",
    anchor: "Largest single value-creation step — sets RET, BD, DN for ~20,000 new parts per year",
    formula: "GP% = (RET − Ex-Factory) ÷ RET × 100",
  },
  {
    n: "3", label: "Central Price\nAdjustments", level: "AG",
    delta: 12, type: "build",
    color: "#21A0AA", lightColor: "#EDFAFA",
    kpis: ["Lump Sum Pass-Through Rate", "Profit Threshold Violation: 0%", "Inflation Coverage %"],
    keyMetric: "Pass-Through: 100% | Violations: 0%",
    anchor: "Protects real margin against inflation — annual lump sum must pass through all 100 markets fully",
    formula: "Real Price Erosion = Inflation % − Lump Sum %",
  },
  {
    n: "4", label: "AG → Market\nHandover", level: "AG",
    delta: -5, type: "risk",
    color: "#DC2626", lightColor: "#FEF2F2",
    kpis: ["Market Notification Lead Time", "Worklist Population Rate", "Transfer Accuracy: 100%"],
    keyMetric: "Lead time: <4hrs | Accuracy: 100%",
    anchor: "Integration risk — delays in Confluent/Kafka mean markets operate on stale central prices",
    formula: "Lag Cost = Δ Price × Volume × Hours delayed",
  },
  {
    n: "5", label: "Market Price\nDerivation", level: "Market",
    delta: 16, type: "build",
    color: "#0369A1", lightColor: "#EFF6FF",
    kpis: ["MRP = RET × Retail Factor", "NSC GP% above floor", "Exchange Rate Lag: near zero"],
    keyMetric: "NSC GP%: above market floor | FX lag: 0",
    anchor: "Converts central value into ~100 local markets — FX and rounding are the primary value leaks",
    formula: "MRP = Central RET × Retail Factor (by Family Code)",
  },
  {
    n: "6", label: "Market Price\nChanges", level: "Market",
    delta: -8, type: "risk",
    color: "#EA580C", lightColor: "#FFF7ED",
    kpis: ["CPI < 110 = at-risk parts", "Manual Price Rate > 10%", "Approval cycle > 24hrs"],
    keyMetric: "CPI target: 110–150 band",
    anchor: "Primary competitive risk — IAM erosion accelerates here if worklist alerts are not actioned fast",
    formula: "CPI = BMW MRP ÷ Best IAM Price × 100",
  },
  {
    n: "7", label: "Campaigns &\nSpecial Prices", level: "Market",
    delta: -4, type: "risk",
    color: "#D97706", lightColor: "#FFFBEB",
    kpis: ["Campaign Restoration Rate", "Special Customer Discount %", "Customer Margin Compliance"],
    keyMetric: "Auto-restoration: 100% | Margin: enforced",
    anchor: "Controllable margin leak — untracked campaigns and over-discounting silently erode GP",
    formula: "Net Discount Impact = Σ (List − Special Price) × Volume",
  },
  {
    n: "8", label: "Price Publication\n& Distribution", level: "AG + Market",
    delta: 8, type: "protect",
    color: "#16A34A", lightColor: "#F0FDF4",
    kpis: ["ATLAS Transfer Success > 99%", "Price Activation: same day", "Invoice Accuracy: 100%"],
    keyMetric: "Transfer: >99% | Same-day live",
    anchor: "Execution integrity — prices set correctly but published wrong destroy realized pricing value",
    formula: "Realization Rate = Invoiced Price ÷ Approved Price × 100",
  },
  {
    n: "9", label: "Audit, History\n& Compliance", level: "AG + Market",
    delta: 6, type: "protect",
    color: "#5B21B6", lightColor: "#F5F3FF",
    kpis: ["Audit Trail: 100%", "4-Eyes Compliance: 100%", "Aftersales EBIT ~ 25%"],
    keyMetric: "15yr history | EBIT ~25% benchmark",
    anchor: "Long-term value protection — compliance failures create retroactive repricing risk and legal exposure",
    formula: "EBIT Margin = Aftersales EBIT ÷ Aftersales Revenue × 100",
  },
];

const TYPE_COLORS = {
  build:   { bar: "#2563EB", light: "#DBEAFE", text: "#1D4ED8", label: "Value Build" },
  protect: { bar: "#059669", light: "#D1FAE5", text: "#047857", label: "Value Protect" },
  risk:    { bar: "#DC2626", light: "#FEE2E2", text: "#B91C1C", label: "Value at Risk" },
};

// Compute running totals
let running = 0;
const barsData = STAGES.map(s => {
  const start = running;
  const end = running + s.delta;
  running = end;
  return { ...s, start, end };
});
const netTotal = running;

export default function WaterfallChart() {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  // Chart geometry
  const W = 900, H = 420;
  const PAD = { top: 50, right: 20, bottom: 110, left: 60 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const totalBars = barsData.length + 1; // +1 for NET TOTAL
  const barW = chartW / (totalBars + 0.5);
  const barGap = barW * 0.22;
  const barActW = barW - barGap;

  const minVal = -20, maxVal = 80;
  const range = maxVal - minVal;

  const scaleY = v => PAD.top + chartH - ((v - minVal) / range) * chartH;
  const heightOf = v => (Math.abs(v) / range) * chartH;
  const barX = i => PAD.left + barGap / 2 + i * barW;

  const yTicks = [-10, 0, 10, 20, 30, 40, 50, 60, 70];

  const activeStage = selected ?? hovered;

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "#0F1923",
      minHeight: "100vh",
      padding: "0",
      color: "#E2EAF4",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0D1B2E 0%, #132240 100%)",
        borderBottom: "1px solid #1E3A5F",
        padding: "28px 40px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#4A90C4", textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>
              BMW Group · Aftersales CA-250/CA-251 · Confidential
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#E8F4FF", lineHeight: 1.2 }}>
              Aftermarket Parts Pricing
            </h1>
            <h2 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 400, color: "#4A90C4" }}>
              Pricing Effectiveness Waterfall
            </h2>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            {Object.entries(TYPE_COLORS).map(([type, col]) => (
              <div key={type} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, background: col.bar, borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: "#7AA5C8", fontFamily: "monospace" }}>{col.label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, background: "#4B5563", borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: "#7AA5C8", fontFamily: "monospace" }}>Net Total</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 40px", display: "flex", gap: 24 }}>
        {/* Chart Column */}
        <div style={{ flex: 1 }}>
          {/* AG / Market bands */}
          <div style={{ display: "flex", marginBottom: 4, marginLeft: PAD.left, gap: 2 }}>
            {[
              { label: "◀  AG (Central)  ▶", from: 0, to: 2 },
              { label: "◀  Market  ▶", from: 3, to: 5 },
              { label: "◀  AG + Market  ▶", from: 6, to: 8 },
            ].map(band => (
              <div key={band.label} style={{
                background: "#1A2E45",
                border: "1px solid #243D57",
                borderRadius: 4,
                padding: "3px 0",
                textAlign: "center",
                fontSize: 10,
                color: "#7AA5C8",
                letterSpacing: 1,
                fontFamily: "monospace",
                width: (band.to - band.from + 1) * barW + barGap / 2,
                flexShrink: 0,
              }}>
                {band.label}
              </div>
            ))}
            <div style={{
              background: "#1A2E45",
              border: "1px solid #243D57",
              borderRadius: 4,
              padding: "3px 0",
              textAlign: "center",
              fontSize: 10,
              color: "#7AA5C8",
              fontFamily: "monospace",
              width: barW + barGap / 2,
              flexShrink: 0,
              marginLeft: "auto",
            }}>
              ◀ Summary ▶
            </div>
          </div>

          {/* SVG Chart */}
          <div style={{ background: "#111C2A", borderRadius: 8, border: "1px solid #1E3A5F", overflow: "hidden" }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
              {/* Grid lines */}
              {yTicks.map(tick => {
                const y = scaleY(tick);
                const isZero = tick === 0;
                return (
                  <g key={tick}>
                    <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y}
                      stroke={isZero ? "#4A6B8A" : "#1A2E45"}
                      strokeWidth={isZero ? 1.5 : 0.8}
                      strokeDasharray={isZero ? "none" : "4,4"}
                    />
                    <text x={PAD.left - 8} y={y + 4} textAnchor="end"
                      fill={isZero ? "#7AA5C8" : "#3A5570"}
                      fontSize="11" fontFamily="monospace" fontWeight={isZero ? "bold" : "normal"}>
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Y axis label */}
              <text x={12} y={PAD.top + chartH / 2} textAnchor="middle"
                fill="#3A5570" fontSize="10" fontFamily="monospace"
                transform={`rotate(-90, 12, ${PAD.top + chartH / 2})`}>
                Pricing Effectiveness Score
              </text>

              {/* Connector lines between bars */}
              {barsData.map((bar, i) => {
                if (i >= barsData.length - 1) return null;
                const connY = scaleY(bar.end);
                const x1 = barX(i) + barActW;
                const x2 = barX(i + 1);
                return (
                  <line key={`conn-${i}`} x1={x1} x2={x2} y1={connY} y2={connY}
                    stroke="#2A4060" strokeWidth={1.5} strokeDasharray="3,2" />
                );
              })}

              {/* Waterfall Bars */}
              {barsData.map((bar, i) => {
                const topVal = Math.max(bar.start, bar.end);
                const botVal = Math.min(bar.start, bar.end);
                const barTop = scaleY(topVal);
                const barHt = Math.max(2, heightOf(topVal - botVal));
                const bx = barX(i);
                const isActive = activeStage === i;
                const tc = TYPE_COLORS[bar.type];
                const barColor = isActive ? tc.bar : bar.type === "build" ? "#1D4ED8" : bar.type === "protect" ? "#047857" : "#B91C1C";
                const isNeg = bar.delta < 0;

                return (
                  <g key={i}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(selected === i ? null : i)}
                  >
                    {/* Highlight glow when active */}
                    {isActive && (
                      <rect x={bx - 3} y={barTop - 3} width={barActW + 6} height={barHt + 6}
                        fill={tc.bar} fillOpacity={0.15} rx={3}
                      />
                    )}

                    {/* The bar */}
                    <rect x={bx} y={barTop} width={barActW} height={barHt}
                      fill={barColor}
                      fillOpacity={isActive ? 1 : 0.85}
                      rx={2}
                    />

                    {/* Top edge highlight */}
                    <rect x={bx} y={barTop} width={barActW} height={2}
                      fill="white" fillOpacity={0.3} rx={1}
                    />

                    {/* Delta label above/below bar */}
                    <text
                      x={bx + barActW / 2}
                      y={isNeg ? barTop + barHt + 16 : barTop - 6}
                      textAnchor="middle"
                      fill={isNeg ? "#F87171" : "#60A5FA"}
                      fontSize="12" fontWeight="bold" fontFamily="monospace"
                    >
                      {bar.delta > 0 ? `+${bar.delta}` : bar.delta}
                    </text>

                    {/* Running total (small, above delta for positives) */}
                    <text
                      x={bx + barActW / 2}
                      y={isNeg ? barTop + barHt + 30 : barTop - 20}
                      textAnchor="middle"
                      fill="#3A5570" fontSize="9" fontFamily="monospace"
                    >
                      ={bar.end}
                    </text>

                    {/* Stage label box */}
                    <rect x={bx} y={H - PAD.bottom + 8} width={barActW} height={50}
                      fill={bar.color} rx={3}
                    />
                    {/* Stage number */}
                    <text x={bx + 10} y={H - PAD.bottom + 29}
                      fill="white" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      {bar.n}
                    </text>
                    {/* Stage label lines */}
                    {bar.label.split("\n").map((line, li) => (
                      <text key={li} x={bx + barActW / 2} y={H - PAD.bottom + 23 + li * 13}
                        textAnchor="middle" fill="white"
                        fontSize="8.5" fontFamily="'Georgia', serif">
                        {line}
                      </text>
                    ))}

                    {/* Type dot */}
                    <circle cx={bx + barActW - 6} cy={H - PAD.bottom + 13} r={3}
                      fill={tc.bar} />
                  </g>
                );
              })}

              {/* NET TOTAL bar */}
              {(() => {
                const i = barsData.length;
                const bx = barX(i);
                const barTop = scaleY(netTotal);
                const barHt = heightOf(netTotal);
                const isActive = activeStage === i;
                return (
                  <g style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(selected === i ? null : i)}
                  >
                    {isActive && (
                      <rect x={bx - 3} y={barTop - 3} width={barActW + 6} height={barHt + 6}
                        fill="#6B7280" fillOpacity={0.2} rx={3}
                      />
                    )}
                    <rect x={bx} y={barTop} width={barActW} height={barHt}
                      fill={isActive ? "#6B7280" : "#374151"} fillOpacity={0.9} rx={2}
                    />
                    <rect x={bx} y={barTop} width={barActW} height={2}
                      fill="white" fillOpacity={0.25} rx={1}
                    />
                    <text x={bx + barActW / 2} y={barTop - 6}
                      textAnchor="middle" fill="#9CA3AF"
                      fontSize="13" fontWeight="bold" fontFamily="monospace">
                      {netTotal}
                    </text>
                    <rect x={bx} y={H - PAD.bottom + 8} width={barActW} height={50}
                      fill="#374151" rx={3}
                    />
                    <text x={bx + barActW / 2} y={H - PAD.bottom + 27}
                      textAnchor="middle" fill="white"
                      fontSize="10" fontWeight="bold" fontFamily="monospace">
                      NET
                    </text>
                    <text x={bx + barActW / 2} y={H - PAD.bottom + 42}
                      textAnchor="middle" fill="#9CA3AF" fontSize="8.5" fontFamily="monospace">
                      TOTAL
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Bottom note */}
          <div style={{ marginTop: 10, fontSize: 10, color: "#3A5570", fontFamily: "monospace", lineHeight: 1.6 }}>
            Note: Score is a composite pricing effectiveness index (0–100). Negative bars = margin at risk if KPI thresholds not met.
            Click any bar for details. Source: BMW RFI CA-250/CA-251 · Vistex Advisory · McKinsey Aftersales Benchmarks.
          </div>
        </div>

        {/* Detail Panel */}
        <div style={{
          width: 320,
          flexShrink: 0,
          background: "#111C2A",
          border: "1px solid #1E3A5F",
          borderRadius: 8,
          padding: 20,
          transition: "all 0.2s",
        }}>
          {activeStage == null ? (
            <div style={{ color: "#2A4060", fontSize: 13, fontFamily: "monospace", paddingTop: 20, lineHeight: 2 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>↖</div>
              Hover or click any bar to see the KPI drivers and formula for that pricing stage.
            </div>
          ) : activeStage === barsData.length ? (
            // Net Total panel
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ background: "#374151", borderRadius: 6, padding: "6px 12px", fontFamily: "monospace", fontSize: 18, fontWeight: "bold", color: "#9CA3AF" }}>
                  NET
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: "bold", color: "#E2EAF4" }}>Net Total Score</div>
                  <div style={{ fontSize: 11, color: "#4A6B8A", fontFamily: "monospace" }}>All stages combined</div>
                </div>
              </div>
              <div style={{ background: "#1A2E45", borderRadius: 6, padding: "12px 16px", marginBottom: 14 }}>
                <div style={{ fontSize: 42, fontWeight: "bold", color: "#60A5FA", fontFamily: "monospace", textAlign: "center" }}>
                  {netTotal}
                </div>
                <div style={{ fontSize: 11, color: "#4A6B8A", fontFamily: "monospace", textAlign: "center" }}>
                  / 100 pricing effectiveness index
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#7AA5C8", lineHeight: 1.7, marginBottom: 14 }}>
                Net score of {netTotal} reflects strong structural value build (Stages 1–3, 5) partially offset by integration, competitive, and discount governance risks.
              </div>
              <div style={{ borderTop: "1px solid #1E3A5F", paddingTop: 12 }}>
                <div style={{ fontSize: 10, color: "#4A6B8A", fontFamily: "monospace", marginBottom: 8 }}>STRATEGIC KPIs</div>
                {["Aftersales EBIT Margin ~ 25% (McKinsey benchmark)", "IAM Market Share Capture Rate", "Worklist Clearance Rate > 95%/week"].map((k, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#5B21B6", marginTop: 5, flexShrink: 0 }} />
                    <div style={{ fontSize: 11, color: "#A0B8CC" }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (() => {
            const bar = barsData[activeStage];
            const tc = TYPE_COLORS[bar.type];
            return (
              <div>
                {/* Stage badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ background: bar.color, borderRadius: 6, padding: "6px 12px", fontFamily: "monospace", fontSize: 20, fontWeight: "bold", color: "white", minWidth: 36, textAlign: "center" }}>
                    {bar.n}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: "#E2EAF4", lineHeight: 1.3 }}>
                      {bar.label.replace("\n", " ")}
                    </div>
                    <div style={{ fontSize: 10, color: "#4A6B8A", fontFamily: "monospace" }}>
                      Level: {bar.level}
                    </div>
                  </div>
                </div>

                {/* Delta score */}
                <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: "#1A2E45", borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: "bold", color: bar.delta > 0 ? "#60A5FA" : "#F87171", fontFamily: "monospace" }}>
                      {bar.delta > 0 ? `+${bar.delta}` : bar.delta}
                    </div>
                    <div style={{ fontSize: 9, color: "#3A5570", fontFamily: "monospace" }}>STAGE DELTA</div>
                  </div>
                  <div style={{ flex: 1, background: "#1A2E45", borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: "bold", color: "#60A5FA", fontFamily: "monospace" }}>
                      {bar.end}
                    </div>
                    <div style={{ fontSize: 9, color: "#3A5570", fontFamily: "monospace" }}>RUNNING TOTAL</div>
                  </div>
                </div>

                {/* Type badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: tc.light, borderRadius: 4, padding: "4px 10px", marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: tc.bar }} />
                  <span style={{ fontSize: 10, fontWeight: "bold", color: tc.text, fontFamily: "monospace" }}>
                    {tc.label.toUpperCase()}
                  </span>
                </div>

                {/* Anchor statement */}
                <div style={{ fontSize: 11, color: "#7AA5C8", lineHeight: 1.7, marginBottom: 14, fontStyle: "italic" }}>
                  "{bar.anchor}"
                </div>

                {/* Formula */}
                <div style={{ background: "#0D1B2E", border: "1px solid #1E3A5F", borderRadius: 6, padding: "10px 12px", marginBottom: 14 }}>
                  <div style={{ fontSize: 9, color: "#3A5570", fontFamily: "monospace", marginBottom: 4 }}>KEY FORMULA</div>
                  <div style={{ fontSize: 11, color: "#60A5FA", fontFamily: "monospace", lineHeight: 1.5 }}>
                    {bar.formula}
                  </div>
                </div>

                {/* KPIs */}
                <div>
                  <div style={{ fontSize: 10, color: "#4A6B8A", fontFamily: "monospace", marginBottom: 8 }}>PRICING KPIs</div>
                  {bar.kpis.map((k, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: bar.color, marginTop: 5, flexShrink: 0 }} />
                      <div style={{ fontSize: 11, color: "#A0B8CC" }}>{k}</div>
                    </div>
                  ))}
                </div>

                {/* Key metric */}
                <div style={{ marginTop: 12, background: "#0D1B2E", border: `1px solid ${bar.color}40`, borderRadius: 6, padding: "8px 12px" }}>
                  <div style={{ fontSize: 9, color: "#3A5570", fontFamily: "monospace", marginBottom: 3 }}>TARGET</div>
                  <div style={{ fontSize: 11, fontWeight: "bold", color: "#E2EAF4" }}>{bar.keyMetric}</div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

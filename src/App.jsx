
// src/App.jsx
import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Cpu, Users, DollarSign, Sparkles, LineChart as LineChartIcon,
  ShieldAlert, Globe2, Factory, Building2, FileWarning, Workflow, Info,
  Settings, RefreshCw, Download, Printer, X, ChevronRight, ChevronLeft
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  ScatterChart, Scatter
} from "recharts";

/* === Map libs === */
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

/* === Backend API (FastAPI + Mongo) === */
// const API_URL = "https://fusion-dashboard-api-fyacf7a2bxdvgchc.canadacentral-01.azurewebsites.net";
const API_URL = import.meta.env.VITE_API_URL;
/* =========================
 *  VISUAL PALETTE
 *  ========================= */
const COLORS = {
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
  indigo: "#6366f1",
  slate: "#64748b",
  zinc: "#71717a",
  rose: "#f43f5e",
  emerald: "#10b981",
  violet: "#8b5cf6",
};
const GAR_COLORS = [COLORS.green, COLORS.amber, COLORS.red];
const SHOW_TIME_FILTER = false;
/* === Map theme (natural water/land) === */
const MAP_THEME = {
  waterA: "#eaf4ff",
  waterB: "#cfe6ff",
  land:   "#cfe8cc",
  landHi: "#bfe0bc",
  stroke: "rgba(18,84,46,.45)",
  bubble: {
    remote: "#10b981",
    mixed:  "#f59e0b",
    onsite: "#ef4444",
    ring:   "rgba(255,255,255,.65)"
  },
  text: {
    label: "#0f172a",
    halo:  "rgba(255,255,255,.8)"
  }
};

/* =========================
 *  BUSINESS DEFAULTS
 *  ========================= */
const DEFAULT_TOTAL = 6639;

const DEFAULT_FUNCTION_SHARE = [
  { team: "Sales",       sharePct: 20 },
  { team: "Ops",         sharePct: 26 },
  { team: "Finance",     sharePct: 12 },
  { team: "HR",          sharePct: 10 },
  { team: "Engineering", sharePct: 32 },
];

const DEFAULT_EMP_PCT = {
  Sales: 74,
  Ops: 67,
  Finance: 83,
  HR: 85,
  Engineering: 66,
};

const COMMON = {
  adoptionGAR: [
    { name: "Green", value: 56 },
    { name: "Amber", value: 30 },
    { name: "Red", value: 14 },
  ],
  deviceTrust: { deviceMatch: true, geofence: "Office/Home", trustScore: 92, policyCompliant: true },
  holidaySickness: [
    { month: "Apr", holiday: 3.1, sickness: 1.2 },
    { month: "May", holiday: 2.4, sickness: 1.0 },
    { month: "Jun", holiday: 2.8, sickness: 1.4 },
    { month: "Jul", holiday: 3.6, sickness: 1.1 },
    { month: "Aug", holiday: 4.2, sickness: 0.9 },
    { month: "Sep", holiday: 2.9, sickness: 1.3 },
  ],
};
const PAID_DAYS = 5.0;

/* =========================
 *  LENSES
 *  ========================= */
const LENSES = {
  CEO: {
    shadowAI: 34,
    outputVsOutcome: [
      { month: "Apr", output: 62, outcome: 48 },
      { month: "May", output: 65, outcome: 55 },
      { month: "Jun", output: 68, outcome: 57 },
      { month: "Jul", output: 71, outcome: 63 },
      { month: "Aug", output: 73, outcome: 66 },
      { month: "Sep", output: 76, outcome: 72 },
    ],
    fusion: [
      { team: "Sales", human: 68, digital: 32 },
      { team: "Ops", human: 54, digital: 46 },
      { team: "Finance", human: 61, digital: 39 },
      { team: "HR", human: 74, digital: 26 },
      { team: "Engineering", human: 49, digital: 51 },
    ],
    reactiveProactivePct: [42, 58],
    onOffPct: [38, 62],
    licenseUtil: [
      { app: "M365", util: 78 }, { app: "Jira", util: 64 },
      { app: "Salesforce", util: 59 }, { app: "Copilot", util: 31 },
      { app: "ChatGPT Ent.", util: 22 },
    ],
    anomalies: [
      { id: "A-1023", label: "High Shadow AI in Sales", impact: "Policy/Risk", hint: "Enable enterprise chat + guardrails." },
      { id: "A-1048", label: "Copilot under-utilised", impact: "Cost Leakage", hint: "Reassign seats to Eng/Ops doc-heavy teams." },
    ],
  },
  CFO: {
    shadowAI: 28,
    outputVsOutcome: [
      { month: "Apr", output: 58, outcome: 46 },
      { month: "May", output: 60, outcome: 50 },
      { month: "Jun", output: 63, outcome: 53 },
      { month: "Jul", output: 65, outcome: 56 },
      { month: "Aug", output: 67, outcome: 60 },
      { month: "Sep", output: 69, outcome: 62 },
    ],
    fusion: [
      { team: "Sales", human: 66, digital: 34 },
      { team: "Ops", human: 52, digital: 48 },
      { team: "Finance", human: 58, digital: 42 },
      { team: "HR", human: 72, digital: 28 },
      { team: "Engineering", human: 48, digital: 52 },
    ],
    reactiveProactivePct: [46, 54],
    onOffPct: [41, 59],
    licenseUtil: [
      { app: "M365", util: 81 }, { app: "Jira", util: 66 },
      { app: "Salesforce", util: 63 }, { app: "Copilot", util: 28 },
      { app: "ChatGPT Ent.", util: 19 },
    ],
    anomalies: [
      { id: "F-2001", label: "Under-used SFDC seats", impact: "Cost", hint: "Downshift 30 seats, save ~£48k/yr." },
      { id: "F-2002", label: "High overtime in Ops", impact: "Spend", hint: "Automate L1 triage to cut 22%." },
    ],
  },
  CHRO: {
    shadowAI: 19,
    outputVsOutcome: [
      { month: "Apr", output: 55, outcome: 45 },
      { month: "May", output: 58, outcome: 51 },
      { month: "Jun", output: 61, outcome: 54 },
      { month: "Jul", output: 64, outcome: 58 },
      { month: "Aug", output: 67, outcome: 61 },
      { month: "Sep", output: 70, outcome: 65 },
    ],
    fusion: [
      { team: "Sales", human: 71, digital: 29 },
      { team: "Ops", human: 60, digital: 40 },
      { team: "Finance", human: 66, digital: 34 },
      { team: "HR", human: 78, digital: 22 },
      { team: "Engineering", human: 53, digital: 47 },
    ],
    reactiveProactivePct: [39, 61],
    onOffPct: [36, 64],
    licenseUtil: [
      { app: "M365", util: 84 }, { app: "Jira", util: 62 },
      { app: "Salesforce", util: 57 }, { app: "Copilot", util: 34 },
      { app: "ChatGPT Ent.", util: 26 },
    ],
    anomalies: [
      { id: "H-3001", label: "Sick-leave spikes (Eng)", impact: "Wellbeing", hint: "Align releases + PTO; review on-call." },
    ],
  },
  CIO: {
    shadowAI: 41,
    outputVsOutcome: [
      { month: "Apr", output: 61, outcome: 49 },
      { month: "May", output: 63, outcome: 52 },
      { month: "Jun", output: 66, outcome: 55 },
      { month: "Jul", output: 69, outcome: 59 },
      { month: "Aug", output: 71, outcome: 62 },
      { month: "Sep", output: 75, outcome: 67 },
    ],
    fusion: [
      { team: "Sales", human: 64, digital: 36 },
      { team: "Ops", human: 51, digital: 49 },
      { team: "Finance", human: 59, digital: 41 },
      { team: "HR", human: 73, digital: 27 },
      { team: "Engineering", human: 47, digital: 53 },
    ],
    reactiveProactivePct: [48, 52],
    onOffPct: [43, 57],
    licenseUtil: [
      { app: "M365", util: 76 }, { app: "Jira", util: 69 },
      { app: "Salesforce", util: 54 }, { app: "Copilot", util: 29 },
      { app: "ChatGPT Ent.", util: 21 },
    ],
    anomalies: [
      { id: "I-4001", label: "Shadow AI imports (web)", impact: "Compliance", hint: "Enterprise proxy + watermark detect." },
    ],
  },
};

/* Sidebar meta */
const LENS_META = {
  CEO:  { icon: Sparkles,   color: "bg-indigo-600",  desc: "Growth & Value" },
  CFO:  { icon: DollarSign, color: "bg-emerald-600", desc: "Cost & ROI" },
  CHRO: { icon: Users,      color: "bg-rose-600",    desc: "People & Wellbeing" },
  CIO:  { icon: Cpu,        color: "bg-violet-600",  desc: "Platforms & Risk" },
};

const REGION_COST = [
  { region: "London", cost: 100 },
  { region: "Bangalore", cost: 58 },
  { region: "Krakow", cost: 74 },
  { region: "Remote (EU)", cost: 82 },
  { region: "Remote (IN)", cost: 61 },
];

/* =========================
 *  VISIBILITY RULES
 *  ========================= */
const CARD_VIS = {
  CEO:  new Set(["adoption", "shadow", "outcome", "labour"]),
  CFO:  new Set(["adoption", "outcome", "labour"]),
  CHRO: new Set(["adoption", "outcome"]),
  CIO:  new Set(["shadow", "outcome"]),
};


const INDIVIDUAL_PROFILES = [
  {
    name: "Physical Me – Analyst",
    physical: 1.0,
    digital: 0.4,
    combined: 1.5,
    type: "Augmentable",
  },
  {
    name: "Digital Me – Copilot/Agent",
    physical: 0.0,
    digital: 1.0,
    combined: 1.0,
    type: "Digital-first",
  },
  {
    name: "Combined Me – Fusion",
    physical: 1.0,
    digital: 1.0,
    combined: 2.1,
    type: "Human + Digital",
  },
];


const SECTION_VIS = {
  CEO:  new Set([
    "output_outcome", "fusion", "reactive_proactive", "onoff",
    "quadrant", "roi", "replaceability", "horizon",
    "emp_contractor_org", "emp_contractor_fn",
    "holiday_sickness", "license_util", "liability_asset",
    "region_cost", "anomalies", "individual_model"
  ]),
  CFO:  new Set([
    "output_outcome", "reactive_proactive", "onoff",
    "quadrant", "roi", "horizon",
    "emp_contractor_org", "license_util", "region_cost", "anomalies"
  ]),
  CHRO: new Set([
    "output_outcome", "onoff",
    "replaceability", "horizon", "individual_model",
    "emp_contractor_org", "emp_contractor_fn",
    "holiday_sickness", "anomalies"
  ]),
  CIO:  new Set([
    "reactive_proactive", "onoff", "license_util",
    "quadrant", "horizon",
    "liability_asset", "output_outcome", "anomalies"
  ]),
};

// const SECTION_VIS = {
//   CEO:  new Set([
//     "output_outcome", "fusion", "reactive_proactive", "onoff",
//     "emp_contractor_org", "emp_contractor_fn",
//     "holiday_sickness", "license_util", "liability_asset",
//     "region_cost", "anomalies"
//   ]),
//   CFO:  new Set([
//     "output_outcome", "reactive_proactive", "onoff",
//     "emp_contractor_org", "license_util", "region_cost", "anomalies"
//   ]),
//   CHRO: new Set([
//     "output_outcome", "onoff",
//     "emp_contractor_org", "emp_contractor_fn",
//     "holiday_sickness", "anomalies"
//   ]),
//   CIO:  new Set([
//     "reactive_proactive", "onoff", "license_util",
//     "liability_asset", "output_outcome", "anomalies"
//   ]),
// };
const canShowCard    = (lens, key) => CARD_VIS[lens]?.has(key);
const canShowSection = (lens, key) => SECTION_VIS[lens]?.has(key);

/* =========================
 *  HELPERS
 *  ========================= */
function allocateByShare(total, rows, shareKey, outKey = "count") {
  const raw = rows.map((r) => (total * r[shareKey]) / 100);
  const floor = raw.map((x) => Math.floor(x));
  const assigned = floor.reduce((a, b) => a + b, 0);
  const need = total - assigned;
  const frac = raw.map((x, i) => ({ i, f: x - floor[i] })).sort((a, b) => b.f - a.f);
  for (let k = 0; k < need; k++) floor[frac[k].i]++;
  return rows.map((r, idx) => ({ ...r, [outKey]: floor[idx] }));
}
function splitEC(total, empPct) {
  const e = Math.floor((total * empPct) / 100);
  return { employees: e, contractors: total - e };
}


/** === Pro background (Geofencing • Animated Globe) — Bigger Globe === */
function ProBackground({ lens = "CEO" }) {
  // Lens-tinted glow used in sweep & accents
  const LENS_TINT = {
    CEO:  "rgba(99,102,241,.28)",  // indigo
    CFO:  "rgba(16,185,129,.28)",  // emerald
    CHRO: "rgba(244,63,94,.28)",   // rose
    CIO:  "rgba(139,92,246,.28)",  // violet
  };
  const tint = LENS_TINT[lens] || "rgba(99,102,241,.28)";

  return (
    <>
      <style>{`
        /* Global spin for globe lines and sweep */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .spin-slow   { animation: spin 42s linear infinite; }
        .spin-medium { animation: spin 18s linear infinite; }

        /* Flowing data arcs */
        @keyframes dashFlow {
          from { stroke-dashoffset: 120; }
          to   { stroke-dashoffset: 0; }
        }
        .dash-animate {
          stroke-dasharray: 6 8;
          animation: dashFlow 4.5s ease-in-out infinite;
        }

        /* Geofence ring pulse */
        @keyframes ringPulse {
          0%   { transform: scale(0.6); opacity: .45; }
          70%  { opacity: .12; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .ring {
          border: 1.5px solid #10b981;
          border-radius: 9999px;
          animation: ringPulse 3.2s ease-out infinite;
        }
      `}</style>

      {/* Base gradient (light, clean) */}
      <div
        className="fixed inset-0 -z-40 print:hidden"
        style={{
          background: `
            radial-gradient(1200px 650px at 12% 10%, rgba(99,102,241,.10), transparent 58%),
            radial-gradient(1100px 650px at 88% 12%, rgba(56,189,248,.10), transparent 60%),
            linear-gradient(180deg, #f9fbff 0%, #f3f6fb 42%, #eef3f9 100%)
          `
        }}
      />

      {/* Lens glow (bigger to match globe) */}
      <div
        className="fixed -z-35 pointer-events-none print:hidden"
        style={{
          left: "58%",
          top: "6%",
          width: "62vmin",
          height: "62vmin",
          filter: "blur(28px)",
          background: `radial-gradient(closest-side, ${tint}, transparent 65%)`,
          borderRadius: "50%"
        }}
      />

      {/* ===== Bigger Globe (SVG wireframe) + arcs ===== */}
      <svg
        className="fixed inset-0 -z-30 pointer-events-none print:hidden"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Move a bit left to keep everything inside the viewBox; bigger globe */}
        <g transform="translate(700,300)">
          {/* Globe outer circle */}
          <circle r="280" fill="none" stroke="#60a5fa" strokeOpacity=".22" strokeWidth="1.2" />

          {/* Latitudes (ellipses) */}
          <g className="spin-slow" style={{ transformOrigin: "0px 0px" }}>
            <ellipse rx="280" ry="90"  fill="none" stroke="#60a5fa" strokeOpacity=".18" strokeWidth=".8" />
            <ellipse rx="280" ry="70"  fill="none" stroke="#60a5fa" strokeOpacity=".16" strokeWidth=".8" />
            <ellipse rx="280" ry="50"  fill="none" stroke="#60a5fa" strokeOpacity=".14" strokeWidth=".8" />
            <ellipse rx="280" ry="30"  fill="none" stroke="#60a5fa" strokeOpacity=".12" strokeWidth=".8" />
            <ellipse rx="280" ry="12"  fill="none" stroke="#60a5fa" strokeOpacity=".10" strokeWidth=".8" />
          </g>

          {/* Longitudes (vertical arcs, rotated) */}
          <g className="spin-slow" style={{ transformOrigin: "0px 0px" }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <ellipse
                key={i}
                rx="90" ry="280"
                fill="none"
                stroke="#60a5fa"
                strokeOpacity=".14"
                strokeWidth=".8"
                transform={`rotate(${i * 18})`}
              />
            ))}
          </g>

          {/* Equator highlight */}
          <ellipse rx="280" ry="90" fill="none" stroke="#60a5fa" strokeOpacity=".28" strokeWidth="1.4" />

          {/* Flowing connection arcs across the globe — scaled up */}
          <g>
            {/* London -> Bengaluru */}
            <path
              d="M -160,-27 C -40,-240  80,-240  173,-53"
              fill="none"
              stroke="#34d399"
              strokeOpacity=".55"
              strokeWidth="1.8"
              className="dash-animate"
            />
            {/* New York -> London */}
            <path
              d="M -280,-13 C -253,-160 -187,-200 -107,-93"
              fill="none"
              stroke="#93c5fd"
              strokeOpacity=".55"
              strokeWidth="1.8"
              className="dash-animate"
              style={{ animationDelay: "0.6s" }}
            />
            {/* Singapore -> Krakow */}
            <path
              d="M 80,133 C 40,27 -53,-13 -133,40"
              fill="none"
              stroke="#f472b6"
              strokeOpacity=".55"
              strokeWidth="1.8"
              className="dash-animate"
              style={{ animationDelay: "1.1s" }}
            />
          </g>
        </g>
      </svg>

      {/* Radar sweep (bigger, centered to globe) */}
      <div
        className="fixed -z-25 spin-medium pointer-events-none print:hidden"
        style={{
          left: "60.5%",
          top: "4.5%",
          width: "62vmin",
          height: "62vmin",
          transformOrigin: "50% 50%",
          borderRadius: "9999px",
          background: `conic-gradient(from 0deg, ${tint} 0deg 20deg, rgba(0,0,0,0) 24deg 360deg)`
        }}
      />

      {/* Geofence rings */}
      <div className="fixed -z-20 pointer-events-none print:hidden" style={{ left: "19%", top: "72%" }}>
        <div className="ring" style={{ width: 36, height: 36 }} />
      </div>
      <div className="fixed -z-20 pointer-events-none print:hidden" style={{ left: "58%", top: "64%", animationDelay: ".6s" }}>
        <div className="ring" style={{ width: 30, height: 30 }} />
      </div>
      <div className="fixed -z-20 pointer-events-none print:hidden" style={{ left: "78%", top: "28%", animationDelay: "1.1s" }}>
        <div className="ring" style={{ width: 28, height: 28 }} />
      </div>
    </>
  );
}


function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

/* =========================
 *  BADGES / CARDS / SECTIONS
 *  ========================= */
function Badge({ children, tone = "slate", className = "" }) {
  const tones = {
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-rose-100 text-rose-800",
    slate: "bg-slate-100 text-slate-800",
    indigo: "bg-indigo-100 text-indigo-800",
  };
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
        whitespace-nowrap ${tones[tone]} ${className}
      `}
    >
      {children}
    </span>
  );
}
function Card({ icon: Icon, title, value, hint, accent = "", children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className={`rounded-2xl bg-white/70 backdrop-blur border border-slate-200 shadow-sm p-4 ${accent}`}>
      <div className="flex items-center gap-3 mb-2">
        {Icon && <div className="p-2 rounded-xl bg-slate-100"><Icon className="w-5 h-5 text-slate-700" /></div>}
        <div>
          <div className="text-slate-500 text-xs uppercase tracking-wide">{title}</div>
          {value && <div className="text-xl font-semibold text-slate-900">{value}</div>}
          {hint && <div className="text-xs text-slate-400">{hint}</div>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function Section({ title, icon: Icon, children, action, sub }) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-slate-600" />}
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        {action}
      </div>
      {sub && <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> {sub}</div>}
      {children}
    </div>
  );
}
function SimpleBadge({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-3 text-sm flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

/* =========================
 *  MINI VISUALS
 *  ========================= */
function Sparkline({ data }) {
  const mapped = data.map((y, i) => ({ x: i + 1, y }));
  return (
    <div className="w-full h-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mapped}>
          <XAxis dataKey="x" hide />
          <YAxis hide domain={[0, "dataMax + 10"]} />
          <Tooltip />
          <Line type="monotone" dataKey="y" stroke={COLORS.blue} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
function BarMini({ value }) {
  return (
    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-slate-800" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
function RadialGauge({ percent }) {
  const d = [{ name: "p", value: percent }, { name: "rest", value: 100 - percent }];
  return (
    <RadialBarChart width={110} height={110} cx={55} cy={55} innerRadius={30} outerRadius={50} barSize={10} data={d} startAngle={90} endAngle={-270}>
      <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={50} fill={COLORS.green} />
      <text x={55} y={60} textAnchor="middle" dominantBaseline="middle" className="fill-slate-800 text-sm font-semibold">{percent}%</text>
    </RadialBarChart>
  );
}

/* =========================
 *  DRAWER / SLIDERS / BUTTON
 *  ========================= */
function Drawer({ open, onClose, title, children, side = "right" }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/20 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={`fixed top-0 ${side === "right" ? "right-0" : "left-0"} h-full w-[360px] bg-white z-50 shadow-xl border-slate-200 border`}
            initial={{ x: side === "right" ? 360 : -360 }} animate={{ x: 0 }} exit={{ x: side === "right" ? 360 : -360 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">{title}</div>
              <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
function SliderRow({ label, min = 0, max = 100, step = 1, value, onChange, suffix = "%", hint }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900 font-semibold">{value}{suffix}</span>
      </div>
      <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}
function SwitchRow({ label, checked, onChange, hint }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="text-xs text-slate-700">{label}</div>
        {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition ${checked ? "bg-slate-900" : "bg-slate-300"}`}
        aria-label={label}
      >
        <span className={`absolute top-0.5 transition ${checked ? "left-6" : "left-0.5"} inline-block w-5 h-5 bg-white rounded-full`} />
      </button>
    </div>
  );
}
function Button({ children, onClick, variant = "default", icon: Icon, className = "" }) {
  const styles = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    ghost: "bg-white border border-slate-200 hover:bg-slate-50",
    subtle: "bg-slate-100 hover:bg-slate-200",
  };
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-2 ${styles[variant]} ${className}`}>
      {Icon && <Icon className="w-4 h-4" />}{children}
    </button>
  );
}

/* =========================
 *  SIDEBAR (Professional)
 *  ========================= */
function MiniStat({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700",
    indigo: "bg-indigo-50 text-indigo-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-xl px-2.5 py-2 text-[12px] border border-slate-200 ${tones[tone]}`}>
      <div className="opacity-70">{label}</div>
      <div className="font-semibold leading-5">{value}</div>
    </div>
  );
}

function LensSidebar({
  activeLens,
  onSelect,
  outcomeByLens,
  shadowAIByLens,
  snapshot,
  onToggleNarration,
  openNarration,
  onExport,
  onPrint
}) {
  const order = ["CEO", "CFO", "CHRO", "CIO"];

  return (
    <div className="sticky top-4 w-[280px]">
      <div className="max-h-[calc(100vh-120px)] overflow-auto pr-1 flex flex-col gap-3">
        {/* Lenses */}
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Executive Lenses</div>
          <div className="space-y-2">
            {order.map((key) => {
              const meta = LENS_META[key];
              const Icon = meta.icon;
              const active = activeLens === key;
              return (
                <button
                  key={key}
                  onClick={() => onSelect(key)}
                  className={`w-full text-left rounded-2xl border p-3 transition
                    ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                >
                  <div className="flex gap-3 items-center">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold leading-5">{key}</div>
                      <div className={`text-[11px] ${active ? "text-slate-300" : "text-slate-500"}`}>{meta.desc}</div>

                      <div className={`mt-2 grid grid-cols-2 gap-2 text-[11px] ${active ? "text-slate-200" : "text-slate-600"}`}>
                        <div className="rounded-lg px-2 py-1 border border-slate-200/50 bg-white/5">
                          <div className="opacity-70">Outcome</div>
                          <div className="font-semibold">{outcomeByLens[key]} / 100</div>
                        </div>
                        <div className="rounded-lg px-2 py-1 border border-slate-200/50 bg-white/5">
                          <div className="opacity-70">Shadow AI</div>
                          <div className="font-semibold">{shadowAIByLens[key]}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Org Snapshot */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Org Snapshot</div>
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Total"       value={snapshot.total} />
            <MiniStat label="Employees"   value={snapshot.employees} />
            <MiniStat label="Contractors" value={snapshot.contractors} />
            <MiniStat label="Outcome"     value={`${snapshot.outcome} / 100`} tone="indigo" />
            <MiniStat label="Green share" value={`${snapshot.adoption}%`} tone="green" />
            <MiniStat label="Shadow AI"   value={`${snapshot.shadow}%`} tone="amber" />
          </div>

          <button
            onClick={onToggleNarration}
            className="mt-3 w-full text-xs rounded-lg border border-slate-200 hover:bg-slate-50 py-1.5"
          >
            {openNarration ? "Hide talking points" : "Show talking points"}
          </button>
        </div>

        {/* Governance quick strip */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Governance & Policy</div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="green"  className="!text-[11px]">Device match: Verified</Badge>
            <Badge tone="indigo" className="!text-[11px]">Geofence: Office/Home</Badge>
            <Badge tone="slate"  className="!text-[11px]">Trust: {snapshot.trust}</Badge>
            <Badge tone="green"  className="!text-[11px]">Policy: Compliant</Badge>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Quick Actions</div>
          <div className="flex flex-col gap-2">
            <Button variant="ghost" icon={Download} onClick={onExport}>Export CSV</Button>
            <Button variant="ghost" icon={Printer} onClick={onPrint}>Print / Save PDF</Button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 text-center mt-1 pb-2">
          Fusion Workforce • Executive Lens
        </div>
      </div>
    </div>
  );
}

/* =========================
 *  MAIN COMPONENT
 *  ========================= */
export default function FusionFalseDashboard() {
  // ---- Mongo config from FastAPI ----
  const [dbConfig, setDbConfig] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`${API_URL}/api/dashboard`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        // set state from data...
      } catch (err) {
        console.error("Failed to load fusion dashboard config", err);
      }
    }
    loadConfig();
  }, []);

  // Values from Mongo (if present) with fallbacks to constants
  const paidDays = dbConfig?.paidDays ?? PAID_DAYS;
  const commonConfig = dbConfig?.common ?? COMMON;
  const lensesConfig = dbConfig?.lenses ?? LENSES;
  const regionCostConfig = dbConfig?.regionCost ?? REGION_COST;
  const citiesConfig = dbConfig?.cities ?? null;
  const defaultFunctionShareConfig = dbConfig?.defaultFunctionShare ?? DEFAULT_FUNCTION_SHARE;
  const defaultEmpPctConfig = dbConfig?.defaultEmpPct ?? DEFAULT_EMP_PCT;
  const defaultTotalConfig = dbConfig?.defaultTotal ?? DEFAULT_TOTAL;

  const [lens, setLens] = useState("CEO");
  const [openLensDrawer, setOpenLensDrawer] = useState(false);
  const [windowKey, setWindowKey] = useState("Last 6 months");
  const [viewTab, setViewTab] = useState("Outcome");
  const [openControls, setOpenControls] = useState(false);

  // Left drawer state – can show either Function focus or Site focus
  const [openLeft, setOpenLeft] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);

  // Talking points visibility (remembered in localStorage)
  const [openNarration, setOpenNarration] = useState(() => {
    const saved = localStorage.getItem("showHighlights");
    return saved ? JSON.parse(saved) : false;
  });

  // What-if Params (initialised from config)
  const [totalHeadcount, setTotalHeadcount] = useState(defaultTotalConfig);
  const [adoptGreen, setAdoptGreen] = useState(commonConfig.adoptionGAR[0].value);
  const [adoptAmber, setAdoptAmber] = useState(commonConfig.adoptionGAR[1].value);
  const adoptRed = Math.max(0, 100 - (adoptGreen + adoptAmber));
  const [useCustomMix, setUseCustomMix] = useState(false);
  const [customReactive, setCustomReactive] = useState(42);
  const [customOnsite, setCustomOnsite] = useState(38);
  const [prodDays, setProdDays] = useState(3.9);
  const [costPerHour, setCostPerHour] = useState(35);
  // === NEW: Scenario & horizon state ===
  const [digitalSubPct, setDigitalSubPct] = useState(30); // % of reactive work moved to digital
  const [horizon, setHorizon] = useState("Now");          // Now / Next / Future
  const [currency, setCurrency] = useState("£");
  const [functionShares, setFunctionShares] = useState(defaultFunctionShareConfig);
  const [empPctByFn, setEmpPctByFn] = useState({ ...defaultEmpPctConfig });

  // When dbConfig arrives/changes, re-sync state with db defaults
  useEffect(() => {
    if (!dbConfig) return;
    setTotalHeadcount(defaultTotalConfig);
    setAdoptGreen(commonConfig.adoptionGAR[0].value);
    setAdoptAmber(commonConfig.adoptionGAR[1].value);
    setFunctionShares(defaultFunctionShareConfig);
    setEmpPctByFn({ ...defaultEmpPctConfig });
  }, [dbConfig, defaultTotalConfig, commonConfig, defaultFunctionShareConfig, defaultEmpPctConfig]);

  // Map interactions
  const [mapZoom, setMapZoom] = useState(1.2);
  const [mapCenter, setMapCenter] = useState([15, 15]);
  const [hoverCity, setHoverCity] = useState(null);

  const lensData = useMemo(() => lensesConfig[lens], [lensesConfig, lens]);

  // Adoption
  const adoption = useMemo(() => ([
    { name: "Green", value: adoptGreen },
    { name: "Amber", value: adoptAmber },
    { name: "Red", value: adoptRed },
  ]), [adoptGreen, adoptAmber, adoptRed]);
  const adoptionPercent = Math.round((adoptGreen / (adoptGreen + adoptAmber + adoptRed)) * 100);

  // Function headcounts
  const functionsWithCounts = useMemo(() => {
    const normalized = normalizeShares(functionShares);
    const base = allocateByShare(totalHeadcount, normalized, "sharePct", "total");
    return base.map((row) => {
      const pctEmp = empPctByFn[row.team] ?? 70;
      const { employees, contractors } = splitEC(row.total, pctEmp);
      return { ...row, employees, contractors, empPct: pctEmp };
    });
  }, [totalHeadcount, functionShares, empPctByFn]);
  const totals = useMemo(() => {
    const employees = functionsWithCounts.reduce((a, r) => a + r.employees, 0);
    const contractors = functionsWithCounts.reduce((a, r) => a + r.contractors, 0);
    return { employees, contractors, total: employees + contractors };
  }, [functionsWithCounts]);

  // Mixes
  const reactiveProactiveCounts = useMemo(() => {
    const [rxPct, pxPct] = useCustomMix ? [customReactive, 100 - customReactive] : lensData.reactiveProactivePct;
    return allocateByShare(totalHeadcount, [
      { name: "Reactive", pct: rxPct }, { name: "Proactive", pct: pxPct }
    ], "pct", "count");
  }, [lensData, totalHeadcount, useCustomMix, customReactive]);
  const onOffCounts = useMemo(() => {
    const [onPct, offPct] = useCustomMix ? [customOnsite, 100 - customOnsite] : lensData.onOffPct;
    return allocateByShare(totalHeadcount, [
      { name: "On-site", pct: onPct }, { name: "Remote", pct: offPct }
    ], "pct", "count");
  }, [lensData, totalHeadcount, useCustomMix, customOnsite]);

  //   // === NEW: Weekly labour economics ===
  // const weeklyPaidHoursOrg = totalHeadcount * paidDays * 8;
  // const weeklyLabourCost   = weeklyPaidHoursOrg * costPerHour;
  // const weeklyOutcomeUnits = 3200; // illustrative total outcomes/week
  // const costPerOutcome     = weeklyOutcomeUnits ? weeklyLabourCost / weeklyOutcomeUnits : 0;
  // const labourDebtPct      = weeklyLabourCost ? (lostCostWeek / weeklyLabourCost) * 100 : 0;

  // Approx labour liability: 16% of people viewed as unused capacity (Richard's "16 out of 100")
  const liabilityPct         = 16;
  const liabilityHeadcount   = Math.round((liabilityPct / 100) * totalHeadcount);
  const liabilityAnnualCost  = liabilityHeadcount * 8 * 220 * costPerHour; // 220 paid days/yr

  // Digital share across functions (for fusion overlay)
  const digitalShareOrg = useMemo(() => {
    const arr = lensesConfig[lens].fusion.map(f => f.digital);
    return arr.length ? avg(arr) : 0;
  }, [lensesConfig, lens]);

  // === NEW: 2×2 quadrant data (Reactive/Proactive × On-site/Remote) ===
  const quadrantData = useMemo(() => {
    const total = totalHeadcount || 1;

    const rx  = reactiveProactiveCounts.find(d => d.name === "Reactive")?.count  ?? 0;
    const pr  = reactiveProactiveCounts.find(d => d.name === "Proactive")?.count ?? 0;
    const on  = onOffCounts.find(d => d.name === "On-site")?.count ?? 0;
    const off = onOffCounts.find(d => d.name === "Remote")?.count  ?? 0;

    const rxOn  = Math.round((rx / total) * (on / total) * total);
    const rxOff = Math.round((rx / total) * (off / total) * total);
    const prOn  = Math.round((pr / total) * (on / total) * total);
    const prOff = Math.round((pr / total) * (off / total) * total);

    const avgDigital = digitalShareOrg || 0;

    return [
      { key: "rx_on",  name: "Reactive • On-site",  count: rxOn,  digitalTasks: Math.round(rxOn  * avgDigital / 100) },
      { key: "rx_off", name: "Reactive • Remote",   count: rxOff, digitalTasks: Math.round(rxOff * avgDigital / 100) },
      { key: "pr_on",  name: "Proactive • On-site", count: prOn,  digitalTasks: Math.round(prOn  * avgDigital / 100) },
      { key: "pr_off", name: "Proactive • Remote",  count: prOff, digitalTasks: Math.round(prOff * avgDigital / 100) },
    ];
  }, [reactiveProactiveCounts, onOffCounts, totalHeadcount, digitalShareOrg]);

  // === NEW: Replaceability / augmentation index by function ===
  const replaceabilityData = useMemo(() => {
    return functionsWithCounts.map(f => {
      const fx = lensesConfig[lens].fusion.find(x => x.team === f.team);
      const digital = fx ? fx.digital : 40;

      // Simple illustrative split using digital share
      const replaceable  = Math.round(digital * 0.40);
      const augmentable  = Math.round(digital * 0.30);
      const digitalFirst = Math.round(digital * 0.20);
      const unique       = Math.max(0, 100 - (replaceable + augmentable + digitalFirst));

      return {
        team: f.team,
        replaceable,
        augmentable,
        digitalFirst,
        unique,
      };
    });
  }, [functionsWithCounts, lensesConfig, lens]);

  // === NEW: Digital substitution scenario on reactive work ===
  const reactiveCount = reactiveProactiveCounts.find(d => d.name === "Reactive")?.count ?? 0;
  const digitalisedReactiveHours = reactiveCount * paidDays * 8 * (digitalSubPct / 100);
  const digitalisedReactiveCost  = digitalisedReactiveHours * costPerHour;

  // === NEW: Simple horizon projections ===
  const horizonFactors = {
    Now:   { headcount: 1.0, digital: 1.0 },
    Next:  { headcount: 1.05, digital: 1.35 }, // +5% headcount, +35% digital share
    Future:{ headcount: 1.10, digital: 1.80 }, // +10% headcount, +80% digital share
  };
  const hf = horizonFactors[horizon];

  const horizonHeadcount   = Math.round(totalHeadcount * hf.headcount);
  const horizonDigitalShare = Math.min(95, Math.round(digitalShareOrg * hf.digital));

  const forecastData = useMemo(() => {
    return [
      { label: "Now",     headcount: totalHeadcount,       digitalShare: digitalShareOrg },
      { label: "Next",    headcount: horizonHeadcount,     digitalShare: horizonDigitalShare },
      { label: "Future",  headcount: Math.round(horizonHeadcount * 1.05), digitalShare: Math.min(95, Math.round(horizonDigitalShare * 1.1)) },
    ];
  }, [totalHeadcount, digitalShareOrg, horizonHeadcount, horizonDigitalShare]);

  // Outcome index
  const outcomeIndex = Math.round(avg(lensData.outputVsOutcome.map(d => d.outcome)));

  // Labour debt
  const lostDaysPerPerson = Math.max(0, paidDays - prodDays);
  const lostDaysOrg = lostDaysPerPerson * totalHeadcount;
  const lostHoursOrg = lostDaysOrg * 8;
  const lostCostWeek = lostHoursOrg * costPerHour;

  // === NEW: Weekly labour economics ===
  const weeklyPaidHoursOrg = totalHeadcount * paidDays * 8;
  const weeklyLabourCost   = weeklyPaidHoursOrg * costPerHour;
  const weeklyOutcomeUnits = 3200; // illustrative total outcomes/week
  const costPerOutcome     = weeklyOutcomeUnits ? weeklyLabourCost / weeklyOutcomeUnits : 0;
  const labourDebtPct      = weeklyLabourCost ? (lostCostWeek / weeklyLabourCost) * 100 : 0;

  // Sidebar summary metrics (from config)
  const outcomeByLens = useMemo(() => {
    const out = {};
    Object.entries(lensesConfig).forEach(([k, v]) => {
      out[k] = Math.round(avg(v.outputVsOutcome.map(d => d.outcome)));
    });
    return out;
  }, [lensesConfig]);
  const shadowAIByLens = useMemo(() => {
    const out = {};
    Object.entries(lensesConfig).forEach(([k, v]) => {
      out[k] = v.shadowAI;
    });
    return out;
  }, [lensesConfig]);

  // Export/Print
  const downloadCSV = () => {
    const rows = [
      ["Function", "Total", "Employees", "Contractors", "Employee%"],
      ...functionsWithCounts.map(r => [r.team, r.total, r.employees, r.contractors, r.empPct]),
      ["TOTAL", totals.total, totals.employees, totals.contractors, ""],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "org_mix.csv";
    a.click();
  };
  const printPage = () => window.print();

  // Drawer open helpers
  const openFunctionFocus = (team) => {
    setSelectedSite(null);
    setSelectedFunction(team);
    setOpenLeft(true);
  };
  const openSiteFocus = (site) => {
    setSelectedFunction(null);
    setSelectedSite(site);
    setOpenLeft(true);
  };

  // Map data (fallback demo cities; can be overridden from Mongo)
  const FALLBACK_CITIES = [
    { name:"London (HQ)",   coords:[-0.1276,51.5072], people:34, remote:54, team:"Sales" },
    { name:"Krakow",        coords:[19.9449,50.0647], people:22, remote:48, team:"Ops" },
    { name:"Bengaluru",     coords:[77.5946,12.9716], people:58, remote:42, team:"Engineering" },
    { name:"Singapore",     coords:[103.8198,1.3521], people:9,  remote:38, team:"Finance" },
    { name:"New York",      coords:[-74.0060,40.7128],people:11, remote:46, team:"HR" },
  ];
  const CITIES = citiesConfig || FALLBACK_CITIES;

  // Narration
  const narration = [
    `Adoption is stable across lenses: ${adoptionPercent}% Green, ${adoptAmber}% Amber, ${adoptRed}% Red.`,
    `Current lens: ${lens}. Outcome Index averages ${outcomeIndex}/100; closing the Output→Outcome gap is key.`,
    `${reactiveProactiveCounts[0].count} reactive vs ${reactiveProactiveCounts[1].count} proactive — shifting 15–20% to proactive cuts labour debt.`,
    `${onOffCounts[0].count} on-site vs ${onOffCounts[1].count} remote — use dynamic pricing to rebalance cost-to-serve.`,
    `Estimated labour debt: ${lostDaysOrg.toFixed(0)} days/week (~${lostHoursOrg.toFixed(0)} hrs/week ⇒ ${currency}${(lostCostWeek/1000).toFixed(1)}k/week).`,
  ];

  return (
    <div className="relative min-h-screen w-full bg-transparent text-slate-900 print:bg-white text-[15px] md:text-[16px]">
      <ProBackground lens={lens} />
      {/* Header */}
      <div className="relative z-10">
        <button
          onClick={() => setOpenLensDrawer(true)}
          className="hidden lg:flex fixed left-3 top-9 z-40 items-center gap-2 rounded-xl bg-white/90 border border-slate-200 shadow px-2.5 py-1.5 text-xs hover:bg-white"
          title="Open Executive Lenses"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Lenses
        </button>
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-2 print:px-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Fusion Workforce – Executive Lens</h1>
                <div className="text-xs text-slate-500">
                  Human + Digital infusion • {windowKey}
                  {dbLoading && " • loading config…"}
                  {dbError && " • using defaults (config error)"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {SHOW_TIME_FILTER && (
                <select
                  value={windowKey}
                  onChange={(e)=>setWindowKey(e.target.value)}
                  className="ml-2 px-3 py-1.5 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option>Last 6 months</option>
                  <option>Quarter to date</option>
                  <option>Month to date</option>
                </select>
              )}

              <div className="ml-2 inline-flex rounded-xl border border-slate-200 overflow-hidden">
                {["KPI", "Outcome"].map((t) => (
                  <button key={t} onClick={()=>setViewTab(t)}
                    className={`px-3 py-1.5 text-sm transition ${viewTab===t?"bg-slate-900 text-white":"bg-white hover:bg-slate-50"}`}>{t}
                  </button>
                ))}
              </div>

              <Button icon={Settings} onClick={()=>setOpenControls(true)} variant="ghost" className="ml-2">What-if</Button>
              <Button icon={Download} onClick={downloadCSV} variant="ghost" title="Export org mix CSV" />
              <Button icon={Printer} onClick={printPage} variant="ghost" title="Print / Save as PDF" />
            </div>
          </div>

          <div className="mt-2 text-xs text-slate-600 flex items-center gap-4">
            <div><strong>Total:</strong> {totalHeadcount}</div>
            <div><strong>Employees:</strong> {totals.employees}</div>
            <div><strong>Contractors:</strong> {totals.contractors}</div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-slate-400">|</span>
              <button onClick={()=>{
                const nxt = !openNarration;
                setOpenNarration(nxt);
                localStorage.setItem("showHighlights", JSON.stringify(nxt));
              }} className="text-slate-600 hover:underline flex items-center gap-1">
                {openNarration? <ChevronLeft className="w-4 h-4"/>:<ChevronRight className="w-4 h-4" />} Talking points
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ====== Layout: Sidebar + Main ====== */}
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 print:px-0">
        <div className="lg:flex lg:items-start lg:gap-4">
          {/* Left Sidebar (collapsed placeholder) */}
          <aside className="hidden lg:block w-[0px] shrink-0" />

          {/* Mobile Lens selector */}
          <div className="lg:hidden -mt-2 mb-3">
            <div className="flex gap-2 overflow-auto no-scrollbar pb-2">
              {["CEO","CFO","CHRO","CIO"].map((l) => (
                <Button key={l} onClick={() => setLens(l)} variant={lens===l?"default":"ghost"}>{l}</Button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1">
            {/* Narration */}
            <AnimatePresence>
              {openNarration && (
                <motion.div
                  className="pb-2"
                  initial={{ height: 0, opacity:0 }} animate={{ height: "auto", opacity:1 }} exit={{ height: 0, opacity:0 }}
                >
                  <div className="rounded-xl bg-white border border-slate-200 p-3 text-xs text-slate-700 grid sm:grid-cols-5 gap-2">
                    {narration.map((line, i)=> <div key={i}>• {line}</div>)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* === GLOBAL PRESENCE MAP === */}
            <Section
              title="Global Workforce Presence"
              icon={Globe2}
              sub="Bubble size = active people; color = % remote (green) vs on-site (red). Click a city to drill; use +/−/⤾ for zoom."
              action={
                <div className="hidden md:flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: MAP_THEME.bubble.remote }} />
                    More Remote
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: MAP_THEME.bubble.mixed }} />
                    Mixed
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: MAP_THEME.bubble.onsite }} />
                    More On-site
                  </span>
                </div>
              }
            >
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(1000px 520px at 50% 25%, ${MAP_THEME.waterA}, ${MAP_THEME.waterB} 75%)`,
                    opacity: 0.95,
                  }}
                />
                <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
                  <button
                    onClick={() => setMapZoom(z => Math.min(8, +(z + 0.4).toFixed(2)))}
                    className="w-8 h-8 rounded-lg bg-white border shadow text-slate-700 hover:bg-slate-50"
                    title="Zoom in"
                  >+</button>
                  <button
                    onClick={() => setMapZoom(z => Math.max(0.9, +(z - 0.4).toFixed(2)))}
                    className="w-8 h-8 rounded-lg bg-white border shadow text-slate-700 hover:bg-slate-50"
                    title="Zoom out"
                  >−</button>
                  <button
                    onClick={() => { setMapZoom(1.2); setMapCenter([15, 15]); }}
                    className="w-8 h-8 rounded-lg bg-white border shadow text-slate-700 hover:bg-slate-50"
                    title="Reset"
                  >⤾</button>
                </div>

                <div className="relative h-[420px]">
                  <ComposableMap projectionConfig={{ scale: 150 }} style={{ width: "100%", height: "100%" }}>
                    <ZoomableGroup
                      zoom={mapZoom}
                      center={mapCenter}
                      onMoveEnd={({ coordinates, zoom }) => { setMapCenter(coordinates); setMapZoom(zoom); }}
                    >
                      <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                        {({ geographies }) =>
                          geographies.map((geo) => (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              style={{
                                default: { fill: MAP_THEME.land, stroke: MAP_THEME.stroke, strokeWidth: 0.6, outline: "none" },
                                hover:   { fill: MAP_THEME.landHi, stroke: MAP_THEME.stroke, strokeWidth: 0.8, outline: "none" },
                                pressed: { fill: MAP_THEME.landHi, outline: "none" },
                              }}
                            />
                          ))
                        }
                      </Geographies>

                      {/* City bubbles */}
                      {CITIES.map((c, i) => {
                        const size = Math.max(6, Math.min(28, Math.sqrt(c.people) * 3.5));
                        const color =
                          c.remote >= 60 ? MAP_THEME.bubble.remote :
                          c.remote <= 40 ? MAP_THEME.bubble.onsite :
                                          MAP_THEME.bubble.mixed;

                        return (
                          <Marker
                            key={i}
                            coordinates={c.coords}
                            onMouseEnter={() => setHoverCity(c)}
                            onMouseLeave={() => setHoverCity(null)}
                            onClick={() => openSiteFocus({
                              city: c.name,
                              active: c.people,
                              remote: Math.round(c.people*c.remote/100),
                              onsite: c.people - Math.round(c.people*c.remote/100),
                              fn: { [c.team]: c.people }
                            })}
                          >
                            <g style={{ transform: "translate(-1px,-1px)" }}>
                              <circle r={size + 3} fill={MAP_THEME.bubble.ring} opacity={0.85} />
                            </g>
                            <circle
                              r={size}
                              fill={color}
                              stroke="rgba(0,0,0,.25)"
                              opacity={0.95}
                              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.25))" }}
                            />
                            <text textAnchor="middle" y={-(size + 10)} className="fill-slate-800 text-[8px] font-medium">
                              {c.name} · {c.people}
                            </text>
                          </Marker>
                        );
                      })}
                    </ZoomableGroup>
                  </ComposableMap>

                  {/* hover tooltip */}
                  <AnimatePresence>
                    {hoverCity && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="pointer-events-none absolute left-3 bottom-3 z-10"
                      >
                        <div className="rounded-xl bg-white/95 shadow-lg border px-3 py-2 text-xs">
                          <div className="font-semibold text-slate-800">{hoverCity.name}</div>
                          <div className="text-slate-600">Active: {hoverCity.people}</div>
                          <div className="text-slate-600">Remote: {hoverCity.remote}%</div>
                          <div className="text-slate-500">Primary team: {hoverCity.team}</div>
                          <div className="mt-1 text-[10px] text-slate-400">Click bubble to open Site Focus</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Section>

            {/* KPI row */}
            <div className="mt-4 grid gap-4 justify-items-center [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {canShowCard(lens, "adoption") && (
                <Card icon={Activity} title={<span className="font-bold">Adoption status</span>} value={`${adoptionPercent}% Green`} hint="Consistent across lenses">
                  <div className="flex items-center gap-4 mt-2">
                    <RadialGauge percent={adoptionPercent} />
                    <div className="text-xs space-y-1">
                      {adoption.map((s, i) => (
                        <div key={s.name} className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full" style={{ background: GAR_COLORS[i] }} />
                          <span className="w-16">{s.name}</span>
                          <span className="font-medium">{s.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {canShowCard(lens, "shadow") && (
                <Card icon={ShieldAlert} title={<span className="font-bold">Shadow AI usage</span>} value={`${lensData.shadowAI}%`} hint="Unapproved AI tools (weekly)">
                  <div className="mt-3"><BarMini value={lensData.shadowAI} /></div>
                  <div className="text-xs text-slate-500 mt-2">Enable enterprise AI with guardrails; convert risk → value.</div>
                </Card>
              )}

              {canShowCard(lens, "outcome") && (
                <Card icon={LineChartIcon} title={<span className="font-bold">Outcome index</span>} value={`${outcomeIndex} / 100`} hint="Avg of Outcome series">
                  <div className="mt-3"><Sparkline data={lensData.outputVsOutcome.map(d=>d.outcome)} /></div>
                  <div className="text-xs text-slate-500 mt-2">Raising proactive work + automation lifts the green curve faster.</div>
                </Card>
              )}

              {canShowCard(lens, "labour") && (
                <Card
                  icon={DollarSign}
                  title={<span className="font-bold">Labour debt (est.)</span>}
                  value={`${lostDaysOrg.toFixed(0)} days/wk`}
                  hint={`${lostHoursOrg.toFixed(0)} hrs/wk • ${currency}${(lostCostWeek/1000).toFixed(1)}k/wk`}
                >
                  <div className="mt-3 text-xs text-slate-500">
                    Paying {paidDays}d; receiving ~{prodDays.toFixed(1)}d → {(paidDays - prodDays).toFixed(1)}d gap × {totalHeadcount} ppl.
                  </div>
                </Card>
              )}
            </div>

            {/* Badges */}
            <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <SimpleBadge label="Device match" value={commonConfig.deviceTrust.deviceMatch ? "Verified" : "Mismatch"} tone={commonConfig.deviceTrust.deviceMatch ? "green" : "red"} />
              <SimpleBadge label="Geofence" value={commonConfig.deviceTrust.geofence} tone="indigo" />
              <SimpleBadge
                label="Trust score"
                value={`${commonConfig.deviceTrust.trustScore}`}
                tone={commonConfig.deviceTrust.trustScore>=80?"green":commonConfig.deviceTrust.trustScore>=60?"amber":"red"}
              />
              <SimpleBadge label="Policy" value={commonConfig.deviceTrust.policyCompliant ? "Compliant" : "Breach"} tone={commonConfig.deviceTrust.policyCompliant ? "green" : "red"} />
            </div>

            {/* Sections */}
            <div
              className="mt-4 grid gap-4 justify-center"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 500px))' }}
            >
              {canShowSection(lens, "output_outcome") && (
                <Section title="Output vs Outcome" icon={Workflow} sub="Output = effort; Outcome = value. Closing the gap improves ROI.">
                  {viewTab === "Outcome" ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={lensData.outputVsOutcome} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="out" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="outc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.5} />
                              <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="output" stroke={COLORS.indigo} fillOpacity={1} fill="url(#out)" name="Output" />
                          <Area type="monotone" dataKey="outcome" stroke={COLORS.emerald} fillOpacity={1} fill="url(#outc)" name="Outcome" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <Card title="Outcome Index" value={`${outcomeIndex} / 100`} hint="Avg of monthly outcomes" />
                      <Card title="GAR Green" value={`${adoptGreen}%`} hint="Consistent adoption value" />
                      <Card
                        title="Proactive mix"
                        value={`${(useCustomMix ? (100-customReactive) : lensesConfig[lens].reactiveProactivePct[1])}%`}
                        hint="Shift ↑ = less labour debt"
                      />
                    </div>
                  )}
                </Section>
              )}

              {canShowSection(lens, "quadrant") && (
                <Section
                  title="2×2 Work Matrix (Proactive/Reactive × On/Off-location)"
                  icon={Activity}
                  sub="Quadrants show where work actually lives; overlay highlights digital-capable work."
                >
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {quadrantData.map(q => (
                      <div key={q.key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <div className="font-semibold text-slate-800 text-sm mb-1">{q.name}</div>
                        <div className="text-slate-600">People: <span className="font-semibold">{q.count}</span></div>
                        <div className="text-slate-600">
                          Digital-capable tasks (est.):{" "}
                          <span className="font-semibold">{q.digitalTasks}</span>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500">
                          Shift volume from left/top to right/bottom and increase digital overlay to reduce labour debt.
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}


              {canShowSection(lens, "fusion") && (
                <Section title="Human–Digital Fusion by Function" icon={Cpu} sub="Task mix (not headcount): % human vs digital by function. Click a bar to drill.">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lensData.fusion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="team" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="human" stackId="a" name="Human" fill={COLORS.slate} radius={[6,6,0,0]}
                             onClick={(d)=>openFunctionFocus(d.team)} cursor="pointer" />
                        <Bar dataKey="digital" stackId="a" name="Digital" fill={COLORS.violet} radius={[6,6,0,0]}
                             onClick={(d)=>openFunctionFocus(d.team)} cursor="pointer" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              )}

              {canShowSection(lens, "reactive_proactive") && (
                <Section title="Reactive vs Proactive (counts)" icon={Activity} sub="Reactive = interrupts; Proactive = planned improvements. Aim to grow proactive.">
                  <div className="h-64 grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center justify-center">
                      <PieChart width={170} height={170}>
                        <Pie data={reactiveProactiveCounts} dataKey="count" outerRadius={70}>
                          {reactiveProactiveCounts.map((_, i) => (<Cell key={`rp-${i}`} fill={i===0?COLORS.rose:COLORS.green} />))}
                        </Pie>
                      </PieChart>
                      <div className="text-sm flex items-center gap-6 flex-nowrap whitespace-nowrap overflow-visible w-full">
                        <Badge tone="red">Reactive {reactiveProactiveCounts[0].count}</Badge>
                        <span className="mx-2">→</span>
                        <Badge tone="green">Proactive {reactiveProactiveCounts[1].count}</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center">
                      Shift 15–20% of reactive to proactive pods; automate L1 triage to improve outcome & cut cost.
                    </div>
                  </div>
                </Section>
              )}

              {canShowSection(lens, "roi") && (
                <Section
                  title="Cost & Value Lens – ROI on People"
                  icon={DollarSign}
                  sub="Moves the conversation from headcount to outcome economics and labour debt/liability."
                >
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                      <div className="text-xs font-semibold text-slate-700 mb-1">Outcome economics</div>
                      <div className="text-slate-700">
                        Weekly labour cost: <strong>{currency}{(weeklyLabourCost/1000).toFixed(1)}k</strong><br/>
                        Outcomes/week (illus.): <strong>{weeklyOutcomeUnits.toLocaleString()}</strong><br/>
                        Cost per outcome: <strong>{currency}{costPerOutcome.toFixed(2)}</strong>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500">
                        Shifting work into proactive + digital quadrants reduces cost per outcome, not just cost per FTE.
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                      <div className="text-xs font-semibold text-slate-700 mb-1">Labour debt & labour liability</div>
                      <div className="text-slate-700">
                        Labour debt: <strong>{labourDebtPct.toFixed(1)}%</strong> of weekly spend (~
                        {currency}{(lostCostWeek/1000).toFixed(1)}k/wk)<br/>
                        Labour liability (16% unused):{" "}
                        <strong>{liabilityHeadcount}</strong> people<br/>
                        Annual liability (illus.):{" "}
                        <strong>{currency}{(liabilityAnnualCost/1000000).toFixed(2)}m</strong>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500">
                        Highlights the balance-sheet effect of unused capacity and the case for digital substitution or redeployment.
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 p-3 text-xs text-slate-700">
                    <div className="font-semibold mb-1">Digital substitution scenario</div>
                    <div>
                      If <strong>{digitalSubPct}%</strong> of reactive work for ~{reactiveCount} people is converted to digital capacity,
                      you unlock ~<strong>{digitalisedReactiveHours.toFixed(0)} hrs/week</strong> of work, worth roughly{" "}
                      <strong>{currency}{(digitalisedReactiveCost/1000).toFixed(1)}k/week</strong> at current rates.
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      This frames “FusionWork™” as converting labour debt into digital capacity and outcome uplift.
                    </div>
                  </div>
                </Section>
              )}


              {canShowSection(lens, "onoff") && (
                <Section title="On-site vs Remote (counts)" icon={Globe2} sub="Where work is performed. Useful for cost, compliance, and scheduling.">
                  <div className="h-64 grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center justify-center">
                      <PieChart width={170} height={170}>
                        <Pie data={onOffCounts} dataKey="count" outerRadius={70}>
                          {onOffCounts.map((_, i) => (<Cell key={`ol-${i}`} fill={i===0?COLORS.indigo:COLORS.zinc} />))}
                        </Pie>
                      </PieChart>
                      <div className="text-sm flex items-center gap-6 flex-nowrap whitespace-nowrap overflow-visible w-full">
                        <Badge tone="indigo">On-site {onOffCounts[0].count}</Badge><span className="mx-2">/</span>
                        <Badge>Remote {onOffCounts[1].count}</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center">
                      Move run-work to best-shore remote (policy permitting); keep outcome-critical roles near users.
                    </div>
                  </div>
                </Section>
              )}

              {canShowSection(lens, "emp_contractor_org") && (
                <Section title="Employee vs Contractor (Org)" icon={Users} sub="Employees anchor IP & continuity; contractors flex for peaks & run.">
                  <div className="h-64 grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center justify-center">
                      <PieChart width={170} height={170}>
                        <Pie data={[{name:"Employees", value: totals.employees},{name:"Contractors", value: totals.contractors}]} dataKey="value" outerRadius={70}>
                          <Cell fill={COLORS.indigo} /><Cell fill={COLORS.zinc} />
                        </Pie>
                      </PieChart>
                      <div className="text-sm flex items-center gap-6 flex-nowrap whitespace-nowrap overflow-visible w-full">
                        <Badge tone="indigo">Employees {totals.employees}</Badge><span className="mx-2">/</span>
                        <Badge>Contractors {totals.contractors}</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center">
                      Current mix: {Math.round((totals.employees/totalHeadcount)*100)}% employees / {Math.round((totals.contractors/totalHeadcount)*100)}% contractors.
                    </div>
                  </div>
                </Section>
              )}

              {canShowSection(lens, "emp_contractor_fn") && (
                <Section title="Employee vs Contractor by Function" icon={Users} sub="Click a bar to focus a function.">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={functionsWithCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="team" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="employees" stackId="mix" name="Employees" fill={COLORS.indigo} radius={[6,6,0,0]}
                             onClick={(d)=>openFunctionFocus(d.team)} cursor="pointer" />
                        <Bar dataKey="contractors" stackId="mix" name="Contractors" fill={COLORS.zinc} radius={[6,6,0,0]}
                             onClick={(d)=>openFunctionFocus(d.team)} cursor="pointer" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              )}

              {canShowSection(lens, "replaceability") && (
                <Section
                  title="Replaceability & Augmentation Index"
                  icon={Cpu}
                  sub="Classifies work by function into replaceable, augmentable, digital-first and unique human."
                >
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={replaceabilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="team" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="replaceable"   stackId="rep" name="Replaceable"   fill={COLORS.green} />
                        <Bar dataKey="augmentable"   stackId="rep" name="Augmentable"   fill={COLORS.indigo} />
                        <Bar dataKey="digitalFirst"  stackId="rep" name="Digital-first" fill={COLORS.emerald} />
                        <Bar dataKey="unique"        stackId="rep" name="Unique human"  fill={COLORS.rose} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Use this to answer: where can we replace, where must we augment, and where is human uniqueness the differentiator?
                  </div>
                </Section>
              )}


              {canShowSection(lens, "holiday_sickness") && (
                <Section title="Holiday & Sickness (trend)" icon={Users} sub="Align PTO & on-call with release windows to stabilise delivery.">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={commonConfig.holidaySickness} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="holiday" name="Holiday %" stroke={COLORS.indigo} strokeWidth={2} dot={{ r:2 }} />
                        <Line type="monotone" dataKey="sickness" name="Sickness %" stroke={COLORS.rose} strokeWidth={2} dot={{ r:2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              )}

              {canShowSection(lens, "license_util") && (
                <Section title="License Utilisation (GAR)" icon={Building2} sub="Quick view of value vs waste across major platforms.">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={lensData.licenseUtil} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="app" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="util" radius={[6,6,0,0]}>
                          {lensData.licenseUtil.map((row, i) => {
                            const tone = row.util >= 70 ? COLORS.green : row.util >= 40 ? COLORS.amber : COLORS.red;
                            return <Cell key={`lic-${i}`} fill={tone} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              )}

              {canShowSection(lens, "liability_asset") && (
                <Section title="Liability vs Asset Curve (illustrative)" icon={FileWarning} sub="Aim to move points up/right (asset) and reduce left/down (liability).">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="idx" name="Individuals" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="asset" dataKey="asset" name="Asset Index" domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="liab" orientation="right" dataKey="liability" domain={[0, 100]} hide />
                        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                        <Scatter
                          name="Individuals"
                          data={Array.from({ length: 40 }).map((_, i) => {
                            const skill = 40 + i * 1.2;
                            const effort = 5 + Math.max(0, 55 - i * 1.1);
                            const liability = Math.max(0, 100 - (skill + effort));
                            const asset = Math.min(100, skill + (60 - effort));
                            return { idx: i + 1, liability, asset };
                          })}
                          yAxisId="asset"
                          fill={COLORS.green}
                          shape="circle"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              )}

              {canShowSection(lens, "region_cost") && (
                <Section title="Region Cost (to London baseline)" icon={Factory} sub="Indicative labour index (London=100).">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={regionCostConfig} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="cost" stroke={COLORS.indigo} strokeWidth={3} dot={{ r:3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              )}

              {canShowSection(lens, "horizon") && (
                <Section
                  title="Time Horizon – Now, Next, Future"
                  icon={LineChartIcon}
                  sub="Frames FusionWork™ as an operating model transition, not a one-off report."
                  action={
                    <select
                      value={horizon}
                      onChange={(e) => setHorizon(e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option>Now</option>
                      <option>Next</option>
                      <option>Future</option>
                    </select>
                  }
                >
                  <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                    <SimpleBadge
                      label="Headcount (Now)"
                      value={totalHeadcount}
                      tone="slate"
                    />
                    <SimpleBadge
                      label={`${horizon} headcount (plan)`}
                      value={horizonHeadcount}
                      tone="indigo"
                    />
                    <SimpleBadge
                      label={`${horizon} digital share`}
                      value={`${horizonDigitalShare}%`}
                      tone="green"
                    />
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="headcount" name="Headcount" stroke={COLORS.indigo} strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="digitalShare" name="Digital share (%)" stroke={COLORS.green} strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    “Now” = current workforce, “Next” = 12–24 months, “Future” = digital-dominant state. Each point can be backed by plan assumptions.
                  </div>
                </Section>
              )}


              {canShowSection(lens, "anomalies") && (
                <Section title="Anomalies & Next Actions" icon={ShieldAlert} sub="Curated signals with recommended next steps.">
                  <ul className="space-y-2 text-sm">
                    {lensData.anomalies.map((a)=>(
                      <li key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                        <Badge tone="amber">{a.id}</Badge>
                        <div>
                          <div className="font-medium">{a.label}</div>
                          <div className="text-slate-500 text-xs">Impact: {a.impact}</div>
                          <div className="text-slate-600 text-xs mt-1">Next: {a.hint}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>

              {canShowSection(lens, "individual_model") && (
                <Section
                  title="Individual Economic Model – Physical, Digital, Combined Me"
                  icon={Users}
                  sub="Illustrates contribution, replaceability and augmentation at a talent level."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {INDIVIDUAL_PROFILES.map(p => (
                      <div key={p.name} className="rounded-xl border border-slate-200 bg-white/80 p-3">
                        <div className="font-semibold text-slate-800 text-sm mb-1">{p.name}</div>
                        <div className="text-slate-600">
                          Physical outcome index: <strong>{p.physical.toFixed(1)}x</strong><br/>
                          Digital outcome index: <strong>{p.digital.toFixed(1)}x</strong><br/>
                          Combined productivity: <strong>{p.combined.toFixed(1)}x</strong>
                        </div>
                        <div className="mt-1">
                          <Badge tone={p.type === "Digital-first" ? "indigo" : p.type === "Augmentable" ? "amber" : "green"}>
                            {p.type}
                          </Badge>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500">
                          Use this to talk about talent-level ROI and how Digital Me + Physical Me compound value.
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}


            <div className="py-6 text-xs text-slate-500 print:hidden text-center">
              This is an interactive, illustrative dashboard for Human + Digital fusion, dynamic pricing, and workforce optimisation.
            </div>
          </main>
        </div>
      </div>

      {/* What-If Drawer */}
      <Drawer open={openControls} onClose={()=>setOpenControls(false)} title="What-If Controls" side="right">
        <div className="text-xs text-slate-600 mb-3">Tune assumptions to see the story update live.</div>
        <SliderRow label="Total headcount" min={100} max={12000} step={20} value={totalHeadcount} onChange={setTotalHeadcount} suffix="" hint="Rescales all function counts." />

        <div className="mt-4 font-semibold text-slate-700 mb-1">Adoption (constant across lenses)</div>
        <SliderRow label="Green" value={adoptGreen} onChange={setAdoptGreen} />
        <SliderRow label="Amber" value={adoptAmber} onChange={setAdoptAmber} />
        <div className="text-[11px] text-slate-500 mb-3">Red auto = {adoptRed}%</div>

        <SwitchRow label="Use custom Reactive/Proactive & On-site/Remote" checked={useCustomMix} onChange={setUseCustomMix} />
        {useCustomMix && (
          <>
            <SliderRow label="Reactive %" value={customReactive} onChange={setCustomReactive} />
            <div className="text-[11px] text-slate-500 mb-2">Proactive auto = {100-customReactive}%</div>
            <SliderRow label="On-site %" value={customOnsite} onChange={setCustomOnsite} />
            <div className="text-[11px] text-slate-500 mb-2">Remote auto = {100-customOnsite}%</div>
          </>
        )}
        <div className="mt-4 font-semibold text-slate-700 mb-1">Digital substitution</div>
        <SliderRow
          label="Reactive work → Digital"
          min={0}
          max={60}
          step={5}
          value={digitalSubPct}
          onChange={setDigitalSubPct}
          suffix="%"
          hint="Illustrative share of reactive work that could be converted into digital capacity."
        />

        <div className="mt-4 font-semibold text-slate-700 mb-1">Productivity & Cost</div>
        <SliderRow label="Productive days / week" min={3.0} max={4.8} step={0.1} value={prodDays} onChange={setProdDays} suffix="d" hint="Raises or lowers labour debt." />
        <div className="flex items-center gap-2 mb-2">
          <select value={currency} onChange={(e)=>setCurrency(e.target.value)} className="px-2 py-1 border rounded">
            <option>£</option><option>₹</option><option>$</option><option>€</option>
          </select>
          <input type="number" className="w-24 px-2 py-1 border rounded" value={costPerHour}
            onChange={(e)=>setCostPerHour(Number(e.target.value))} />
          <span className="text-xs text-slate-500">/ hour</span>
        </div>
        <div className="text-[11px] text-slate-500 mb-4">
          Lost ≈ {lostHoursOrg.toFixed(0)} hrs/week ⇒ {currency}{(lostCostWeek/1000).toFixed(1)}k/week
        </div>

        <div className="mt-4 font-semibold text-slate-700 mb-1">Function Shares (must sum ≈ 100%)</div>
        {functionShares.map((f, idx)=>(
          <SliderRow key={f.team} label={`${f.team} share`} value={f.sharePct}
            onChange={(v)=>updateShare(idx, v, functionShares, setFunctionShares)} />
        ))}
        <div className="text-[11px] text-slate-500 mb-3">
          Current total: {functionShares.reduce((a,b)=>a+b.sharePct,0)}%
        </div>

        <div className="mt-4 font-semibold text-slate-700 mb-1">Employee % by Function</div>
        {Object.keys(empPctByFn).map((team)=>(
          <SliderRow key={team} label={`${team} Employees %`} value={empPctByFn[team]}
            onChange={(v)=>setEmpPctByFn(prev=>({...prev,[team]:v}))} />
        ))}

        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="ghost"
            icon={RefreshCw}
            onClick={()=>{
              setTotalHeadcount(defaultTotalConfig);
              setAdoptGreen(commonConfig.adoptionGAR[0].value);
              setAdoptAmber(commonConfig.adoptionGAR[1].value);
              setUseCustomMix(false);
              setCustomReactive(42);
              setCustomOnsite(38);
              setProdDays(3.9);
              setCostPerHour(35);
              setCurrency("£");
              setFunctionShares(defaultFunctionShareConfig);
              setEmpPctByFn({...defaultEmpPctConfig});
            }}
          >
            Reset
          </Button>
        </div>
      </Drawer>

      {/* Executive Lenses Drawer (Left) */}
      <Drawer
        open={openLensDrawer}
        onClose={() => setOpenLensDrawer(false)}
        title="Executive Lenses"
        side="left"
      >
        <LensSidebar
          activeLens={lens}
          // When a lens is chosen, also close the drawer
          onSelect={(k) => { setLens(k); setOpenLensDrawer(false); }}
          outcomeByLens={outcomeByLens}
          shadowAIByLens={shadowAIByLens}
          snapshot={{
            total: totalHeadcount,
            employees: totals.employees,
            contractors: totals.contractors,
            outcome: Math.round(avg(lensesConfig[lens].outputVsOutcome.map(d => d.outcome))),
            adoption: adoptionPercent,
            shadow: lensesConfig[lens].shadowAI,
            trust: commonConfig.deviceTrust.trustScore
          }}
          onToggleNarration={()=>{
            const nxt = !openNarration;
            setOpenNarration(nxt);
            localStorage.setItem("showHighlights", JSON.stringify(nxt));
          }}
          openNarration={openNarration}
          onExport={downloadCSV}
          onPrint={printPage}
        />
      </Drawer>

      {/* Unified LEFT Drawer */}
      <Drawer
        open={openLeft}
        onClose={() => { setOpenLeft(false); setSelectedFunction(null); setSelectedSite(null); }}
        title={selectedSite ? `Site Focus: ${selectedSite.city}` : `Function Focus: ${selectedFunction ?? ""}`}
        side="left"
      >
        {selectedSite ? (
          <SiteDetails site={selectedSite} currency={currency} onClose={()=>{ setOpenLeft(false); setSelectedSite(null); }} />
        ) : selectedFunction ? (
          <FunctionDetails
            team={selectedFunction}
            functionsWithCounts={functionsWithCounts}
            lensFusion={lensesConfig[lens].fusion}
            currency={currency}
            onClose={()=>{ setOpenLeft(false); setSelectedFunction(null); }}
          />
        ) : (
          <div className="text-sm text-slate-600">Click a city bubble on the map, or a bar in “Fusion by Function”.</div>
        )}
      </Drawer>
    </div>
  );
}

/* =========================
 *  Function Details Panel
 *  ========================= */
function FunctionDetails({ team, functionsWithCounts, lensFusion, currency, onClose }) {
  const f = functionsWithCounts.find(x => x.team === team);
  const fx = lensFusion.find(x => x.team === team);
  if (!f || !fx) return <div className="text-sm text-slate-600">No data.</div>;

  const estHourly = 35;
  const estWeeklyHours = (f.total * 40);
  const estDigitalShare = fx.digital / 100;
  const estAutomationSavings = estWeeklyHours * estDigitalShare * 0.15 * estHourly;

  return (
    <div className="text-sm">
      <div className="mb-2">
        <div className="text-slate-800 font-semibold">{team}</div>
        <div className="text-slate-500">Headcount: {f.total} • Employees: {f.employees} • Contractors: {f.contractors}</div>
      </div>

      <div className="rounded-xl border p-3 mb-3">
        <div className="text-xs text-slate-500 mb-2">Task Mix (Human vs Digital)</div>
        <div className="flex items-center gap-3">
          <Badge tone="slate">Human {fx.human}%</Badge>
          <Badge tone="indigo">Digital {fx.digital}%</Badge>
        </div>
      </div>

      <div className="rounded-xl border p-3 mb-3">
        <div className="text-xs text-slate-500 mb-1">What-If Savings (illustrative)</div>
        <div className="text-slate-700">
          Weekly Hours ≈ {estWeeklyHours.toLocaleString()} • Digital share {Math.round(estDigitalShare*100)}%<br/>
          Potential extra leverage (15% of digital hours): <strong>{currency}{(estAutomationSavings/1000).toFixed(1)}k / week</strong>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">Uses a simple assumption to make the conversation tangible.</div>
      </div>

      <div className="rounded-xl border p-3">
        <div className="text-xs text-slate-500 mb-1">Staffing Guidance</div>
        <ul className="list-disc ml-4 space-y-1">
          <li>Keep core knowledge and process ownership in Employees.</li>
          <li>Use contractor pods for reactive run or short surges.</li>
          <li>Automate repeatable workflows; track outcome vs output.</li>
        </ul>
      </div>

      <div className="mt-4">
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

/* =========================
 *  Site Details Panel
 *  ========================= */
function SiteDetails({ site, currency, onClose }) {
  if (!site) return null;
  const remoteShare = site.active ? Math.round((site.remote / site.active) * 100) : 0;
  const onsiteShare = 100 - remoteShare;

  return (
    <div className="text-sm">
      <div className="mb-2">
        <div className="text-slate-800 font-semibold">{site.city}</div>
        <div className="text-slate-500">
          Active: {site.active} • On-site: {site.onsite} • Remote: {site.remote}
        </div>
      </div>

      <div className="rounded-xl border p-3 mb-3">
        <div className="text-xs text-slate-500 mb-1">Work Mode Split</div>
        <div className="flex items-center gap-2">
          <Badge tone="indigo">On-site {onsiteShare}%</Badge>
          <Badge tone="green">Remote {remoteShare}%</Badge>
        </div>
      </div>

      {site.fn && (
        <div className="rounded-xl border p-3 mb-3">
          <div className="text-xs text-slate-500 mb-1">Function Breakdown (active)</div>
          <ul className="space-y-1">
            {Object.entries(site.fn).map(([k,v]) => (
              <li key={k} className="flex items-center justify-between">
                <span className="text-slate-700">{k}</span>
                <span className="font-medium">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-[11px] text-slate-500">
        This view is aggregated per city/site for privacy. Wire this to your FastAPI endpoint that returns
        site presence (active/onsite/remote) for real data.
      </div>

      <div className="mt-4">
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

/* =========================
 *  HELPERS: share normalisation
 *  ========================= */
function normalizeShares(shares) {
  const sum = shares.reduce((a,b)=>a+b.sharePct,0);
  if (sum === 100) return shares;
  return shares.map(s => ({ ...s, sharePct: Math.max(0, Math.round((s.sharePct/sum)*100)) }));
}
function updateShare(idx, value, shares, setShares) {
  const next = shares.map((s,i)=> i===idx ? { ...s, sharePct: value } : s);
  setShares(next);
}

// Below is the code conatainig hardcoded values for the dashboard and above is connected with mongo DB.


// // src/App.jsx
// import React, { useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Activity, Cpu, Users, DollarSign, Sparkles, LineChart as LineChartIcon,
//   ShieldAlert, Globe2, Factory, Building2, FileWarning, Workflow, Info,
//   Settings, RefreshCw, Download, Printer, X, ChevronRight, ChevronLeft
// } from "lucide-react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
//   ScatterChart, Scatter
// } from "recharts";

// /* === Map libs === */
// import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

// /* =========================
//  *  VISUAL PALETTE
//  *  ========================= */
// const COLORS = {
//   green: "#22c55e",
//   amber: "#f59e0b",
//   red: "#ef4444",
//   blue: "#3b82f6",
//   indigo: "#6366f1",
//   slate: "#64748b",
//   zinc: "#71717a",
//   rose: "#f43f5e",
//   emerald: "#10b981",
//   violet: "#8b5cf6",
// };
// const GAR_COLORS = [COLORS.green, COLORS.amber, COLORS.red];
// const SHOW_TIME_FILTER = false;   
// /* === Map theme (natural water/land) === */
// const MAP_THEME = {
//   waterA: "#eaf4ff",
//   waterB: "#cfe6ff",
//   land:   "#cfe8cc",
//   landHi: "#bfe0bc",
//   stroke: "rgba(18,84,46,.45)",
//   bubble: {
//     remote: "#10b981",
//     mixed:  "#f59e0b",
//     onsite: "#ef4444",
//     ring:   "rgba(255,255,255,.65)"
//   },
//   text: {
//     label: "#0f172a",
//     halo:  "rgba(255,255,255,.8)"
//   }
// };

// /* =========================
//  *  BUSINESS DEFAULTS
//  *  ========================= */
// // const DEFAULT_TOTAL = 400;
// const DEFAULT_TOTAL = 6639;
// // const DEFAULT_FUNCTION_SHARE = [
// //   { team: "Sales", sharePct: 22 },
// //   { team: "Ops", sharePct: 28 },
// //   { team: "Finance", sharePct: 12 },
// //   { team: "HR", sharePct: 8 },
// //   { team: "Engineering", sharePct: 30 },
// // ];

// const DEFAULT_FUNCTION_SHARE = [
//   { team: "Sales",       sharePct: 20 },
//   { team: "Ops",         sharePct: 26 },
//   { team: "Finance",     sharePct: 12 },
//   { team: "HR",          sharePct: 10 },
//   { team: "Engineering", sharePct: 32 },
// ];

// // const DEFAULT_EMP_PCT = {
// //   Sales: 78, Ops: 65, Finance: 85, HR: 90, Engineering: 58,
// // };

// // after (hits ~4,764 employees with DEFAULT_FUNCTION_SHARE)
// // const DEFAULT_EMP_PCT = {
// //   Sales: 76,
// //   Ops: 69,
// //   Finance: 81,
// //   HR: 85,
// //   Engineering: 64,
// // };

// const DEFAULT_EMP_PCT = {
//   Sales: 74,
//   Ops: 67,
//   Finance: 83,
//   HR: 85,
//   Engineering: 66,
// };
// const COMMON = {
//   adoptionGAR: [
//     { name: "Green", value: 56 },
//     { name: "Amber", value: 30 },
//     { name: "Red", value: 14 },
//   ],
//   deviceTrust: { deviceMatch: true, geofence: "Office/Home", trustScore: 92, policyCompliant: true },
//   holidaySickness: [
//     { month: "Apr", holiday: 3.1, sickness: 1.2 },
//     { month: "May", holiday: 2.4, sickness: 1.0 },
//     { month: "Jun", holiday: 2.8, sickness: 1.4 },
//     { month: "Jul", holiday: 3.6, sickness: 1.1 },
//     { month: "Aug", holiday: 4.2, sickness: 0.9 },
//     { month: "Sep", holiday: 2.9, sickness: 1.3 },
//   ],
// };
// const PAID_DAYS = 5.0;

// /* =========================
//  *  LENSES
//  *  ========================= */
// const LENSES = {
//   CEO: {
//     shadowAI: 34,
//     outputVsOutcome: [
//       { month: "Apr", output: 62, outcome: 48 },
//       { month: "May", output: 65, outcome: 55 },
//       { month: "Jun", output: 68, outcome: 57 },
//       { month: "Jul", output: 71, outcome: 63 },
//       { month: "Aug", output: 73, outcome: 66 },
//       { month: "Sep", output: 76, outcome: 72 },
//     ],
//     fusion: [
//       { team: "Sales", human: 68, digital: 32 },
//       { team: "Ops", human: 54, digital: 46 },
//       { team: "Finance", human: 61, digital: 39 },
//       { team: "HR", human: 74, digital: 26 },
//       { team: "Engineering", human: 49, digital: 51 },
//     ],
//     reactiveProactivePct: [42, 58],
//     onOffPct: [38, 62],
//     licenseUtil: [
//       { app: "M365", util: 78 }, { app: "Jira", util: 64 },
//       { app: "Salesforce", util: 59 }, { app: "Copilot", util: 31 },
//       { app: "ChatGPT Ent.", util: 22 },
//     ],
//     anomalies: [
//       { id: "A-1023", label: "High Shadow AI in Sales", impact: "Policy/Risk", hint: "Enable enterprise chat + guardrails." },
//       { id: "A-1048", label: "Copilot under-utilised", impact: "Cost Leakage", hint: "Reassign seats to Eng/Ops doc-heavy teams." },
//     ],
//   },
//   CFO: {
//     shadowAI: 28,
//     outputVsOutcome: [
//       { month: "Apr", output: 58, outcome: 46 },
//       { month: "May", output: 60, outcome: 50 },
//       { month: "Jun", output: 63, outcome: 53 },
//       { month: "Jul", output: 65, outcome: 56 },
//       { month: "Aug", output: 67, outcome: 60 },
//       { month: "Sep", output: 69, outcome: 62 },
//     ],
//     fusion: [
//       { team: "Sales", human: 66, digital: 34 },
//       { team: "Ops", human: 52, digital: 48 },
//       { team: "Finance", human: 58, digital: 42 },
//       { team: "HR", human: 72, digital: 28 },
//       { team: "Engineering", human: 48, digital: 52 },
//     ],
//     reactiveProactivePct: [46, 54],
//     onOffPct: [41, 59],
//     licenseUtil: [
//       { app: "M365", util: 81 }, { app: "Jira", util: 66 },
//       { app: "Salesforce", util: 63 }, { app: "Copilot", util: 28 },
//       { app: "ChatGPT Ent.", util: 19 },
//     ],
//     anomalies: [
//       { id: "F-2001", label: "Under-used SFDC seats", impact: "Cost", hint: "Downshift 30 seats, save ~£48k/yr." },
//       { id: "F-2002", label: "High overtime in Ops", impact: "Spend", hint: "Automate L1 triage to cut 22%." },
//     ],
//   },
//   CHRO: {
//     shadowAI: 19,
//     outputVsOutcome: [
//       { month: "Apr", output: 55, outcome: 45 },
//       { month: "May", output: 58, outcome: 51 },
//       { month: "Jun", output: 61, outcome: 54 },
//       { month: "Jul", output: 64, outcome: 58 },
//       { month: "Aug", output: 67, outcome: 61 },
//       { month: "Sep", output: 70, outcome: 65 },
//     ],
//     fusion: [
//       { team: "Sales", human: 71, digital: 29 },
//       { team: "Ops", human: 60, digital: 40 },
//       { team: "Finance", human: 66, digital: 34 },
//       { team: "HR", human: 78, digital: 22 },
//       { team: "Engineering", human: 53, digital: 47 },
//     ],
//     reactiveProactivePct: [39, 61],
//     onOffPct: [36, 64],
//     licenseUtil: [
//       { app: "M365", util: 84 }, { app: "Jira", util: 62 },
//       { app: "Salesforce", util: 57 }, { app: "Copilot", util: 34 },
//       { app: "ChatGPT Ent.", util: 26 },
//     ],
//     anomalies: [
//       { id: "H-3001", label: "Sick-leave spikes (Eng)", impact: "Wellbeing", hint: "Align releases + PTO; review on-call." },
//     ],
//   },
//   CIO: {
//     shadowAI: 41,
//     outputVsOutcome: [
//       { month: "Apr", output: 61, outcome: 49 },
//       { month: "May", output: 63, outcome: 52 },
//       { month: "Jun", output: 66, outcome: 55 },
//       { month: "Jul", output: 69, outcome: 59 },
//       { month: "Aug", output: 71, outcome: 62 },
//       { month: "Sep", output: 75, outcome: 67 },
//     ],
//     fusion: [
//       { team: "Sales", human: 64, digital: 36 },
//       { team: "Ops", human: 51, digital: 49 },
//       { team: "Finance", human: 59, digital: 41 },
//       { team: "HR", human: 73, digital: 27 },
//       { team: "Engineering", human: 47, digital: 53 },
//     ],
//     reactiveProactivePct: [48, 52],
//     onOffPct: [43, 57],
//     licenseUtil: [
//       { app: "M365", util: 76 }, { app: "Jira", util: 69 },
//       { app: "Salesforce", util: 54 }, { app: "Copilot", util: 29 },
//       { app: "ChatGPT Ent.", util: 21 },
//     ],
//     anomalies: [
//       { id: "I-4001", label: "Shadow AI imports (web)", impact: "Compliance", hint: "Enterprise proxy + watermark detect." },
//     ],
//   },
// };

// /* Sidebar meta */
// const LENS_META = {
//   CEO:  { icon: Sparkles,   color: "bg-indigo-600",  desc: "Growth & Value" },
//   CFO:  { icon: DollarSign, color: "bg-emerald-600", desc: "Cost & ROI" },
//   CHRO: { icon: Users,      color: "bg-rose-600",    desc: "People & Wellbeing" },
//   CIO:  { icon: Cpu,        color: "bg-violet-600",  desc: "Platforms & Risk" },
// };

// const REGION_COST = [
//   { region: "London", cost: 100 },
//   { region: "Bangalore", cost: 58 },
//   { region: "Krakow", cost: 74 },
//   { region: "Remote (EU)", cost: 82 },
//   { region: "Remote (IN)", cost: 61 },
// ];

// /* =========================
//  *  VISIBILITY RULES
//  *  ========================= */
// const CARD_VIS = {
//   CEO:  new Set(["adoption", "shadow", "outcome", "labour"]),
//   CFO:  new Set(["adoption", "outcome", "labour"]),
//   CHRO: new Set(["adoption", "outcome"]),
//   CIO:  new Set(["shadow", "outcome"]),
// };
// const SECTION_VIS = {
//   CEO:  new Set([
//     "output_outcome", "fusion", "reactive_proactive", "onoff",
//     "emp_contractor_org", "emp_contractor_fn",
//     "holiday_sickness", "license_util", "liability_asset",
//     "region_cost", "anomalies"
//   ]),
//   CFO:  new Set([
//     "output_outcome", "reactive_proactive", "onoff",
//     "emp_contractor_org", "license_util", "region_cost", "anomalies"
//   ]),
//   CHRO: new Set([
//     "output_outcome", "onoff",
//     "emp_contractor_org", "emp_contractor_fn",
//     "holiday_sickness", "anomalies"
//   ]),
//   CIO:  new Set([
//     "reactive_proactive", "onoff", "license_util",
//     "liability_asset", "output_outcome", "anomalies"
//   ]),
// };
// const canShowCard    = (lens, key) => CARD_VIS[lens]?.has(key);
// const canShowSection = (lens, key) => SECTION_VIS[lens]?.has(key);

// /* =========================
//  *  HELPERS
//  *  ========================= */
// function allocateByShare(total, rows, shareKey, outKey = "count") {
//   const raw = rows.map((r) => (total * r[shareKey]) / 100);
//   const floor = raw.map((x) => Math.floor(x));
//   const assigned = floor.reduce((a, b) => a + b, 0);
//   const need = total - assigned;
//   const frac = raw.map((x, i) => ({ i, f: x - floor[i] })).sort((a, b) => b.f - a.f);
//   for (let k = 0; k < need; k++) floor[frac[k].i]++;
//   return rows.map((r, idx) => ({ ...r, [outKey]: floor[idx] }));
// }
// function splitEC(total, empPct) {
//   const e = Math.floor((total * empPct) / 100);
//   return { employees: e, contractors: total - e };
// }


// /** === Pro background (Geofencing • Animated Globe) === */
// /** === Pro background (Geofencing • Animated Globe) — Bigger Globe === */
// function ProBackground({ lens = "CEO" }) {
//   // Lens-tinted glow used in sweep & accents
//   const LENS_TINT = {
//     CEO:  "rgba(99,102,241,.28)",  // indigo
//     CFO:  "rgba(16,185,129,.28)",  // emerald
//     CHRO: "rgba(244,63,94,.28)",   // rose
//     CIO:  "rgba(139,92,246,.28)",  // violet
//   };
//   const tint = LENS_TINT[lens] || "rgba(99,102,241,.28)";

//   return (
//     <>
//       <style>{`
//         /* Global spin for globe lines and sweep */
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to   { transform: rotate(360deg); }
//         }
//         .spin-slow   { animation: spin 42s linear infinite; }
//         .spin-medium { animation: spin 18s linear infinite; }

//         /* Flowing data arcs */
//         @keyframes dashFlow {
//           from { stroke-dashoffset: 120; }
//           to   { stroke-dashoffset: 0; }
//         }
//         .dash-animate {
//           stroke-dasharray: 6 8;
//           animation: dashFlow 4.5s ease-in-out infinite;
//         }

//         /* Geofence ring pulse */
//         @keyframes ringPulse {
//           0%   { transform: scale(0.6); opacity: .45; }
//           70%  { opacity: .12; }
//           100% { transform: scale(1.6); opacity: 0; }
//         }
//         .ring {
//           border: 1.5px solid #10b981;
//           border-radius: 9999px;
//           animation: ringPulse 3.2s ease-out infinite;
//         }
//       `}</style>

//       {/* Base gradient (light, clean) */}
//       <div
//         className="fixed inset-0 -z-40 print:hidden"
//         style={{
//           background: `
//             radial-gradient(1200px 650px at 12% 10%, rgba(99,102,241,.10), transparent 58%),
//             radial-gradient(1100px 650px at 88% 12%, rgba(56,189,248,.10), transparent 60%),
//             linear-gradient(180deg, #f9fbff 0%, #f3f6fb 42%, #eef3f9 100%)
//           `
//         }}
//       />

//       {/* Lens glow (bigger to match globe) */}
//       <div
//         className="fixed -z-35 pointer-events-none print:hidden"
//         style={{
//           left: "58%",
//           top: "6%",
//           width: "62vmin",
//           height: "62vmin",
//           filter: "blur(28px)",
//           background: `radial-gradient(closest-side, ${tint}, transparent 65%)`,
//           borderRadius: "50%"
//         }}
//       />

//       {/* ===== Bigger Globe (SVG wireframe) + arcs ===== */}
//       <svg
//         className="fixed inset-0 -z-30 pointer-events-none print:hidden"
//         viewBox="0 0 1000 700"
//         preserveAspectRatio="xMidYMid slice"
//       >
//         {/* Move a bit left to keep everything inside the viewBox; bigger globe */}
//         <g transform="translate(700,300)">
//           {/* Globe outer circle */}
//           <circle r="280" fill="none" stroke="#60a5fa" strokeOpacity=".22" strokeWidth="1.2" />

//           {/* Latitudes (ellipses) */}
//           <g className="spin-slow" style={{ transformOrigin: "0px 0px" }}>
//             <ellipse rx="280" ry="90"  fill="none" stroke="#60a5fa" strokeOpacity=".18" strokeWidth=".8" />
//             <ellipse rx="280" ry="70"  fill="none" stroke="#60a5fa" strokeOpacity=".16" strokeWidth=".8" />
//             <ellipse rx="280" ry="50"  fill="none" stroke="#60a5fa" strokeOpacity=".14" strokeWidth=".8" />
//             <ellipse rx="280" ry="30"  fill="none" stroke="#60a5fa" strokeOpacity=".12" strokeWidth=".8" />
//             <ellipse rx="280" ry="12"  fill="none" stroke="#60a5fa" strokeOpacity=".10" strokeWidth=".8" />
//           </g>

//           {/* Longitudes (vertical arcs, rotated) */}
//           <g className="spin-slow" style={{ transformOrigin: "0px 0px" }}>
//             {Array.from({ length: 10 }).map((_, i) => (
//               <ellipse
//                 key={i}
//                 rx="90" ry="280"
//                 fill="none"
//                 stroke="#60a5fa"
//                 strokeOpacity=".14"
//                 strokeWidth=".8"
//                 transform={`rotate(${i * 18})`}
//               />
//             ))}
//           </g>

//           {/* Equator highlight */}
//           <ellipse rx="280" ry="90" fill="none" stroke="#60a5fa" strokeOpacity=".28" strokeWidth="1.4" />

//           {/* Flowing connection arcs across the globe — scaled up */}
//           <g>
//             {/* London -> Bengaluru */}
//             <path
//               d="M -160,-27 C -40,-240  80,-240  173,-53"
//               fill="none"
//               stroke="#34d399"
//               strokeOpacity=".55"
//               strokeWidth="1.8"
//               className="dash-animate"
//             />
//             {/* New York -> London */}
//             <path
//               d="M -280,-13 C -253,-160 -187,-200 -107,-93"
//               fill="none"
//               stroke="#93c5fd"
//               strokeOpacity=".55"
//               strokeWidth="1.8"
//               className="dash-animate"
//               style={{ animationDelay: "0.6s" }}
//             />
//             {/* Singapore -> Krakow */}
//             <path
//               d="M 80,133 C 40,27 -53,-13 -133,40"
//               fill="none"
//               stroke="#f472b6"
//               strokeOpacity=".55"
//               strokeWidth="1.8"
//               className="dash-animate"
//               style={{ animationDelay: "1.1s" }}
//             />
//           </g>
//         </g>
//       </svg>

//       {/* Radar sweep (bigger, centered to globe) */}
//       <div
//         className="fixed -z-25 spin-medium pointer-events-none print:hidden"
//         style={{
//           left: "60.5%",
//           top: "4.5%",
//           width: "62vmin",
//           height: "62vmin",
//           transformOrigin: "50% 50%",
//           borderRadius: "9999px",
//           background: `conic-gradient(from 0deg, ${tint} 0deg 20deg, rgba(0,0,0,0) 24deg 360deg)`
//         }}
//       />

//       {/* Geofence rings (unchanged; optional to tweak later) */}
//       <div className="fixed -z-20 pointer-events-none print:hidden" style={{ left: "19%", top: "72%" }}>
//         <div className="ring" style={{ width: 36, height: 36 }} />
//       </div>
//       <div className="fixed -z-20 pointer-events-none print:hidden" style={{ left: "58%", top: "64%", animationDelay: ".6s" }}>
//         <div className="ring" style={{ width: 30, height: 30 }} />
//       </div>
//       <div className="fixed -z-20 pointer-events-none print:hidden" style={{ left: "78%", top: "28%", animationDelay: "1.1s" }}>
//         <div className="ring" style={{ width: 28, height: 28 }} />
//       </div>
//     </>
//   );
// }


// function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

// /* =========================
//  *  BADGES / CARDS / SECTIONS
//  *  ========================= */
// function Badge({ children, tone = "slate", className = "" }) {
//   const tones = {
//     green: "bg-green-100 text-green-800",
//     amber: "bg-amber-100 text-amber-800",
//     red: "bg-rose-100 text-rose-800",
//     slate: "bg-slate-100 text-slate-800",
//     indigo: "bg-indigo-100 text-indigo-800",
//   };
//   return (
//     <span
//       className={`
//         inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
//         whitespace-nowrap ${tones[tone]} ${className}
//       `}
//     >
//       {children}
//     </span>
//   );
// }
// function Card({ icon: Icon, title, value, hint, accent = "", children }) {
//   return (
//     <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
//       className={`rounded-2xl bg-white/70 backdrop-blur border border-slate-200 shadow-sm p-4 ${accent}`}>
//       <div className="flex items-center gap-3 mb-2">
//         {Icon && <div className="p-2 rounded-xl bg-slate-100"><Icon className="w-5 h-5 text-slate-700" /></div>}
//         <div>
//           <div className="text-slate-500 text-xs uppercase tracking-wide">{title}</div>
//           {value && <div className="text-xl font-semibold text-slate-900">{value}</div>}
//           {hint && <div className="text-xs text-slate-400">{hint}</div>}
//         </div>
//       </div>
//       {children}
//     </motion.div>
//   );
// }

// function Section({ title, icon: Icon, children, action, sub }) {
//   return (
//     <div className="rounded-2xl bg-white/70 backdrop-blur border border-slate-200 shadow-sm p-4">
//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center gap-2">
//           {Icon && <Icon className="w-5 h-5 text-slate-600" />}
//           <h3 className="font-semibold text-slate-800">{title}</h3>
//         </div>
//         {action}
//       </div>
//       {sub && <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> {sub}</div>}
//       {children}
//     </div>
//   );
// }
// function SimpleBadge({ label, value, tone }) {
//   return (
//     <div className="rounded-xl border border-slate-200 bg-white/70 p-3 text-sm flex items-center justify-between">
//       <span className="text-slate-600">{label}</span>
//       <Badge tone={tone}>{value}</Badge>
//     </div>
//   );
// }

// /* =========================
//  *  MINI VISUALS
//  *  ========================= */
// function Sparkline({ data }) {
//   const mapped = data.map((y, i) => ({ x: i + 1, y }));
//   return (
//     <div className="w-full h-16">
//       <ResponsiveContainer width="100%" height="100%">
//         <LineChart data={mapped}>
//           <XAxis dataKey="x" hide />
//           <YAxis hide domain={[0, "dataMax + 10"]} />
//           <Tooltip />
//           <Line type="monotone" dataKey="y" stroke={COLORS.blue} strokeWidth={2} dot={false} />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
// function BarMini({ value }) {
//   return (
//     <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
//       <div className="h-full bg-slate-800" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
//     </div>
//   );
// }
// function RadialGauge({ percent }) {
//   const d = [{ name: "p", value: percent }, { name: "rest", value: 100 - percent }];
//   return (
//     <RadialBarChart width={110} height={110} cx={55} cy={55} innerRadius={30} outerRadius={50} barSize={10} data={d} startAngle={90} endAngle={-270}>
//       <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={50} fill={COLORS.green} />
//       <text x={55} y={60} textAnchor="middle" dominantBaseline="middle" className="fill-slate-800 text-sm font-semibold">{percent}%</text>
//     </RadialBarChart>
//   );
// }

// /* =========================
//  *  DRAWER / SLIDERS / BUTTON
//  *  ========================= */
// function Drawer({ open, onClose, title, children, side = "right" }) {
//   return (
//     <AnimatePresence>
//       {open && (
//         <>
//           <motion.div className="fixed inset-0 bg-black/20 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
//           <motion.div
//             className={`fixed top-0 ${side === "right" ? "right-0" : "left-0"} h-full w-[360px] bg-white z-50 shadow-xl border-slate-200 border`}
//             initial={{ x: side === "right" ? 360 : -360 }} animate={{ x: 0 }} exit={{ x: side === "right" ? 360 : -360 }}
//             transition={{ type: "spring", damping: 22, stiffness: 220 }}
//           >
//             <div className="p-4 border-b flex items-center justify-between">
//               <div className="font-semibold">{title}</div>
//               <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
//             </div>
//             <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">{children}</div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }
// function SliderRow({ label, min = 0, max = 100, step = 1, value, onChange, suffix = "%", hint }) {
//   return (
//     <div className="mb-3">
//       <div className="flex items-center justify-between text-xs mb-1">
//         <span className="text-slate-600">{label}</span>
//         <span className="text-slate-900 font-semibold">{value}{suffix}</span>
//       </div>
//       <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
//       {hint && <div className="text-[11px] text-slate-500 mt-1">{hint}</div>}
//     </div>
//   );
// }
// function SwitchRow({ label, checked, onChange, hint }) {
//   return (
//     <div className="flex items-center justify-between mb-3">
//       <div>
//         <div className="text-xs text-slate-700">{label}</div>
//         {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
//       </div>
//       <button
//         onClick={() => onChange(!checked)}
//         className={`w-11 h-6 rounded-full relative transition ${checked ? "bg-slate-900" : "bg-slate-300"}`}
//         aria-label={label}
//       >
//         <span className={`absolute top-0.5 transition ${checked ? "left-6" : "left-0.5"} inline-block w-5 h-5 bg-white rounded-full`} />
//       </button>
//     </div>
//   );
// }
// function Button({ children, onClick, variant = "default", icon: Icon, className = "" }) {
//   const styles = {
//     default: "bg-slate-900 text-white hover:bg-slate-800",
//     ghost: "bg-white border border-slate-200 hover:bg-slate-50",
//     subtle: "bg-slate-100 hover:bg-slate-200",
//   };
//   return (
//     <button onClick={onClick} className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-2 ${styles[variant]} ${className}`}>
//       {Icon && <Icon className="w-4 h-4" />}{children}
//     </button>
//   );
// }

// /* =========================
//  *  SIDEBAR (Professional)
//  *  ========================= */
// function MiniStat({ label, value, tone = "slate" }) {
//   const tones = {
//     slate: "bg-slate-50 text-slate-700",
//     indigo: "bg-indigo-50 text-indigo-700",
//     green: "bg-emerald-50 text-emerald-700",
//     amber: "bg-amber-50 text-amber-700",
//   };
//   return (
//     <div className={`rounded-xl px-2.5 py-2 text-[12px] border border-slate-200 ${tones[tone]}`}>
//       <div className="opacity-70">{label}</div>
//       <div className="font-semibold leading-5">{value}</div>
//     </div>
//   );
// }

// function LensSidebar({
//   activeLens,
//   onSelect,
//   outcomeByLens,
//   shadowAIByLens,
//   snapshot,
//   onToggleNarration,
//   openNarration,
//   onExport,
//   onPrint
// }) {
//   const order = ["CEO", "CFO", "CHRO", "CIO"];

//   return (
//     <div className="sticky top-4 w-[280px]">
//       <div className="max-h-[calc(100vh-120px)] overflow-auto pr-1 flex flex-col gap-3">
//         {/* Lenses */}
//         <div>
//           <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Executive Lenses</div>
//           <div className="space-y-2">
//             {order.map((key) => {
//               const meta = LENS_META[key];
//               const Icon = meta.icon;
//               const active = activeLens === key;
//               return (
//                 <button
//                   key={key}
//                   onClick={() => onSelect(key)}
//                   className={`w-full text-left rounded-2xl border p-3 transition
//                     ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200 hover:bg-slate-50"}`}
//                 >
//                   <div className="flex gap-3 items-center">
//                     <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${meta.color}`}>
//                       <Icon className="w-4 h-4" />
//                     </div>
//                     <div className="flex-1">
//                       <div className="font-semibold leading-5">{key}</div>
//                       <div className={`text-[11px] ${active ? "text-slate-300" : "text-slate-500"}`}>{meta.desc}</div>

//                       <div className={`mt-2 grid grid-cols-2 gap-2 text-[11px] ${active ? "text-slate-200" : "text-slate-600"}`}>
//                         <div className="rounded-lg px-2 py-1 border border-slate-200/50 bg-white/5">
//                           <div className="opacity-70">Outcome</div>
//                           <div className="font-semibold">{outcomeByLens[key]} / 100</div>
//                         </div>
//                         <div className="rounded-lg px-2 py-1 border border-slate-200/50 bg-white/5">
//                           <div className="opacity-70">Shadow AI</div>
//                           <div className="font-semibold">{shadowAIByLens[key]}%</div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Org Snapshot */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-3">
//           <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Org Snapshot</div>
//           <div className="grid grid-cols-2 gap-2">
//             <MiniStat label="Total"       value={snapshot.total} />
//             <MiniStat label="Employees"   value={snapshot.employees} />
//             <MiniStat label="Contractors" value={snapshot.contractors} />
//             <MiniStat label="Outcome"     value={`${snapshot.outcome} / 100`} tone="indigo" />
//             <MiniStat label="Green share" value={`${snapshot.adoption}%`} tone="green" />
//             <MiniStat label="Shadow AI"   value={`${snapshot.shadow}%`} tone="amber" />
//           </div>

//           <button
//             onClick={onToggleNarration}
//             className="mt-3 w-full text-xs rounded-lg border border-slate-200 hover:bg-slate-50 py-1.5"
//           >
//             {openNarration ? "Hide talking points" : "Show talking points"}
//           </button>
//         </div>

//         {/* Governance quick strip */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-3">
//           <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Governance & Policy</div>
//           <div className="flex flex-wrap gap-2">
//             <Badge tone="green"  className="!text-[11px]">Device match: Verified</Badge>
//             <Badge tone="indigo" className="!text-[11px]">Geofence: Office/Home</Badge>
//             <Badge tone="slate"  className="!text-[11px]">Trust: {snapshot.trust}</Badge>
//             <Badge tone="green"  className="!text-[11px]">Policy: Compliant</Badge>
//           </div>
//         </div>

//         {/* Quick actions */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-3">
//           <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Quick Actions</div>
//           <div className="flex flex-col gap-2">
//             <Button variant="ghost" icon={Download} onClick={onExport}>Export CSV</Button>
//             <Button variant="ghost" icon={Printer} onClick={onPrint}>Print / Save PDF</Button>
//           </div>
//         </div>

//         <div className="text-[11px] text-slate-500 text-center mt-1 pb-2">
//           Fusion Workforce • Executive Lens
//         </div>
//       </div>
//     </div>
//   );
// }

// /* =========================
//  *  MAIN COMPONENT
//  *  ========================= */
// export default function FusionFalseDashboard() {
//   const [lens, setLens] = useState("CEO");
//   const [openLensDrawer, setOpenLensDrawer] = useState(false);   // NEW
//   const [windowKey, setWindowKey] = useState("Last 6 months");
//   const [viewTab, setViewTab] = useState("Outcome");
//   const [openControls, setOpenControls] = useState(false);

//   // Left drawer state – can show either Function focus or Site focus
//   const [openLeft, setOpenLeft] = useState(false);
//   const [selectedFunction, setSelectedFunction] = useState(null);
//   const [selectedSite, setSelectedSite] = useState(null);

//   // Talking points visibility (remembered in localStorage)
//   const [openNarration, setOpenNarration] = useState(() => {
//     const saved = localStorage.getItem("showHighlights");
//     return saved ? JSON.parse(saved) : false;
//   });

//   // What-if Params
//   const [totalHeadcount, setTotalHeadcount] = useState(DEFAULT_TOTAL);
//   const [adoptGreen, setAdoptGreen] = useState(COMMON.adoptionGAR[0].value);
//   const [adoptAmber, setAdoptAmber] = useState(COMMON.adoptionGAR[1].value);
//   const adoptRed = Math.max(0, 100 - (adoptGreen + adoptAmber));
//   const [useCustomMix, setUseCustomMix] = useState(false);
//   const [customReactive, setCustomReactive] = useState(42);
//   const [customOnsite, setCustomOnsite] = useState(38);
//   const [prodDays, setProdDays] = useState(3.9);
//   const [costPerHour, setCostPerHour] = useState(35);
//   const [currency, setCurrency] = useState("£");
//   const [functionShares, setFunctionShares] = useState(DEFAULT_FUNCTION_SHARE);
//   const [empPctByFn, setEmpPctByFn] = useState({ ...DEFAULT_EMP_PCT });

//   // Map interactions
//   const [mapZoom, setMapZoom] = useState(1.2);
//   const [mapCenter, setMapCenter] = useState([15, 15]);
//   const [hoverCity, setHoverCity] = useState(null);

//   const lensData = useMemo(() => LENSES[lens], [lens]);

//   // Adoption
//   const adoption = useMemo(() => ([
//     { name: "Green", value: adoptGreen },
//     { name: "Amber", value: adoptAmber },
//     { name: "Red", value: adoptRed },
//   ]), [adoptGreen, adoptAmber, adoptRed]);
//   const adoptionPercent = Math.round((adoptGreen / (adoptGreen + adoptAmber + adoptRed)) * 100);

//   // Function headcounts
//   const functionsWithCounts = useMemo(() => {
//     const normalized = normalizeShares(functionShares);
//     const base = allocateByShare(totalHeadcount, normalized, "sharePct", "total");
//     return base.map((row) => {
//       const pctEmp = empPctByFn[row.team] ?? 70;
//       const { employees, contractors } = splitEC(row.total, pctEmp);
//       return { ...row, employees, contractors, empPct: pctEmp };
//     });
//   }, [totalHeadcount, functionShares, empPctByFn]);
//   const totals = useMemo(() => {
//     const employees = functionsWithCounts.reduce((a, r) => a + r.employees, 0);
//     const contractors = functionsWithCounts.reduce((a, r) => a + r.contractors, 0);
//     return { employees, contractors, total: employees + contractors };
//   }, [functionsWithCounts]);

//   // Mixes
//   const reactiveProactiveCounts = useMemo(() => {
//     const [rxPct, pxPct] = useCustomMix ? [customReactive, 100 - customReactive] : lensData.reactiveProactivePct;
//     return allocateByShare(totalHeadcount, [
//       { name: "Reactive", pct: rxPct }, { name: "Proactive", pct: pxPct }
//     ], "pct", "count");
//   }, [lensData, totalHeadcount, useCustomMix, customReactive]);
//   const onOffCounts = useMemo(() => {
//     const [onPct, offPct] = useCustomMix ? [customOnsite, 100 - customOnsite] : lensData.onOffPct;
//     return allocateByShare(totalHeadcount, [
//       { name: "On-site", pct: onPct }, { name: "Remote", pct: offPct }
//     ], "pct", "count");
//   }, [lensData, totalHeadcount, useCustomMix, customOnsite]);

//   // Outcome index
//   const outcomeIndex = Math.round(avg(lensData.outputVsOutcome.map(d => d.outcome)));

//   // Labour debt
//   const lostDaysPerPerson = Math.max(0, PAID_DAYS - prodDays);
//   const lostDaysOrg = lostDaysPerPerson * totalHeadcount;
//   const lostHoursOrg = lostDaysOrg * 8;
//   const lostCostWeek = lostHoursOrg * costPerHour;

//   // Sidebar summary metrics
//   const outcomeByLens = useMemo(() => {
//     const out = {};
//     Object.entries(LENSES).forEach(([k, v]) => out[k] = Math.round(avg(v.outputVsOutcome.map(d => d.outcome))));
//     return out;
//   }, []);
//   const shadowAIByLens = useMemo(() => {
//     const out = {};
//     Object.entries(LENSES).forEach(([k, v]) => out[k] = v.shadowAI);
//     return out;
//   }, []);

//   // Export/Print
//   const downloadCSV = () => {
//     const rows = [
//       ["Function", "Total", "Employees", "Contractors", "Employee%"],
//       ...functionsWithCounts.map(r => [r.team, r.total, r.employees, r.contractors, r.empPct]),
//       ["TOTAL", totals.total, totals.employees, totals.contractors, ""],
//     ];
//     const csv = rows.map(r => r.join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.download = "org_mix.csv";
//     a.click();
//   };
//   const printPage = () => window.print();

//   // Drawer open helpers
//   const openFunctionFocus = (team) => {
//     setSelectedSite(null);
//     setSelectedFunction(team);
//     setOpenLeft(true);
//   };
//   const openSiteFocus = (site) => {
//     setSelectedFunction(null);
//     setSelectedSite(site);
//     setOpenLeft(true);
//   };

//   // Map data (demo)
//   const CITIES = [
//     { name:"London (HQ)",   coords:[-0.1276,51.5072], people:34, remote:54, team:"Sales" },
//     { name:"Krakow",        coords:[19.9449,50.0647], people:22, remote:48, team:"Ops" },
//     { name:"Bengaluru",     coords:[77.5946,12.9716], people:58, remote:42, team:"Engineering" },
//     { name:"Singapore",     coords:[103.8198,1.3521], people:9,  remote:38, team:"Finance" },
//     { name:"New York",      coords:[-74.0060,40.7128],people:11, remote:46, team:"HR" },
//   ];

//   // Narration
//   const narration = [
//     `Adoption is stable across lenses: ${adoptionPercent}% Green, ${adoptAmber}% Amber, ${adoptRed}% Red.`,
//     `Current lens: ${lens}. Outcome Index averages ${outcomeIndex}/100; closing the Output→Outcome gap is key.`,
//     `${reactiveProactiveCounts[0].count} reactive vs ${reactiveProactiveCounts[1].count} proactive — shifting 15–20% to proactive cuts labour debt.`,
//     `${onOffCounts[0].count} on-site vs ${onOffCounts[1].count} remote — use dynamic pricing to rebalance cost-to-serve.`,
//     `Estimated labour debt: ${lostDaysOrg.toFixed(0)} days/week (~${lostHoursOrg.toFixed(0)} hrs/week ⇒ ${currency}${(lostCostWeek/1000).toFixed(1)}k/week).`,
//   ];

//   return (
//     <div className="relative min-h-screen w-full bg-transparent text-slate-900 print:bg-white text-[15px] md:text-[16px]">
//       <ProBackground lens={lens} />
//       {/* Header */}
//       <div className="relative z-10">
//         <button
//           onClick={() => setOpenLensDrawer(true)}
//           className="hidden lg:flex fixed left-3 top-9 z-40 items-center gap-2 rounded-xl bg-white/90 border border-slate-200 shadow px-2.5 py-1.5 text-xs hover:bg-white"
//           title="Open Executive Lenses"
//         >
//           <Sparkles className="w-4 h-4 text-indigo-600" />
//           Lenses
//         </button>
//         <div className="max-w-7xl mx-auto px-4 pt-6 pb-2 print:px-0">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
//                 <Sparkles className="w-5 h-5" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold tracking-tight">Fusion Workforce – Executive Lens</h1>
//                 <div className="text-xs text-slate-500">Human + Digital infusion • {windowKey}</div>
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               {SHOW_TIME_FILTER && (
//                 <select
//                   value={windowKey}
//                   onChange={(e)=>setWindowKey(e.target.value)}
//                   className="ml-2 px-3 py-1.5 text-sm rounded-xl border border-slate-200 bg-white"
//                 >
//                   <option>Last 6 months</option>
//                   <option>Quarter to date</option>
//                   <option>Month to date</option>
//                 </select>
//               )}

//               <div className="ml-2 inline-flex rounded-xl border border-slate-200 overflow-hidden">
//                 {["KPI", "Outcome"].map((t) => (
//                   <button key={t} onClick={()=>setViewTab(t)}
//                     className={`px-3 py-1.5 text-sm transition ${viewTab===t?"bg-slate-900 text-white":"bg-white hover:bg-slate-50"}`}>{t}
//                   </button>
//                 ))}
//               </div>

//               <Button icon={Settings} onClick={()=>setOpenControls(true)} variant="ghost" className="ml-2">What-if</Button>
//               <Button icon={Download} onClick={downloadCSV} variant="ghost" title="Export org mix CSV" />
//               <Button icon={Printer} onClick={printPage} variant="ghost" title="Print / Save as PDF" />
//             </div>
//           </div>

//           <div className="mt-2 text-xs text-slate-600 flex items-center gap-4">
//             <div><strong>Total:</strong> {totalHeadcount}</div>
//             <div><strong>Employees:</strong> {totals.employees}</div>
//             <div><strong>Contractors:</strong> {totals.contractors}</div>
//             <div className="hidden sm:flex items-center gap-2">
//               <span className="text-slate-400">|</span>
//               <button onClick={()=>{
//                 const nxt = !openNarration;
//                 setOpenNarration(nxt);
//                 localStorage.setItem("showHighlights", JSON.stringify(nxt));
//               }} className="text-slate-600 hover:underline flex items-center gap-1">
//                 {openNarration? <ChevronLeft className="w-4 h-4"/>:<ChevronRight className="w-4 h-4" />} Talking points
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* ====== Layout: Sidebar + Main ====== */}
//       <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 print:px-0">
//         <div className="lg:flex lg:items-start lg:gap-4">
//           {/* Left Sidebar
//           <aside className="hidden lg:block w-[280px] shrink-0">
//             <LensSidebar
//               activeLens={lens}
//               onSelect={setLens}
//               outcomeByLens={outcomeByLens}
//               shadowAIByLens={shadowAIByLens}
//               snapshot={{
//                 total: totalHeadcount,
//                 employees: totals.employees,
//                 contractors: totals.contractors,
//                 outcome: Math.round(avg(LENSES[lens].outputVsOutcome.map(d => d.outcome))),
//                 adoption: adoptionPercent,
//                 shadow: LENSES[lens].shadowAI,
//                 trust: COMMON.deviceTrust.trustScore
//               }}
//               onToggleNarration={()=>{
//                 const nxt = !openNarration;
//                 setOpenNarration(nxt);
//                 localStorage.setItem("showHighlights", JSON.stringify(nxt));
//               }}
//               openNarration={openNarration}
//               onExport={downloadCSV}
//               onPrint={printPage}
//             />
//           </aside> */}
//           {/* Left Sidebar (collapsed by default) */}
//           <aside className="hidden lg:block w-[0px] shrink-0" />

//           {/* Mobile Lens selector */}
//           <div className="lg:hidden -mt-2 mb-3">
//             <div className="flex gap-2 overflow-auto no-scrollbar pb-2">
//               {["CEO","CFO","CHRO","CIO"].map((l) => (
//                 <Button key={l} onClick={() => setLens(l)} variant={lens===l?"default":"ghost"}>{l}</Button>
//               ))}
//             </div>
//           </div>

//           {/* Main content */}
//           <main className="flex-1">
//             {/* Narration */}
//             <AnimatePresence>
//               {openNarration && (
//                 <motion.div
//                   className="pb-2"
//                   initial={{ height: 0, opacity:0 }} animate={{ height: "auto", opacity:1 }} exit={{ height: 0, opacity:0 }}
//                 >
//                   <div className="rounded-xl bg-white border border-slate-200 p-3 text-xs text-slate-700 grid sm:grid-cols-5 gap-2">
//                     {narration.map((line, i)=> <div key={i}>• {line}</div>)}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* === GLOBAL PRESENCE MAP === */}
//             <Section
//               title="Global Workforce Presence"
//               icon={Globe2}
//               sub="Bubble size = active people; color = % remote (green) vs on-site (red). Click a city to drill; use +/−/⤾ for zoom."
//               action={
//                 <div className="hidden md:flex items-center gap-2 text-xs">
//                   <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border">
//                     <span className="h-2.5 w-2.5 rounded-full" style={{ background: MAP_THEME.bubble.remote }} />
//                     More Remote
//                   </span>
//                   <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border">
//                     <span className="h-2.5 w-2.5 rounded-full" style={{ background: MAP_THEME.bubble.mixed }} />
//                     Mixed
//                   </span>
//                   <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border">
//                     <span className="h-2.5 w-2.5 rounded-full" style={{ background: MAP_THEME.bubble.onsite }} />
//                     More On-site
//                   </span>
//                 </div>
//               }
//             >
//               <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white">
//                 <div
//                   className="absolute inset-0"
//                   style={{
//                     background: `radial-gradient(1000px 520px at 50% 25%, ${MAP_THEME.waterA}, ${MAP_THEME.waterB} 75%)`,
//                     opacity: 0.95,
//                   }}
//                 />
//                 <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
//                   <button
//                     onClick={() => setMapZoom(z => Math.min(8, +(z + 0.4).toFixed(2)))}
//                     className="w-8 h-8 rounded-lg bg-white border shadow text-slate-700 hover:bg-slate-50"
//                     title="Zoom in"
//                   >+</button>
//                   <button
//                     onClick={() => setMapZoom(z => Math.max(0.9, +(z - 0.4).toFixed(2)))}
//                     className="w-8 h-8 rounded-lg bg-white border shadow text-slate-700 hover:bg-slate-50"
//                     title="Zoom out"
//                   >−</button>
//                   <button
//                     onClick={() => { setMapZoom(1.2); setMapCenter([15, 15]); }}
//                     className="w-8 h-8 rounded-lg bg-white border shadow text-slate-700 hover:bg-slate-50"
//                     title="Reset"
//                   >⤾</button>
//                 </div>

//                 <div className="relative h-[420px]">
//                   <ComposableMap projectionConfig={{ scale: 150 }} style={{ width: "100%", height: "100%" }}>
//                     <ZoomableGroup
//                       zoom={mapZoom}
//                       center={mapCenter}
//                       onMoveEnd={({ coordinates, zoom }) => { setMapCenter(coordinates); setMapZoom(zoom); }}
//                     >
//                       <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
//                         {({ geographies }) =>
//                           geographies.map((geo) => (
//                             <Geography
//                               key={geo.rsmKey}
//                               geography={geo}
//                               style={{
//                                 default: { fill: MAP_THEME.land, stroke: MAP_THEME.stroke, strokeWidth: 0.6, outline: "none" },
//                                 hover:   { fill: MAP_THEME.landHi, stroke: MAP_THEME.stroke, strokeWidth: 0.8, outline: "none" },
//                                 pressed: { fill: MAP_THEME.landHi, outline: "none" },
//                               }}
//                             />
//                           ))
//                         }
//                       </Geographies>

//                       {/* City bubbles */}
//                       {CITIES.map((c, i) => {
//                         const size = Math.max(6, Math.min(28, Math.sqrt(c.people) * 3.5));
//                         const color =
//                           c.remote >= 60 ? MAP_THEME.bubble.remote :
//                           c.remote <= 40 ? MAP_THEME.bubble.onsite :
//                                           MAP_THEME.bubble.mixed;

//                         return (
//                           <Marker
//                             key={i}
//                             coordinates={c.coords}
//                             onMouseEnter={() => setHoverCity(c)}
//                             onMouseLeave={() => setHoverCity(null)}
//                             onClick={() => openSiteFocus({
//                               city: c.name,
//                               active: c.people,
//                               remote: Math.round(c.people*c.remote/100),
//                               onsite: c.people - Math.round(c.people*c.remote/100),
//                               fn: { [c.team]: c.people }
//                             })}
//                           >
//                             <g style={{ transform: "translate(-1px,-1px)" }}>
//                               <circle r={size + 3} fill={MAP_THEME.bubble.ring} opacity={0.85} />
//                             </g>
//                             <circle
//                               r={size}
//                               fill={color}
//                               stroke="rgba(0,0,0,.25)"
//                               opacity={0.95}
//                               style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,.25))" }}
//                             />
//                             <text textAnchor="middle" y={-(size + 10)} className="fill-slate-800 text-[8px] font-medium">
//                               {c.name} · {c.people}
//                             </text>
//                           </Marker>
//                         );
//                       })}
//                     </ZoomableGroup>
//                   </ComposableMap>

//                   {/* hover tooltip */}
//                   <AnimatePresence>
//                     {hoverCity && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 6 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: 6 }}
//                         className="pointer-events-none absolute left-3 bottom-3 z-10"
//                       >
//                         <div className="rounded-xl bg-white/95 shadow-lg border px-3 py-2 text-xs">
//                           <div className="font-semibold text-slate-800">{hoverCity.name}</div>
//                           <div className="text-slate-600">Active: {hoverCity.people}</div>
//                           <div className="text-slate-600">Remote: {hoverCity.remote}%</div>
//                           <div className="text-slate-500">Primary team: {hoverCity.team}</div>
//                           <div className="mt-1 text-[10px] text-slate-400">Click bubble to open Site Focus</div>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </div>
//             </Section>

//             {/* KPI row */}
//             <div className="mt-4 grid gap-4 justify-items-center [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
//               {canShowCard(lens, "adoption") && (
//                 <Card icon={Activity} title={<span className="font-bold">Adoption status</span>} value={`${adoptionPercent}% Green`} hint="Consistent across lenses">
//                   <div className="flex items-center gap-4 mt-2">
//                     <RadialGauge percent={adoptionPercent} />
//                     <div className="text-xs space-y-1">
//                       {adoption.map((s, i) => (
//                         <div key={s.name} className="flex items-center gap-2">
//                           <span className="inline-block w-2 h-2 rounded-full" style={{ background: GAR_COLORS[i] }} />
//                           <span className="w-16">{s.name}</span>
//                           <span className="font-medium">{s.value}%</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </Card>
//               )}

//               {canShowCard(lens, "shadow") && (
//                 <Card icon={ShieldAlert} title={<span className="font-bold">Shadow AI usage</span>} value={`${lensData.shadowAI}%`} hint="Unapproved AI tools (weekly)">
//                   <div className="mt-3"><BarMini value={lensData.shadowAI} /></div>
//                   <div className="text-xs text-slate-500 mt-2">Enable enterprise AI with guardrails; convert risk → value.</div>
//                 </Card>
//               )}

//               {canShowCard(lens, "outcome") && (
//                 <Card icon={LineChartIcon} title={<span className="font-bold">Outcome index</span>} value={`${outcomeIndex} / 100`} hint="Avg of Outcome series">
//                   <div className="mt-3"><Sparkline data={lensData.outputVsOutcome.map(d=>d.outcome)} /></div>
//                   <div className="text-xs text-slate-500 mt-2">Raising proactive work + automation lifts the green curve faster.</div>
//                 </Card>
//               )}

//               {canShowCard(lens, "labour") && (
//                 <Card icon={DollarSign} title={<span className="font-bold">Labour debt (est.)</span>} value={`${lostDaysOrg.toFixed(0)} days/wk`} hint={`${lostHoursOrg.toFixed(0)} hrs/wk • ${currency}${(lostCostWeek/1000).toFixed(1)}k/wk`}>
//                   <div className="mt-3 text-xs text-slate-500">Paying {PAID_DAYS}d; receiving ~{prodDays.toFixed(1)}d → {(PAID_DAYS-prodDays).toFixed(1)}d gap × {totalHeadcount} ppl.</div>
//                 </Card>
//               )}
//             </div>

//             {/* Badges */}
//             <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
//               <SimpleBadge label="Device match" value={COMMON.deviceTrust.deviceMatch ? "Verified" : "Mismatch"} tone={COMMON.deviceTrust.deviceMatch ? "green" : "red"} />
//               <SimpleBadge label="Geofence" value={COMMON.deviceTrust.geofence} tone="indigo" />
//               <SimpleBadge label="Trust score" value={`${COMMON.deviceTrust.trustScore}`} tone={COMMON.deviceTrust.trustScore>=80?"green":COMMON.deviceTrust.trustScore>=60?"amber":"red"} />
//               <SimpleBadge label="Policy" value={COMMON.deviceTrust.policyCompliant ? "Compliant" : "Breach"} tone={COMMON.deviceTrust.policyCompliant ? "green" : "red"} />
//             </div>

//             {/* Sections */}
//             <div
//               className="mt-4 grid gap-4 justify-center"
//               style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 500px))' }}
//             >
//               {canShowSection(lens, "output_outcome") && (
//                 <Section title="Output vs Outcome" icon={Workflow} sub="Output = effort; Outcome = value. Closing the gap improves ROI.">
//                   {viewTab === "Outcome" ? (
//                     <div className="h-64">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <AreaChart data={lensData.outputVsOutcome} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                           <defs>
//                             <linearGradient id="out" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.4} />
//                               <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
//                             </linearGradient>
//                             <linearGradient id="outc" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.5} />
//                               <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
//                             </linearGradient>
//                           </defs>
//                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                           <XAxis dataKey="month" tick={{ fontSize: 12 }} />
//                           <YAxis tick={{ fontSize: 12 }} />
//                           <Tooltip />
//                           <Area type="monotone" dataKey="output" stroke={COLORS.indigo} fillOpacity={1} fill="url(#out)" name="Output" />
//                           <Area type="monotone" dataKey="outcome" stroke={COLORS.emerald} fillOpacity={1} fill="url(#outc)" name="Outcome" />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </div>
//                   ) : (
//                     <div className="grid grid-cols-3 gap-3">
//                       <Card title="Outcome Index" value={`${outcomeIndex} / 100`} hint="Avg of monthly outcomes" />
//                       <Card title="GAR Green" value={`${adoptGreen}%`} hint="Consistent adoption value" />
//                       <Card title="Proactive mix" value={`${(useCustomMix? (100-customReactive): LENSES[lens].reactiveProactivePct[1])}%`} hint="Shift ↑ = less labour debt" />
//                     </div>
//                   )}
//                 </Section>
//               )}

//               {canShowSection(lens, "fusion") && (
//                 <Section title="Human–Digital Fusion by Function" icon={Cpu} sub="Task mix (not headcount): % human vs digital by function. Click a bar to drill.">
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={lensData.fusion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                         <XAxis dataKey="team" tick={{ fontSize: 12 }} />
//                         <YAxis tick={{ fontSize: 12 }} />
//                         <Tooltip />
//                         <Bar dataKey="human" stackId="a" name="Human" fill={COLORS.slate} radius={[6,6,0,0]}
//                              onClick={(d)=>openFunctionFocus(d.team)} cursor="pointer" />
//                         <Bar dataKey="digital" stackId="a" name="Digital" fill={COLORS.violet} radius={[6,6,0,0]}
//                              onClick={(d)=>openFunctionFocus(d.team)} cursor="pointer" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </Section>
//               )}

//               {canShowSection(lens, "reactive_proactive") && (
//                 <Section title="Reactive vs Proactive (counts)" icon={Activity} sub="Reactive = interrupts; Proactive = planned improvements. Aim to grow proactive.">
//                   <div className="h-64 grid grid-cols-2 gap-3">
//                     <div className="flex flex-col items-center justify-center">
//                       <PieChart width={170} height={170}>
//                         <Pie data={reactiveProactiveCounts} dataKey="count" outerRadius={70}>
//                           {reactiveProactiveCounts.map((_, i) => (<Cell key={`rp-${i}`} fill={i===0?COLORS.rose:COLORS.green} />))}
//                         </Pie>
//                       </PieChart>
//                       <div className="text-sm flex items-center gap-6 flex-nowrap whitespace-nowrap overflow-visible w-full">
//                         <Badge tone="red">Reactive {reactiveProactiveCounts[0].count}</Badge>
//                         <span className="mx-2">→</span>
//                         <Badge tone="green">Proactive {reactiveProactiveCounts[1].count}</Badge>
//                       </div>
//                     </div>
//                     <div className="text-xs text-slate-600 flex items-center">
//                       Shift 15–20% of reactive to proactive pods; automate L1 triage to improve outcome & cut cost.
//                     </div>
//                   </div>
//                 </Section>
//               )}

//               {canShowSection(lens, "onoff") && (
//                 <Section title="On-site vs Remote (counts)" icon={Globe2} sub="Where work is performed. Useful for cost, compliance, and scheduling.">
//                   <div className="h-64 grid grid-cols-2 gap-3">
//                     <div className="flex flex-col items-center justify-center">
//                       <PieChart width={170} height={170}>
//                         <Pie data={onOffCounts} dataKey="count" outerRadius={70}>
//                           {onOffCounts.map((_, i) => (<Cell key={`ol-${i}`} fill={i===0?COLORS.indigo:COLORS.zinc} />))}
//                         </Pie>
//                       </PieChart>
//                       <div className="text-sm flex items-center gap-6 flex-nowrap whitespace-nowrap overflow-visible w-full">
//                         <Badge tone="indigo">On-site {onOffCounts[0].count}</Badge><span className="mx-2">/</span>
//                         <Badge>Remote {onOffCounts[1].count}</Badge>
//                       </div>
//                     </div>
//                     <div className="text-xs text-slate-600 flex items-center">
//                       Move run-work to best-shore remote (policy permitting); keep outcome-critical roles near users.
//                     </div>
//                   </div>
//                 </Section>
//               )}

//               {canShowSection(lens, "emp_contractor_org") && (
//                 <Section title="Employee vs Contractor (Org)" icon={Users} sub="Employees anchor IP & continuity; contractors flex for peaks & run.">
//                   <div className="h-64 grid grid-cols-2 gap-3">
//                     <div className="flex flex-col items-center justify-center">
//                       <PieChart width={170} height={170}>
//                         <Pie data={[{name:"Employees", value: totals.employees},{name:"Contractors", value: totals.contractors}]} dataKey="value" outerRadius={70}>
//                           <Cell fill={COLORS.indigo} /><Cell fill={COLORS.zinc} />
//                         </Pie>
//                       </PieChart>
//                       <div className="text-sm flex items-center gap-6 flex-nowrap whitespace-nowrap overflow-visible w-full">
//                         <Badge tone="indigo">Employees {totals.employees}</Badge><span className="mx-2">/</span>
//                         <Badge>Contractors {totals.contractors}</Badge>
//                       </div>
//                     </div>
//                     <div className="text-xs text-slate-600 flex items-center">
//                       Current mix: {Math.round((totals.employees/totalHeadcount)*100)}% employees / {Math.round((totals.contractors/totalHeadcount)*100)}% contractors.
//                     </div>
//                   </div>
//                 </Section>
//               )}

//               {canShowSection(lens, "emp_contractor_fn") && (
//                 <Section title="Employee vs Contractor by Function" icon={Users} sub="Click a bar to focus a function.">
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={functionsWithCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                         <XAxis dataKey="team" tick={{ fontSize: 12 }} />
//                         <YAxis tick={{ fontSize: 12 }} />
//                         <Tooltip />
//                         <Bar dataKey="employees" stackId="mix" name="Employees" fill={COLORS.indigo} radius={[6,6,0,0]}
//                              onClick={(d)=>openFunctionFocus(d.team)} cursor="pointer" />
//                         <Bar dataKey="contractors" stackId="mix" name="Contractors" fill={COLORS.zinc} radius={[6,6,0,0]}
//                              onClick={(d)=>openFunctionFocus(d.team)} cursor="pointer" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </Section>
//               )}

//               {canShowSection(lens, "holiday_sickness") && (
//                 <Section title="Holiday & Sickness (trend)" icon={Users} sub="Align PTO & on-call with release windows to stabilise delivery.">
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <LineChart data={COMMON.holidaySickness} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="month" tick={{ fontSize: 12 }} />
//                         <YAxis tick={{ fontSize: 12 }} />
//                         <Tooltip />
//                         <Line type="monotone" dataKey="holiday" name="Holiday %" stroke={COLORS.indigo} strokeWidth={2} dot={{ r:2 }} />
//                         <Line type="monotone" dataKey="sickness" name="Sickness %" stroke={COLORS.rose} strokeWidth={2} dot={{ r:2 }} />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </Section>
//               )}

//               {canShowSection(lens, "license_util") && (
//                 <Section title="License Utilisation (GAR)" icon={Building2} sub="Quick view of value vs waste across major platforms.">
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={lensData.licenseUtil} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                         <XAxis dataKey="app" tick={{ fontSize: 12 }} />
//                         <YAxis tick={{ fontSize: 12 }} />
//                         <Tooltip />
//                         <Bar dataKey="util" radius={[6,6,0,0]}>
//                           {lensData.licenseUtil.map((row, i) => {
//                             const tone = row.util >= 70 ? COLORS.green : row.util >= 40 ? COLORS.amber : COLORS.red;
//                             return <Cell key={`lic-${i}`} fill={tone} />;
//                           })}
//                         </Bar>
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </Section>
//               )}

//               {canShowSection(lens, "liability_asset") && (
//                 <Section title="Liability vs Asset Curve (illustrative)" icon={FileWarning} sub="Aim to move points up/right (asset) and reduce left/down (liability).">
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="idx" name="Individuals" tick={{ fontSize: 12 }} />
//                         <YAxis yAxisId="asset" dataKey="asset" name="Asset Index" domain={[0, 100]} tick={{ fontSize: 12 }} />
//                         <YAxis yAxisId="liab" orientation="right" dataKey="liability" domain={[0, 100]} hide />
//                         <Tooltip cursor={{ strokeDasharray: "3 3" }} />
//                         <Scatter
//                           name="Individuals"
//                           data={Array.from({ length: 40 }).map((_, i) => {
//                             const skill = 40 + i * 1.2;
//                             const effort = 5 + Math.max(0, 55 - i * 1.1);
//                             const liability = Math.max(0, 100 - (skill + effort));
//                             const asset = Math.min(100, skill + (60 - effort));
//                             return { idx: i + 1, liability, asset };
//                           })}
//                           yAxisId="asset"
//                           fill={COLORS.green}
//                           shape="circle"
//                         />
//                       </ScatterChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </Section>
//               )}

//               {canShowSection(lens, "region_cost") && (
//                 <Section title="Region Cost (to London baseline)" icon={Factory} sub="Indicative labour index (London=100).">
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <LineChart data={REGION_COST} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="region" tick={{ fontSize: 12 }} />
//                         <YAxis tick={{ fontSize: 12 }} />
//                         <Tooltip />
//                         <Line type="monotone" dataKey="cost" stroke={COLORS.indigo} strokeWidth={3} dot={{ r:3 }} />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </Section>
//               )}

//               {canShowSection(lens, "anomalies") && (
//                 <Section title="Anomalies & Next Actions" icon={ShieldAlert} sub="Curated signals with recommended next steps.">
//                   <ul className="space-y-2 text-sm">
//                     {lensData.anomalies.map((a)=>(
//                       <li key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
//                         <Badge tone="amber">{a.id}</Badge>
//                         <div>
//                           <div className="font-medium">{a.label}</div>
//                           <div className="text-slate-500 text-xs">Impact: {a.impact}</div>
//                           <div className="text-slate-600 text-xs mt-1">Next: {a.hint}</div>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 </Section>
//               )}
//             </div>

//             <div className="py-6 text-xs text-slate-500 print:hidden">
//               This is an interactive, illustrative dashboard for Human + Digital fusion, dynamic pricing, and workforce optimisation.
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* What-If Drawer */}
//       <Drawer open={openControls} onClose={()=>setOpenControls(false)} title="What-If Controls" side="right">
//         <div className="text-xs text-slate-600 mb-3">Tune assumptions to see the story update live.</div>
//         <SliderRow label="Total headcount" min={100} max={1200} step={20} value={totalHeadcount} onChange={setTotalHeadcount} suffix="" hint="Rescales all function counts." />

//         <div className="mt-4 font-semibold text-slate-700 mb-1">Adoption (constant across lenses)</div>
//         <SliderRow label="Green" value={adoptGreen} onChange={setAdoptGreen} />
//         <SliderRow label="Amber" value={adoptAmber} onChange={setAdoptAmber} />
//         <div className="text-[11px] text-slate-500 mb-3">Red auto = {adoptRed}%</div>

//         <SwitchRow label="Use custom Reactive/Proactive & On-site/Remote" checked={useCustomMix} onChange={setUseCustomMix} />
//         {useCustomMix && (
//           <>
//             <SliderRow label="Reactive %" value={customReactive} onChange={setCustomReactive} />
//             <div className="text-[11px] text-slate-500 mb-2">Proactive auto = {100-customReactive}%</div>
//             <SliderRow label="On-site %" value={customOnsite} onChange={setCustomOnsite} />
//             <div className="text-[11px] text-slate-500 mb-2">Remote auto = {100-customOnsite}%</div>
//           </>
//         )}

//         <div className="mt-4 font-semibold text-slate-700 mb-1">Productivity & Cost</div>
//         <SliderRow label="Productive days / week" min={3.0} max={4.8} step={0.1} value={prodDays} onChange={setProdDays} suffix="d" hint="Raises or lowers labour debt." />
//         <div className="flex items-center gap-2 mb-2">
//           <select value={currency} onChange={(e)=>setCurrency(e.target.value)} className="px-2 py-1 border rounded">
//             <option>£</option><option>₹</option><option>$</option><option>€</option>
//           </select>
//           <input type="number" className="w-24 px-2 py-1 border rounded" value={costPerHour}
//             onChange={(e)=>setCostPerHour(Number(e.target.value))} />
//           <span className="text-xs text-slate-500">/ hour</span>
//         </div>
//         <div className="text-[11px] text-slate-500 mb-4">
//           Lost ≈ {lostHoursOrg.toFixed(0)} hrs/week ⇒ {currency}{(lostCostWeek/1000).toFixed(1)}k/week
//         </div>

//         <div className="mt-4 font-semibold text-slate-700 mb-1">Function Shares (must sum ≈ 100%)</div>
//         {functionShares.map((f, idx)=>(
//           <SliderRow key={f.team} label={`${f.team} share`} value={f.sharePct}
//             onChange={(v)=>updateShare(idx, v, functionShares, setFunctionShares)} />
//         ))}
//         <div className="text-[11px] text-slate-500 mb-3">
//           Current total: {functionShares.reduce((a,b)=>a+b.sharePct,0)}%
//         </div>

//         <div className="mt-4 font-semibold text-slate-700 mb-1">Employee % by Function</div>
//         {Object.keys(empPctByFn).map((team)=>(
//           <SliderRow key={team} label={`${team} Employees %`} value={empPctByFn[team]}
//             onChange={(v)=>setEmpPctByFn(prev=>({...prev,[team]:v}))} />
//         ))}

//         <div className="flex items-center gap-2 mt-4">
//           <Button variant="ghost" icon={RefreshCw} onClick={()=>{
//             setTotalHeadcount(DEFAULT_TOTAL);
//             setAdoptGreen(COMMON.adoptionGAR[0].value);
//             setAdoptAmber(COMMON.adoptionGAR[1].value);
//             setUseCustomMix(false);
//             setCustomReactive(42);
//             setCustomOnsite(38);
//             setProdDays(3.9);
//             setCostPerHour(35);
//             setCurrency("£");
//             setFunctionShares(DEFAULT_FUNCTION_SHARE);
//             setEmpPctByFn({...DEFAULT_EMP_PCT});
//           }}>Reset</Button>
//         </div>
//       </Drawer>

//       + {/* Executive Lenses Drawer (Left) */}
//       <Drawer
//         open={openLensDrawer}
//         onClose={() => setOpenLensDrawer(false)}
//         title="Executive Lenses"
//         side="left"
//       >
//         <LensSidebar
//           activeLens={lens}
//           // When a lens is chosen, also close the drawer
//           onSelect={(k) => { setLens(k); setOpenLensDrawer(false); }}
//           outcomeByLens={outcomeByLens}
//           shadowAIByLens={shadowAIByLens}
//           snapshot={{
//             total: totalHeadcount,
//             employees: totals.employees,
//             contractors: totals.contractors,
//             outcome: Math.round(avg(LENSES[lens].outputVsOutcome.map(d => d.outcome))),
//             adoption: adoptionPercent,
//             shaNdow: LENSES[lens].shadowAI,
//             trust: COMMON.deviceTrust.trustScore
//           }}
//           onToggleNarration={()=>{
//             const nxt = !openNarration;
//             setOpenNarration(nxt);
//             localStorage.setItem("showHighlights", JSON.stringify(nxt));
//           }}
//           openarration={openNarration}
//           onExport={downloadCSV}
//           onPrint={printPage}
//         />
//       </Drawer>

//       {/* Unified LEFT Drawer */}
//       <Drawer
//         open={openLeft}
//         onClose={() => { setOpenLeft(false); setSelectedFunction(null); setSelectedSite(null); }}
//         title={selectedSite ? `Site Focus: ${selectedSite.city}` : `Function Focus: ${selectedFunction ?? ""}`}
//         side="left"
//       >
//         {selectedSite ? (
//           <SiteDetails site={selectedSite} currency={currency} onClose={()=>{ setOpenLeft(false); setSelectedSite(null); }} />
//         ) : selectedFunction ? (
//           <FunctionDetails
//             team={selectedFunction}
//             functionsWithCounts={functionsWithCounts}
//             lensFusion={LENSES[lens].fusion}
//             currency={currency}
//             onClose={()=>{ setOpenLeft(false); setSelectedFunction(null); }}
//           />
//         ) : (
//           <div className="text-sm text-slate-600">Click a city bubble on the map, or a bar in “Fusion by Function”.</div>
//         )}
//       </Drawer>
//     </div>
//   );
// }

// /* =========================
//  *  Function Details Panel
//  *  ========================= */
// function FunctionDetails({ team, functionsWithCounts, lensFusion, currency, onClose }) {
//   const f = functionsWithCounts.find(x => x.team === team);
//   const fx = lensFusion.find(x => x.team === team);
//   if (!f || !fx) return <div className="text-sm text-slate-600">No data.</div>;

//   const estHourly = 35;
//   const estWeeklyHours = (f.total * 40);
//   the
//   const estDigitalShare = fx.digital / 100;
//   const estAutomationSavings = estWeeklyHours * estDigitalShare * 0.15 * estHourly;

//   return (
//     <div className="text-sm">
//       <div className="mb-2">
//         <div className="text-slate-800 font-semibold">{team}</div>
//         <div className="text-slate-500">Headcount: {f.total} • Employees: {f.employees} • Contractors: {f.contractors}</div>
//       </div>

//       <div className="rounded-xl border p-3 mb-3">
//         <div className="text-xs text-slate-500 mb-2">Task Mix (Human vs Digital)</div>
//         <div className="flex items-center gap-3">
//           <Badge tone="slate">Human {fx.human}%</Badge>
//           <Badge tone="indigo">Digital {fx.digital}%</Badge>
//         </div>
//       </div>

//       <div className="rounded-xl border p-3 mb-3">
//         <div className="text-xs text-slate-500 mb-1">What-If Savings (illustrative)</div>
//         <div className="text-slate-700">
//           Weekly Hours ≈ {estWeeklyHours.toLocaleString()} • Digital share {Math.round(estDigitalShare*100)}%<br/>
//           Potential extra leverage (15% of digital hours): <strong>{currency}{(estAutomationSavings/1000).toFixed(1)}k / week</strong>
//         </div>
//         <div className="text-[11px] text-slate-500 mt-1">Uses a simple assumption to make the conversation tangible.</div>
//       </div>

//       <div className="rounded-xl border p-3">
//         <div className="text-xs text-slate-500 mb-1">Staffing Guidance</div>
//         <ul className="list-disc ml-4 space-y-1">
//           <li>Keep core knowledge and process ownership in Employees.</li>
//           <li>Use contractor pods for reactive run or short surges.</li>
//           <li>Automate repeatable workflows; track outcome vs output.</li>
//         </ul>
//       </div>

//       <div className="mt-4">
//         <Button variant="ghost" onClick={onClose}>Close</Button>
//       </div>
//     </div>
//   );
// }

// /* =========================
//  *  Site Details Panel
//  *  ========================= */
// function SiteDetails({ site, currency, onClose }) {
//   if (!site) return null;
//   const remoteShare = site.active ? Math.round((site.remote / site.active) * 100) : 0;
//   const onsiteShare = 100 - remoteShare;

//   return (
//     <div className="text-sm">
//       <div className="mb-2">
//         <div className="text-slate-800 font-semibold">{site.city}</div>
//         <div className="text-slate-500">
//           Active: {site.active} • On-site: {site.onsite} • Remote: {site.remote}
//         </div>
//       </div>

//       <div className="rounded-xl border p-3 mb-3">
//         <div className="text-xs text-slate-500 mb-1">Work Mode Split</div>
//         <div className="flex items-center gap-2">
//           <Badge tone="indigo">On-site {onsiteShare}%</Badge>
//           <Badge tone="green">Remote {remoteShare}%</Badge>
//         </div>
//       </div>

//       {site.fn && (
//         <div className="rounded-xl border p-3 mb-3">
//           <div className="text-xs text-slate-500 mb-1">Function Breakdown (active)</div>
//           <ul className="space-y-1">
//             {Object.entries(site.fn).map(([k,v]) => (
//               <li key={k} className="flex items-center justify-between">
//                 <span className="text-slate-700">{k}</span>
//                 <span className="font-medium">{v}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <div className="text-[11px] text-slate-500">
//         This view is aggregated per city/site for privacy. Wire this to your FastAPI endpoint that returns
//         site presence (active/onsite/remote) for real data.
//       </div>

//       <div className="mt-4">
//         <Button variant="ghost" onClick={onClose}>Close</Button>
//       </div>
//     </div>
//   );
// }

// /* =========================
//  *  HELPERS: share normalisation
//  *  ========================= */
// function normalizeShares(shares) {
//   const sum = shares.reduce((a,b)=>a+b.sharePct,0);
//   if (sum === 100) return shares;
//   return shares.map(s => ({ ...s, sharePct: Math.max(0, Math.round((s.sharePct/sum)*100)) }));
// }
// function updateShare(idx, value, shares, setShares) {
//   const next = shares.map((s,i)=> i===idx ? { ...s, sharePct: value } : s);
//   setShares(next);
// }

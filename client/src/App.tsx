import { useMemo, useState, type ReactNode } from "react";
import { Link, Redirect, Route, Switch, useLocation } from "wouter";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Download,
  FileText,
  Gauge,
  HelpCircle,
  Home,
  Info,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

const businessId = "demo-company";
const months = ["Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26"];
const fullMonths = [
  "November 2025",
  "December 2025",
  "January 2026",
  "February 2026",
  "March 2026",
  "April 2026",
  "May 2026",
  "June 2026",
];

type Severity = "critical" | "warning" | "healthy";
type CashMonth = { revenue: number; expenses: number };
type Scenario = {
  id: string;
  name: string;
  kind: "Baseline" | "Scenario";
  description: string;
  runway: number;
  zeroCash: string;
  closingCash: number;
  delta: number;
  assumptions: number;
};

const initialCashFlow: CashMonth[] = [
  { revenue: 11800, expenses: 17600 },
  { revenue: 12400, expenses: 18200 },
  { revenue: 13700, expenses: 19500 },
  { revenue: 14300, expenses: 15400 },
  { revenue: 15500, expenses: 14200 },
  { revenue: 16200, expenses: 14800 },
  { revenue: 16800, expenses: 15100 },
  { revenue: 17500, expenses: 15700 },
];

const initialScenarios: Scenario[] = [
  {
    id: "baseline",
    name: "Baseline",
    kind: "Baseline",
    description: "Current plan with recurring revenue and expenses",
    runway: 8.4,
    zeroCash: "Jul 26",
    closingCash: 38600,
    delta: 0,
    assumptions: 0,
  },
  {
    id: "freelancer",
    name: "Hire a freelancer",
    kind: "Scenario",
    description: "Add a product designer from month 3",
    runway: 6.1,
    zeroCash: "May 26",
    closingCash: 15800,
    delta: -2.3,
    assumptions: 1,
  },
  {
    id: "growth",
    name: "Growth push",
    kind: "Scenario",
    description: "Increase prices by 8% from January",
    runway: 10.2,
    zeroCash: "Oct 26",
    closingCash: 56200,
    delta: 1.8,
    assumptions: 2,
  },
];

function money(value: number, compact = false) {
  if (compact && Math.abs(value) >= 1000) {
    return `${value < 0 ? "−" : ""}$${Math.abs(value / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function calculateSummary(cashFlow: CashMonth[]) {
  const current = cashFlow[0] ?? { revenue: 0, expenses: 0 };
  const trailing = cashFlow.slice(0, 3);
  const avgBurn = trailing.reduce((total, item) => total + Math.max(0, item.expenses - item.revenue), 0) / Math.max(1, trailing.length);
  const monthlyRevenue = current.revenue;
  const monthlyCosts = current.expenses;
  const netBurn = monthlyCosts - monthlyRevenue;
  const currentCash = 48700;
  const runway = avgBurn > 0 ? currentCash / avgBurn : 99;
  const closingCash = currentCash - netBurn * 3;
  const severity: Severity = runway < 3 ? "critical" : runway < 6 ? "warning" : "healthy";
  return { currentCash, monthlyRevenue, monthlyCosts, netBurn, avgBurn, runway, closingCash, severity };
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`brand-mark ${inverse ? "brand-mark-inverse" : ""}`}><Activity size={17} strokeWidth={2.8} /></span>
      <span className={`brand-wordmark ${inverse ? "text-white" : ""}`}>Boot<span>Pulse</span></span>
    </div>
  );
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "mint" | "amber" | "coral" | "blue" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function FormulaDisclosure({ title, expression, inputs }: { title: string; expression: string; inputs: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="formula-disclosure">
      <button className="formula-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="formula-icon">ƒx</span>
        <span>{title}</span>
        <ChevronDown size={15} className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div className="formula-body">
          <div className="formula-expression">{expression}</div>
          <div className="formula-inputs">
            {inputs.map((input) => <span key={input}>{input}</span>)}
          </div>
          <p>BootPulse keeps this calculation visible so you can challenge the assumption or edit the input.</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone = "default", trend }: { label: string; value: string; detail: string; icon: typeof Gauge; tone?: string; trend?: "up" | "down" }) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <div className="metric-topline"><span>{label}</span><span className="metric-icon"><Icon size={16} /></span></div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{trend && (trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />)}{detail}</div>
    </div>
  );
}

function SignalBanner({ severity, onDismiss }: { severity: Severity; onDismiss?: () => void }) {
  const config = {
    healthy: { icon: Check, title: "Runway looks healthy", copy: "You have room to operate, but the next three months still deserve a weekly review.", label: "Healthy" },
    warning: { icon: Info, title: "Plan the next move", copy: "Your runway is below six months. Review the assumptions that move your zero-cash month.", label: "Warning" },
    critical: { icon: Bell, title: "Decision needed soon", copy: "Your current plan reaches a critical runway threshold. Review costs or add a revenue action.", label: "Critical" },
  }[severity];
  const Icon = config.icon;
  return (
    <div className={`signal-banner signal-${severity}`} role="status">
      <div className="signal-symbol"><Icon size={18} /></div>
      <div className="signal-copy"><div><strong>{config.title}</strong><Badge tone={severity === "healthy" ? "mint" : severity === "warning" ? "amber" : "coral"}>{config.label}</Badge></div><p>{config.copy}</p></div>
      <Link href={`/app/businesses/${businessId}/scenarios`} className="signal-action">Compare scenarios <ArrowRight size={15} /></Link>
      {onDismiss && <button className="icon-button" aria-label="Dismiss warning" onClick={onDismiss}><X size={16} /></button>}
    </div>
  );
}

function MiniChart({ cashFlow }: { cashFlow: CashMonth[] }) {
  const max = Math.max(...cashFlow.map((item) => item.revenue), 1);
  return (
    <div className="chart-wrap">
      <div className="chart-legend"><span><i className="legend-dot legend-mint" />Revenue</span><span><i className="legend-dot legend-navy" />Costs</span><span className="chart-note">Projected cash movement</span></div>
      <div className="bar-chart" aria-hidden="true">
        {cashFlow.slice(0, 6).map((item, index) => <div className="bar-column" key={months[index]}><div className="bar-pair"><div className="bar bar-revenue" style={{ height: `${(item.revenue / max) * 100}%` }} /><div className="bar bar-cost" style={{ height: `${(item.expenses / max) * 100}%` }} /></div><span>{months[index]}</span></div>)}
      </div>
      <table className="sr-only"><caption>Revenue and cost data by month</caption><thead><tr><th>Month</th><th>Revenue</th><th>Costs</th></tr></thead><tbody>{cashFlow.slice(0, 6).map((item, index) => <tr key={months[index]}><th>{fullMonths[index]}</th><td>{money(item.revenue)}</td><td>{money(item.expenses)}</td></tr>)}</tbody></table>
    </div>
  );
}

function WorkspaceLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const nav = [
    { label: "Overview", href: `/app/businesses/${businessId}`, icon: LayoutDashboard },
    { label: "Cash flow", href: `/app/businesses/${businessId}/cash-flow`, icon: BarChart3 },
    { label: "Scenarios", href: `/app/businesses/${businessId}/scenarios`, icon: Sparkles },
    { label: "Decisions", href: `/app/businesses/${businessId}/decisions`, icon: ListChecks },
    { label: "Milestones", href: `/app/businesses/${businessId}/milestones`, icon: Target },
    { label: "Notes", href: `/app/businesses/${businessId}/notes`, icon: FileText },
  ];
  return (
    <div className="app-frame">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="sidebar-top"><Logo inverse /><button className="mobile-close icon-button" onClick={() => setMobileNav(false)}><X size={18} /></button></div>
        <button className="business-switcher"><span className="business-avatar">P</span><span className="business-switch-copy"><strong>Priya Demo Co.</strong><small>Growth plan</small></span><ChevronDown size={15} /></button>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Workspace navigation">{nav.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={`sidebar-link ${location === href || (label === "Overview" && location === `/app/businesses/${businessId}`) ? "sidebar-link-active" : ""}`} onClick={() => setMobileNav(false)}><Icon size={17} /><span>{label}</span>{label === "Scenarios" && <span className="nav-count">3</span>}</Link>)}</nav>
        <div className="sidebar-section-label sidebar-section-spaced">Manage</div>
        <nav className="sidebar-nav" aria-label="Account navigation">
          <Link href={`/app/businesses/${businessId}/settings`} className="sidebar-link"><Settings size={17} /><span>Business settings</span></Link>
          <Link href="/app/billing" className="sidebar-link"><ReceiptText size={17} /><span>Billing</span></Link>
        </nav>
        <div className="sidebar-bottom"><div className="trial-card"><span className="trial-icon"><Zap size={15} /></span><div><strong>Growth trial</strong><p>11 days remaining</p></div><ChevronRight size={14} /></div><div className="sidebar-user"><span className="user-avatar">PD</span><div><strong>Priya Demo</strong><small>Owner</small></div><MoreHorizontal size={17} /></div></div>
      </aside>
      <div className="app-main">
        <header className="app-header"><button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={19} /></button><div className="crumbs"><span>Workspace</span><ChevronRight size={14} /><strong>Priya Demo Co.</strong></div><div className="header-actions"><button className="header-help"><CircleHelp size={16} /> Help center</button><button className="notification-button" aria-label="Notifications"><Bell size={17} /><span /></button><div className="header-divider" /><span className="header-date">Updated moments ago</span></div></header>
        <main className="content-canvas">{children}</main>
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-header-action">{action}</div>}</div>;
}

function Dashboard({ cashFlow }: { cashFlow: CashMonth[] }) {
  const summary = calculateSummary(cashFlow);
  const [dismissed, setDismissed] = useState(false);
  return (
    <div className="page-stack">
      <PageHeader eyebrow="Monday, 17 November 2025" title="Good morning, Priya." description="Here’s the clearest view of what changed in your cash plan this week." action={<button className="button button-primary"><Plus size={16} /> Add entry</button>} />
      {!dismissed && <SignalBanner severity={summary.severity} onDismiss={() => setDismissed(true)} />}
      <section className="runway-card">
        <div className="runway-main"><div className="eyebrow eyebrow-light">Current runway</div><div className="runway-number">{summary.runway.toFixed(1)} <span>months</span></div><p className="runway-caption">At the current average monthly burn of <strong>{money(summary.avgBurn)}</strong></p><FormulaDisclosure title="Show the maths" expression="Current cash ÷ average monthly burn = runway" inputs={[`$${summary.currentCash.toLocaleString()} current cash`, `$${Math.round(summary.avgBurn).toLocaleString()} avg. monthly burn`, "Trailing window: 3 months"]} /></div>
        <div className="runway-side"><div className="zero-cash-label"><span className="zero-cash-dot" />Projected zero-cash month</div><strong>July 2026</strong><p>That gives you 8.4 months to make the next decision.</p><Link href={`/app/businesses/${businessId}/scenarios`} className="text-link light-link">Explore scenarios <ArrowRight size={15} /></Link></div>
      </section>
      <div className="metric-grid"><MetricCard label="Current cash" value={money(summary.currentCash, true)} detail="+$2,900 vs. last month" icon={Landmark} tone="mint" trend="up" /><MetricCard label="Monthly revenue" value={money(summary.monthlyRevenue, true)} detail="+6.4% vs. previous month" icon={TrendingUp} tone="blue" trend="up" /><MetricCard label="Monthly costs" value={money(summary.monthlyCosts, true)} detail="+$340 vs. previous month" icon={TrendingDown} tone="coral" trend="up" /><MetricCard label="Net cash flow" value={money(summary.monthlyRevenue - summary.monthlyCosts, true)} detail="Improving after January" icon={Activity} tone="navy" /></div>
      <div className="dashboard-grid">
        <section className="panel chart-panel"><div className="panel-heading"><div><div className="eyebrow">Cash movement</div><h2>Costs are settling into a steadier base</h2></div><Link href={`/app/businesses/${businessId}/cash-flow`} className="panel-link">Open cash flow <ArrowRight size={15} /></Link></div><MiniChart cashFlow={cashFlow} /></section>
        <section className="panel"><div className="panel-heading"><div><div className="eyebrow">Decision queue</div><h2>What needs your attention</h2></div><Link href={`/app/businesses/${businessId}/decisions`} className="panel-link">View log <ArrowRight size={15} /></Link></div><div className="attention-list"><div className="attention-item"><span className="attention-icon attention-amber"><Lightbulb size={16} /></span><div><strong>Review freelancer scenario</strong><p>See if the May delivery target is worth the runway tradeoff.</p></div><ChevronRight size={16} /></div><div className="attention-item"><span className="attention-icon attention-mint"><Target size={16} /></span><div><strong>Milestone coming up</strong><p>Reach $15k MRR by the end of March.</p></div><ChevronRight size={16} /></div><div className="attention-item"><span className="attention-icon attention-blue"><FileText size={16} /></span><div><strong>Note from last review</strong><p>“Watch contractor spend after the January release.”</p></div><ChevronRight size={16} /></div></div></section>
      </div>
      <section className="panel activity-panel"><div className="panel-heading"><div><div className="eyebrow">Recent activity</div><h2>Decisions and notes</h2></div><Link href={`/app/businesses/${businessId}/notes`} className="panel-link">See all activity <ArrowRight size={15} /></Link></div><div className="activity-table"><div className="activity-row activity-head"><span>Activity</span><span>Type</span><span>When</span><span /></div><div className="activity-row"><span className="activity-name"><span className="activity-dot dot-mint" />Raised prices for annual plans</span><Badge tone="mint">Decision</Badge><span className="muted">Today</span><ChevronRight size={15} /></div><div className="activity-row"><span className="activity-name"><span className="activity-dot dot-blue" />Added “Product designer” scenario</span><Badge tone="blue">Scenario</Badge><span className="muted">Yesterday</span><ChevronRight size={15} /></div><div className="activity-row"><span className="activity-name"><span className="activity-dot dot-amber" />Q4 planning notes</span><Badge tone="amber">Note</Badge><span className="muted">Nov 14</span><ChevronRight size={15} /></div></div></section>
    </div>
  );
}

function CashFlowPage({ cashFlow, setCashFlow }: { cashFlow: CashMonth[]; setCashFlow: React.Dispatch<React.SetStateAction<CashMonth[]>> }) {
  const summary = calculateSummary(cashFlow);
  const [editing, setEditing] = useState<{ index: number; field: "revenue" | "expenses" } | null>(null);
  const [draft, setDraft] = useState("");
  const commit = () => { if (!editing) return; const value = Number(draft.replace(/[^0-9.-]/g, "")); if (Number.isFinite(value)) setCashFlow((rows) => rows.map((row, index) => index === editing.index ? { ...row, [editing.field]: value } : row)); setEditing(null); };
  const startEdit = (index: number, field: "revenue" | "expenses") => { setEditing({ index, field }); setDraft(String(cashFlow[index]?.[field] ?? 0)); };
  const closing = cashFlow.reduce((arr, item, index) => { const previous = arr[index - 1] ?? 48700; arr.push(previous + item.revenue - item.expenses); return arr; }, [] as number[]);
  return (
    <div className="page-stack"><PageHeader eyebrow="Cash flow / 8 month view" title="Cash flow" description="Edit a monthly input and see the runway respond immediately." action={<div className="button-row"><button className="button button-secondary"><Download size={15} /> Export CSV</button><button className="button button-primary"><Plus size={16} /> Add line</button></div>} /><div className="inline-notice"><Info size={16} /><span><strong>All figures are fictional demo data.</strong> Your assumptions are editable and the formula trail is always available.</span><button className="icon-button"><X size={15} /></button></div><div className="cash-summary-strip"><div><span>Current cash</span><strong>{money(summary.currentCash)}</strong></div><div><span>Monthly revenue</span><strong>{money(summary.monthlyRevenue)}</strong></div><div><span>Monthly costs</span><strong>{money(summary.monthlyCosts)}</strong></div><div><span>Runway</span><strong>{summary.runway.toFixed(1)} mo</strong></div><FormulaDisclosure title="How this is calculated" expression="Closing cash = opening cash + revenue − expenses" inputs={["Opening cash starts at $48,700", "Revenue and expenses are editable below"]} /></div><section className="panel table-panel"><div className="table-toolbar"><div><div className="eyebrow">Monthly forecast</div><h2>Base plan</h2></div><div className="table-toolbar-right"><span className="keyboard-hint"><kbd>Enter</kbd> edit <kbd>Esc</kbd> cancel</span><button className="icon-button"><MoreHorizontal size={18} /></button></div></div><div className="table-scroll"><table className="cash-table"><thead><tr><th className="sticky-col" scope="col">Cash flow</th>{months.map((month) => <th key={month} scope="col">{month}</th>)}</tr></thead><tbody><tr><th className="sticky-col" scope="row">Opening cash</th>{months.map((month, index) => <td key={month} className="cell-muted">{money(index === 0 ? 48700 : closing[index - 1], true)}</td>)}</tr><tr><th className="sticky-col" scope="row"><span className="row-marker marker-mint" />Revenue</th>{cashFlow.map((item, index) => <td key={months[index]} onDoubleClick={() => startEdit(index, "revenue")} className="editable-cell">{editing?.index === index && editing.field === "revenue" ? <input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") commit(); if (event.key === "Escape") setEditing(null); }} /> : <button onClick={() => startEdit(index, "revenue")} aria-label={`Edit revenue for ${months[index]}`}>{money(item.revenue, true)}</button>}</td>)}</tr><tr><th className="sticky-col" scope="row"><span className="row-marker marker-coral" />Expenses</th>{cashFlow.map((item, index) => <td key={months[index]} onDoubleClick={() => startEdit(index, "expenses")} className="editable-cell">{editing?.index === index && editing.field === "expenses" ? <input autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") commit(); if (event.key === "Escape") setEditing(null); }} /> : <button onClick={() => startEdit(index, "expenses")} aria-label={`Edit expenses for ${months[index]}`}>{money(item.expenses, true)}</button>}</td>)}</tr><tr className="net-row"><th className="sticky-col" scope="row">Net cash flow</th>{cashFlow.map((item, index) => <td key={months[index]} className={item.revenue - item.expenses >= 0 ? "positive" : "negative"}>{money(item.revenue - item.expenses, true)}</td>)}</tr><tr className="closing-row"><th className="sticky-col" scope="row">Closing cash</th>{closing.map((value, index) => <td key={months[index]}>{money(value, true)}</td>)}</tr></tbody><tfoot><tr><th className="sticky-col" scope="row">8 month total</th><td colSpan={2}>{money(cashFlow.reduce((sum, item) => sum + item.revenue, 0), true)} revenue</td><td colSpan={2}>{money(cashFlow.reduce((sum, item) => sum + item.expenses, 0), true)} costs</td><td colSpan={4}>{money(cashFlow.reduce((sum, item) => sum + item.revenue - item.expenses, 0), true)} net</td></tr></tfoot></table></div><div className="table-footer"><span><span className="status-dot" />Synced just now</span><span>Tip: click any revenue or expense number to edit it.</span></div></section><div className="tier-callout"><LockKeyhole size={17} /><div><strong>Growth plan horizon: 18 months</strong><p>Months 19–36 become read-only until you upgrade to Scale. Your existing data is never deleted.</p></div><Link href="/app/billing" className="text-link">View plans <ArrowRight size={15} /></Link></div></div>
  );
}

function ScenarioPage() {
  const [scenarios, setScenarios] = useState(initialScenarios);
  const [selected, setSelected] = useState("baseline");
  const active = scenarios.find((item) => item.id === selected) ?? scenarios[0];
  return (
    <div className="page-stack"><PageHeader eyebrow="Decision planning" title="Scenarios" description="Compare a decision against your baseline before it becomes a commitment." action={<button className="button button-primary" onClick={() => setScenarios((items) => [...items, { id: `scenario-${items.length}`, name: "New scenario", kind: "Scenario", description: "Add an assumption to model the change", runway: 8.4, zeroCash: "Jul 26", closingCash: 38600, delta: 0, assumptions: 0 }])}><Plus size={16} /> New scenario</button>} /><div className="scenario-tabs">{scenarios.map((scenario) => <button key={scenario.id} className={`scenario-tab ${selected === scenario.id ? "scenario-tab-active" : ""}`} onClick={() => setSelected(scenario.id)}><span className={`scenario-tab-dot ${scenario.kind === "Baseline" ? "dot-navy" : "dot-mint"}`} /><div><strong>{scenario.name}</strong><small>{scenario.kind}</small></div>{scenario.id !== "baseline" && <span className="scenario-tab-delta">{scenario.delta > 0 ? "+" : ""}{scenario.delta.toFixed(1)} mo</span>}</button>)}</div><div className="comparison-grid"><section className="panel comparison-panel"><div className="panel-heading"><div><div className="eyebrow">Side-by-side comparison</div><h2>What changes if you hire?</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="compare-head"><span>Metric</span><span>Baseline</span><span>{active?.name}</span><span>Delta</span></div><div className="compare-row"><div><strong>Runway</strong><small>Months of cash remaining</small></div><strong>8.4 mo</strong><strong className={active?.delta && active.delta < 0 ? "compare-risk" : "compare-good"}>{active?.runway.toFixed(1)} mo</strong><span className={active?.delta && active.delta < 0 ? "delta-negative" : "delta-positive"}>{active?.delta && active.delta > 0 ? "+" : ""}{active?.delta.toFixed(1)} mo</span></div><div className="compare-row"><div><strong>Zero-cash month</strong><small>First month closing cash falls below $0</small></div><strong>Jul 26</strong><strong>{active?.zeroCash}</strong><span className="delta-neutral">{active?.id === "baseline" ? "—" : active?.delta && active.delta < 0 ? "2 months earlier" : "3 months later"}</span></div><div className="compare-row"><div><strong>Closing cash at horizon</strong><small>Projected closing cash in month 8</small></div><strong>{money(38600, true)}</strong><strong>{money(active?.closingCash ?? 38600, true)}</strong><span className={active?.delta && active.delta < 0 ? "delta-negative" : "delta-positive"}>{active?.delta && active.delta < 0 ? "−$22.8k" : active?.id === "baseline" ? "—" : "+$17.6k"}</span></div><FormulaDisclosure title="Show the comparison maths" expression="Scenario result = baseline forecast + enabled assumptions" inputs={["Baseline: recurring revenue and expenses", "Assumptions: applied by start and end month", "All values remain editable"]} /></section><section className="panel assumption-panel"><div className="panel-heading"><div><div className="eyebrow">Assumptions</div><h2>{active?.name}</h2></div><Badge tone={active?.id === "baseline" ? "blue" : "mint"}>{active?.kind}</Badge></div><p className="panel-intro">{active?.description}. Each assumption is applied only within its selected month range.</p>{active?.id === "baseline" ? <div className="empty-assumption"><span><ShieldCheck size={20} /></span><strong>Baseline is your reference plan</strong><p>Clone it to test a cost, revenue change, or one-off event without changing your base numbers.</p><button className="button button-secondary" onClick={() => setScenarios((items) => [...items, { ...items[0], id: "new-plan", name: "New plan", kind: "Scenario", description: "Cloned from baseline", delta: 0, assumptions: 0 }])}>Clone baseline <ArrowRight size={15} /></button></div> : <><div className="assumption-row"><span className="assumption-icon"><Users size={16} /></span><div><strong>Add product designer</strong><small>Monthly expense · starts Jan 26</small></div><strong className="assumption-amount">−$2,000</strong><button className="icon-button"><MoreHorizontal size={16} /></button></div><div className="assumption-row"><span className="assumption-icon assumption-icon-blue"><TrendingUp size={16} /></span><div><strong>Price increase</strong><small>Revenue change · starts Feb 26</small></div><strong className="assumption-amount amount-positive">+$1,300</strong><button className="icon-button"><MoreHorizontal size={16} /></button></div><button className="add-assumption"><Plus size={15} /> Add assumption</button></>}</section></div><div className="scenario-footnote"><Info size={15} /> Scenarios are planning models, not predictions. The best model is the one you keep reviewing.</div></div>
  );
}

function DecisionsPage() {
  const [status, setStatus] = useState("All");
  const decisions = [{ title: "Hire a product designer", rationale: "Reduce delivery bottlenecks ahead of the spring release.", scenario: "Hire a freelancer", impact: "−$2,000 / mo", date: "Nov 17, 2025", state: "Considering", tone: "amber" }, { title: "Raise annual plan pricing", rationale: "Improve cash conversion without adding support load.", scenario: "Growth push", impact: "+$1,300 / mo", date: "Nov 12, 2025", state: "Committed", tone: "mint" }, { title: "Keep software stack lean", rationale: "Keep non-core subscriptions below 10% of monthly costs.", scenario: "Baseline", impact: "−$240 / mo", date: "Nov 04, 2025", state: "Revisited", tone: "blue" }];
  return <div className="page-stack"><PageHeader eyebrow="Decision log" title="Decisions" description="Keep the reasoning behind each financial move reviewable." action={<button className="button button-primary"><Plus size={16} /> Record decision</button>} /><div className="filter-row"><div className="filter-tabs">{["All", "Considering", "Committed", "Revisited"].map((item) => <button key={item} className={status === item ? "filter-active" : ""} onClick={() => setStatus(item)}>{item}{item === "All" && <span>3</span>}</button>)}</div><button className="button button-secondary"><Download size={15} /> Export</button></div><section className="panel decision-list">{decisions.filter((item) => status === "All" || item.state === status).map((decision) => <article className="decision-card" key={decision.title}><div className="decision-icon"><ListChecks size={17} /></div><div className="decision-main"><div className="decision-title-row"><h2>{decision.title}</h2><Badge tone={decision.tone as "mint" | "amber" | "blue"}>{decision.state}</Badge></div><p>{decision.rationale}</p><div className="decision-meta"><span><Sparkles size={13} /> {decision.scenario}</span><span><Activity size={13} /> {decision.impact}</span><span><CalendarDays size={13} /> {decision.date}</span></div></div><button className="icon-button"><MoreHorizontal size={18} /></button></article>)}</section></div>;
}

function MilestonesPage() {
  const milestones = [{ date: "NOV 2025", title: "Ship the new onboarding flow", description: "Reduce time-to-value for the next 20 demo accounts.", state: "Achieved", tone: "mint" }, { date: "MAR 2026", title: "Reach $15k MRR", description: "A steady base to unlock the next contractor decision.", state: "Next up", tone: "blue" }, { date: "JUN 2026", title: "Make founder draw predictable", description: "Move from reactive cash decisions to a repeatable monthly plan.", state: "Planned", tone: "amber" }];
  return <div className="page-stack"><PageHeader eyebrow="Plan the next chapter" title="Milestones" description="Turn the numbers into a few dates worth working toward." action={<button className="button button-primary"><Plus size={16} /> Add milestone</button>} /><section className="panel milestone-panel"><div className="timeline">{milestones.map((milestone, index) => <div className="milestone" key={milestone.title} tabIndex={0}><div className="milestone-rail"><span className={`milestone-dot milestone-${milestone.tone}`} />{index < milestones.length - 1 && <span className="milestone-line" />}</div><div className="milestone-card"><div className="milestone-date">{milestone.date}</div><div className="milestone-title-row"><h2>{milestone.title}</h2><Badge tone={milestone.tone as "mint" | "amber" | "blue"}>{milestone.state}</Badge></div><p>{milestone.description}</p><button className="text-link">Edit milestone <ArrowRight size={14} /></button></div></div>)}</div></section></div>;
}

function NotesPage() {
  return <div className="page-stack"><PageHeader eyebrow="Working memory" title="Notes" description="Keep context close to the month, decision, or business it belongs to." action={<button className="button button-primary"><Plus size={16} /> Add note</button>} /><div className="notes-layout"><section className="panel notes-list"><div className="notes-filter"><button className="filter-active">All notes</button><button>Business</button><button>Decisions</button><button>Months</button></div>{[{ text: "Watch contractor spend after the January release.", tag: "Business", date: "Nov 14, 2025", initials: "PD" }, { text: "If activation improves, move the pricing test into the Growth push scenario.", tag: "Growth push", date: "Nov 12, 2025", initials: "PD" }, { text: "January includes the annual plan renewal cohort.", tag: "Jan 26", date: "Nov 08, 2025", initials: "PD" }].map((note) => <article className="note-card" key={note.text}><div className="note-avatar">{note.initials}</div><div><p>“{note.text}”</p><div className="note-meta"><Badge tone="blue">{note.tag}</Badge><span>{note.date}</span></div></div><button className="icon-button"><MoreHorizontal size={17} /></button></article>)}</section><aside className="panel note-side"><div className="eyebrow">Note context</div><h2>Keep the why beside the number.</h2><p>Notes can attach to your business, a month, or a decision so future-you sees the reasoning without opening another spreadsheet.</p><div className="note-side-items"><span><Check size={14} /> Business notes</span><span><Check size={14} /> Monthly context</span><span><Check size={14} /> Decision rationale</span></div></aside></div></div>;
}

function SettingsPage() {
  return <div className="page-stack"><PageHeader eyebrow="Business settings" title="Settings" description="Tune the assumptions that shape your forecast." action={<button className="button button-primary"><Check size={16} /> Save changes</button>} /><div className="settings-grid"><section className="panel settings-section"><div className="panel-heading"><div><div className="eyebrow">Business profile</div><h2>Priya Demo Co.</h2></div><Badge tone="mint">Active</Badge></div><div className="form-grid"><label>Business name<input defaultValue="Priya Demo Co." /></label><label>Currency<select defaultValue="USD"><option>USD — US dollar</option></select></label><label>Business start month<input defaultValue="2025-11" type="month" /></label><label>Starting cash<input defaultValue="48700" /></label></div></section><section className="panel settings-section"><div className="eyebrow">Forecast assumptions</div><h2>Make the model yours</h2><p className="panel-intro">These defaults stay visible in every formula disclosure.</p><div className="settings-lines"><label><span>Trailing burn window <small>Months used for average burn</small></span><input defaultValue="3" /></label><label><span>Critical threshold <small>Show critical below</small></span><input defaultValue="3" /></label><label><span>Warning threshold <small>Show warning below</small></span><input defaultValue="6" /></label></div></section><section className="panel settings-section categories-section"><div className="panel-heading"><div><div className="eyebrow">Categories</div><h2>Revenue and expense labels</h2></div><button className="button button-secondary"><Plus size={15} /> Add category</button></div><div className="category-row"><span className="category-swatch swatch-mint" /><strong>Product sales</strong><Badge tone="mint">Revenue · recurring</Badge><MoreHorizontal size={17} /></div><div className="category-row"><span className="category-swatch swatch-blue" /><strong>Consulting</strong><Badge tone="blue">Revenue · one-off</Badge><MoreHorizontal size={17} /></div><div className="category-row"><span className="category-swatch swatch-coral" /><strong>Software</strong><Badge tone="coral">Expense · recurring</Badge><MoreHorizontal size={17} /></div><div className="category-row"><span className="category-swatch swatch-amber" /><strong>Contractors</strong><Badge tone="amber">Expense · variable</Badge><MoreHorizontal size={17} /></div></section></div><div className="danger-zone"><div><div className="eyebrow">Danger zone</div><h2>Delete this business</h2><p>This removes the demo business and its planning data. The action cannot be undone.</p></div><button className="button button-danger">Delete business</button></div></div>;
}

function BillingPage() {
  const plans = [{ name: "Starter", price: "$12", description: "For a single founder finding a rhythm.", features: ["1 business", "6 month horizon", "2 scenarios"], active: false }, { name: "Growth", price: "$29", description: "For founders making decisions with context.", features: ["3 businesses", "18 month horizon", "10 scenarios"], active: true }, { name: "Scale", price: "$59", description: "For small teams and adviser-led planning.", features: ["10 businesses", "36 month horizon", "Unlimited scenarios"], active: false }];
  return <div className="page-stack"><PageHeader eyebrow="Plan and usage" title="Billing" description="A simple plan for a simple promise: keep the math visible." /><div className="billing-current"><div className="billing-current-copy"><span className="billing-icon"><Zap size={17} /></span><div><div className="eyebrow">Current plan</div><h2>Growth trial <Badge tone="mint">11 days remaining</Badge></h2><p>3 businesses · 18 month forecast · 10 scenarios</p></div></div><button className="button button-secondary">Manage billing <ArrowRight size={15} /></button></div><div className="pricing-grid">{plans.map((plan) => <article className={`pricing-card ${plan.active ? "pricing-card-active" : ""}`} key={plan.name}>{plan.active && <div className="popular-ribbon">Current plan</div>}<div className="eyebrow">{plan.name}</div><div className="pricing-price">{plan.price}<span>/ month</span></div><p>{plan.description}</p><div className="pricing-features">{plan.features.map((feature) => <span key={feature}><Check size={14} /> {feature}</span>)}</div><button className={`button ${plan.active ? "button-primary" : "button-secondary"}`}>{plan.active ? "Current plan" : `Choose ${plan.name}`}</button></article>)}</div><div className="billing-footnote"><ShieldCheck size={16} /> Payments are handled securely in Stripe test mode for this demo. No live charges.</div></div>;
}

function MarketingNav() {
  return <header className="marketing-nav"><Link href="/"><Logo /></Link><nav><Link href="/#product">Product</Link><Link href="/pricing">Pricing</Link><Link href="/legal/privacy">Privacy</Link></nav><div className="marketing-actions"><Link href="/sign-in" className="nav-login">Sign in</Link><Link href="/sign-up" className="button button-primary button-small">Start free trial <ArrowRight size={14} /></Link></div></header>;
}

function LandingPage() {
  return <div className="marketing-page"><MarketingNav /><main><section className="hero-section"><div className="hero-copy"><div className="hero-kicker"><span><Activity size={14} /> Built for founder-led businesses</span><span className="hero-kicker-line" /></div><h1>Know how long you can run <em>before</em> you make the next move.</h1><p>BootPulse turns your cash plan into a clear operating rhythm — runway, scenarios, and the reasoning behind every decision in one calm workspace.</p><div className="hero-actions"><Link href="/sign-up" className="button button-primary button-large">Start free trial <ArrowRight size={16} /></Link><Link href="/app/businesses/demo-company" className="button button-ghost button-large"><PlayIcon /> Explore demo</Link></div><div className="hero-proof"><span><ShieldCheck size={15} /> Fictional demo data</span><span><LockKeyhole size={15} /> Your assumptions stay yours</span></div></div><div className="hero-visual"><div className="visual-glow" /><div className="demo-window"><div className="demo-window-top"><span className="window-dots"><i /><i /><i /></span><span>bootpulse / overview</span><MoreHorizontal size={15} /></div><div className="demo-window-body"><div className="demo-rail"><Logo inverse /><span className="demo-rail-line active" /><span className="demo-rail-line" /><span className="demo-rail-line" /><span className="demo-rail-line" /></div><div className="demo-content"><div className="demo-caption">CURRENT RUNWAY</div><div className="demo-runway">8.4 <small>months</small></div><div className="demo-rule" /><div className="demo-mini-grid"><span>Current cash<strong>$48.7k</strong></span><span>Monthly burn<strong>$5.8k</strong></span><span>Zero-cash month<strong>Jul 26</strong></span></div><div className="demo-bars">{[54, 67, 62, 74, 69, 81, 78].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div></div></div></div><div className="hero-floating-card"><span><span className="floating-icon"><Check size={14} /></span><strong>Healthy runway</strong></span><small>+2.3 months vs. last plan</small></div></div></section><section className="logo-strip"><span>For people who build without a finance department</span><div><span>SOLO FOUNDERS</span><span>BOOTSTRAPPED TEAMS</span><span>INDEPENDENT STUDIOS</span><span>ADVISERS & MENTORS</span></div></section><section id="product" className="value-section"><div className="section-heading"><div className="eyebrow">The founder’s view</div><h2>Clarity where the spreadsheet gets fuzzy.</h2><p>BootPulse is designed around the decisions that actually change your month.</p></div><div className="value-grid"><article><span className="value-icon value-icon-mint"><Gauge size={19} /></span><h3>See your runway in a minute</h3><p>One headline number, one projected zero-cash month, and a visible trail back to every assumption.</p><Link href="/app/businesses/demo-company" className="text-link">View the dashboard <ArrowRight size={15} /></Link></article><article><span className="value-icon value-icon-blue"><Sparkles size={19} /></span><h3>Model the move, not the mess</h3><p>Clone your baseline, add a cost or revenue change, and compare the tradeoff side by side.</p><Link href="/app/businesses/demo-company/scenarios" className="text-link">Compare scenarios <ArrowRight size={15} /></Link></article><article><span className="value-icon value-icon-coral"><BookOpen size={19} /></span><h3>Keep the reasoning</h3><p>Decision log, milestones, and notes keep the why beside the number for your next review.</p><Link href="/app/businesses/demo-company/decisions" className="text-link">Open the decision log <ArrowRight size={15} /></Link></article></div></section><section className="quote-section"><div className="quote-mark">“</div><blockquote>Every figure is editable. Every total has a trail.</blockquote><p>BootPulse is for founders who want to make the next move with context, not confidence theater.</p></section><section className="cta-section"><div><div className="eyebrow eyebrow-light">Start with a clearer Monday</div><h2>Your runway is already telling you something.</h2><p>Give it a place where the decision is easier to see.</p></div><Link href="/sign-up" className="button button-light button-large">Start free trial <ArrowRight size={16} /></Link></section></main><footer className="marketing-footer"><Logo /><span>Built for calm, candid planning.</span><div><Link href="/legal/privacy">Privacy</Link><Link href="/legal/terms">Terms</Link><Link href="/pricing">Pricing</Link></div></footer></div>;
}

function PlayIcon() { return <span className="play-icon">▶</span>; }

function SimplePage({ kind }: { kind: "pricing" | "privacy" | "terms" | "signin" | "signup" | "onboarding" }) {
  if (kind === "pricing") return <div className="marketing-page"><MarketingNav /><main className="simple-marketing"><div className="section-heading centered"><div className="eyebrow">Pricing that stays legible</div><h1>Start small. Upgrade when the decisions get bigger.</h1><p>Every plan is built around a forecast horizon and a number of businesses. No hidden gates.</p></div><div className="pricing-grid pricing-grid-marketing">{[{ name: "Starter", price: "$12", copy: "One business, a six-month view, and the confidence to start.", items: ["1 business", "6 month forecast", "2 scenarios", "Self-serve docs"] }, { name: "Growth", price: "$29", copy: "For founders who want the full decision loop.", items: ["3 businesses", "18 month forecast", "10 scenarios", "Email support"] }, { name: "Scale", price: "$59", copy: "For small teams and adviser-led planning.", items: ["10 businesses", "36 month forecast", "Unlimited scenarios", "Read-only adviser access"] }].map((plan, index) => <article className={`pricing-card ${index === 1 ? "pricing-card-active" : ""}`} key={plan.name}>{index === 1 && <div className="popular-ribbon">Most popular</div>}<div className="eyebrow">{plan.name}</div><div className="pricing-price">{plan.price}<span>/ month</span></div><p>{plan.copy}</p><div className="pricing-features">{plan.items.map((item) => <span key={item}><Check size={14} /> {item}</span>)}</div><Link href="/sign-up" className={`button ${index === 1 ? "button-primary" : "button-secondary"}`}>Start with {plan.name}</Link></article>)}</div></main></div>;
  const titles = { privacy: "Privacy, in plain language", terms: "Terms for a focused tool", signin: "Sign in to your workspace", signup: "Start your free trial", onboarding: "Set up your first business" };
  const descriptions = { privacy: "BootPulse uses fictional demo data in this preview. In a production account, you control the business data you enter and may request access or correction.", terms: "BootPulse is a planning tool, not accounting, tax, legal, or investment advice. The demo uses test-mode billing and fictional data only.", signin: "Use the demo workspace below, or connect your account when authentication is enabled.", signup: "A calm cash plan starts with a few honest assumptions.", onboarding: "Four steps to a useful first forecast. You can change every assumption later." };
  return <div className="auth-page"><div className="auth-aside"><Link href="/"><Logo inverse /></Link><div><div className="eyebrow eyebrow-light">BootPulse</div><h1>Make the next move with the math in view.</h1><p>Cash-flow clarity for founders who are building without a finance department.</p></div><div className="auth-aside-foot"><ShieldCheck size={15} /> Fictional demo environment</div></div><div className="auth-content"><Link href="/" className="auth-back"><ArrowRight size={15} className="rotate-180" /> Back to home</Link><div className="auth-card"><div className="eyebrow">{kind === "onboarding" ? "Step 1 of 4" : "BootPulse workspace"}</div><h2>{titles[kind]}</h2><p>{descriptions[kind]}</p>{kind === "privacy" || kind === "terms" ? <div className="legal-copy"><h3>What this means</h3><p>We collect only what is needed to provide the workspace, support authentication, and process test-mode subscriptions. Service providers may include Clerk for sign-in, Neon for the database, and Stripe for billing. Information is retained while the account is active and deleted or exported when requested, subject to lawful retention.</p><h3>Your choices</h3><p>You may request access, correction, export, or deletion. Contact the workspace owner through the support channel shown in the production account.</p></div> : kind === "onboarding" ? <div className="onboarding-form"><label>Business name<input defaultValue="Priya Demo Co." /></label><label>Currency<select defaultValue="USD"><option>USD — US dollar</option></select></label><label>Starting cash<input defaultValue="48700" /></label><label>Start month<input type="month" defaultValue="2025-11" /></label><Link href={`/app/businesses/${businessId}`} className="button button-primary button-full">Create my dashboard <ArrowRight size={16} /></Link></div> : <div className="onboarding-form"><label>Email address<input placeholder="you@example.com" /></label><label>Password<input type="password" placeholder="At least 8 characters" /></label><label className="checkbox-line"><input type="checkbox" defaultChecked /> I agree to the privacy notice and terms.</label><Link href={kind === "signin" ? `/app/businesses/${businessId}` : "/onboarding"} className="button button-primary button-full">{kind === "signin" ? "Sign in" : "Create account"} <ArrowRight size={16} /></Link><div className="form-divider"><span>or</span></div><Link href={`/app/businesses/${businessId}`} className="button button-secondary button-full">Explore fictional demo</Link>{kind === "signin" && <Link href="/signup" className="form-link">Forgot password?</Link>}</div>}</div></div></div>;
}

function AccountSettings() { return <WorkspaceLayout><div className="page-stack"><PageHeader eyebrow="Account" title="Account settings" description="Manage consent records and your demo workspace data." /><section className="panel settings-section"><div className="panel-heading"><div><div className="eyebrow">Consent record</div><h2>Privacy and terms</h2></div><Badge tone="mint">Recorded</Badge></div><div className="consent-row"><span><ShieldCheck size={16} /> Privacy notice accepted</span><small>Nov 17, 2025 · append-only record</small></div><div className="consent-row"><span><ShieldCheck size={16} /> Terms accepted</span><small>Nov 17, 2025 · append-only record</small></div><div className="consent-row"><span><Bell size={16} /> Product updates</span><small>Off by default</small></div></section><div className="export-grid"><button className="export-card"><Download size={18} /><strong>Export JSON</strong><span>Download all workspace data</span></button><button className="export-card"><Download size={18} /><strong>Export CSV</strong><span>Download monthly summaries</span></button></div></div></WorkspaceLayout>; }

function Router({ cashFlow, setCashFlow }: { cashFlow: CashMonth[]; setCashFlow: React.Dispatch<React.SetStateAction<CashMonth[]>> }) {
  return <Switch><Route path="/" component={LandingPage} /><Route path="/pricing">{() => <SimplePage kind="pricing" />}</Route><Route path="/legal/privacy">{() => <SimplePage kind="privacy" />}</Route><Route path="/legal/terms">{() => <SimplePage kind="terms" />}</Route><Route path="/sign-in">{() => <SimplePage kind="signin" />}</Route><Route path="/sign-up">{() => <SimplePage kind="signup" />}</Route><Route path="/onboarding">{() => <SimplePage kind="onboarding" />}</Route><Route path="/app">{() => <Redirect to={`/app/businesses/${businessId}`} />}</Route><Route path={`/app/businesses/${businessId}/cash-flow`}>{() => <WorkspaceLayout><CashFlowPage cashFlow={cashFlow} setCashFlow={setCashFlow} /></WorkspaceLayout>}</Route><Route path={`/app/businesses/${businessId}/scenarios/:scenarioId`}>{() => <WorkspaceLayout><ScenarioPage /></WorkspaceLayout>}</Route><Route path={`/app/businesses/${businessId}/scenarios`}>{() => <WorkspaceLayout><ScenarioPage /></WorkspaceLayout>}</Route><Route path={`/app/businesses/${businessId}/decisions`}>{() => <WorkspaceLayout><DecisionsPage /></WorkspaceLayout>}</Route><Route path={`/app/businesses/${businessId}/milestones`}>{() => <WorkspaceLayout><MilestonesPage /></WorkspaceLayout>}</Route><Route path={`/app/businesses/${businessId}/notes`}>{() => <WorkspaceLayout><NotesPage /></WorkspaceLayout>}</Route><Route path={`/app/businesses/${businessId}/settings`}>{() => <WorkspaceLayout><SettingsPage /></WorkspaceLayout>}</Route><Route path="/app/billing">{() => <WorkspaceLayout><BillingPage /></WorkspaceLayout>}</Route><Route path="/app/settings">{() => <AccountSettings />}</Route><Route path={`/app/businesses/${businessId}`}>{() => <WorkspaceLayout><Dashboard cashFlow={cashFlow} /></WorkspaceLayout>}</Route><Route>{() => <Redirect to="/" />}</Route></Switch>;
}

function App() {
  const [cashFlow, setCashFlow] = useState<CashMonth[]>(initialCashFlow);
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router cashFlow={cashFlow} setCashFlow={setCashFlow} /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;

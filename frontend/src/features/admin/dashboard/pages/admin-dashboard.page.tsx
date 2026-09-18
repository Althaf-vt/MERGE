import React, { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from 'react';
import DraggableWidgetGrid, { type WidgetItem } from '../../../../shared/components/ui/draggable-widget-grid';
import styles from './admin-dashboard.module.css';

type Kind = 'runs' | 'health' | 'cost' | 'failures' | 'traces' | 'evals' | 'tools' | 'models';

interface Widget extends WidgetItem {
    kind: Kind;
}

const WIDGETS: Widget[] = [
    { id: 'runs', kind: 'runs', size: 'wide', label: 'KYC Verifications today' },
    { id: 'health', kind: 'health', size: 'sm', label: 'System status' },
    { id: 'cost', kind: 'cost', size: 'sm', label: 'Infrastructure cost' },
    { id: 'failures', kind: 'failures', size: 'sm', label: 'System Errors' },
    { id: 'traces', kind: 'traces', size: 'wide', label: 'Recent KYC traces' },
    { id: 'evals', kind: 'evals', size: 'sm', label: 'Liveness AI Score' },
    { id: 'tools', kind: 'tools', size: 'wide', label: 'Partner API calls' },
    { id: 'models', kind: 'models', size: 'wide', label: 'LLM Token usage' },
];

const LiveContext = createContext(true);

function useTick(ms = 2000) {
    const live = useContext(LiveContext);
    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (!live) return;
        const id = window.setInterval(() => {
            if (!document.hidden) setTick((t) => t + 1);
        }, ms);
        return () => window.clearInterval(id);
    }, [live, ms]);
    return tick;
}

function noise(seed: number) {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
}

const fmt = (v: number) => v.toLocaleString('en-US');
const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const duration = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${Math.round(v)}ms`;

/* ------------------------------------------------------------------ *
 * Building blocks
 * ------------------------------------------------------------------ */

function Shell({ title, meta, children }: { title: string; meta?: ReactNode; children: ReactNode }) {
    return (
        <section className={styles.shell}>
            <header className={styles.shellHeader}>
                <h3 className={styles.shellTitle}>{title}</h3>
                {meta && <span className={styles.shellMeta}>{meta}</span>}
            </header>
            <div className={styles.shellContent}>{children}</div>
        </section>
    );
}

function Big({ children, unit, unitWide = false }: { children: ReactNode; unit?: string; unitWide?: boolean }) {
    return (
        <p className={styles.bigText}>
            {children}
            {unit && (
                <span className={`${styles.bigUnit} ${unitWide ? styles.unitWide : ''}`}>
                    {'\u00a0'}{unit}
                </span>
            )}
        </p>
    );
}

function Delta({ value, against, suffix, good = 'up' }: { value: number; against: string; suffix?: string; good?: 'up' | 'down' }) {
    const up = value >= 0;
    const isOk = up === (good === 'up');
    return (
        <span className={`${styles.delta} ${isOk ? styles.textOk : styles.textErr}`}>
            <span aria-hidden="true">{up ? '↑' : '↓'} </span>
            {Math.abs(value)}%
            {suffix && <span aria-hidden="true" className={styles.deltaSuffix}> {suffix}</span>}
            <span className={styles.srOnly}> {against}</span>
        </span>
    );
}

function Dot({ tone, pulse = false }: { tone: 'ok' | 'warn' | 'err' | 'idle'; pulse?: boolean }) {
    const colorClass = tone === 'ok' ? styles.dotOk : tone === 'warn' ? styles.dotWarn : tone === 'err' ? styles.dotErr : styles.dotIdle;
    return (
        <span aria-hidden="true" className={styles.dotContainer}>
            {pulse && <span className={`${styles.dotPulse} ${colorClass}`} />}
            <span className={`${styles.dotCore} ${colorClass}`} />
        </span>
    );
}

function Row({ children, value }: { children: ReactNode; value: ReactNode }) {
    return (
        <div className={styles.row}>
            <dt className={styles.rowDt}>{children}</dt>
            <dd className={styles.rowDd}>{value}</dd>
        </div>
    );
}

/* ------------------------------------------------------------------ *
 * Widgets
 * ------------------------------------------------------------------ */

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Today'];
const SLOTS = 32; const SLOT_MINUTES = 45; const NOW = 28;
const HOURS = ['12AM', '6AM', '12PM', '6PM'];

function runsAt(day: number, slot: number) {
    const hour = (slot * SLOT_MINUTES) / 60;
    const weekend = DAYS[day] === 'Sat' || DAYS[day] === 'Sun';
    const shape = 3.5 + Math.exp(-((hour - 15) ** 2) / 30) * 18 + Math.exp(-((hour - 10) ** 2) / 10) * 11;
    return Math.max(0, Math.round(shape * 3.3 * (weekend ? 0.5 : 1) * (0.5 + noise(day * 97 + slot))));
}
const slotClock = (slot: number) => `${String(Math.floor((slot * SLOT_MINUTES) / 60)).padStart(2, '0')}:${String((slot * SLOT_MINUTES) % 60).padStart(2, '0')}`;

function Runs() {
    const t = useTick(2500);
    const today = DAYS.length - 1;
    const grid = DAYS.map((_, d) => Array.from({ length: SLOTS }, (_, s) => d === today && s > NOW ? null : runsAt(d, s) + (d === today && s === NOW ? t % 12 : 0)));
    const peak = Math.max(...grid.flat().map((v) => v ?? 0));
    const total = grid[today].reduce<number>((a, v) => a + (v ?? 0), 0);

    return (
        <Shell title="KYC Verifications" meta={<Delta value={12} against="compared with yesterday" suffix="vs yesterday" />}>
            <Big>{fmt(total)}</Big>
            <div className={styles.pushBottom}>
                <div role="img" aria-label={`Runs per 45 minutes over the last 5 days. ${fmt(total)} runs so far today.`} className={styles.heatmapGrid}>
                    {grid.map((row, d) => (
                        <Fragment key={DAYS[d]}>
                            <span aria-hidden="true" className={`${styles.heatmapDay} ${d === today ? styles.textForeground : styles.textMuted}`}>{DAYS[d]}</span>
                            <span className={styles.heatmapRow}>
                                {row.map((v, s) => {
                                    const level = v === null || v === 0 ? 0 : Math.max(1, Math.ceil((v / peak) * 4));
                                    const heatClass = `heat${level}`;
                                    const isActive = d === today && s === NOW;
                                    return (
                                        <span key={s} title={v === null ? undefined : `${DAYS[d]} ${slotClock(s)} · ${v} runs`}
                                              className={`${styles.heatmapCell} ${isActive ? styles.bgAccentLight : styles[heatClass as keyof typeof styles]}`} />
                                    );
                                })}
                            </span>
                        </Fragment>
                    ))}
                    <span aria-hidden="true" className={styles.heatmapDay} />
                    <span aria-hidden="true" className={styles.heatmapHours}>
                        {HOURS.map((h) => <span key={h}>{h}</span>)}
                    </span>
                </div>
            </div>
        </Shell>
    );
}

const INCIDENTS: Record<number, boolean> = { 8: true, 21: true };
function Health() {
    const t = useTick(5000);
    const degraded = t % 6 === 5;
    return (
        <Shell title="System status" meta="30d">
            <Big unit="uptime" unitWide>99.98%</Big>
            <p className={`${styles.healthStatus} ${degraded ? styles.textWarn : styles.textForeground}`}>
                <Dot tone={degraded ? 'warn' : 'ok'} pulse />
                <span className={styles.truncate}>{degraded ? 'Degraded performance' : 'All systems operational'}</span>
            </p>
            <div className={styles.pushBottom}>
                <div role="img" aria-label="Uptime over the last 30 days." className={styles.healthStrip}>
                    {Array.from({ length: 30 }, (_, i) => <span key={i} className={`${styles.healthDay} ${INCIDENTS[i] ? styles.bgWarnStrip : styles.bgMutedStrip}`} />)}
                </div>
            </div>
        </Shell>
    );
}

function Cost() {
    const t = useTick(3000);
    const days = Array.from({ length: 14 }, (_, i) => Math.round(9 + noise(i * 5) * 7 + i * 0.35));
    days[13] = Math.round(12 + (t % 30) * 0.2);
    const month = 184.2 + (t % 30) * 0.07;
    const max = Math.max(...days);
    return (
        <Shell title="Infrastructure cost" meta={<Delta value={8} against="compared with last month" suffix="MoM" good="down" />}>
            <Big unit="MTD">${month.toFixed(0)}</Big>
            <div role="img" aria-label={`Daily cost over the last 14 days.`} className={`${styles.pushBottom} ${styles.costChart}`}>
                {days.map((d, i) => (
                    <span key={i} className={`${styles.costBar} ${i === days.length - 1 ? styles.bgAccent : styles.bgMutedStrip}`} style={{ height: `${(d / max) * 100}%` }} />
                ))}
            </div>
        </Shell>
    );
}

function Failures() {
    const t = useTick(5000);
    const causes = [
        { name: 'liveness-timeout', count: 9 + (Math.floor(t / 3) % 5) },
        { name: 'uidai-rate-limit', count: 7 },
        { name: 'pki-decryption-error', count: 5 + (Math.floor(t / 5) % 4) },
    ];
    const total = causes.reduce((a, c) => a + c.count, 0) + 2;
    return (
        <Shell title="System Errors" meta="24h">
            <Big unit={`${((total / 1262) * 100).toFixed(1)}% rate`}>{total}</Big>
            <dl className={`${styles.pushBottom} ${styles.failureList}`}>
                {causes.map((c, i) => (
                    <Row key={c.name} value={c.count}>
                        <Dot tone={i === 0 ? 'err' : 'idle'} /> {c.name}
                    </Row>
                ))}
            </dl>
        </Shell>
    );
}

const AGENTS = ['liveness_worker', 'biometric_matcher', 'document_parser', 'pki_validator', 'moderation_sentinel'];
function trace(n: number) {
    const r = noise(n * 3);
    return {
        n, id: `tr_${Math.floor(noise(n) * 0xffffff).toString(16).padStart(6, '0')}`,
        agent: AGENTS[Math.floor(noise(n * 7) * AGENTS.length)],
        ms: 400 + noise(n * 13) * 3200,
        tone: r > 0.9 ? 'err' as const : r > 0.8 ? 'warn' as const : 'ok' as const,
    };
}
function Traces() {
    const t = useTick(2200);
    const rows = Array.from({ length: 4 }, (_, i) => trace(t + 40 - i));
    const longest = 3600;
    return (
        <Shell title="Recent KYC traces" meta={<span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Dot tone="ok" pulse />live</span>}>
            <Big unit="p50">{duration(median(rows.map((r) => r.ms)))}</Big>
            <ol aria-label="Most recent traces" className={`${styles.pushBottom} ${styles.traceList}`}>
                {rows.map((r, i) => (
                    <li key={r.n} className={`${styles.traceItem} ${i === 0 ? styles.textForeground : styles.textMuted} ${i >= 3 ? styles.hiddenSm : i === 2 ? styles.hiddenXs : ''}`}>
                        <Dot tone={r.tone} />
                        <span className={styles.truncate}>{r.id}</span>
                        <span aria-hidden="true" className={`${styles.truncate} ${styles.traceAgent}`}>{r.agent}</span>
                        <span aria-hidden="true" className={styles.traceBarTrack}>
                            <span className={`${styles.traceBarFill} ${i === 0 ? styles.bgAccent : styles.bgMutedStrip}`} style={{ width: `${(r.ms / longest) * 100}%` }} />
                        </span>
                        <span className={styles.traceTime}>{duration(r.ms)}</span>
                    </li>
                ))}
            </ol>
        </Shell>
    );
}

const EVALS = [{ name: 'Precision', value: 0.94 }, { name: 'Recall', value: 0.89 }, { name: 'F1 Score', value: 0.91 }];
function Evals() {
    const score = EVALS.reduce((a, e) => a + e.value, 0) / EVALS.length;
    return (
        <Shell title="Liveness AI Score">
            <div className={styles.evalScoreWrap}>
                <Big>{score.toFixed(2)}</Big>
                <span className={`${styles.delta} ${styles.textOk}`}><span aria-hidden="true">↑ </span>0.03</span>
            </div>
            <dl className={`${styles.pushBottom} ${styles.failureList}`}>
                {EVALS.map((e) => <Row key={e.name} value={e.value.toFixed(2)}>{e.name}</Row>)}
            </dl>
        </Shell>
    );
}

const TOOLS = [
    { name: 'aws_rekognition', calls: 412 }, { name: 'uidai_aadhaar_xml', calls: 268 },
    { name: 'twilio_sms', calls: 197 }, { name: 'gemini_llm', calls: 143 },
];
function Tools() {
    const t = useTick(3000);
    const rows = TOOLS.map((tool, i) => ({ ...tool, calls: tool.calls + Math.floor((t % 50) * (4 - i) * 0.6) }));
    const max = Math.max(...rows.map((r) => r.calls));
    const total = rows.reduce((a, r) => a + r.calls, 0);
    return (
        <Shell title="Partner API calls" meta="24h">
            <Big>{fmt(total)}</Big>
            <table className={`${styles.pushBottom} ${styles.toolsTable}`}>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={r.name} className={`${i >= 3 ? styles.hiddenSm : i === 2 ? styles.hiddenXs : ''}`}>
                            <th scope="row" className={`${styles.truncate} ${i === 0 ? styles.textForeground : styles.textMuted}`}>{r.name}</th>
                            <td>
                                <span className={styles.traceBarTrack} style={{ display: 'block', width: '100%' }}>
                                    <span className={`${styles.traceBarFill} ${i === 0 ? styles.bgAccent : styles.bgMutedStrip}`} style={{ width: `${(r.calls / max) * 100}%` }} />
                                </span>
                            </td>
                            <td className={styles.toolCount}>{r.calls}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Shell>
    );
}

const MODELS = [
    { name: 'gpt-4o-moderation', share: 0.52, swatch: styles.bgAccent },
    { name: 'gemini-1.5-flash', share: 0.27, swatch: styles.bgAccentSecondary },
    { name: 'gemini-1.5-pro', share: 0.13, swatch: styles.bgAccentTertiary },
    { name: 'text-embedding-v3', share: 0.08, swatch: styles.bgMutedStrip },
];
function Models() {
    return (
        <Shell title="LLM Token usage" meta="by model · 24h">
            <Big unit="tokens">12.3M</Big>
            <dl className={`${styles.pushBottom} ${styles.modelsGrid}`}>
                {MODELS.map((m) => (
                    <Row key={m.name} value={`${Math.round(m.share * 100)}%`}>
                        <span aria-hidden="true" className={`${styles.modelDot} ${m.swatch}`} />
                        <span className={styles.truncate}>{m.name}</span>
                    </Row>
                ))}
            </dl>
            <div role="img" className={styles.modelsStrip}>
                {MODELS.map((m) => <span key={m.name} className={`${styles.modelsStripSeg} ${m.swatch}`} style={{ width: `${m.share * 100}%` }} />)}
            </div>
        </Shell>
    );
}

/* ------------------------------------------------------------------ *
 * Board
 * ------------------------------------------------------------------ */

const VIEWS: Record<Kind, () => ReactNode> = {
    runs: Runs, health: Health, cost: Cost, failures: Failures,
    traces: Traces, evals: Evals, tools: Tools, models: Models,
};

export const AdminDashboardPage = () => {
    const [live, setLive] = useState(true);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setLive(false);
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.contentConstraints}>
                <header style={{ marginBottom: '1.5rem' }}>
                    <h1 className={styles.pageTitle}>Observability Metrics</h1>
                    <p className={styles.pageDescription}>
                        <span className={styles.dragDesktopText}>Drag and rearrange widgets to customize the layout.</span>
                        <span className={styles.dragMobileText}>Press and hold a widget, then drag to rearrange the layout.</span>
                    </p>
                </header>

                <section aria-labelledby="agent-observability-title">
                    <h2 id="agent-observability-title" className={styles.srOnly}>Platform Telemetry</h2>
                    <LiveContext.Provider value={live}>
                        <DraggableWidgetGrid
                            items={WIDGETS}
                            renderItem={(item) => {
                                const View = VIEWS[(item as Widget).kind];
                                return <View />;
                            }}
                        />
                    </LiveContext.Provider>
                </section>
            </div>
        </div>
    );
};
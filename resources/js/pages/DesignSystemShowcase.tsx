/**
 * Purpose: Phase 0 System Health & Calm Editorial Neutral Design System Showcase (`/` & `/design-system`).
 * Domain Context: Demonstrates the low-glare Calm Editorial Neutral UI system
 *                 (`docs/DESIGN_SYSTEM.md`), Journey of Belonging tiers (`Part` & `Vital`),
 *                 the 5 Vital Organs, Virtual Funds in IDR, 90-Minute Run Sheet, and live MySQL connectivity.
 * Key Dependencies: @inertiajs/react, recharts, @/components/shared/*, @/components/ui/*
 */
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    Clock,
    Database,
    KeyRound,
    Layers,
    Lock,
    Server,
    ShieldCheck,
    Sparkles,
    Users,
    Wallet,
} from 'lucide-react';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Cell as RechartsCell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { OrganIcon } from '@/components/shared/OrganIcon';
import { PageHeader } from '@/components/shared/PageHeader';
import { TierBadge } from '@/components/shared/TierBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBanner, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDurationTag, formatEditorialDate, formatIdr } from '@/lib/formatters';
import type {
    CellTenant,
    EventSummary,
    FinanceFundSummary,
    SystemHealthMetrics,
    VitalOrganMetadata,
} from '@/types';

export interface ShepherdRadarSummary {
    total_members: number;
    vital_count: number;
    part_count: number;
    attendance_rate_percent: number;
    open_follow_ups_count: number;
}

export interface DesignSystemShowcaseProps {
    /** Active cell tenant (`FC R&D`) */
    cell: CellTenant | null;
    /** Cell health metrics computed by ShepherdRadarService */
    shepherdRadar: ShepherdRadarSummary;
    /** All 5 Vital Organs with assigned stewards and Spatie permissions */
    vitalOrgans: VitalOrganMetadata[];
    /** Virtual funds managed by Vascular System (Treasurer) */
    funds: FinanceFundSummary[];
    /** Sample 90-minute gathering with run sheet and anonymous feedback stats */
    featuredEvent: EventSummary | null;
    /** Live backend & database health diagnostics */
    health: SystemHealthMetrics;
}

interface ColorSwatchSpec {
    name: string;
    token: string;
    hex: string;
    textHex: string;
    role: string;
}

const EDITORIAL_SWATCHES: ColorSwatchSpec[] = [
    { name: 'Slate 50 (Alabaster)', token: '--background', hex: '#F8FAFC', textHex: '#1E293B', role: 'Low-Glare Primary Canvas & Card Banners' },
    { name: 'Pure White', token: '--card / --surface', hex: '#FFFFFF', textHex: '#1E293B', role: 'Clean Card, Table & Modal Surface' },
    { name: 'Slate 800 (Charcoal)', token: '--foreground / --primary', hex: '#1E293B', textHex: '#FFFFFF', role: 'Comfortable Primary Ink & Primary CTA' },
    { name: 'Slate 500 (Muted)', token: '--muted-foreground', hex: '#64748B', textHex: '#FFFFFF', role: 'Secondary Copy, Subtitles & Metadata' },
    { name: 'Slate 200 (Hairline)', token: '--border', hex: '#E2E8F0', textHex: '#1E293B', role: 'Subtle 1px Structural Borders & Dividers' },
    { name: 'Slate 100 (Quiet Pill)', token: '--secondary', hex: '#F1F5F9', textHex: '#334155', role: 'Secondary Buttons & Part Tier Pill' },
    { name: 'Indigo 600 (Restrained)', token: '--ring / --chart-2', hex: '#4F46E5', textHex: '#FFFFFF', role: 'Focus Rings, Active Links & Vital Accent' },
    { name: 'Indigo 50 (Soft Tint)', token: '--accent', hex: '#EEF2FF', textHex: '#4338CA', role: 'Soft Vital Tier Badge Background' },
];

const CHART_BAR_PALETTE = ['#1E293B', '#4F46E5', '#64748B'];

/**
 * Renders the Phase 0 System Health & Calm Editorial Neutral Design System Showcase.
 */
export default function DesignSystemShowcase({
    cell,
    shepherdRadar,
    vitalOrgans,
    funds,
    featuredEvent,
    health,
}: DesignSystemShowcaseProps): React.ReactElement {
    const cellName = cell?.name ?? 'FC R&D';

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
            <Head title="Phase 0 System Health & Calm Editorial Design System" />
            <TopBar cellName={cellName} />

            <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
                {/* ==================== 1. EDITORIAL SUBJECT HERO ==================== */}
                <PageHeader
                    categoryTag="HISTORY MAKER / FC R&D / PHASE 0 FOUNDATION"
                    title={`${cellName} — Community Architecture & Design System`}
                    description={
                        cell?.description ??
                        'Scalable, soft multi-tenant cell management architecture engineered for cPanel Shared Hosting + MySQL with a low-glare Calm Editorial Neutral interface.'
                    }
                    actions={
                        <>
                            <a href="#vital-organs">
                                <Button variant="default">
                                    <Layers className="h-4 w-4" />
                                    <span>Explore 5 Vital Organs</span>
                                </Button>
                            </a>
                            <Link href="/auth/google/redirect">
                                <Button variant="outline">
                                    <ShieldCheck className="h-4 w-4 text-[#4F46E5]" />
                                    <span>Google OAuth Whitelist</span>
                                </Button>
                            </Link>
                        </>
                    }
                />

                {/* ==================== 2. SYSTEM HEALTH & CPANEL TELEMETRY ==================== */}
                <section aria-labelledby="system-health-heading" className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <span className="font-mono text-xs font-medium tracking-wider text-[#64748B] uppercase">
                                INFRASTRUCTURE DIAGNOSTICS
                            </span>
                            <h2 id="system-health-heading" className="font-heading text-2xl font-semibold text-[#0F172A]">
                                Phase 0 System Health & cPanel Readiness
                            </h2>
                        </div>
                        <Badge variant={health.database_connected ? 'success' : 'destructive'}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>
                                {health.database_connected
                                    ? `MYSQL CONNECTED (${health.database_name})`
                                    : 'DATABASE DISCONNECTED'}
                            </span>
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <Card interactive>
                            <CardBanner>
                                <span>RUNTIME & DATABASE</span>
                                <Database className="h-3.5 w-3.5 text-[#64748B]" />
                            </CardBanner>
                            <CardHeader className="pb-2">
                                <CardTitle className="font-mono text-xl text-[#0F172A]">
                                    PHP {health.php_version}
                                </CardTitle>
                                <CardDescription>
                                    Laravel v{health.laravel_version} · Driver:{' '}
                                    <strong className="font-mono font-medium text-[#1E293B]">{health.database_driver}</strong>
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <span>DB: {health.database_name}</span>
                                <span className="font-semibold text-[#047857]">ONLINE</span>
                            </CardFooter>
                        </Card>

                        <Card interactive>
                            <CardBanner>
                                <span>CPANEL DRIVERS (NO REDIS)</span>
                                <Server className="h-3.5 w-3.5 text-[#64748B]" />
                            </CardBanner>
                            <CardHeader className="pb-2">
                                <CardTitle className="font-mono text-xl text-[#0F172A] uppercase">
                                    {health.session_driver} / {health.queue_driver}
                                </CardTitle>
                                <CardDescription>
                                    Session, Cache ({health.cache_driver}), and Queue run 100% on MySQL tables.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <span>ZERO SUPERVISOR/SSR</span>
                                <span className="font-semibold text-[#4F46E5]">VERIFIED</span>
                            </CardFooter>
                        </Card>

                        <Card interactive>
                            <CardBanner>
                                <span>SHEPHERD RADAR ROSTER</span>
                                <Users className="h-3.5 w-3.5 text-[#64748B]" />
                            </CardBanner>
                            <CardHeader className="pb-2">
                                <CardTitle className="font-mono text-xl text-[#0F172A]">
                                    {shepherdRadar.total_members} Members
                                </CardTitle>
                                <CardDescription>
                                    {shepherdRadar.vital_count} Vital Servants · {shepherdRadar.part_count} Part Members ·{' '}
                                    {shepherdRadar.attendance_rate_percent}% Attendance
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <span>PASTORAL FOLLOW-UPS</span>
                                <span className="font-semibold text-[#334155]">{shepherdRadar.open_follow_ups_count} ACTIVE</span>
                            </CardFooter>
                        </Card>

                        <Card interactive>
                            <CardBanner>
                                <span>RBAC & AUDIT TRAIL</span>
                                <ShieldCheck className="h-3.5 w-3.5 text-[#64748B]" />
                            </CardBanner>
                            <CardHeader className="pb-2">
                                <CardTitle className="font-mono text-xl text-[#0F172A]">
                                    {health.spatie_roles_count} Roles · {health.spatie_permissions_count} Perms
                                </CardTitle>
                                <CardDescription>
                                    Spatie Permission + {health.activity_logs_count} Immutable Activitylog Ledger Entries
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <span>ANON FEEDBACKS</span>
                                <span className="font-semibold text-[#334155]">{health.anonymous_feedbacks_count} LOGGED</span>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

                {/* ==================== 3. JOURNEY OF BELONGING & 5 VITAL ORGANS ==================== */}
                <section id="vital-organs" aria-labelledby="vital-organs-heading" className="space-y-6">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-4 md:flex-row md:items-end">
                        <div>
                            <span className="font-mono text-xs font-medium tracking-wider text-[#64748B] uppercase">
                                DOMAIN MODELING · PHP 8.3+ STRICT ENUMS & SPATIE RBAC
                            </span>
                            <h2 id="vital-organs-heading" className="font-heading text-2xl font-semibold text-[#0F172A]">
                                Journey of Belonging (2 Tiers) & The 5 Vital Organs
                            </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <TierBadge tier="part" />
                            <TierBadge tier="vital" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {vitalOrgans.map((organ) => (
                            <Card key={organ.value} interactive className="flex flex-col justify-between">
                                <div>
                                    <CardBanner>
                                        <span>VITAL ORGAN · {organ.team_name}</span>
                                        <span className="font-mono text-[11px] text-[#475569]">{organ.spatie_role}</span>
                                    </CardBanner>
                                    <CardHeader>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <OrganIcon organ={organ.value} />
                                        </div>
                                        <CardTitle className="mt-1">{organ.label}</CardTitle>
                                        <CardDescription>{organ.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                                            <div className="font-mono text-[10px] font-medium text-[#64748B] uppercase">
                                                SEEDED STEWARD (WHITELISTED)
                                            </div>
                                            <div className="mt-0.5 font-heading text-sm font-semibold text-[#1E293B]">
                                                {organ.steward_name ?? 'Unassigned'}
                                            </div>
                                            <div className="font-mono text-xs text-[#64748B]">
                                                {organ.steward_email ?? '—'}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5">
                                            {organ.permissions.map((perm) => (
                                                <span
                                                    key={perm}
                                                    className="rounded-sm border border-[#E2E8F0] bg-white px-2 py-0.5 font-mono text-[11px] text-[#475569]"
                                                >
                                                    {perm}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                </div>
                                <CardFooter>
                                    <span>TIER: VITAL</span>
                                    <span className="font-medium text-[#4F46E5]">{organ.permissions.length} PERMISSIONS</span>
                                </CardFooter>
                            </Card>
                        ))}

                        {/* 6th Card: Part Tier Explanation */}
                        <Card interactive className="flex flex-col justify-between">
                            <div>
                                <CardBanner>
                                    <span>JOURNEY OF BELONGING · ENTRY TIER</span>
                                    <span>ROLE: PART</span>
                                </CardBanner>
                                <CardHeader>
                                    <div className="mb-1.5">
                                        <TierBadge tier="part" />
                                    </div>
                                    <CardTitle className="mt-1">Part (Cell Member)</CardTitle>
                                    <CardDescription>
                                        Every member begins in the <strong className="font-medium text-[#1E293B]">Part</strong> tier—experiencing authentic family care, participating in weekly 90-minute gatherings, and sharing honest anonymous feedback before stepping into a <strong className="font-medium text-[#1E293B]">Vital</strong> organ role.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3 font-mono text-xs">
                                        <div className="text-[10px] font-medium text-[#64748B] uppercase">ACTIVE PART MEMBERS IN FC R&D</div>
                                        <div className="mt-1 text-base font-semibold text-[#1E293B]">
                                            {shepherdRadar.part_count} Whitelisted Members
                                        </div>
                                    </div>
                                </CardContent>
                            </div>
                            <CardFooter>
                                <span>SPATIE ROLE: part</span>
                                <span className="font-medium text-[#475569]">FELLOWSHIP & GROWTH</span>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

                {/* ==================== 4. VIRTUAL FUNDS & LEDGER ANALYTICS ==================== */}
                <section id="virtual-funds" aria-labelledby="virtual-funds-heading" className="space-y-6">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-4 md:flex-row md:items-end">
                        <div>
                            <span className="font-mono text-xs font-medium tracking-wider text-[#64748B] uppercase">
                                🫀 VASCULAR SYSTEM (TREASURER) · SOFTDELETES + SPATIE ACTIVITYLOG
                            </span>
                            <h2 id="virtual-funds-heading" className="font-heading text-2xl font-semibold text-[#0F172A]">
                                Virtual Funds & Immutable Financial Ledger
                            </h2>
                        </div>
                        <div className="rounded-md border border-[#E2E8F0] bg-white px-4 py-2 font-mono text-xs font-semibold text-[#0F172A] shadow-2xs">
                            TOTAL CELL BALANCE: <span className="text-[#4F46E5]">{formatIdr(health.total_funds_balance_idr)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:col-span-2">
                            {funds.map((fund) => (
                                <Card key={fund.id} interactive className="flex flex-col justify-between">
                                    <div>
                                        <CardBanner>
                                            <span>{fund.slug}</span>
                                            <Wallet className="h-3.5 w-3.5 text-[#64748B]" />
                                        </CardBanner>
                                        <CardHeader>
                                            <CardTitle className="text-base">{fund.name}</CardTitle>
                                            <div className="mt-1.5 font-mono text-xl font-bold text-[#0F172A]">
                                                {formatIdr(fund.cached_balance)}
                                            </div>
                                            <CardDescription className="mt-2">
                                                {fund.description}
                                            </CardDescription>
                                        </CardHeader>
                                    </div>
                                    <CardFooter>
                                        <span>{fund.transactions_count} LEDGER TX</span>
                                        <span className="font-medium text-[#047857]">AUDITED</span>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Recharts Fund Distribution Card (Cohesive Slate & Muted Indigo Palette) */}
                        <Card className="flex flex-col justify-between">
                            <CardBanner>
                                <span>RECHARTS ANALYTICS VERIFICATION</span>
                                <Activity className="h-3.5 w-3.5 text-[#64748B]" />
                            </CardBanner>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Virtual Fund Allocation (IDR)</CardTitle>
                                <CardDescription>Cohesive Slate & Indigo balance distribution.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={funds} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                                            axisLine={{ stroke: '#E2E8F0' }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                                            tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                                            axisLine={{ stroke: '#E2E8F0' }}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            formatter={(value) => [formatIdr(Number(value ?? 0)), 'Balance']}
                                            contentStyle={{
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #E2E8F0',
                                                borderRadius: '6px',
                                                fontFamily: 'JetBrains Mono',
                                                fontSize: '12px',
                                                color: '#1E293B',
                                            }}
                                        />
                                        <Bar dataKey="cached_balance" radius={[4, 4, 0, 0]}>
                                            {funds.map((entry, idx) => (
                                                <RechartsCell
                                                    key={entry.slug}
                                                    fill={CHART_BAR_PALETTE[idx % CHART_BAR_PALETTE.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                            <CardFooter>
                                <span>HARD DELETE: BLOCKED</span>
                                <span>ACTIVITYLOG: ON</span>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

                {/* ==================== 5. 90-MINUTE RUN SHEET & ANONYMOUS FEEDBACK ==================== */}
                {featuredEvent && (
                    <section id="run-sheet" aria-labelledby="run-sheet-heading" className="space-y-6">
                        <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-4 md:flex-row md:items-end">
                            <div>
                                <span className="font-mono text-xs font-medium tracking-wider text-[#64748B] uppercase">
                                    🫁 LUNGS (EVENT TEAM) & ⚡ NERVOUS SYSTEM (IT TEAM)
                                </span>
                                <h2 id="run-sheet-heading" className="font-heading text-2xl font-semibold text-[#0F172A]">
                                    90-Minute Gathering Run Sheet & Anonymous PIN Channel
                                </h2>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Badge variant="indigo" className="px-3 py-1">
                                    <KeyRound className="h-3.5 w-3.5" />
                                    <span>FEEDBACK PIN: {featuredEvent.feedback_pin}</span>
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{featuredEvent.duration_minutes} MIN TOTAL</span>
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            {/* 90-Minute Run Sheet Table Card */}
                            <Card className="lg:col-span-2">
                                <CardBanner>
                                    <span>{featuredEvent.title}</span>
                                    <span>{formatEditorialDate(featuredEvent.scheduled_at)}</span>
                                </CardBanner>
                                <CardHeader>
                                    <CardTitle>Synchronized 90-Minute Flow (`event_rosters`)</CardTitle>
                                    <CardDescription>
                                        Location: {featuredEvent.location} · Status:{' '}
                                        <strong className="font-medium text-[#1E293B]">{featuredEvent.status_label}</strong>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto rounded-md border border-[#E2E8F0]">
                                        <table className="w-full border-collapse text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] font-mono text-[11px] font-medium text-[#64748B] uppercase">
                                                    <th className="px-4 py-3">#</th>
                                                    <th className="px-4 py-3">Segment & Flow</th>
                                                    <th className="px-4 py-3">Steward & Organ</th>
                                                    <th className="px-4 py-3 text-right">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#F1F5F9] bg-white">
                                                {featuredEvent.rosters.map((segment) => (
                                                    <tr key={segment.id} className="hover:bg-[#F8FAFC]/70">
                                                        <td className="px-4 py-3 font-mono text-xs font-medium text-[#64748B]">
                                                            0{segment.sort_order}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-heading font-semibold text-[#1E293B]">
                                                                {segment.segment_title}
                                                            </div>
                                                            <div className="font-mono text-xs text-[#64748B]">
                                                                {segment.role_name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col items-start gap-1">
                                                                <span className="font-medium text-[#1E293B]">
                                                                    {segment.servant_name ?? 'TBA'}
                                                                </span>
                                                                {segment.servant_organ && (
                                                                    <OrganIcon organ={segment.servant_organ} showTeam={false} />
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-[#475569]">
                                                            {formatDurationTag(segment.duration_minutes)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Technical Anonymity Guardrail Card */}
                            <Card className="flex flex-col justify-between">
                                <div>
                                    <CardBanner>
                                        <span>⚡ NERVOUS SYSTEM ANONYMITY GUARD</span>
                                        <Lock className="h-3.5 w-3.5 text-[#64748B]" />
                                    </CardBanner>
                                    <CardHeader>
                                        <CardTitle>100% Technical Anonymity</CardTitle>
                                        <CardDescription>
                                            The `feedbacks` table is architecturally stripped of `user_id`, `ip_address`, and `user_agent` columns so members can speak openly.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="rounded-md border border-[#C7D2FE] bg-[#EEF2FF]/60 p-4 text-center">
                                            <div className="font-mono text-[11px] font-medium text-[#4338CA] uppercase">
                                                ACTIVE EVENT PIN
                                            </div>
                                            <div className="mt-1 font-mono text-2xl font-bold tracking-widest text-[#1E293B]">
                                                {featuredEvent.feedback_pin}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 font-mono text-xs text-[#475569]">
                                            <span>Feedbacks Collected:</span>
                                            <span className="font-semibold text-[#1E293B]">{featuredEvent.feedbacks_count} entries</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 font-mono text-xs text-[#475569]">
                                            <span>Average Gathering Rating:</span>
                                            <span className="font-semibold text-[#047857]">
                                                {featuredEvent.average_rating ?? 5.0} / 5.0 ★
                                            </span>
                                        </div>
                                    </CardContent>
                                </div>
                                <CardFooter>
                                    <span>SCHEMA: feedbacks</span>
                                    <span className="font-medium text-[#047857]">NO PII COLUMNS</span>
                                </CardFooter>
                            </Card>
                        </div>
                    </section>
                )}

                {/* ==================== 6. CALM EDITORIAL DESIGN TOKENS SHOWCASE ==================== */}
                <section id="design-tokens" aria-labelledby="design-tokens-heading" className="space-y-6">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#E2E8F0] pb-4 md:flex-row md:items-end">
                        <div>
                            <span className="font-mono text-xs font-medium tracking-wider text-[#64748B] uppercase">
                                UPDATED SPECIFICATION · DOCS/DESIGN_SYSTEM.MD
                            </span>
                            <h2 id="design-tokens-heading" className="font-heading text-2xl font-semibold text-[#0F172A]">
                                Calm Editorial Neutral Palette, Typography & UI Primitives
                            </h2>
                        </div>
                        <Badge variant="outline">
                            <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" />
                            <span>LOW-GLARE RESTRAINED PALETTE</span>
                        </Badge>
                    </div>

                    {/* Swatches Grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {EDITORIAL_SWATCHES.map((swatch) => (
                            <div
                                key={swatch.name}
                                className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-[0_1px_2px_0_rgba(15,23,42,0.03)]"
                            >
                                <div
                                    className="flex h-16 items-end justify-between border-b border-[#E2E8F0] p-3 font-mono text-xs font-medium"
                                    style={{ backgroundColor: swatch.hex, color: swatch.textHex }}
                                >
                                    <span>{swatch.hex}</span>
                                </div>
                                <div className="p-3">
                                    <div className="font-heading text-sm font-semibold text-[#1E293B]">{swatch.name}</div>
                                    <div className="font-mono text-[11px] text-[#4F46E5]">{swatch.token}</div>
                                    <div className="mt-1 text-xs text-[#64748B]">{swatch.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Buttons, Badges & EmptyState Preview */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <Card>
                            <CardBanner>
                                <span>SHADCN/UI CUSTOMIZED PRIMITIVES</span>
                                <span>1PX SLATE BORDER + SOFT GEOMETRY</span>
                            </CardBanner>
                            <CardHeader>
                                <CardTitle>Interactive Buttons & Badges</CardTitle>
                                <CardDescription>
                                    Restrained deep slate (`#1E293B`) and muted indigo (`#4F46E5`) actions with `6px` (`rounded-md`) corners.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <Button variant="default">Primary Slate (#1E293B)</Button>
                                    <Button variant="indigo">Muted Indigo (#4F46E5)</Button>
                                    <Button variant="secondary">Secondary Neutral</Button>
                                    <Button variant="outline">Outline Border</Button>
                                    <Button variant="ghost">Ghost Action</Button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 pt-2">
                                    <Badge variant="default">DEFAULT SLATE</Badge>
                                    <Badge variant="indigo">VITAL INDIGO</Badge>
                                    <Badge variant="secondary">PART NEUTRAL</Badge>
                                    <Badge variant="success">VERIFIED</Badge>
                                    <Badge variant="warning">FOLLOW-UP</Badge>
                                    <Badge variant="outline">OUTLINE</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <EmptyState
                            tag="EMPTY STATE COMPONENT PREVIEW"
                            title="Ready for Phases 1–4 Feature Modules"
                            description="This reusable EmptyState primitive uses a soft 1px dashed slate border on a low-glare #F8FAFC surface—ready for Phase 1 Anonymous Feedback, Phase 2 Event Run Sheets, Phase 3 Vascular Ledger, and Phase 4 Shepherd Radar."
                            action={
                                <Link href="/login">
                                    <Button variant="outline" size="sm">
                                        Test Member Login Flow
                                    </Button>
                                </Link>
                            }
                        />
                    </div>
                </section>
            </main>

            <footer className="mt-16 border-t border-[#E2E8F0] bg-white py-6">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 font-mono text-xs text-[#64748B] sm:flex-row sm:px-6 lg:px-8">
                    <div>
                        <strong className="font-semibold text-[#1E293B]">FC R&D (Family Care — History Maker)</strong> · Phase 0 Architecture & Calm Editorial Design System
                    </div>
                    <div>
                        MySQL 8 (`{health.database_name}`) · Soft Multi-Tenancy (`cell_id`) · cPanel Ready
                    </div>
                </div>
            </footer>
        </div>
    );
}

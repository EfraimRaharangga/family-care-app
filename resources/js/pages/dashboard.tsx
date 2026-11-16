/**
 * Purpose: General Cell Overview Dashboard (`/dashboard`) for FC Leaders & Nervous System.
 * Domain Context: Provides a cell-wide operational overview across Events (`Lungs`), Members (`Part` / `Vital`),
 *                 Anonymous Feedback (`Nervous System`), and Virtual Funds (`Vascular System`), with:
 *                 1. Reorganized Active 4-Digit PIN Banner (aligned `Regenerate PIN` & `Buka Form` controls).
 *                 2. Quick Session & 24-Hour 4-Digit PIN Generator Modal.
 *                 3. User-filterable General Overview KPIs & Recharts Analytics (by Event Type & Timeframe).
 * Key Dependencies: @inertiajs/react, recharts, @/layouts/AuthenticatedLayout, @/components/ui/*
 */
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ExternalLink,
    Filter,
    KeyRound,
    MessageSquareHeart,
    RefreshCw,
    Star,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import * as React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardBanner,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { formatIdr } from '@/lib/formatters';
import type {
    ActivePinSession,
    CategoryBreakdownPoint,
    EventTypeOption,
    FeedbackTrendPoint,
    OverviewDashboardFilters,
    OverviewDashboardKpis,
} from '@/types';

export interface DashboardProps {
    cellName: string;
    activePinSession: ActivePinSession | null;
    overviewKpis: OverviewDashboardKpis;
    trendSeries: FeedbackTrendPoint[];
    categoryBreakdown: CategoryBreakdownPoint[];
    eventTypes: EventTypeOption[];
    filters: OverviewDashboardFilters;
    flashStatus?: string | null;
}

/**
 * General Overview Dashboard adhering strictly to `docs/DESIGN_SYSTEM.md`.
 */
export default function Dashboard({
    cellName = 'Family Care',
    activePinSession,
    overviewKpis,
    trendSeries = [],
    categoryBreakdown = [],
    eventTypes = [],
    filters,
    flashStatus,
}: DashboardProps): React.ReactElement {
    const [regeneratingPin, setRegeneratingPin] = React.useState<boolean>(false);

    const handleRegeneratePin = (eventId: number): void => {
        setRegeneratingPin(true);
        router.post(
            route('dashboard.events.regenerate-pin', eventId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setRegeneratingPin(false),
            },
        );
    };

    const applyOverviewFilters = (overrides: Partial<OverviewDashboardFilters>): void => {
        const next: OverviewDashboardFilters = {
            event_type: overrides.event_type ?? filters?.event_type ?? 'all',
            period: overrides.period ?? filters?.period ?? 'all',
        };

        router.get(
            route('dashboard'),
            {
                event_type: next.event_type === 'all' ? undefined : next.event_type,
                period: next.period === 'all' ? undefined : next.period,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters = filters?.event_type !== 'all' || filters?.period !== 'all';

    return (
        <AuthenticatedLayout cellName={cellName}>
            <Head title={`Dashboard Pages`} />

            <div className="space-y-8">
                {/* ========================================================================= */}
                {/* 1. PAGE HEADER                                                            */}
                {/* ========================================================================= */}
                <PageHeader
                    title={`Halaman Dashboard`}
                    description="Ringkasan operasional sel meliputi sesi acara, anggota aktif, metrik kepuasan feedback, dan saldo dana komsel."
                />

                {/* Flash Status Notification */}
                {flashStatus && (
                    <div className="flex items-center justify-between rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span className="font-medium">{flashStatus}</span>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 2. OVERVIEW FILTER BAR                                                    */}
                {/* ========================================================================= */}
                <Card>
                    <CardBanner>
                        <span className="inline-flex items-center gap-1.5">
                            <Filter className="h-3.5 w-3.5 text-[#64748B]" />
                            <span>FILTER METRIK & GRAFIK OVERVIEW</span>
                        </span>
                        <span>
                            {hasActiveFilters ? 'FILTER AKTIF' : 'MENAMPILKAN SEMUA DATA'}
                        </span>
                    </CardBanner>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 md:max-w-xl">
                                <div>
                                    <Label
                                        htmlFor="overview-event-type"
                                        className="mb-1 block font-mono text-[11px] text-[#64748B]"
                                    >
                                        JENIS ACARA
                                    </Label>
                                    <select
                                        id="overview-event-type"
                                        value={filters?.event_type ?? 'all'}
                                        onChange={(e) => applyOverviewFilters({ event_type: e.target.value })}
                                        className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#1E293B] focus:border-[#4F46E5] focus:outline-none"
                                    >
                                        <option value="all">Semua Jenis Acara</option>
                                        {eventTypes.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label
                                        htmlFor="overview-period"
                                        className="mb-1 block font-mono text-[11px] text-[#64748B]"
                                    >
                                        RENTANG WAKTU
                                    </Label>
                                    <select
                                        id="overview-period"
                                        value={filters?.period ?? 'all'}
                                        onChange={(e) => applyOverviewFilters({ period: e.target.value })}
                                        className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#1E293B] focus:border-[#4F46E5] focus:outline-none"
                                    >
                                        <option value="all">Semua Waktu</option>
                                        <option value="30d">30 Hari Terakhir</option>
                                        <option value="7d">7 Hari Terakhir</option>
                                    </select>
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get(route('dashboard'))}
                                >
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ========================================================================= */}
                {/* 4. GENERAL CELL KPI SUMMARY CARDS                                         */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardBanner>
                            <span>SESI ACARA</span>
                            <CalendarDays className="h-3.5 w-3.5 text-[#4F46E5]" />
                        </CardBanner>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-baseline gap-2">
                                <span className="font-mono text-3xl font-bold text-[#0F172A]">
                                    {overviewKpis.total_events}
                                </span>
                                <Badge variant="success">
                                    {overviewKpis.active_pin_events} PIN Aktif
                                </Badge>
                            </div>
                            <p className="mt-1 text-xs text-[#64748B]">
                                Total event sesuai filter aktif
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardBanner>
                            <span>ANGGOTA & PELAYAN</span>
                            <Users className="h-3.5 w-3.5 text-[#64748B]" />
                        </CardBanner>
                        <CardContent className="pt-4 pb-4">
                            <div className="font-mono text-3xl font-bold text-[#0F172A]">
                                {overviewKpis.total_members}
                            </div>
                            <p className="mt-1 font-mono text-xs text-[#64748B]">
                                {overviewKpis.vital_members} Vital · {overviewKpis.part_members} Part
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardBanner>
                            <span>KEPUASAN & FEEDBACK</span>
                            <Star className="h-3.5 w-3.5 text-[#4F46E5]" />
                        </CardBanner>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-mono text-3xl font-bold text-[#0F172A]">
                                    {overviewKpis.average_rating.toFixed(2)}
                                </span>
                                <span className="font-mono text-xs text-[#64748B]">
                                    / 5.00 ({overviewKpis.total_feedbacks} masukan)
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-[#64748B]">
                                {overviewKpis.unreviewed_count} belum dibahas · {overviewKpis.pastoral_care_count} pastoral
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardBanner>
                            <span>TOTAL DANA SEL</span>
                            <Wallet className="h-3.5 w-3.5 text-[#047857]" />
                        </CardBanner>
                        <CardContent className="pt-4 pb-4">
                            <div className="font-mono text-2xl font-bold text-[#0F172A]">
                                {formatIdr(overviewKpis.total_funds_balance)}
                            </div>
                            <p className="mt-1 text-xs text-[#64748B]">
                                Akumulasi kas rutin, diakonia & acara
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ========================================================================= */}
                {/* 5. FILTERABLE RECHARTS ANALYTICS                                          */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Chart 1: Session Rating & Feedback Volume Trend */}
                    <Card>
                        <CardBanner>
                            <span className="inline-flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5 text-[#4F46E5]" />
                                <span>TREN KEPUASAN & PARTISIPASI SESI</span>
                            </span>
                            <span>8 SESI TERAKHIR</span>
                        </CardBanner>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Rating & Jumlah Masukan per Sesi</CardTitle>
                            <CardDescription className="text-xs">
                                Batang Slate (#1E293B) menunjukkan rata-rata rating; garis Indigo (#4F46E5) menunjukkan jumlah respons.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {trendSeries.length === 0 ? (
                                <div className="py-12 text-center font-mono text-xs text-[#64748B]">
                                    Belum ada data sesi untuk filter yang dipilih.
                                </div>
                            ) : (
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={trendSeries}
                                            margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#E2E8F0"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="event_date"
                                                tick={{ fill: '#64748B', fontSize: 11 }}
                                                axisLine={{ stroke: '#E2E8F0' }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                domain={[0, 5]}
                                                ticks={[0, 1, 2, 3, 4, 5]}
                                                tick={{ fill: '#64748B', fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#FFFFFF',
                                                    borderColor: '#E2E8F0',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    color: '#1E293B',
                                                }}
                                                formatter={(value, name) => {
                                                    if (name === 'average_rating') {
                                                        return [`${value ?? 0} / 5.0`, 'Rata-Rata Rating'];
                                                    }
                                                    return [`${value ?? 0} respons`, 'Jumlah Feedback'];
                                                }}
                                                labelFormatter={(_label, payload) => {
                                                    const item = payload?.[0]?.payload as
                                                        | FeedbackTrendPoint
                                                        | undefined;
                                                    return item ? `${item.title} (${item.type_label})` : '';
                                                }}
                                            />
                                            <Bar
                                                dataKey="average_rating"
                                                fill="#1E293B"
                                                radius={[6, 6, 0, 0]}
                                                barSize={34}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="feedbacks_count"
                                                stroke="#4F46E5"
                                                strokeWidth={2}
                                                dot={{ r: 4, fill: '#4F46E5' }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chart 2: Feedback Category Breakdown */}
                    <Card>
                        <CardBanner>
                            <span className="inline-flex items-center gap-1.5">
                                <MessageSquareHeart className="h-3.5 w-3.5 text-[#64748B]" />
                                <span>DISTRIBUSI KATEGORI MASUKAN</span>
                            </span>
                            <span>{overviewKpis.total_feedbacks} TOTAL</span>
                        </CardBanner>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Volume Feedback per Kategori</CardTitle>
                            <CardDescription className="text-xs">
                                Sebaran masukan anggota berdasarkan kategori Materi, Hospitality, Acara &amp; Games, dan Lainnya.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {categoryBreakdown.every((c) => c.count === 0) ? (
                                <div className="py-12 text-center font-mono text-xs text-[#64748B]">
                                    Belum ada feedback pada rentang filter ini.
                                </div>
                            ) : (
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={categoryBreakdown}
                                            margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#E2E8F0"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={{ fill: '#64748B', fontSize: 11 }}
                                                axisLine={{ stroke: '#E2E8F0' }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fill: '#64748B', fontSize: 11 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#FFFFFF',
                                                    borderColor: '#E2E8F0',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    color: '#1E293B',
                                                }}
                                                formatter={(value) => [`${value ?? 0} masukan`, 'Jumlah']}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="#4F46E5"
                                                radius={[6, 6, 0, 0]}
                                                barSize={40}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

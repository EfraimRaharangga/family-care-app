/**
 * Purpose: Phase 1 Authenticated Leader & Nervous System Analytics Dashboard (`/dashboard`).
 * Domain Context: Stewarded by the Nervous System (IT Team) and Brain (Leader).
 *                 Delivers:
 *                 1. Quick Session & 24-Hour 4-Digit PIN Generator Modal ("Buat Sesi Acara & Generate PIN").
 *                 2. Active PIN Banner with 1-Click Copy for WhatsApp & Regenerate PIN action.
 *                 3. KPI Summary Cards, Recharts Satisfaction Trend Chart, Multi-Filter Bar,
 *                    and Feedback Triage Cards with 1-click `Belum Dibahas` <-> `Sudah Dievaluasi` toggle.
 * Key Dependencies: @inertiajs/react, recharts, @/layouts/AuthenticatedLayout, @/components/ui/*
 */
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CalendarPlus,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    Filter,
    HeartHandshake,
    KeyRound,
    MessageSquareHeart,
    RefreshCw,
    Search,
    Sparkles,
    Star,
    TrendingUp,
} from 'lucide-react';
import * as React from 'react';
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import InputError from '@/components/input-error';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardBanner,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import type {
    ActivePinSession,
    EventTypeOption,
    EventTypeValue,
    FeedbackCategoryOption,
    FeedbackDashboardFilters,
    FeedbackDashboardKpis,
    FeedbackEventOption,
    FeedbackItem,
    FeedbackTrendPoint,
} from '@/types';

export interface DashboardProps {
    cellName: string;
    activePinSession: ActivePinSession | null;
    kpis: FeedbackDashboardKpis;
    trendSeries: FeedbackTrendPoint[];
    events: FeedbackEventOption[];
    eventTypes: EventTypeOption[];
    categories: FeedbackCategoryOption[];
    feedbacks: FeedbackItem[];
    filters: FeedbackDashboardFilters;
    flashStatus?: string | null;
}

type QuickEventForm = {
    title: string;
    type: EventTypeValue;
    event_date: string;
    location: string;
};

/**
 * Nervous System Analytics & Feedback Triage Dashboard adhering to `docs/DESIGN_SYSTEM.md`.
 */
export default function Dashboard({
    cellName = 'FC R&D',
    activePinSession,
    kpis,
    trendSeries = [],
    events = [],
    eventTypes = [],
    categories = [],
    feedbacks = [],
    filters,
    flashStatus,
}: DashboardProps): React.ReactElement {
    // =========================================================================
    // 1. QUICK SESSION & 4-DIGIT PIN MODAL STATE
    // =========================================================================
    const [isQuickModalOpen, setIsQuickModalOpen] = React.useState<boolean>(false);
    const [copiedWhatsApp, setCopiedWhatsApp] = React.useState<boolean>(false);
    const [togglingId, setTogglingId] = React.useState<number | null>(null);
    const [regeneratingPin, setRegeneratingPin] = React.useState<boolean>(false);

    const todayIsoDate = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

    const quickEventForm = useForm<Required<QuickEventForm>>({
        title: '',
        type: eventTypes[0]?.value ?? 'regular',
        event_date: todayIsoDate,
        location: 'Basecamp History Maker — Ruang R&D Lt. 2',
    });

    const handleCreateQuickSession = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        quickEventForm.post(route('dashboard.events.quick-store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsQuickModalOpen(false);
                quickEventForm.reset('title');
            },
        });
    };

    // =========================================================================
    // 2. 1-CLICK WHATSAPP COPY & PIN REGENERATION HANDLERS
    // =========================================================================
    const handleCopyWhatsAppMessage = async (): Promise<void> => {
        if (!activePinSession) {
            return;
        }

        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const directUrl = `${origin}/feedback?pin=${activePinSession.feedback_pin}`;
        const whatsappText = [
            `🙌 *Suara Anggota — ${cellName} (History Maker)*`,
            `Sesi: *${activePinSession.title}* (${activePinSession.type_label})`,
            ``,
            `Yuk bagikan kesan, evaluasi, atau pokok doa secara *100% Anonim* (tanpa login & tanpa jejak IP):`,
            `🔗 Link Langsung: ${directUrl}`,
            `🔑 Kode PIN 4-Digit: *${activePinSession.feedback_pin}*`,
            `⏳ Berlaku 24 jam hingga ${activePinSession.pin_expires_formatted ?? 'besok'}. Terima kasih!`,
        ].join('\n');

        try {
            await navigator.clipboard.writeText(whatsappText);
            setCopiedWhatsApp(true);
            window.setTimeout(() => setCopiedWhatsApp(false), 2500);
        } catch {
            // Fallback for older webviews
            setCopiedWhatsApp(true);
            window.setTimeout(() => setCopiedWhatsApp(false), 2500);
        }
    };

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

    // =========================================================================
    // 3. FILTER & TRIAGE HANDLERS
    // =========================================================================
    const [searchInput, setSearchInput] = React.useState<string>(filters?.search ?? '');

    const applyFilters = (overrides: Partial<FeedbackDashboardFilters>): void => {
        const nextFilters: FeedbackDashboardFilters = {
            event_id: overrides.event_id ?? filters?.event_id ?? 'all',
            category: overrides.category ?? filters?.category ?? 'all',
            review_status: overrides.review_status ?? filters?.review_status ?? 'all',
            pastoral_only:
                overrides.pastoral_only !== undefined
                    ? overrides.pastoral_only
                    : (filters?.pastoral_only ?? false),
            search: overrides.search !== undefined ? overrides.search : searchInput,
        };

        router.get(
            route('dashboard'),
            {
                event_id: nextFilters.event_id === 'all' ? undefined : nextFilters.event_id,
                category: nextFilters.category === 'all' ? undefined : nextFilters.category,
                review_status:
                    nextFilters.review_status === 'all' ? undefined : nextFilters.review_status,
                pastoral_only: nextFilters.pastoral_only ? '1' : undefined,
                search: nextFilters.search.trim() !== '' ? nextFilters.search.trim() : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleToggleReview = (feedbackId: number): void => {
        setTogglingId(feedbackId);
        router.patch(
            route('dashboard.feedbacks.toggle-review', feedbackId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            },
        );
    };

    return (
        <AuthenticatedLayout cellName={cellName}>
            <Head title={`Dashboard & Analitik Feedback — ${cellName}`} />

            <div className="space-y-8">
                {/* ========================================================================= */}
                {/* 1. PAGE HEADER & QUICK SESSION GENERATOR MODAL                            */}
                {/* ========================================================================= */}
                <PageHeader
                    categoryTag="PHASE 1 · NERVOUS SYSTEM ANALYTICS"
                    title="Evaluasi Anonim & Radar Suara Anggota"
                    description="Kelola PIN 4-digit harian, pantau tren kepuasan sesi komsel, dan tindak lanjuti permohonan Pastoral Care dengan privasi penuh."
                    actions={
                        <Dialog open={isQuickModalOpen} onOpenChange={setIsQuickModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="default">
                                    <CalendarPlus className="h-4 w-4" />
                                    <span>Buat Sesi Acara & Generate PIN</span>
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="border-[#E2E8F0] bg-white sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="font-heading text-lg font-bold text-[#0F172A]">
                                        Buat Sesi Acara & Generate PIN 4-Digit
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-[#64748B]">
                                        Buat sesi komsel baru dan terbitkan kode PIN 4 angka yang aktif selama 24 jam
                                        untuk form feedback anonim anggota.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleCreateQuickSession} className="space-y-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="quick-title">Judul Acara</Label>
                                        <Input
                                            id="quick-title"
                                            type="text"
                                            required
                                            value={quickEventForm.data.title}
                                            onChange={(e) => quickEventForm.setData('title', e.target.value)}
                                            placeholder="Contoh: FC R&D Gathering #16: Heart of Stewardship"
                                        />
                                        <InputError message={quickEventForm.errors.title} />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="quick-type">Jenis Acara</Label>
                                            <select
                                                id="quick-type"
                                                value={quickEventForm.data.type}
                                                onChange={(e) =>
                                                    quickEventForm.setData('type', e.target.value as EventTypeValue)
                                                }
                                                className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-1 text-sm text-[#1E293B] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 focus:outline-none"
                                            >
                                                {eventTypes.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={quickEventForm.errors.type} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="quick-date">Tanggal Acara</Label>
                                            <Input
                                                id="quick-date"
                                                type="date"
                                                required
                                                value={quickEventForm.data.event_date}
                                                onChange={(e) => quickEventForm.setData('event_date', e.target.value)}
                                            />
                                            <InputError message={quickEventForm.errors.event_date} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="quick-location">Lokasi (Opsional)</Label>
                                        <Input
                                            id="quick-location"
                                            type="text"
                                            value={quickEventForm.data.location}
                                            onChange={(e) => quickEventForm.setData('location', e.target.value)}
                                            placeholder="Basecamp History Maker — Ruang R&D Lt. 2"
                                        />
                                        <InputError message={quickEventForm.errors.location} />
                                    </div>

                                    <DialogFooter className="pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsQuickModalOpen(false)}
                                        >
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={quickEventForm.processing}>
                                            <KeyRound className="h-4 w-4" />
                                            <span>
                                                {quickEventForm.processing
                                                    ? 'Membuat PIN...'
                                                    : 'Simpan & Generate PIN 24 Jam'}
                                            </span>
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    }
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
                {/* 2. ACTIVE 4-DIGIT PIN BANNER & 1-CLICK WHATSAPP COPY                      */}
                {/* ========================================================================= */}
                {activePinSession && (
                    <Card>
                        <CardBanner>
                            <span className="inline-flex items-center gap-1.5">
                                <KeyRound className="h-3.5 w-3.5 text-[#4F46E5]" />
                                <span>ACTIVE DAILY FEEDBACK PIN GATE (24-HOUR WINDOW)</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-[#64748B]" />
                                <span>
                                    {activePinSession.is_pin_active
                                        ? `Aktif · Berakhir ${activePinSession.pin_expires_human ?? 'dalam 24 jam'}`
                                        : 'PIN Kadaluarsa — Silakan Regenerate PIN'}
                                </span>
                            </span>
                        </CardBanner>

                        <CardContent className="pt-5 pb-5">
                            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="indigo">{activePinSession.type_label}</Badge>
                                        <Badge
                                            variant={activePinSession.is_pin_active ? 'success' : 'warning'}
                                        >
                                            {activePinSession.is_pin_active ? 'PIN AKTIF (24 JAM)' : 'PIN EXPIRED'}
                                        </Badge>
                                        <span className="font-mono text-xs text-[#64748B]">
                                            {activePinSession.event_date_formatted}
                                        </span>
                                    </div>
                                    <h2 className="font-heading text-xl font-bold text-[#0F172A]">
                                        {activePinSession.title}
                                    </h2>
                                    <p className="text-xs text-[#64748B]">
                                        Bagikan kode PIN 4-digit ini atau salin pesan WhatsApp ke grup komsel di akhir
                                        acara. Berlaku hingga{' '}
                                        <span className="font-mono font-medium text-[#334155]">
                                            {activePinSession.pin_expires_formatted ?? '-'}
                                        </span>
                                        .
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {/* 4-Digit Monospace PIN Display Box */}
                                    <div className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
                                        <div>
                                            <div className="font-mono text-[10px] font-medium text-[#64748B] uppercase">
                                                4-DIGIT PIN
                                            </div>
                                            <div className="font-mono text-2xl font-bold tracking-[0.25em] text-[#0F172A]">
                                                {activePinSession.feedback_pin}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 1-Click Copy for WhatsApp */}
                                    <Button
                                        type="button"
                                        variant="default"
                                        onClick={handleCopyWhatsAppMessage}
                                    >
                                        {copiedWhatsApp ? (
                                            <>
                                                <Check className="h-4 w-4 text-[#A7F3D0]" />
                                                <span>Tersalin untuk WhatsApp!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4" />
                                                <span>Copy untuk WhatsApp</span>
                                            </>
                                        )}
                                    </Button>

                                    {/* Regenerate 24h PIN */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={regeneratingPin}
                                        onClick={() => handleRegeneratePin(activePinSession.id)}
                                    >
                                        <RefreshCw
                                            className={`h-4 w-4 ${regeneratingPin ? 'animate-spin' : ''}`}
                                        />
                                        <span>Regenerate PIN</span>
                                    </Button>

                                    {/* Preview Guest Form with PIN */}
                                    <Link
                                        href={route('feedback.index', {
                                            pin: activePinSession.feedback_pin,
                                        })}
                                    >
                                        <Button type="button" variant="secondary">
                                            <ExternalLink className="h-4 w-4" />
                                            <span>Buka Form</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ========================================================================= */}
                {/* 3. KPI SUMMARY CARDS                                                      */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardBanner>
                            <span>TOTAL MASUKAN</span>
                            <MessageSquareHeart className="h-3.5 w-3.5 text-[#64748B]" />
                        </CardBanner>
                        <CardContent className="pt-4 pb-4">
                            <div className="font-mono text-3xl font-bold text-[#0F172A]">
                                {kpis.total_feedbacks}
                            </div>
                            <p className="mt-1 text-xs text-[#64748B]">
                                Respons anonim terkumpul lintas sesi
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardBanner>
                            <span>RATA-RATA KEPUASAN</span>
                            <Star className="h-3.5 w-3.5 text-[#4F46E5]" />
                        </CardBanner>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-mono text-3xl font-bold text-[#0F172A]">
                                    {kpis.average_rating.toFixed(2)}
                                </span>
                                <span className="font-mono text-xs text-[#64748B]">/ 5.00</span>
                            </div>
                            <p className="mt-1 text-xs text-[#64748B]">
                                Skor kepuasan anggota komsel {cellName}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardBanner>
                            <span>BELUM DIBAHAS</span>
                            <Sparkles className="h-3.5 w-3.5 text-[#B45309]" />
                        </CardBanner>
                        <CardContent className="pt-4 pb-4">
                            <div className="font-mono text-3xl font-bold text-[#0F172A]">
                                {kpis.unreviewed_count}
                            </div>
                            <p className="mt-1 text-xs text-[#64748B]">
                                Menunggu evaluasi pengurus (Belum Dibahas)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardBanner>
                            <span>BUTUH PASTORAL CARE</span>
                            <HeartHandshake className="h-3.5 w-3.5 text-[#4F46E5]" />
                        </CardBanner>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-baseline gap-2">
                                <span className="font-mono text-3xl font-bold text-[#0F172A]">
                                    {kpis.pastoral_care_count}
                                </span>
                                {kpis.unreviewed_pastoral_count > 0 && (
                                    <Badge variant="warning">
                                        {kpis.unreviewed_pastoral_count} Belum Dibahas
                                    </Badge>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-[#64748B]">
                                Permohonan doa & sapaan personal anggota
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ========================================================================= */}
                {/* 4. RECHARTS SATISFACTION TREND ACROSS RECENT SESSIONS                     */}
                {/* ========================================================================= */}
                <Card>
                    <CardBanner>
                        <span className="inline-flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-[#4F46E5]" />
                            <span>TREN KEPUASAN ANGGOTA PER SESI ACARA</span>
                        </span>
                        <span>SKALA 1.0 – 5.0</span>
                    </CardBanner>

                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Grafik Rata-Rata Kepuasan & Partisipasi Feedback
                        </CardTitle>
                        <CardDescription>
                            Membandingkan skor rata-rata kepuasan (`#1E293B` Slate Bar) dan jumlah respons
                            masuk (`#4F46E5` Indigo Line) di setiap sesi acara.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-2">
                        {trendSeries.length === 0 ? (
                            <div className="py-8 text-center font-mono text-xs text-[#64748B]">
                                Belum ada data sesi acara untuk ditampilkan pada grafik.
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
                                            tick={{ fill: '#64748B', fontSize: 12 }}
                                            axisLine={{ stroke: '#E2E8F0' }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 5]}
                                            ticks={[0, 1, 2, 3, 4, 5]}
                                            tick={{ fill: '#64748B', fontSize: 12 }}
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
                                                return item
                                                    ? `${item.title} (${item.type_label})`
                                                    : '';
                                            }}
                                        />
                                        <Bar
                                            dataKey="average_rating"
                                            fill="#1E293B"
                                            radius={[6, 6, 0, 0]}
                                            barSize={38}
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

                {/* ========================================================================= */}
                {/* 5. FILTERING, SEARCH & PASTORAL CARE QUICK TOGGLE                         */}
                {/* ========================================================================= */}
                <Card>
                    <CardBanner>
                        <span className="inline-flex items-center gap-1.5">
                            <Filter className="h-3.5 w-3.5 text-[#64748B]" />
                            <span>FILTER & TRIAGE FEEDBACK ANGGOTA</span>
                        </span>
                        <span>MENAMPILKAN {feedbacks.length} KARTU FEEDBACK</span>
                    </CardBanner>

                    <CardContent className="pt-4 pb-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                            {/* Filter by Event Session */}
                            <div className="md:col-span-3">
                                <Label htmlFor="filter-event" className="mb-1 block font-mono text-[11px] text-[#64748B]">
                                    SESI ACARA
                                </Label>
                                <select
                                    id="filter-event"
                                    value={filters?.event_id ?? 'all'}
                                    onChange={(e) => applyFilters({ event_id: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#1E293B] focus:border-[#4F46E5] focus:outline-none"
                                >
                                    <option value="all">Semua Sesi Acara ({events.length})</option>
                                    {events.map((ev) => (
                                        <option key={ev.id} value={String(ev.id)}>
                                            {ev.event_date_formatted} — {ev.title} ({ev.feedbacks_count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter by Category */}
                            <div className="md:col-span-3">
                                <Label htmlFor="filter-category" className="mb-1 block font-mono text-[11px] text-[#64748B]">
                                    KATEGORI FEEDBACK
                                </Label>
                                <select
                                    id="filter-category"
                                    value={filters?.category ?? 'all'}
                                    onChange={(e) => applyFilters({ category: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#1E293B] focus:border-[#4F46E5] focus:outline-none"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter by Review Status */}
                            <div className="md:col-span-2">
                                <Label htmlFor="filter-status" className="mb-1 block font-mono text-[11px] text-[#64748B]">
                                    STATUS EVALUASI
                                </Label>
                                <select
                                    id="filter-status"
                                    value={filters?.review_status ?? 'all'}
                                    onChange={(e) => applyFilters({ review_status: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#1E293B] focus:border-[#4F46E5] focus:outline-none"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="unreviewed">Belum Dibahas</option>
                                    <option value="reviewed">Sudah Dievaluasi</option>
                                </select>
                            </div>

                            {/* Search Keyword */}
                            <div className="md:col-span-4">
                                <Label htmlFor="filter-search" className="mb-1 block font-mono text-[11px] text-[#64748B]">
                                    CARI ISI PESAN / NAMA KONTAK
                                </Label>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        applyFilters({ search: searchInput });
                                    }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        id="filter-search"
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Cari kata kunci..."
                                        className="h-9 text-xs"
                                    />
                                    <Button type="submit" variant="outline" size="sm" className="h-9">
                                        <Search className="h-3.5 w-3.5" />
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Quick Toggle Pill for Pastoral Care & Reset */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[#E2E8F0] pt-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        applyFilters({ pastoral_only: !filters?.pastoral_only })
                                    }
                                    className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs font-medium transition-colors ${
                                        filters?.pastoral_only
                                            ? 'border-[#4F46E5] bg-[#EEF2FF] text-[#4338CA]'
                                            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#CBD5E1]'
                                    }`}
                                >
                                    <HeartHandshake className="h-3.5 w-3.5" />
                                    <span>Hanya yang Butuh Pastoral Care ({kpis.pastoral_care_count})</span>
                                </button>
                            </div>

                            {(filters?.event_id !== 'all' ||
                                filters?.category !== 'all' ||
                                filters?.review_status !== 'all' ||
                                filters?.pastoral_only ||
                                (filters?.search ?? '') !== '') && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchInput('');
                                        router.get(route('dashboard'));
                                    }}
                                >
                                    Reset Semua Filter
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ========================================================================= */}
                {/* 6. FEEDBACK TRIAGE CARDS & 1-CLICK REVIEW STATUS TOGGLE                   */}
                {/* ========================================================================= */}
                {feedbacks.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Feedback yang Sesuai Filter"
                        description="Coba ubah filter sesi acara atau bagikan kode PIN 4-digit ke grup WhatsApp agar anggota dapat mengirimkan masukan anonim."
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {feedbacks.map((item) => (
                            <Card
                                key={item.id}
                                className={
                                    item.needs_pastoral_care
                                        ? 'border-[#C7D2FE] ring-1 ring-[#EEF2FF]'
                                        : ''
                                }
                            >
                                <CardBanner>
                                    <span className="truncate">
                                        {item.event_date} · {item.event_title}
                                    </span>
                                    <span className="shrink-0">{item.created_at_human}</span>
                                </CardBanner>

                                <CardContent className="space-y-3.5 pt-4 pb-4">
                                    {/* Badges Row: Rating, Category, Pastoral Care Flag, Review Status */}
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 font-mono text-xs font-semibold text-[#0F172A]">
                                                <Star className="h-3.5 w-3.5 fill-[#1E293B] text-[#1E293B]" />
                                                <span>{item.rating}/5</span>
                                            </span>
                                            <Badge variant="outline">{item.category_label}</Badge>
                                            {item.needs_pastoral_care && (
                                                <Badge variant="indigo">
                                                    <HeartHandshake className="h-3 w-3" />
                                                    <span>Butuh Pastoral Care</span>
                                                </Badge>
                                            )}
                                        </div>

                                        <Badge
                                            variant={item.is_reviewed ? 'success' : 'warning'}
                                        >
                                            {item.is_reviewed ? 'Sudah Dievaluasi' : 'Belum Dibahas'}
                                        </Badge>
                                    </div>

                                    {/* Feedback Message */}
                                    <p className="text-sm leading-relaxed text-[#1E293B]">
                                        {item.message}
                                    </p>

                                    {/* Conditional Pastoral Care Contact Details Box */}
                                    {item.needs_pastoral_care && (
                                        <div className="rounded-md border border-[#C7D2FE] bg-[#EEF2FF]/70 p-3">
                                            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#4338CA] uppercase">
                                                <HeartHandshake className="h-3.5 w-3.5" />
                                                <span>Permohonan Doa / Sapaan Personal</span>
                                            </div>
                                            <div className="mt-1.5 grid grid-cols-1 gap-1 text-xs text-[#1E293B] sm:grid-cols-2">
                                                <div>
                                                    <span className="text-[#64748B]">Nama Panggilan: </span>
                                                    <span className="font-semibold">
                                                        {item.contact_name || 'Tidak disebutkan (Anonim)'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[#64748B]">Kontak WA/IG: </span>
                                                    <span className="font-mono font-semibold">
                                                        {item.contact_info || 'Tidak disertakan'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="justify-between">
                                    <span>100% ANONYMOUS ENTRY #{item.id}</span>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant={item.is_reviewed ? 'outline' : 'default'}
                                        disabled={togglingId === item.id}
                                        onClick={() => handleToggleReview(item.id)}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>
                                            {item.is_reviewed
                                                ? 'Tandai Belum Dibahas'
                                                : 'Tandai Sudah Dievaluasi'}
                                        </span>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

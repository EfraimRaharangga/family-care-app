/**
 * Purpose: Dedicated Feedback Data Page (`/feedback-data`) for FC Leaders & Nervous System.
 * Domain Context: Displays anonymous member feedback with multi-dimensional filtering (event,
 *                 category, evaluation status, pastoral care toggle, keyword search), 1-click
 *                 evaluation status toggle, and a Card/Table view mode toggle.
 * Key Dependencies: @inertiajs/react, @/layouts/AuthenticatedLayout, @/components/shared/ViewModeToggle
 */
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Filter,
    HeartHandshake,
    Search,
    Star,
} from 'lucide-react';
import * as React from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { type ViewMode, ViewModeToggle } from '@/components/shared/ViewModeToggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardBanner,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import type {
    FeedbackCategoryOption,
    FeedbackDashboardFilters,
    FeedbackDashboardKpis,
    FeedbackEventOption,
    FeedbackItem,
} from '@/types';

export interface FeedbackDataPageProps {
    cellName: string;
    kpis: FeedbackDashboardKpis;
    events: FeedbackEventOption[];
    categories: FeedbackCategoryOption[];
    feedbacks: FeedbackItem[];
    filters: FeedbackDashboardFilters;
    flashStatus?: string | null;
}

/**
 * Feedback Data Page with filters and Card / Table view toggle adhering to `docs/DESIGN_SYSTEM.md`.
 */
export default function FeedbackDataIndex({
    cellName = 'Family Care',
    kpis,
    events = [],
    categories = [],
    feedbacks = [],
    filters,
    flashStatus,
}: FeedbackDataPageProps): React.ReactElement {
    const [viewMode, setViewMode] = React.useState<ViewMode>('cards');
    const [togglingId, setTogglingId] = React.useState<number | null>(null);
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
            route('feedback.data'),
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

    const hasActiveFilters =
        filters?.event_id !== 'all' ||
        filters?.category !== 'all' ||
        filters?.review_status !== 'all' ||
        filters?.pastoral_only ||
        (filters?.search ?? '') !== '';

    return (
        <AuthenticatedLayout cellName={cellName}>
            <Head title={`Data Feedback — ${cellName}`} />

            <div className="space-y-6">
                <PageHeader
                    title="Data Feedback Anggota"
                    description="Tinjau, filter, dan evaluasi seluruh masukan anonim anggota dalam tampilan kartu atau tabel."
                    actions={<ViewModeToggle value={viewMode} onChange={setViewMode} />}
                />

                {flashStatus && (
                    <div className="flex items-center justify-between rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span className="font-medium">{flashStatus}</span>
                        </div>
                    </div>
                )}

                {/* Filter Bar */}
                <Card>
                    <CardBanner>
                        <span className="inline-flex items-center gap-1.5">
                            <Filter className="h-3.5 w-3.5 text-[#64748B]" />
                            <span>FILTER & TRIAGE FEEDBACK ANGGOTA</span>
                        </span>
                        <span>MENAMPILKAN {feedbacks.length} DATA FEEDBACK</span>
                    </CardBanner>

                    <CardContent className="pt-4 pb-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                            <div className="md:col-span-3">
                                <Label
                                    htmlFor="filter-event"
                                    className="mb-1 block font-mono text-[11px] text-[#64748B]"
                                >
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

                            <div className="md:col-span-3">
                                <Label
                                    htmlFor="filter-category"
                                    className="mb-1 block font-mono text-[11px] text-[#64748B]"
                                >
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

                            <div className="md:col-span-2">
                                <Label
                                    htmlFor="filter-status"
                                    className="mb-1 block font-mono text-[11px] text-[#64748B]"
                                >
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

                            <div className="md:col-span-4">
                                <Label
                                    htmlFor="filter-search"
                                    className="mb-1 block font-mono text-[11px] text-[#64748B]"
                                >
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

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[#E2E8F0] pt-3">
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

                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchInput('');
                                        router.get(route('feedback.data'));
                                    }}
                                >
                                    Reset Semua Filter
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Data View: Cards or Table */}
                {feedbacks.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Feedback yang Sesuai Filter"
                        description="Coba ubah filter sesi acara atau bagikan kode PIN 4-digit ke grup WhatsApp agar anggota dapat mengirimkan masukan anonim."
                    />
                ) : viewMode === 'cards' ? (
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

                                        <Badge variant={item.is_reviewed ? 'success' : 'warning'}>
                                            {item.is_reviewed ? 'Sudah Dievaluasi' : 'Belum Dibahas'}
                                        </Badge>
                                    </div>

                                    <p className="text-sm leading-relaxed text-[#1E293B]">
                                        {item.message}
                                    </p>

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
                ) : (
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9] font-mono text-[11px] font-semibold text-[#475569] uppercase">
                                        <th className="px-4 py-3">Sesi Acara</th>
                                        <th className="px-4 py-3">Rating & Kategori</th>
                                        <th className="px-4 py-3">Pesan Anggota</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                                    {feedbacks.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="transition-colors hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3.5 align-top">
                                                <div className="font-medium text-[#0F172A]">
                                                    {item.event_title}
                                                </div>
                                                <div className="mt-0.5 font-mono text-[11px] text-[#64748B]">
                                                    {item.event_date} · {item.created_at_human}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 align-top">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="inline-flex items-center gap-1 rounded border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#0F172A]">
                                                        <Star className="h-3 w-3 fill-[#1E293B] text-[#1E293B]" />
                                                        {item.rating}/5
                                                    </span>
                                                    <Badge variant="outline">{item.category_label}</Badge>
                                                </div>
                                            </td>
                                            <td className="max-w-md px-4 py-3.5 align-top">
                                                <p className="text-xs leading-relaxed text-[#1E293B]">
                                                    {item.message}
                                                </p>
                                                {item.needs_pastoral_care && (
                                                    <div className="mt-1.5 inline-flex flex-wrap items-center gap-1.5 rounded border border-[#C7D2FE] bg-[#EEF2FF]/70 px-2 py-1 text-[11px] text-[#4338CA]">
                                                        <HeartHandshake className="h-3 w-3 shrink-0" />
                                                        <span className="font-semibold">
                                                            {item.contact_name || 'Anonim'}
                                                        </span>
                                                        {item.contact_info && (
                                                            <span className="font-mono text-[#334155]">
                                                                ({item.contact_info})
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 align-top">
                                                <Badge variant={item.is_reviewed ? 'success' : 'warning'}>
                                                    {item.is_reviewed ? 'Sudah Dievaluasi' : 'Belum Dibahas'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3.5 text-right align-top">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={item.is_reviewed ? 'outline' : 'default'}
                                                    disabled={togglingId === item.id}
                                                    onClick={() => handleToggleReview(item.id)}
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span>
                                                        {item.is_reviewed ? 'Belum Dibahas' : 'Evaluasi'}
                                                    </span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

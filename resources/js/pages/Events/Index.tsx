/**
 * Purpose: Dedicated Event List Page (`/events`) for FC Leaders & Lungs/Nervous System.
 * Domain Context: Provides the "Buat Sesi Acara" modal trigger (moved from Dashboard) to create
 *                 a new event with a 24h 4-digit PIN, followed by the full event list with
 *                 filters (type, PIN status, search), Card/Table view toggle, and 3-action
 *                 controls (`Regenerate PIN`, `Expire PIN`, and `Buka Form`).
 * Key Dependencies: @inertiajs/react, @/layouts/AuthenticatedLayout, @/components/shared/ViewModeToggle
 */
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Ban,
    CalendarPlus,
    CheckCircle2,
    ExternalLink,
    Filter,
    KeyRound,
    MapPin,
    MessageSquareHeart,
    RefreshCw,
    Search,
    Star,
} from 'lucide-react';
import * as React from 'react';

import {
    type QuickEventFormData,
    QuickEventFormFields,
} from '@/components/events/QuickEventFormFields';
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
import type { EventListFilters, EventListItem, EventTypeOption } from '@/types';

export interface EventsIndexProps {
    cellName: string;
    events: EventListItem[];
    eventTypes: EventTypeOption[];
    filters: EventListFilters;
    flashStatus?: string | null;
}

/**
 * Event List Page with Create Event Modal, filters, Card / Table view toggle, and 3-button PIN actions.
 */
export default function EventsIndex({
    cellName = 'Family Care',
    events = [],
    eventTypes = [],
    filters,
    flashStatus,
}: EventsIndexProps): React.ReactElement {
    const [viewMode, setViewMode] = React.useState<ViewMode>('cards');
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState<boolean>(false);
    const [regeneratingId, setRegeneratingId] = React.useState<number | null>(null);
    const [expiringId, setExpiringId] = React.useState<number | null>(null);
    const [searchInput, setSearchInput] = React.useState<string>(filters?.search ?? '');

    const todayIsoDate = React.useMemo(() => new Date().toISOString().slice(0, 10), []);

    const createEventForm = useForm<QuickEventFormData>({
        title: '',
        type: eventTypes[0]?.value ?? 'regular',
        event_date: todayIsoDate,
        location: 'Basecamp History Maker',
    });

    const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        createEventForm.post(route('dashboard.events.quick-store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createEventForm.reset('title');
            },
        });
    };

    const handleRegeneratePin = (eventId: number): void => {
        setRegeneratingId(eventId);
        router.post(
            route('dashboard.events.regenerate-pin', eventId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setRegeneratingId(null),
            },
        );
    };

    const handleExpirePin = (eventId: number): void => {
        setExpiringId(eventId);
        router.post(
            route('dashboard.events.expire-pin', eventId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setExpiringId(null),
            },
        );
    };

    const applyFilters = (overrides: Partial<EventListFilters>): void => {
        const nextFilters: EventListFilters = {
            type: overrides.type ?? filters?.type ?? 'all',
            pin_status: overrides.pin_status ?? filters?.pin_status ?? 'all',
            search: overrides.search !== undefined ? overrides.search : searchInput,
        };

        router.get(
            route('events.index'),
            {
                type: nextFilters.type === 'all' ? undefined : nextFilters.type,
                pin_status: nextFilters.pin_status === 'all' ? undefined : nextFilters.pin_status,
                search: nextFilters.search.trim() !== '' ? nextFilters.search.trim() : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const hasActiveFilters =
        filters?.type !== 'all' ||
        filters?.pin_status !== 'all' ||
        (filters?.search ?? '') !== '';

    return (
        <AuthenticatedLayout cellName={cellName}>
            <Head title={`Event List — ${cellName}`} />

            <div className="space-y-6">
                <PageHeader
                    title="Daftar Sesi Acara"
                    description="Buat sesi acara baru dengan PIN 4-digit 24 jam, serta kelola seluruh jadwal dan status PIN acara."
                    actions={
                        <div className="flex flex-wrap items-center gap-3">
                            <ViewModeToggle value={viewMode} onChange={setViewMode} />

                            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="default">
                                        <CalendarPlus className="h-4 w-4" />
                                        <span>Buat Sesi Acara</span>
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

                                    <form onSubmit={handleCreateEvent} className="space-y-4 pt-2">
                                        <QuickEventFormFields
                                            data={createEventForm.data}
                                            errors={createEventForm.errors}
                                            eventTypes={eventTypes}
                                            onChange={(field, value) => createEventForm.setData(field, value)}
                                            idPrefix="events-modal"
                                        />

                                        <DialogFooter className="pt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsCreateModalOpen(false)}
                                            >
                                                Batal
                                            </Button>
                                            <Button type="submit" disabled={createEventForm.processing}>
                                                <KeyRound className="h-4 w-4" />
                                                <span>
                                                    {createEventForm.processing
                                                        ? 'Membuat PIN...'
                                                        : 'Simpan & Generate PIN'}
                                                </span>
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    }
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
                            <span>FILTER DAFTAR ACARA</span>
                        </span>
                        <span>MENAMPILKAN {events.length} ACARA</span>
                    </CardBanner>

                    <CardContent className="pt-4 pb-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                            <div className="md:col-span-4">
                                <Label
                                    htmlFor="event-filter-type"
                                    className="mb-1 block font-mono text-[11px] text-[#64748B]"
                                >
                                    JENIS ACARA
                                </Label>
                                <select
                                    id="event-filter-type"
                                    value={filters?.type ?? 'all'}
                                    onChange={(e) => applyFilters({ type: e.target.value })}
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

                            <div className="md:col-span-3">
                                <Label
                                    htmlFor="event-filter-pin"
                                    className="mb-1 block font-mono text-[11px] text-[#64748B]"
                                >
                                    STATUS PIN
                                </Label>
                                <select
                                    id="event-filter-pin"
                                    value={filters?.pin_status ?? 'all'}
                                    onChange={(e) => applyFilters({ pin_status: e.target.value })}
                                    className="flex h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-1 text-xs text-[#1E293B] focus:border-[#4F46E5] focus:outline-none"
                                >
                                    <option value="all">Semua Status PIN</option>
                                    <option value="active">PIN Aktif</option>
                                    <option value="expired">PIN Expired</option>
                                </select>
                            </div>

                            <div className="md:col-span-5">
                                <Label
                                    htmlFor="event-filter-search"
                                    className="mb-1 block font-mono text-[11px] text-[#64748B]"
                                >
                                    CARI JUDUL / LOKASI / PIN
                                </Label>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        applyFilters({ search: searchInput });
                                    }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        id="event-filter-search"
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Cari acara atau kode PIN..."
                                        className="h-9 text-xs"
                                    />
                                    <Button type="submit" variant="outline" size="sm" className="h-9">
                                        <Search className="h-3.5 w-3.5" />
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <div className="mt-3 flex justify-end border-t border-dashed border-[#E2E8F0] pt-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchInput('');
                                        router.get(route('events.index'));
                                    }}
                                >
                                    Reset Semua Filter
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Event List: Cards or Table */}
                {events.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Acara yang Sesuai Filter"
                        description="Klik tombol 'Buat Sesi Acara' di kanan atas untuk membuat sesi baru, atau ubah filter pencarian Anda."
                    />
                ) : viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {events.map((ev) => (
                            <Card key={ev.id}>
                                <CardBanner>
                                    <span className="truncate">{ev.event_date_formatted}</span>
                                    <span className="shrink-0">{ev.type_label}</span>
                                </CardBanner>

                                <CardContent className="space-y-3 pt-4 pb-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <h3 className="truncate font-heading text-base font-bold text-[#0F172A]">
                                                {ev.title}
                                            </h3>
                                            {ev.location && (
                                                <p className="flex items-center gap-1.5 text-xs text-[#64748B]">
                                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{ev.location}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="shrink-0 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-right">
                                            <div className="font-mono text-[10px] text-[#64748B] uppercase">
                                                PIN
                                            </div>
                                            <div className="font-mono text-base font-bold tracking-widest text-[#0F172A]">
                                                {ev.feedback_pin}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant={ev.is_pin_active ? 'success' : 'warning'}>
                                            {ev.is_pin_active ? 'PIN AKTIF' : 'PIN EXPIRED'}
                                        </Badge>
                                        <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 font-mono text-xs text-[#334155]">
                                            <MessageSquareHeart className="h-3 w-3 text-[#64748B]" />
                                            {ev.feedbacks_count} Feedback
                                        </span>
                                        {ev.average_rating !== null && (
                                            <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 font-mono text-xs font-semibold text-[#0F172A]">
                                                <Star className="h-3 w-3 fill-[#1E293B] text-[#1E293B]" />
                                                {ev.average_rating.toFixed(1)}/5
                                            </span>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-center"
                                            disabled={regeneratingId === ev.id}
                                            onClick={() => handleRegeneratePin(ev.id)}
                                        >
                                            <RefreshCw
                                                className={`h-3.5 w-3.5 ${regeneratingId === ev.id ? 'animate-spin' : ''}`}
                                            />
                                            <span>Regenerate</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-center text-[#E11D48] hover:border-[#FECDD3] hover:bg-[#FFF1F2] hover:text-[#BE123C] disabled:text-[#94A3B8]"
                                            disabled={!ev.is_pin_active || expiringId === ev.id}
                                            onClick={() => handleExpirePin(ev.id)}
                                        >
                                            <Ban className="h-3.5 w-3.5" />
                                            <span>Expire PIN</span>
                                        </Button>

                                        {ev.is_pin_active ? (
                                            <Link
                                                href={route('feedback.index', { pin: ev.feedback_pin })}
                                                className="w-full"
                                            >
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full justify-center"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    <span>Buka Form</span>
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="w-full justify-center"
                                                disabled
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                <span>Buka Form</span>
                                            </Button>
                                        )}
                                    </div>
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
                                        <th className="px-4 py-3">Acara & Lokasi</th>
                                        <th className="px-4 py-3">Jenis & Jadwal</th>
                                        <th className="px-4 py-3">PIN 4-Digit</th>
                                        <th className="px-4 py-3">Feedback</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                                    {events.map((ev) => (
                                        <tr
                                            key={ev.id}
                                            className="transition-colors hover:bg-[#F8FAFC]"
                                        >
                                            <td className="px-4 py-3.5 align-top">
                                                <div className="font-semibold text-[#0F172A]">
                                                    {ev.title}
                                                </div>
                                                {ev.location && (
                                                    <div className="mt-0.5 text-[11px] text-[#64748B]">
                                                        {ev.location}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 align-top">
                                                <Badge variant="outline">{ev.type_label}</Badge>
                                                <div className="mt-1 font-mono text-[11px] text-[#64748B]">
                                                    {ev.event_date_formatted}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 align-top">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm font-bold tracking-widest text-[#0F172A]">
                                                        {ev.feedback_pin}
                                                    </span>
                                                    <Badge variant={ev.is_pin_active ? 'success' : 'warning'}>
                                                        {ev.is_pin_active ? 'AKTIF' : 'EXPIRED'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 align-top font-mono text-xs text-[#334155]">
                                                <div>{ev.feedbacks_count} masukan</div>
                                                {ev.average_rating !== null && (
                                                    <div className="mt-0.5 text-[11px] text-[#64748B]">
                                                        Rating {ev.average_rating.toFixed(1)}/5.0
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right align-top">
                                                <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={regeneratingId === ev.id}
                                                        onClick={() => handleRegeneratePin(ev.id)}
                                                    >
                                                        <RefreshCw
                                                            className={`h-3.5 w-3.5 ${regeneratingId === ev.id ? 'animate-spin' : ''}`}
                                                        />
                                                        <span>Regenerate</span>
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[#E11D48] hover:border-[#FECDD3] hover:bg-[#FFF1F2] hover:text-[#BE123C] disabled:text-[#94A3B8]"
                                                        disabled={!ev.is_pin_active || expiringId === ev.id}
                                                        onClick={() => handleExpirePin(ev.id)}
                                                    >
                                                        <Ban className="h-3.5 w-3.5" />
                                                        <span>Expire</span>
                                                    </Button>

                                                    {ev.is_pin_active ? (
                                                        <Link href={route('feedback.index', { pin: ev.feedback_pin })}>
                                                            <Button type="button" variant="secondary" size="sm">
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                                <span>Buka Form</span>
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button type="button" variant="secondary" size="sm" disabled>
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                            <span>Buka Form</span>
                                                        </Button>
                                                    )}
                                                </div>
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

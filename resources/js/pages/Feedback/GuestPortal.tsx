/**
 * Purpose: Public Mobile-First 4-Digit PIN Gate & 100% Anonymous Feedback Portal (`/feedback`).
 * Domain Context: Stewarded by the Nervous System (IT Team).
 *                 Allows cell members to unlock the current session via a daily 4-digit PIN
 *                 (`/feedback?pin=XXXX`), view the locked Event Title/Type/Date, and submit
 *                 anonymous feedback with an optional Pastoral Care follow-up toggle.
 * Key Dependencies: @inertiajs/react, @/layouts/GuestFeedbackLayout, @/components/ui/*
 */
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    HeartHandshake,
    KeyRound,
    Lock,
    MessageSquarePlus,
    RefreshCw,
    Send,
    ShieldCheck,
    Star,
} from 'lucide-react';
import * as React from 'react';

import InputError from '@/components/input-error';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestFeedbackLayout from '@/layouts/GuestFeedbackLayout';
import type {
    FeedbackCategoryOption,
    FeedbackCategoryValue,
    VerifiedGuestEvent,
} from '@/types';

export interface GuestPortalProps {
    pinQuery: string;
    pinError: string | null;
    verifiedEvent: VerifiedGuestEvent | null;
    categories: FeedbackCategoryOption[];
    submitted: boolean;
    flashSuccess?: string | null;
}

type VerifyPinForm = {
    pin: string;
};

type SubmitFeedbackForm = {
    pin: string;
    rating: number;
    category: FeedbackCategoryValue;
    message: string;
    needs_pastoral_care: boolean;
    contact_name: string;
    contact_info: string;
};

const RATING_LABELS: Record<number, string> = {
    1: '1 — Perlu Banyak Evaluasi',
    2: '2 — Cukup, Bisa Lebih Baik',
    3: '3 — Baik & Nyaman',
    4: '4 — Sangat Baik & Hangat',
    5: '5 — Sangat Memberkati!',
};

/**
 * Public Guest Feedback Portal adhering strictly to Calm Editorial Neutral (`docs/DESIGN_SYSTEM.md`).
 */
export default function GuestPortal({
    pinQuery,
    pinError,
    verifiedEvent,
    categories,
    submitted,
    flashSuccess,
}: GuestPortalProps): React.ReactElement {
    // =========================================================================
    // 1. 4-DIGIT PIN VERIFICATION FORM STATE
    // =========================================================================
    const pinForm = useForm<Required<VerifyPinForm>>({
        pin: pinQuery || '',
    });

    const handleVerifyPin = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        pinForm.post(route('feedback.verify-pin'), {
            preserveScroll: true,
        });
    };

    // =========================================================================
    // 2. ANONYMOUS FEEDBACK SUBMISSION FORM STATE
    // =========================================================================
    const feedbackForm = useForm<Required<SubmitFeedbackForm>>({
        pin: verifiedEvent?.feedback_pin ?? pinQuery ?? '',
        rating: 5,
        category: categories[0]?.value ?? 'materi',
        message: '',
        needs_pastoral_care: false,
        contact_name: '',
        contact_info: '',
    });

    React.useEffect(() => {
        if (verifiedEvent?.feedback_pin) {
            feedbackForm.setData('pin', verifiedEvent.feedback_pin);
        }
    }, [verifiedEvent?.feedback_pin]);

    const handleSubmitFeedback = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        feedbackForm.post(route('feedback.store'), {
            preserveScroll: true,
            onSuccess: () => {
                feedbackForm.reset('message', 'needs_pastoral_care', 'contact_name', 'contact_info');
            },
        });
    };

    return (
        <GuestFeedbackLayout>
            <Head title="Feedback Anonim Anggota — FC R&D" />

            {/* Top Identity Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#1E293B] bg-[#1E293B] font-mono text-sm font-semibold text-white">
                        FC
                    </div>
                    <div>
                        <h1 className="font-heading text-lg font-bold tracking-tight text-[#0F172A]">
                            FC R&D · Suara Anggota
                        </h1>
                        <p className="font-mono text-xs text-[#64748B]">
                            Family Care — History Maker · Nervous System Channel
                        </p>
                    </div>
                </div>
                <Link
                    href="/login"
                    className="font-mono text-xs font-medium text-[#64748B] underline-offset-4 hover:text-[#1E293B] hover:underline"
                >
                    Login Pengurus
                </Link>
            </div>

            {/* ========================================================================= */}
            {/* STATE A: DAILY 4-DIGIT PIN GATE (NO VERIFIED EVENT YET)                   */}
            {/* ========================================================================= */}
            {!verifiedEvent && (
                <Card>
                    <CardBanner>
                        <span>DAILY 4-DIGIT PIN GATE</span>
                        <span className="inline-flex items-center gap-1">
                            <KeyRound className="h-3.5 w-3.5 text-[#4F46E5]" />
                            <span>VALID 24 JAM</span>
                        </span>
                    </CardBanner>

                    <CardHeader>
                        <CardTitle className="text-xl">Masukkan 4-Digit PIN Sesi Acara</CardTitle>
                        <CardDescription>
                            Masukkan kode 4 angka yang dibagikan oleh pengurus di akhir komsel untuk membuka
                            form evaluasi anonim hari ini.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {(pinError || pinForm.errors.pin) && (
                            <div className="mb-5 flex items-start gap-2.5 rounded-md border border-[#FECDD3] bg-[#FFF1F2] p-3.5 text-sm text-[#E11D48]">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <div>
                                    <p className="font-medium">Verifikasi PIN Gagal</p>
                                    <p className="text-xs text-[#BE123C]">
                                        {pinForm.errors.pin || pinError}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleVerifyPin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="pin-input" className="font-mono text-xs uppercase text-[#475569]">
                                    4-Digit PIN Acara
                                </Label>
                                <Input
                                    id="pin-input"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{4}"
                                    maxLength={4}
                                    autoFocus
                                    required
                                    value={pinForm.data.pin}
                                    onChange={(e) => {
                                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        pinForm.setData('pin', digitsOnly);
                                    }}
                                    placeholder="2408"
                                    className="h-14 text-center font-mono text-2xl font-bold tracking-[0.5em] text-[#0F172A]"
                                />
                                <p className="text-center font-mono text-[11px] text-[#64748B]">
                                     Masukkan 4 angka PIN sesi hari ini (contoh demo aktif: 2408)
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={pinForm.processing || pinForm.data.pin.length !== 4}
                            >
                                <Lock className="h-4 w-4" />
                                <span>Buka Form Feedback Anonim</span>
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-between">
                        <span>TANPA LOGIN</span>
                        <span>ZERO IP / USER_ID TRACKING</span>
                    </CardFooter>
                </Card>
            )}

            {/* ========================================================================= */}
            {/* STATE B: WARM CONFIRMATION SCREEN UPON SUBMISSION                         */}
            {/* ========================================================================= */}
            {verifiedEvent && submitted && (
                <Card>
                    <CardBanner>
                        <span>FEEDBACK TERKIRIM · 100% ANONIM</span>
                        <span>PIN #{verifiedEvent.feedback_pin}</span>
                    </CardBanner>

                    <CardContent className="pt-8 pb-6 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>

                        <h2 className="font-heading text-xl font-bold text-[#0F172A]">
                            Terima Kasih atas Kejujuran & Masukanmu!
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-[#475569]">
                            {flashSuccess ||
                                'Setiap masukan dievaluasi oleh tim Nervous System & Leader agar komsel FC R&D semakin hangat dan bertumbuh.'}
                        </p>

                        <div className="mt-5 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-left font-mono text-xs text-[#475569]">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-[#1E293B]">{verifiedEvent.title}</span>
                                <Badge variant="outline">{verifiedEvent.type_label}</Badge>
                            </div>
                            <p className="mt-1 text-[11px] text-[#64748B]">
                                Status Privasi: Tidak ada identitas akun, IP address, atau jejak browser yang disimpan.
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                            <Link href={route('feedback.index', { pin: verifiedEvent.feedback_pin })}>
                                <Button variant="default" className="w-full sm:w-auto">
                                    <MessageSquarePlus className="h-4 w-4" />
                                    <span>Kirim Feedback Lagi (Sesi Ini)</span>
                                </Button>
                            </Link>
                            <Link href={route('feedback.index')}>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Ganti PIN Sesi Lain</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ========================================================================= */}
            {/* STATE C: VERIFIED EVENT HEADER + ANONYMOUS FEEDBACK FORM                  */}
            {/* ========================================================================= */}
            {verifiedEvent && !submitted && (
                <div className="space-y-5">
                    {/* Locked Event Header Banner Card */}
                    <Card>
                        <CardBanner>
                            <span className="inline-flex items-center gap-1.5 text-[#047857]">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>SESI TERVERIFIKASI · PIN #{verifiedEvent.feedback_pin}</span>
                            </span>
                            <Link
                                href={route('feedback.index')}
                                className="font-mono text-[11px] font-medium text-[#4F46E5] hover:underline"
                            >
                                Ganti PIN
                            </Link>
                        </CardBanner>

                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                        <Badge variant="indigo">{verifiedEvent.type_label}</Badge>
                                        <span className="inline-flex items-center gap-1 font-mono text-xs text-[#64748B]">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{verifiedEvent.event_date_formatted}</span>
                                        </span>
                                    </div>
                                    <h2 className="font-heading text-lg font-bold text-[#0F172A]">
                                        {verifiedEvent.title}
                                    </h2>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Anonymous Feedback Form Card */}
                    <Card>
                        <CardBanner>
                            <span>FORM EVALUASI ANONIM</span>
                            <span>WAJIB DIISI DENGAN JUJUR</span>
                        </CardBanner>

                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmitFeedback} className="space-y-6">
                                {/* 1. Satisfaction Rating (1–5 Star Selector) */}
                                <div className="space-y-2.5">
                                    <Label className="text-sm font-semibold text-[#1E293B]">
                                        1. Tingkat Kepuasan Sesi Hari Ini <span className="text-[#E11D48]">*</span>
                                    </Label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {[1, 2, 3, 4, 5].map((score) => {
                                            const isSelected = feedbackForm.data.rating >= score;
                                            const isExact = feedbackForm.data.rating === score;
                                            return (
                                                <button
                                                    key={score}
                                                    type="button"
                                                    onClick={() => feedbackForm.setData('rating', score)}
                                                    className={`flex flex-col items-center justify-center gap-1 rounded-md border py-3 transition-all ${
                                                        isExact
                                                            ? 'border-[#1E293B] bg-[#1E293B] text-white shadow-xs'
                                                            : isSelected
                                                              ? 'border-[#CBD5E1] bg-[#F1F5F9] text-[#1E293B]'
                                                              : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]'
                                                    }`}
                                                >
                                                    <Star
                                                        className={`h-5 w-5 ${
                                                            isSelected
                                                                ? isExact
                                                                    ? 'fill-white text-white'
                                                                    : 'fill-[#1E293B] text-[#1E293B]'
                                                                : 'text-[#94A3B8]'
                                                        }`}
                                                    />
                                                    <span className="font-mono text-xs font-semibold">{score}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="font-mono text-xs text-[#475569]">
                                        Pilihan: <span className="font-semibold text-[#1E293B]">{RATING_LABELS[feedbackForm.data.rating]}</span>
                                    </p>
                                    <InputError message={feedbackForm.errors.rating} />
                                </div>

                                {/* 2. Feedback Category Selector */}
                                <div className="space-y-2.5">
                                    <Label className="text-sm font-semibold text-[#1E293B]">
                                        2. Kategori Feedback <span className="text-[#E11D48]">*</span>
                                    </Label>
                                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                        {categories.map((cat) => {
                                            const active = feedbackForm.data.category === cat.value;
                                            return (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => feedbackForm.setData('category', cat.value)}
                                                    className={`rounded-md border p-3 text-left transition-all ${
                                                        active
                                                            ? 'border-[#1E293B] bg-[#F8FAFC] ring-1 ring-[#1E293B]'
                                                            : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-heading text-sm font-semibold text-[#0F172A]">
                                                            {cat.label}
                                                        </span>
                                                        {active && (
                                                            <span className="font-mono text-[10px] font-semibold text-[#4F46E5] uppercase">
                                                                DIPILIH
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-xs text-[#64748B]">{cat.description}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={feedbackForm.errors.category} />
                                </div>

                                {/* 3. Open Feedback / Suggestions Textarea */}
                                <div className="space-y-2">
                                    <Label htmlFor="feedback-message" className="text-sm font-semibold text-[#1E293B]">
                                        3. Pesan, Kesan, atau Saran Membangun <span className="text-[#E11D48]">*</span>
                                    </Label>
                                    <textarea
                                        id="feedback-message"
                                        rows={4}
                                        required
                                        value={feedbackForm.data.message}
                                        onChange={(e) => feedbackForm.setData('message', e.target.value)}
                                        placeholder="Tuliskan hal yang paling memberkati atau saran praktis untuk sesi berikutnya..."
                                        className="w-full rounded-md border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] placeholder:text-[#94A3B8] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 focus:outline-none"
                                    />
                                    <InputError message={feedbackForm.errors.message} />
                                </div>

                                {/* 4. Pastoral Care Toggle & Conditional Contact Inputs */}
                                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="needs_pastoral_care"
                                            checked={feedbackForm.data.needs_pastoral_care}
                                            onCheckedChange={(checked) => {
                                                const isChecked = checked === true;
                                                feedbackForm.setData((prev) => ({
                                                    ...prev,
                                                    needs_pastoral_care: isChecked,
                                                    contact_name: isChecked ? prev.contact_name : '',
                                                    contact_info: isChecked ? prev.contact_info : '',
                                                }));
                                            }}
                                            className="mt-0.5"
                                        />
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="needs_pastoral_care"
                                                className="cursor-pointer text-sm font-semibold text-[#1E293B]"
                                            >
                                                Saya ingin didoakan atau dihubungi secara personal oleh pengurus
                                            </Label>
                                            <p className="text-xs text-[#64748B]">
                                                Opsional. Jika dicentang, Anda dapat menyertakan nama panggilan & kontak
                                                agar pengurus dapat mendukung dalam doa atau ngobrol personal.
                                            </p>
                                        </div>
                                    </div>

                                    {feedbackForm.data.needs_pastoral_care && (
                                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-dashed border-[#CBD5E1] pt-4 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="contact_name" className="text-xs font-medium text-[#334155]">
                                                    Nama Panggilan (Opsional)
                                                </Label>
                                                <Input
                                                    id="contact_name"
                                                    type="text"
                                                    value={feedbackForm.data.contact_name}
                                                    onChange={(e) => feedbackForm.setData('contact_name', e.target.value)}
                                                    placeholder="Contoh: Tasya / Raka"
                                                    className="bg-white"
                                                />
                                                <InputError message={feedbackForm.errors.contact_name} />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label htmlFor="contact_info" className="text-xs font-medium text-[#334155]">
                                                    Kontak WA / IG (Opsional)
                                                </Label>
                                                <Input
                                                    id="contact_info"
                                                    type="text"
                                                    value={feedbackForm.data.contact_info}
                                                    onChange={(e) => feedbackForm.setData('contact_info', e.target.value)}
                                                    placeholder="Contoh: 0812-xxxx-xxxx atau @username"
                                                    className="bg-white"
                                                />
                                                <InputError message={feedbackForm.errors.contact_info} />
                                            </div>

                                            <div className="sm:col-span-2 flex items-center gap-1.5 font-mono text-[11px] text-[#475569]">
                                                <HeartHandshake className="h-3.5 w-3.5 text-[#4F46E5]" />
                                                <span>
                                                    Data kontak ini hanya disimpan pada kartu feedback ini untuk tindak lanjut doa.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <InputError message={feedbackForm.errors.pin} />

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full"
                                    disabled={feedbackForm.processing}
                                >
                                    <Send className="h-4 w-4" />
                                    <span>
                                        {feedbackForm.processing
                                            ? 'Mengirim Secara Anonim...'
                                            : 'Kirim Feedback Anonim'}
                                    </span>
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="justify-between">
                            <span>DIKELOLA OLEH SIE IT (NERVOUS SYSTEM)</span>
                            <span>100% ANONYMOUS</span>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </GuestFeedbackLayout>
    );
}

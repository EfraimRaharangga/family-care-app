/**
 * Purpose: FC R&D Member & Servant Login Page (Google OAuth Whitelist + Local Dev Fallback).
 * Domain Context: Primary authentication gate for Family Care — History Maker,
 *                 styled with the Calm Editorial Neutral design system. Includes quick
 *                 access to the public `/feedback` PIN portal and 1-click local demo fill.
 * Key Dependencies: @inertiajs/react, @/layouts/auth-layout
 */
import { Head, Link, useForm } from '@inertiajs/react';
import { KeyRound, LoaderCircle, MessageSquareHeart, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const fillDemoAccount = (email: string): void => {
        setData({
            email,
            password: 'password',
            remember: true,
        });
    };

    return (
        <AuthLayout
            title="FC R&D Member Login"
            description="Masuk menggunakan akun Google Whitelist pengurus atau kredensial lokal"
        >
            <Head title="Login Pengurus — FC R&D" />

            {/* Quick Link for Cell Members looking for the Anonymous Feedback Portal */}
            <div className="mb-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="font-mono text-[11px] font-semibold text-[#1E293B] uppercase">
                            Anggota Komsel FC R&D?
                        </p>
                        <p className="text-xs text-[#64748B]">
                            Kirim feedback 100% anonim dengan 4-digit PIN tanpa login.
                        </p>
                    </div>
                    <Link href="/feedback">
                        <Button type="button" variant="outline" size="sm">
                            <MessageSquareHeart className="h-3.5 w-3.5 text-[#4F46E5]" />
                            <span>Isi Feedback</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mb-4">
                <a href="/auth/google/redirect" className="block w-full">
                    <Button type="button" variant="outline" className="w-full">
                        <ShieldCheck className="h-4 w-4 text-[#4F46E5]" />
                        <span>Sign in with Google (FC R&D Whitelist)</span>
                    </Button>
                </a>
            </div>

            <div className="relative my-2 flex items-center justify-center">
                <div className="w-full border-t border-dashed border-[#E2E8F0]" />
                <span className="bg-[#F8FAFC] px-3 font-mono text-[11px] font-medium text-[#64748B] uppercase">
                    ATAU LOGIN PENGURUS (LOCAL DEV)
                </span>
                <div className="w-full border-t border-dashed border-[#E2E8F0]" />
            </div>

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="brain@fcrnd.local"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Lupa password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Ingat saya</Label>
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Masuk ke Dashboard
                    </Button>
                </div>

                {/* Quick Demo Fill Helpers for Local Testing */}
                <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3">
                    <div className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#475569]">
                        <KeyRound className="h-3.5 w-3.5 text-[#64748B]" />
                        <span>AKUN DEMO PENGURUS (PASSWORD: password)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => fillDemoAccount('brain@fcrnd.local')}
                            className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-left font-mono text-[11px] text-[#1E293B] transition-colors hover:border-[#CBD5E1] hover:bg-[#F1F5F9]"
                        >
                            <div className="font-semibold">🧠 Leader (Brain)</div>
                            <div className="text-[10px] text-[#64748B]">brain@fcrnd.local</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemoAccount('it@fcrnd.local')}
                            className="rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-left font-mono text-[11px] text-[#1E293B] transition-colors hover:border-[#CBD5E1] hover:bg-[#F1F5F9]"
                        >
                            <div className="font-semibold">⚡ Sie IT (Nervous)</div>
                            <div className="text-[10px] text-[#64748B]">it@fcrnd.local</div>
                        </button>
                    </div>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Belum punya akun?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Daftar
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-[#047857]">{status}</div>}
        </AuthLayout>
    );
}

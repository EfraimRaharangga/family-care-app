/**
 * Purpose: FC R&D Member Login Page (Google OAuth Whitelist + Local Dev Password Fallback).
 * Domain Context: Primary authentication gate for Family Care — History Maker,
 *                 styled with the Calm Editorial Neutral design system.
 * Key Dependencies: @inertiajs/react, @/layouts/auth-layout
 */
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
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

    return (
        <AuthLayout
            title="FC R&D Member Login"
            description="Sign in with your whitelisted Google account or local member credentials"
        >
            <Head title="Member Login" />

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
                    OR LOCAL DEV FALLBACK
                </span>
                <div className="w-full border-t border-dashed border-[#E2E8F0]" />
            </div>

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
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
                                    Forgot password?
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
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-[#047857]">{status}</div>}
        </AuthLayout>
    );
}

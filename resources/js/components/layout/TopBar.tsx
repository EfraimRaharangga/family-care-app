/**
 * Purpose: Calm Editorial Neutral Top Navigation Bar for FC R&D.
 * Domain Context: Displays the active cell tenant (`FC R&D`), navigation links,
 *                 and Google OAuth Whitelist authentication status on a clean white header.
 * Key Dependencies: @inertiajs/react, @/components/ui/button
 */
import { Link, usePage } from '@inertiajs/react';
import { Activity, BookOpen, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';

export interface TopBarProps {
    /** Active cell tenant name */
    cellName?: string;
}

/**
 * Quiet editorial header bar with 1px solid #E2E8F0 bottom border.
 */
export function TopBar({ cellName = 'FC R&D' }: TopBarProps): React.ReactElement {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xs">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand & Active Cell Tenant Pill */}
                <div className="flex items-center gap-3.5">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#1E293B] bg-[#1E293B] font-mono text-sm font-semibold text-white transition-colors group-hover:bg-[#334155]">
                            FC
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-heading text-base font-bold tracking-tight text-[#0F172A]">
                                    {cellName}
                                </span>
                                <span className="rounded-md border border-[#E2E8F0] bg-[#F1F5F9] px-2 py-0.5 font-mono text-[10px] font-medium text-[#475569] uppercase">
                                    HISTORY MAKER
                                </span>
                            </div>
                            <p className="font-mono text-[11px] text-[#64748B]">Journey of Belonging · Phase 0 Foundation</p>
                        </div>
                    </Link>
                </div>

                {/* Section Jump Links */}
                <nav className="hidden items-center gap-6 md:flex">
                    <a
                        href="#vital-organs"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#475569] transition-colors hover:text-[#0F172A]"
                    >
                        <Layers className="h-3.5 w-3.5 text-[#64748B]" />
                        <span>5 Vital Organs</span>
                    </a>
                    <a
                        href="#virtual-funds"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#475569] transition-colors hover:text-[#0F172A]"
                    >
                        <ShieldCheck className="h-3.5 w-3.5 text-[#64748B]" />
                        <span>Virtual Funds</span>
                    </a>
                    <a
                        href="#run-sheet"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#475569] transition-colors hover:text-[#0F172A]"
                    >
                        <Activity className="h-3.5 w-3.5 text-[#64748B]" />
                        <span>90m Run Sheet</span>
                    </a>
                    <a
                        href="#design-tokens"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#475569] transition-colors hover:text-[#0F172A]"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-[#64748B]" />
                        <span>Design Tokens</span>
                    </a>
                </nav>

                {/* Auth / Whitelist Controls */}
                <div className="flex items-center gap-2.5">
                    <Link href="/design-system">
                        <Button variant="outline" size="sm">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>Design Specs</span>
                        </Button>
                    </Link>
                    {auth?.user ? (
                        <Link href="/dashboard">
                            <Button variant="default" size="sm">
                                <span>Dashboard ({auth.user.name})</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm">
                                <span>Member Login</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

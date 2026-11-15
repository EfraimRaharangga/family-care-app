/**
 * Purpose: Calm Editorial Neutral Top Navigation Bar for FC R&D.
 * Domain Context: Displays the active cell tenant (`FC R&D`), Phase 1 Nervous System
 *                 navigation links, and member authentication status on a clean white header.
 * Key Dependencies: @inertiajs/react, @/components/ui/button
 */
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, LogOut, MessageSquareHeart } from 'lucide-react';
import * as React from 'react';

import { OrganIcon } from '@/components/shared/OrganIcon';
import { TierBadge } from '@/components/shared/TierBadge';
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
    const user = auth?.user;

    return (
        <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xs">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand & Active Cell Tenant Pill */}
                <div className="flex items-center gap-3.5">
                    <Link href="/dashboard" className="group flex items-center gap-3">
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
                            <p className="font-mono text-[11px] text-[#64748B]">
                                Nervous System · Feedback & Analytics
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Phase 1 Navigation Links */}
                <nav className="hidden items-center gap-6 md:flex">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#1E293B] transition-colors hover:text-[#4F46E5]"
                    >
                        <BarChart3 className="h-3.5 w-3.5 text-[#4F46E5]" />
                        <span>Dashboard & Analitik</span>
                    </Link>
                    <Link
                        href="/feedback"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#475569] transition-colors hover:text-[#0F172A]"
                    >
                        <MessageSquareHeart className="h-3.5 w-3.5 text-[#64748B]" />
                        <span>Portal Feedback Anggota (/feedback)</span>
                    </Link>
                </nav>

                {/* Auth / Servant Profile & Logout Controls */}
                <div className="flex items-center gap-2.5">
                    {user ? (
                        <>
                            <div className="hidden items-center gap-2 sm:flex">
                                {user.tier && <TierBadge tier={user.tier} />}
                                {user.vital_organ && <OrganIcon organ={user.vital_organ} showTeam={false} />}
                                <span className="font-mono text-xs font-medium text-[#334155]">
                                    {user.name}
                                </span>
                            </div>
                            <Link href={route('logout')} method="post" as="button">
                                <Button variant="outline" size="sm" type="button">
                                    <LogOut className="h-3.5 w-3.5 text-[#64748B]" />
                                    <span>Keluar</span>
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm">
                                <span>Login Pengurus</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

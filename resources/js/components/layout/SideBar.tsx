/**
 * Purpose: Calm Editorial Neutral Desktop Sidebar Navigation & Shared Drawer Parts for FC.
 * Domain Context: Displays Phase 1 Nervous System navigation links on desktop (`md+`)
 *                 and houses the compact combined User Tier + Name profile element at the bottom.
 *                 Exports `SidebarNavLinks` and `CompactUserProfile` for reuse in the mobile hamburger menu.
 * Key Dependencies: @inertiajs/react, @/components/layout/nav-items, @/lib/utils
 */
import { Link, usePage } from '@inertiajs/react';
import * as React from 'react';

import { LAYOUT_NAV_ITEMS } from '@/components/layout/nav-items';
import { cn } from '@/lib/utils';
import type { SharedData, User, VitalOrganValue } from '@/types';

const ORGAN_EMOJI: Record<VitalOrganValue, string> = {
    brain: '🧠',
    lungs: '🫁',
    hands_and_feet: '🤲',
    vascular_system: '🫀',
    nervous_system: '⚡',
};

export interface SidebarNavLinksProps {
    onNavigate?: () => void;
    className?: string;
}

/**
 * Navigation links shared between the desktop sidebar and mobile hamburger menu.
 */
export function SidebarNavLinks({ onNavigate, className }: SidebarNavLinksProps): React.ReactElement {
    const currentUrl = usePage().url;

    return (
        <nav aria-label="Menu Navigasi" className={cn('space-y-1', className)}>
            <p className="px-3 pb-2 font-mono text-[10px] font-medium tracking-wider text-[#64748B] uppercase">
                Navigasi
            </p>
            {LAYOUT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = item.isActive(currentUrl);

                return (
                    <Link
                        key={item.id}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                            'flex items-center gap-2.5 rounded-md border px-3 py-2 font-mono text-xs font-medium transition-colors',
                            active
                                ? 'border-[#C7D2FE] bg-[#EEF2FF] text-[#4338CA]'
                                : 'border-transparent text-[#475569] hover:border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]',
                        )}
                    >
                        <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#4F46E5]' : 'text-[#64748B]')} />
                        <span className="truncate">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

export interface CompactUserProfileProps {
    user?: User | null;
    className?: string;
}

/**
 * Single, compact element combining tier badge, optional organ emoji, and username.
 */
export function CompactUserProfile({ user, className }: CompactUserProfileProps): React.ReactElement | null {
    if (!user) {
        return null;
    }

    const isVital = user.tier === 'vital';

    return (
        <div className={cn('border-t border-[#E2E8F0] p-3', className)}>
            <div
                className={cn(
                    'flex items-center justify-between gap-2 rounded-md border px-2.5 py-2',
                    isVital ? 'border-[#C7D2FE] bg-[#EEF2FF]/70' : 'border-[#E2E8F0] bg-[#F8FAFC]',
                )}
            >
                <div className="flex min-w-0 items-center gap-2">
                    <span
                        className={cn(
                            'inline-block h-2 w-2 shrink-0 rounded-full',
                            isVital ? 'bg-[#4F46E5]' : 'bg-[#64748B]',
                        )}
                        aria-hidden="true"
                    />
                    <span className="truncate font-mono text-xs font-semibold text-[#1E293B]">
                        {user.name}
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {user.vital_organ && (
                        <span className="text-xs" aria-label={user.vital_organ}>
                            {ORGAN_EMOJI[user.vital_organ]}
                        </span>
                    )}
                    {user.tier && (
                        <span
                            className={cn(
                                'rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide uppercase',
                                isVital ? 'bg-[#E0E7FF] text-[#4338CA]' : 'bg-[#E2E8F0]/70 text-[#334155]',
                            )}
                        >
                            {isVital ? 'VITAL' : 'PART'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Sticky desktop sidebar with navigation links at top and a compact combined profile pill at bottom.
 */
export function SideBar(): React.ReactElement {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    return (
        <aside
            aria-label="Navigasi Utama"
            className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col justify-between border-r border-[#E2E8F0] bg-white md:flex"
        >
            <SidebarNavLinks className="p-3 pt-5" />
            <CompactUserProfile user={user} />
        </aside>
    );
}

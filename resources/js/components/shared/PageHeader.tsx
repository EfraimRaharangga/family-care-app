/**
 * Purpose: Calm Editorial Subject Header for FC R&D Domain Pages.
 * Domain Context: Provides quiet, structured visual hierarchy with a 1px #E2E8F0 border,
 *                 rounded-lg geometry, and soft ambient shadow.
 * Key Dependencies: react, @/lib/utils
 */
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface PageHeaderProps {
    /** Monospace breadcrumb/category overline (e.g., "HISTORY MAKER / FC R&D / PHASE 0") */
    categoryTag: string;
    /** Main display heading */
    title: string;
    /** Supporting editorial summary */
    description: string;
    /** Optional right-aligned action buttons or status widget */
    actions?: React.ReactNode;
    /** Optional CSS class */
    className?: string;
}

/**
 * Low-glare editorial banner with 1px solid #E2E8F0 border and diffused elevation.
 */
export function PageHeader({ categoryTag, title, description, actions, className }: PageHeaderProps): React.ReactElement {
    return (
        <section
            className={cn(
                'relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] md:p-8',
                className,
            )}
        >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
                <div className="inline-flex items-center gap-2 font-mono text-xs font-medium tracking-wider text-[#64748B] uppercase">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#4F46E5]" />
                    <span>{categoryTag}</span>
                </div>
                <span className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#475569] uppercase">
                    SOFT MULTI-TENANT · CELL_ID SCOPED
                </span>
            </div>

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-3xl space-y-2">
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl">{title}</h1>
                    <p className="text-base leading-relaxed text-[#475569]">{description}</p>
                </div>
                {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
            </div>
        </section>
    );
}

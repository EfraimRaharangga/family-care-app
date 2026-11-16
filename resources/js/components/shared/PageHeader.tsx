/**
 * Purpose: Calm Editorial Subject Header for FC Domain Pages.
 * Domain Context: Provides quiet, structured visual hierarchy with a 1px #E2E8F0 border,
 *                 rounded-lg geometry, and soft ambient shadow.
 * Key Dependencies: react, @/lib/utils
 */
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface PageHeaderProps {
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
export function PageHeader({title, description, actions, className }: PageHeaderProps): React.ReactElement {
    return (
        <section
            className={cn(
                'relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] md:p-8',
                className,
            )}
        >

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
